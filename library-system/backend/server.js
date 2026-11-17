// server.js — Express REST API for the Library Management System.
// Endpoints:
//   GET    /api/health
//   GET    /api/books            POST /api/books          PUT /api/books/:id   DELETE /api/books/:id
//   GET    /api/users            POST /api/users          PUT /api/users/:id   DELETE /api/users/:id
//   POST   /api/users/login      (login by membership_id)
//   GET    /api/transactions     POST /api/transactions   (add / borrow / return stock)
const express = require('express');
const cors = require('cors');
const { pool, initTables } = require('./db');

const app = express();
app.use(cors());            // allow the React frontend (different port) to call this API
app.use(express.json());    // parse JSON request bodies

const PORT = process.env.PORT || 3000;

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ==================== BOOKS ====================
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, isbn, initial_quantity } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required.' });
    }
    const qty = parseInt(initial_quantity, 10) || 0;
    const result = await pool.query(
      `INSERT INTO books (title, author, genre, isbn, total_quantity, available_quantity)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, author, genre || '', isbn || '', qty, qty]
    );
    // Record the initial stock as an 'add' transaction for the history log.
    if (qty > 0) {
      await pool.query(
        "INSERT INTO transactions (book_id, type, quantity, note) VALUES ($1,'add',$2,'Initial stock')",
        [result.rows[0].id, qty]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, genre, isbn } = req.body;
    const result = await pool.query(
      `UPDATE books SET title=$1, author=$2, genre=$3, isbn=$4 WHERE id=$5 RETURNING *`,
      [title, author, genre || '', isbn || '', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM books WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== USERS ====================
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, membership_id, role } = req.body;
    if (!name || !membership_id) {
      return res.status(400).json({ error: 'Name and membership ID are required.' });
    }
    const result = await pool.query(
      `INSERT INTO users (name, membership_id, role) VALUES ($1,$2,$3)
       RETURNING id, name, membership_id, role`,
      [name, membership_id, role || 'member']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ error: 'That membership ID already exists.' });
    }
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, membership_id, role } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=$1, membership_id=$2, role=$3 WHERE id=$4
       RETURNING id, name, membership_id, role`,
      [name, membership_id, role || 'member', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ error: 'That membership ID already exists.' });
    }
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login: look up a user by membership ID (matches the brief — users have no password field).
app.post('/api/users/login', async (req, res) => {
  try {
    const { membership_id } = req.body;
    if (!membership_id) {
      return res.status(400).json({ error: 'Membership ID is required.' });
    }
    const result = await pool.query(
      'SELECT id, name, membership_id, role FROM users WHERE membership_id = $1',
      [membership_id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid membership ID.' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== TRANSACTIONS (stock in / out) ====================
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, b.title AS book_title, u.name AS user_name
       FROM transactions t
       LEFT JOIN books b ON b.id = t.book_id
       LEFT JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC
       LIMIT 200`
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a stock transaction. Uses a DB transaction + row lock so two borrows
// at the same time can never make stock negative.
app.post('/api/transactions', async (req, res) => {
  const client = await pool.connect();
  try {
    const { book_id, type, quantity, user_id, note } = req.body;
    const qty = parseInt(quantity, 10);
    if (!book_id || !type || !qty || qty <= 0) {
      return res.status(400).json({ error: 'book_id, type, and a positive quantity are required.' });
    }
    if (!['add', 'borrow', 'return'].includes(type)) {
      return res.status(400).json({ error: "type must be 'add', 'borrow', or 'return'." });
    }

    await client.query('BEGIN');
    const book = await client.query('SELECT * FROM books WHERE id=$1 FOR UPDATE', [book_id]);
    if (book.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book not found.' });
    }

    let available = book.rows[0].available_quantity;
    if (type === 'borrow') {
      if (available < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Not enough stock to borrow that many copies.' });
      }
      available -= qty;
    } else {
      available += qty; // 'add' or 'return' both increase stock
    }

    await client.query('UPDATE books SET available_quantity=$1 WHERE id=$2', [available, book_id]);
    const tx = await client.query(
      `INSERT INTO transactions (book_id, user_id, type, quantity, note)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [book_id, user_id || null, type, qty, note || '']
    );
    await client.query('COMMIT');
    res.status(201).json(tx.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// Start the server only after tables are confirmed to exist.
initTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Library API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection/init failed:', err.message);
    console.error('Hint: set DATABASE_URL, or create a local Postgres DB named "library".');
    process.exit(1);
  });
