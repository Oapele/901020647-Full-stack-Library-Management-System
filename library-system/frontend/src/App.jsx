import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';

// App holds the logged-in user (kept in localStorage so a refresh keeps you in).
// The nav bar + routes live here; each page manages its own data with fetch.
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('library-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem('library-user', JSON.stringify(currentUser));
    else localStorage.removeItem('library-user');
  }, [currentUser]);

  const handleLogout = () => setCurrentUser(null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">📚</span>
          <div>
            <div className="brand-name">The Reading Room</div>
            <div className="brand-caption">Your little book nook</div>
          </div>
        </div>
        <div className="nav-label">Explore</div>
        <nav className="nav-links">
          <NavLink to="/" end><span className="nav-icon" aria-hidden="true">⌂</span>Dashboard</NavLink>
          <NavLink to="/books"><span className="nav-icon" aria-hidden="true">▤</span>Book shelf</NavLink>
          <NavLink to="/transactions"><span className="nav-icon" aria-hidden="true">↔</span>Transactions</NavLink>
          <NavLink to="/users"><span className="nav-icon" aria-hidden="true">♡</span>Members</NavLink>
        </nav>
        <div className="sidebar-note">
          <strong>A little escape, anytime.</strong>
          <span>Pick a book, find a new world, and let the next chapter begin.</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div>
            <div className="eyebrow">A cozy corner for curious minds</div>
            <div className="topbar-title">Discover something wonderful today</div>
          </div>
          <div className="user-chip">
          {currentUser ? (
            <>
              <span className="user-avatar" aria-hidden="true">{currentUser.name?.charAt(0)?.toUpperCase() || 'R'}</span>
              <span>{currentUser.name} <span className="user-role">({currentUser.role})</span></span>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <span className="user-avatar" aria-hidden="true">♡</span>
              <span>Welcome, reader</span>
            </>
          )}
          </div>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route
              path="/users"
              element={<Users currentUser={currentUser} onLogin={setCurrentUser} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
