// api.js — a tiny Fetch API helper. Every page calls these functions instead of
// writing fetch() directly. This keeps the code clean and in one place.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  // Parse JSON (empty body -> {}). Throw an Error with the server's message if not ok.
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Books
  getBooks: () => request('/books'),
  addBook: (book) => request('/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, book) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Users + login
  getUsers: () => request('/users'),
  addUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  login: (membershipId) =>
    request('/users/login', { method: 'POST', body: JSON.stringify({ membership_id: membershipId }) }),

  // Transactions (stock in / out)
  getTransactions: () => request('/transactions'),
  addTransaction: (tx) => request('/transactions', { method: 'POST', body: JSON.stringify(tx) }),
};
