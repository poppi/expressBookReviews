const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
let axios = require('axios');

public_users.post("/register", (req, res) => {
  console.log('HERE')
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password)
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
  return res.status(404).json({ message: `Unable to register user. Username ${username} and password are required.` });
});



// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error });
  }
});

public_users.get('/books', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/books');
    let books = response.data;
    if (books[isbn]) {
      res.send(JSON.stringify(books[isbn], null, 4));
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book details", error: error });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/books');
    let books = response.data;
    let results = []
    for (let key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        results.push(books[key]);
      }
    }
    if (results.length > 0) {
      res.send(JSON.stringify(results, null, 4));
    } else {
      res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by author", error: error });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/books');
    let books = response.data;
    let results = []
    for (let key in books) {
      if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
        results.push(books[key]);
      }
    }
    if (results.length > 0) {
      res.send(JSON.stringify(results, null, 4));
    } else {
      res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by title", error: error });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/books');
    let books = response.data;
    if (books[isbn]) {
      if (books[isbn].reviews && Object.keys(books[isbn].reviews).length > 0) {
        return res.send(JSON.stringify(books[isbn].reviews, null, 4));
      }
      return res.json({ message: "No reviews for this book" });
    }
    res.json({ message: "ISBN not found" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book reviews", error: error });
  }
});

module.exports.general = public_users;
