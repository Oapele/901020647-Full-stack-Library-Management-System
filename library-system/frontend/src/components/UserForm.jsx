import { useState, useEffect } from 'react';

// Reusable controlled form for adding OR editing a user.
// Pass `initial` (a user object) to switch to edit mode.
export default function UserForm({ initial, onSubmit, submitLabel = 'Add User' }) {
  const [form, setForm] = useState({ name: '', membership_id: '', role: 'member' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        membership_id: initial.membership_id,
        role: initial.role || 'member',
      });
    }
  }, [initial]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.membership_id.trim()) {
      setError('Name and membership ID are required.');
      return;
    }
    setError('');
    onSubmit(form);
    if (!initial) setForm({ name: '', membership_id: '', role: 'member' });
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{submitLabel}</h3>
      {error && <p className="error">{error}</p>}
      <label>Name
        <input value={form.name} onChange={set('name')} placeholder="Full name" />
      </label>
      <label>Membership ID
        <input value={form.membership_id} onChange={set('membership_id')} placeholder="e.g. MEM003" />
      </label>
      <label>Role
        <select value={form.role} onChange={set('role')}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
