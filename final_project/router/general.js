const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});

// Get all books
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({ message: "Book not found" });
});

// Get books based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  const result = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found for this author" });
});

// Get books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  const result = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found with this title" });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});

// Async/Await with Axios - Get all books
async function getAllBooks() {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

// Promise with Axios - Get book by ISBN
function getBooksByISBN(isbn) {
  return axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => console.error(error.message));
}

// Async/Await with Axios - Get books by author
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

// Async/Await with Axios - Get books by title
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    return response.data;
  } catch (error) {
    console.error(error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;