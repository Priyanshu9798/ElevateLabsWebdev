const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory array to store books
let books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho" },
  { id: 2, title: "1984", author: "George Orwell" }
];

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET a book by ID
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).send({ message: "Book not found" });
  res.json(book);
});

// GET books by author (extra feature)
app.get('/books/author/:author', (req, res) => {
  const authorBooks = books.filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
  if (authorBooks.length === 0) return res.status(404).send({ message: "No books found for this author" });
  res.json(authorBooks);
});

// POST a new book
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).send({ message: "Title and author are required" });

  const newBook = {
    id: books.length + 1,
    title,
    author
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT (update) a book
app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).send({ message: "Book not found" });

  const { title, author } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;

  res.json(book);
});

// DELETE a book
app.delete('/books/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) return res.status(404).send({ message: "Book not found" });

  const removedBook = books.splice(bookIndex, 1);
  res.json({ message: "Book deleted", book: removedBook });
});

// Root
app.get('/', (req, res) => {
  res.send("📚 Book API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
