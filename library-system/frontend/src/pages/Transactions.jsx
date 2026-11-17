import { useState, useEffect } from 'react';
import { api } from '../api.js';

// Transactions page: record stock movements (add / borrow / return) and view
// the full history log. A borrow requires selecting which user takes the book.
export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    book_id: '', type: 'borrow', quantity: 1, user_id: '', note: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAll = () => {
    api.getBooks().then(setBooks).catch((e) => setError(e.message));
    api.getUsers().then(setUsers).catch(() => {});
    api.getTransactions().then(setTransactions).catch((e) => setError(e.message));
  };

  useEffect(() => { loadAll(); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      if (!form.book_id) throw new Error('Please select a book.');
      const qty = parseInt(form.quantity, 10);
      if (!qty || qty < 1) throw new Error('Quantity must be at least 1.');
      const payload = { book_id: form.book_id, type: form.type, quantity: qty, note: form.note };
      if (form.type === 'borrow') {
        if (!form.user_id) throw new Error('Please select which user is borrowing the book.');
        payload.user_id = form.user_id;
      }
      await api.addTransaction(payload);
      setMessage('Transaction recorded — stock updated.');
      setForm({ book_id: '', type: 'borrow', quantity: 1, user_id: '', note: '' });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const typeLabel = { add: 'Stock Added', borrow: 'Borrowed Out', return: 'Returned In' };

  return (
    <div>
      <h1>Transactions</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Record Stock Movement</h3>
        <label>Book
          <select value={form.book_id} onChange={set('book_id')}>
            <option value="">— select a book —</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} (available: {b.available_quantity})
              </option>
            ))}
          </select>
        </label>
        <label>Movement Type
          <select value={form.type} onChange={set('type')}>
            <option value="add">Add Stock — new copies arrived</option>
            <option value="borrow">Borrow — deduct stock</option>
            <option value="return">Return — add copies back</option>
          </select>
        </label>
        <label>Quantity
          <input type="number" min="1" value={form.quantity} onChange={set('quantity')} />
        </label>
        {form.type === 'borrow' && (
          <label>Borrowed by (user)
            <select value={form.user_id} onChange={set('user_id')}>
              <option value="">— select a user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
              ))}
            </select>
          </label>
        )}
        <label>Note (optional)
          <input value={form.note} onChange={set('note')} placeholder="e.g. new shipment" />
        </label>
        <button type="submit" className="btn-primary">Record Transaction</button>
      </form>

      <h2>Transaction History</h2>
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>User</th><th>Note</th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.created_at).toLocaleString()}</td>
              <td>{t.book_title || '—'}</td>
              <td><span className={`badge-${t.type}`}>{typeLabel[t.type]}</span></td>
              <td>{t.quantity}</td>
              <td>{t.user_name || '—'}</td>
              <td>{t.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
