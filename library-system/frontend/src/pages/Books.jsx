import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookCover from '../components/BookCover.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBooks = () => api.getBooks().then(setBooks).catch((e) => setError(e.message));

  useEffect(() => { loadBooks(); }, []);

  const handleAdd = async (book) => {
    setError(''); setMessage('');
    try {
      await api.addBook(book);
      setMessage('Book added successfully.');
      loadBooks();
    } catch (e) { setError(e.message); }
  };

  const handleUpdate = async (book) => {
    setError(''); setMessage('');
    try {
      await api.updateBook(editing.id, book);
      setEditing(null);
      setMessage('Book updated.');
      loadBooks();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? Its transaction history will be removed too.')) return;
    setError(''); setMessage('');
    try {
      await api.deleteBook(id);
      setMessage('Book deleted.');
      loadBooks();
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow">Every cover hides a new world</div>
          <h1>Our book shelf</h1>
          <p>Browse the collection and find a story that feels like yours.</p>
        </div>
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <BookForm
        initial={editing}
        submitLabel={editing ? 'Update Book' : 'Add a Book'}
        onSubmit={editing ? handleUpdate : handleAdd}
      />
      {editing && (
        <p><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel edit</button></p>
      )}

      <div className="section-heading">
        <div>
          <h2>All the stories</h2>
          <p>{books.length} {books.length === 1 ? 'book' : 'books'} waiting to be discovered</p>
        </div>
      </div>
      {books.length > 0 ? (
        <div className="book-grid">
          {books.map((book) => (
            <article className="book-card" key={book.id}>
              <BookCover book={book} />
              <div className="book-info">
                <h3 title={book.title}>{book.title}</h3>
                <p title={book.author}>by {book.author}</p>
                <div className="book-meta">
                  <span className="genre-tag">{book.genre || 'A good story'}</span>
                  <span className={`availability ${book.available_quantity < 2 ? 'low' : ''}`}>
                    {book.available_quantity} / {book.total_quantity} available
                  </span>
                </div>
                <div className="book-actions">
                  <button className="btn-secondary" onClick={() => setEditing(book)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(book.id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card muted">No books just yet. Add the first one above to start your collection.</div>
      )}
    </>
  );
}
