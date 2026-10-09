const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./customer_delegate.js").isValid;
let users = require("./customer_delegate.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 10: Get all books using Async/Await or Promises
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await getBooks;
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: "Book not found" });
    }
  })
  .then((book) => res.status(200).json(book))
  .catch((err) => res.status(404).json(err));
});

// Task 12: Get book details based on Author using Promises/Async
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    let matchingBooks = [];
    for (let key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: "No books found by this author" });
    }
  })
  .then((booksFound) => res.status(200).json({ booksbyauthor: booksFound }))
  .catch((err) => res.status(404).json(err));
});

// Task 13: Get book details based on Title using Promises/Async
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    let matchingBooks = [];
    for (let key in books) {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: "No books found with this title" });
    }
  })
  .then((booksFound) => res.status(200).json({ booksbytitle: booksFound }))
  .catch((err) => res.status(404).json(err));
});

module.exports.general = public_users;
