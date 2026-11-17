import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import BookCover from '../components/BookCover.jsx';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBooks()
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Opening the book shelves…</p>;
  if (error) return <p className="error">Could not load books: {error}</p>;

  const totalCopies = books.reduce((sum, book) => sum + book.total_quantity, 0);
  const totalAvailable = books.reduce((sum, book) => sum + book.available_quantity, 0);
  const lowStock = books.filter((book) => book.available_quantity < 2);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">Welcome to your happy place</div>
          <h1>So many books.<br />So little time.</h1>
          <p>Wander through the shelves, find your next favorite, and make room for a little wonder.</p>
          <Link className="hero-cta" to="/books">Explore the book shelf <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="stats" aria-label="Library statistics">
        <div className="stat-card"><div className="stat-label">Lovely titles</div><div className="stat-num">{books.length}</div></div>
        <div className="stat-card"><div className="stat-label">Books on the shelves</div><div className="stat-num">{totalCopies}</div></div>
        <div className="stat-card"><div className="stat-label">Ready for a new reader</div><div className="stat-num">{totalAvailable}</div></div>
        <div className={`stat-card ${lowStock.length > 0 ? 'warn' : ''}`}>
          <div className="stat-label">Almost all checked out</div>
          <div className="stat-num">{lowStock.length}</div>
        </div>
      </section>

      {lowStock.length > 0 && (
        <div className="card low-stock-alert">
          <h3>A few favorites are nearly gone</h3>
          <ul>
            {lowStock.map((book) => (
              <li key={book.id}><strong>{book.title}</strong> — {book.available_quantity} of {book.total_quantity} copies available</li>
            ))}
          </ul>
        </div>
      )}

      <div className="section-heading">
        <div>
          <h2>Pick your next read</h2>
          <p>A few stories from around the shelves</p>
        </div>
        <Link className="text-link" to="/books">See all books →</Link>
      </div>
      {books.length > 0 ? (
        <div className="book-grid">
          {books.slice(0, 4).map((book) => (
            <article className="book-card" key={book.id}>
              <BookCover book={book} />
              <div className="book-info">
                <h3 title={book.title}>{book.title}</h3>
                <p title={book.author}>by {book.author}</p>
                <div className="book-meta">
                  <span className="genre-tag">{book.genre || 'A good story'}</span>
                  <span className={`availability ${book.available_quantity < 2 ? 'low' : ''}`}>
                    {book.available_quantity} left
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card muted">The shelves are waiting for their first story. Add a book to get started!</div>
      )}
    </>
  );
}
