import { useState, useEffect } from 'react';

// Reusable controlled form for adding OR editing a book.
// Pass `initial` (a book object) to switch to edit mode; quantity is hidden in
// edit mode because stock changes happen through Transactions instead.
export default function BookForm({ initial, onSubmit, submitLabel = 'Add Book' }) {
  const [form, setForm] = useState({
    title: '', author: '', genre: '', isbn: '', initial_quantity: 1,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        author: initial.author,
        genre: initial.genre || '',
        isbn: initial.isbn || '',
        initial_quantity: initial.total_quantity,
      });
    }
  }, [initial]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError('Title and author are required.');
      return;
    }
    const qty = parseInt(form.initial_quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity must be a whole number of 0 or more.');
      return;
    }
    setError('');
    onSubmit({ ...form, initial_quantity: qty });
    if (!initial) {
      setForm({ title: '', author: '', genre: '', isbn: '', initial_quantity: 1 });
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{submitLabel}</h3>
      {error && <p className="error">{error}</p>}
      <label>Title
        <input value={form.title} onChange={set('title')} placeholder="e.g. The Great Gatsby" />
      </label>
      <label>Author
        <input value={form.author} onChange={set('author')} placeholder="e.g. F. Scott Fitzgerald" />
      </label>
      <label>Genre
        <input value={form.genre} onChange={set('genre')} placeholder="e.g. Fiction" />
      </label>
      <label>ISBN
        <input value={form.isbn} onChange={set('isbn')} placeholder="e.g. 9780743273565" />
        <span className="field-hint">Add an ISBN to look up the book's real cover.</span>
      </label>
      {!initial && (
        <label>Initial Quantity
          <input type="number" min="0" value={form.initial_quantity} onChange={set('initial_quantity')} />
        </label>
      )}
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
