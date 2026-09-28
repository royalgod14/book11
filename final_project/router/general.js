const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const PORT = 5000;

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

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);

  const booksByAuthor = bookKeys
    .filter((key) => books[key].author === author)
    .reduce((acc, key) => {
      acc[key] = books[key];
      return acc;
    }, {});

  if (Object.keys(booksByAuthor).length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for author " + author });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);

  const booksByTitle = bookKeys
    .filter((key) => books[key].title === title)
    .reduce((acc, key) => {
      acc[key] = books[key];
      return acc;
    }, {});

  if (Object.keys(booksByTitle).length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with title " + title });
  }
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
 * Tasks 10-13: Same functionality as Tasks 1-4, implemented using
 * Promise callbacks / async-await with Axios.
 * These hit the server's own endpoints above, so they can be curled
 * once the server is running.
 * ------------------------------------------------------------------ */

// Task 10: Get the book list available in the shop - Using async-await with Axios
public_users.get('/async/', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN - Using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:${PORT}/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      const data = error.response ? error.response.data : { message: "Error fetching book by ISBN" };
      return res.status(status).json(data);
    });
});

// Task 12: Get book details based on author - Using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:${PORT}/author/${encodeURIComponent(author)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { message: "Error fetching books by author" };
    return res.status(status).json(data);
  }
});

// Task 13: Get book details based on title - Using Promise callbacks with Axios
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`http://localhost:${PORT}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      const data = error.response ? error.response.data : { message: "Error fetching books by title" };
      return res.status(status).json(data);
    });
});

module.exports.general = public_users;
