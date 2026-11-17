# Library Management System

Full-stack coursework project: **React** frontend + **Express.js** REST API + **PostgreSQL** database, communicating with the **Fetch API**.

## What it does (matches the brief)

| Page | Features |
|------|----------|
| **Dashboard** | Stats (titles / total copies / available / low-stock), low-stock alert for books with fewer than 2 copies, full availability table |
| **Books** | Add book (title, author, genre, ISBN, initial quantity), edit, delete — reusable controlled form component |
| **Transactions** | Record stock movements (add / borrow / return), borrow requires selecting a user, full history log |
| **Users** | Login by membership ID; admin view can add / edit / delete users (name, membership ID, role) |

**Demo admin login:** `ADMIN001` (auto-created on first run, along with 3 sample books).

## Project structure

```
library-system/
├── backend/               Express + PostgreSQL REST API
│   ├── package.json
│   ├── server.js          all routes (books / users / transactions / login)
│   ├── db.js              pg connection + auto-create tables + seed data
│   └── .env.example       copy to .env and set DATABASE_URL
└── frontend/              React (Vite) + React Router
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx       entry point + BrowserRouter
        ├── App.jsx        nav bar + routes + login state
        ├── api.js         Fetch API helper (all backend calls)
        ├── index.css      styling
        ├── components/    BookForm.jsx, UserForm.jsx (reusable)
        └── pages/         Dashboard.jsx, Books.jsx, Transactions.jsx, Users.jsx
```
