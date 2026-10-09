const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./customer_delegate.js").isValid;
let users = require("./customer_delegate.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 10: Get all books using Async/Await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Making an asynchronous request using Axios
    const response = await axios.get('http://localhost:5000/books'); 
    return res.status(200).json(response.data);
  } catch (error) {
    // Fallback to local books database if external request fails
    return res.status(200).json(books);
  }
});

// Task 11: Get book details based on ISBN using Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Task 12: Get book details based on Author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const matchingBooks = Object.keys(books)
      .filter(key => books[key].author.toLowerCase() === author.toLowerCase())
      .map(key => ({ isbn: key, ...books[key] }));

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing request" });
  }
});

// Task 13: Get book details based on Title using Async/Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const matchingBooks = Object.keys(books)
      .filter(key => books[key].title.toLowerCase() === title.toLowerCase())
      .map(key => ({ isbn: key, ...books[key] }));

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbytitle: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing request" });
  }
});

module.exports.general = public_users;
