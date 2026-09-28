const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

/* ------------------------------------------------------------------ *
 * Promise-based data access helpers.
 * Each helper returns a Promise that resolves with the matching books
 * or rejects with an error, so every route below can use async/await.
 * ------------------------------------------------------------------ */

// Resolves with the whole book list
const getAllBooks = () => new Promise((resolve) => resolve(books));

// Resolves with a single book, rejects if the ISBN does not exist
const findBookByIsbn = (isbn) => new Promise((resolve, reject) => {
  const book = books[isbn];
  if (book) {
    resolve(book);
  } else {
    reject({ status: 404, message: "Book not found for ISBN " + isbn });
  }
});

// Resolves with every book whose `field` (author / title) equals `value`.
// Iterates over the keys of the books object and keeps the matches.
const findBooksByField = (field, value) => new Promise((resolve, reject) => {
  const matches = Object.keys(books)
    .filter((key) => books[key][field] === value)
    .reduce((acc, key) => {
      acc[key] = books[key];
      return acc;
    }, {});

  if (Object.keys(matches).length > 0) {
    resolve(matches);
  } else {
    reject({ status: 404, message: "No books found with " + field + " " + value });
  }
});

// Sends an error produced by the helpers (or by Axios) back to the client
const sendError = (res, error, fallbackMessage) => {
  const status = error.status || (error.response && error.response.status) || 500;
  const data = (error.response && error.response.data) || { message: error.message || fallbackMessage };
  return res.status(status).json(data);
};

/* ------------------------------------------------------------------ *
 * Task 6: Register a new user
 * ------------------------------------------------------------------ */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* ------------------------------------------------------------------ *
 * Tasks 1-4: Get books (all / by ISBN / by author / by title).
 * Implemented with async/await on top of the Promise helpers above.
 * ------------------------------------------------------------------ */

// Task 1: Get the book list available in the shop (async/await)
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return sendError(res, error, "Error fetching book list");
  }
});

// Task 2: Get book details based on ISBN (async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await findBookByIsbn(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return sendError(res, error, "Error fetching book by ISBN");
  }
});

// Task 3: Get book details based on author (Promise callbacks)
public_users.get('/author/:author', function (req, res) {
  findBooksByField("author", req.params.author)
    .then((booksByAuthor) => res.status(200).send(JSON.stringify(booksByAuthor, null, 4)))
    .catch((error) => sendError(res, error, "Error fetching books by author"));
});

// Task 4: Get all books based on title (Promise callbacks)
public_users.get('/title/:title', function (req, res) {
  findBooksByField("title", req.params.title)
    .then((booksByTitle) => res.status(200).send(JSON.stringify(booksByTitle, null, 4)))
    .catch((error) => sendError(res, error, "Error fetching books by title"));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(200).json({ message: "No reviews found for this book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

/* ------------------------------------------------------------------ *
 * Tasks 10-13: The same four lookups performed with Axios.
 * Each function is a reusable Axios client (async/await or Promise
 * callbacks) and is exposed through a /async/... route so it can be
 * tested with curl while the server is running.
 * ------------------------------------------------------------------ */

// Task 10: Get all books - async/await with Axios
const getAllBooksAxios = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Task 11: Get book details by ISBN - Promise callbacks with Axios
const getBookByIsbnAxios = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data);

// Task 12: Get book details by author - async/await with Axios
const getBooksByAuthorAxios = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Task 13: Get book details by title - Promise callbacks with Axios
const getBooksByTitleAxios = (title) =>
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => response.data);

// Task 10 route
public_users.get('/async/', async function (req, res) {
  try {
    const data = await getAllBooksAxios();
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return sendError(res, error, "Error fetching book list");
  }
});

// Task 11 route
public_users.get('/async/isbn/:isbn', function (req, res) {
  getBookByIsbnAxios(req.params.isbn)
    .then((data) => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch((error) => sendError(res, error, "Error fetching book by ISBN"));
});

// Task 12 route
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const data = await getBooksByAuthorAxios(req.params.author);
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return sendError(res, error, "Error fetching books by author");
  }
});

// Task 13 route
public_users.get('/async/title/:title', function (req, res) {
  getBooksByTitleAxios(req.params.title)
    .then((data) => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch((error) => sendError(res, error, "Error fetching books by title"));
});

module.exports.general = public_users;
module.exports.getAllBooksAxios = getAllBooksAxios;
module.exports.getBookByIsbnAxios = getBookByIsbnAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
