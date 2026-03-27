const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
  getBooks.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((error) => {
    res.status(500).json({ message: "Error retrieving books", error: error });
  }
  );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });

  getBookByISBN.then((book) => {
    res.send(JSON.stringify(book, null, 4));
  }).catch((error) => {
    res.status(404).json({ message: "ISBN not found" });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    let result = books.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error("Author not found"));
    }
  });

  getBooksByAuthor.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((error) => {
    res.status(404).json({ message: "Author not found" });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let result = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error("Title not found"));
    }
  });

  getBooksByTitle.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((error) => {
    res.status(404).json({ message: "Title not found" });
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(books[isbn].reqviews);
  }
  res.json({ message: "ISBN not found" });
});

module.exports.general = public_users;
