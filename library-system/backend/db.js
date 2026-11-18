
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/library',
  // Render and most cloud Postgres require SSL. Local Postgres usually does not.
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Creates tables the first time the server runs, and seeds demo data if empty.
async function initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT DEFAULT '',
      isbn TEXT DEFAULT '',
      total_quantity INTEGER NOT NULL DEFAULT 0,
      available_quantity INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      membership_id TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('add','borrow','return')),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      note TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed one admin user so the login page works immediately.
  const userCount = await pool.query('SELECT COUNT(*)::int AS c FROM users');
  if (userCount.rows[0].c === 0) {
    await pool.query(
      "INSERT INTO users (name, membership_id, role) VALUES ('System Admin', 'ADMIN001', 'admin')"
    );
    console.log('Seeded admin user: membership_id = ADMIN001');
  }

  // Seed a few sample books (one has low stock so the dashboard highlight works).
  const bookCount = await pool.query('SELECT COUNT(*)::int AS c FROM books');
  if (bookCount.rows[0].c === 0) {
    await pool.query(
      `INSERT INTO books (title, author, genre, isbn, total_quantity, available_quantity)
       VALUES ($1,$2,$3,$4,$5,$6), ($7,$8,$9,$10,$11,$12), ($13,$14,$15,$16,$17,$18)`,
      [
        'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '9780743273565', 5, 5,
        'Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 'Computer Science', '9780262033848', 3, 1,
        'Atomic Habits', 'James Clear', 'Self-Help', '9780735211292', 4, 4,
      ]
    );
    console.log('Seeded 3 sample books.');
  }
}

module.exports = { pool, initTables };
