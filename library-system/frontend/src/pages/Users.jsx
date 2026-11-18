import { useState, useEffect } from 'react';
import { api } from '../api.js';
import UserForm from '../components/UserForm.jsx';

// User Management page. If not logged in, shows the login form (membership ID).
// Once logged in as admin, shows add/edit/delete user controls. A normal member
export default function Users({ currentUser, onLogin }) {
  const [membershipId, setMembershipId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = () => api.getUsers().then(setUsers).catch((e) => setError(e.message));

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') loadUsers();
  }, [currentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const user = await api.login(membershipId.trim());
      onLogin(user);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="login-wrap">
        <h1>User Login</h1>
        <form className="card form" onSubmit={handleLogin}>
          {loginError && <p className="error">{loginError}</p>}
          <label>Membership ID
            <input
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              placeholder="e.g. ADMIN001"
              autoFocus
            />
          </label>
          <button type="submit" className="btn-primary">Log In</button>
          <p className="hint">Demo admin account: <strong>ADMIN001</strong></p>
        </form>
      </div>
    );
  }

  const handleAdd = async (user) => {
    setError(''); setMessage('');
    try { await api.addUser(user); setMessage('User added.'); loadUsers(); }
    catch (e) { setError(e.message); }
  };

  const handleUpdate = async (user) => {
    setError(''); setMessage('');
    try { await api.updateUser(editing.id, user); setEditing(null); setMessage('User updated.'); loadUsers(); }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError(''); setMessage('');
    try { await api.deleteUser(id); setMessage('User deleted.'); loadUsers(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div>
      <h1>User Management</h1>
      <p className="success">
        Logged in as <strong>{currentUser.name}</strong> — role: {currentUser.role}.
      </p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {currentUser.role === 'admin' ? (
        <>
          <UserForm
            initial={editing}
            submitLabel={editing ? 'Update User' : 'Add User'}
            onSubmit={editing ? handleUpdate : handleAdd}
          />
          {editing && (
            <p><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel edit</button></p>
          )}

          <h2>All Users</h2>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.membership_id}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => setEditing(u)}>Edit</button>{' '}
                    <button className="btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>You are signed in as a member. Only admin accounts can add, edit, or delete users.</p>
      )}
    </div>
  );
}
