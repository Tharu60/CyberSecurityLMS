# Developer Guide
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Project Structure](#2-project-structure)
3. [Backend Development](#3-backend-development)
4. [Frontend Development](#4-frontend-development)
5. [Database Development](#5-database-development)
6. [API Development](#6-api-development)
7. [Testing](#7-testing)
8. [Code Style](#8-code-style)
9. [Contributing](#9-contributing)
10. [Common Tasks](#10-common-tasks)

---

## 1. Getting Started

### 1.1 Development Environment Setup

**Required Tools:**
```bash
# Node.js (v18 recommended)
node -v  # Should show v18.x.x

# npm or yarn
npm -v

# Git
git --version
```

**Clone and Setup:**
```bash
# Clone repository
git clone https://github.com/yourusername/lms.git
cd lms

# Backend setup
cd backend
npm install
npm run seed
npm start

# Frontend setup (new terminal)
cd ../client
npm install
npm start
```

### 1.2 IDE Setup (VS Code)

**Recommended Extensions:**
- ESLint
- Prettier
- JavaScript (ES6) code snippets
- React snippets
- SQLite Viewer
- GitLens

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 2. Project Structure

### 2.1 Repository Structure

```
lms/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── stageController.js    # Stage management
│   │   ├── progressController.js # Progress tracking
│   │   ├── questionController.js # Question CRUD
│   │   ├── videoController.js    # Video CRUD
│   │   ├── adminController.js    # Admin functions
│   │   └── certificateController.js # Certificate logic
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Stage.js              # Stage model
│   │   ├── Question.js           # Question model
│   │   ├── Video.js              # Video model
│   │   └── Progress.js           # Progress model
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── stageRoutes.js        # Stage endpoints
│   │   ├── progressRoutes.js     # Progress endpoints
│   │   ├── questionRoutes.js     # Question endpoints
│   │   ├── videoRoutes.js        # Video endpoints
│   │   ├── adminRoutes.js        # Admin endpoints
│   │   └── certificateRoutes.js  # Certificate endpoints
│   ├── middleware/
│   │   └── auth.js               # JWT verification & RBAC
│   ├── utils/
│   │   └── seeder.js             # Database seeder
│   ├── scripts/
│   │   ├── runSeeder.js          # Run seeder script
│   │   ├── createDefaultUsers.js
│   │   └── inspectDatabase.js
│   ├── .env                      # Environment variables
│   ├── .gitignore
│   ├── server.js                 # Express entry point
│   ├── package.json
│   └── lms.db                    # SQLite database
│
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── PrivateRoute.js
│   │   │   ├── MobileNav.js
│   │   │   └── SwipeableCard.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Unauthorized.js
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── InitialAssessment.js
│   │   │   │   ├── StageView.js
│   │   │   │   ├── Quiz.js
│   │   │   │   ├── Progress.js
│   │   │   │   └── Certificate.js
│   │   │   ├── instructor/
│   │   │   │   └── Dashboard.js
│   │   │   └── admin/
│   │   │       └── Dashboard.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Quiz.css
│   │   │   └── ...
│   │   ├── App.js
│   │   └── index.js
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── CLAUDE.md              # Project guidelines
├── QUESTION.txt           # Question bank
├── Video.txt              # Video list
├── SRS.md                 # Requirements
├── USE_CASES.md           # Use cases
└── README.md
```

### 2.2 Architecture Pattern

**Backend:** MVC (Model-View-Controller)
- **Models:** Data structures and database queries
- **Controllers:** Business logic
- **Routes:** API endpoint definitions

**Frontend:** Component-based with Context API
- **Pages:** Top-level route components
- **Components:** Reusable UI elements
- **Context:** Global state management

---

## 3. Backend Development

### 3.1 Adding New Endpoint

**Step 1: Create Route**

`routes/newFeatureRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const newFeatureController = require('../controllers/newFeatureController');

router.get('/', authenticate, newFeatureController.getAll);
router.post('/', authenticate, authorize('admin'), newFeatureController.create);

module.exports = router;
```

**Step 2: Create Controller**

`controllers/newFeatureController.js`:
```javascript
const NewFeature = require('../models/NewFeature');

exports.getAll = async (req, res) => {
  try {
    const items = await NewFeature.findAll();
    res.json({ items });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Name required' });
    }

    const newItem = await NewFeature.create({ name, description });
    res.status(201).json({ message: 'Created successfully', item: newItem });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**Step 3: Create Model**

`models/NewFeature.js`:
```javascript
const db = require('../config/database');

class NewFeature {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM new_features ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(data) {
    return new Promise((resolve, reject) => {
      const { name, description } = data;
      db.run(
        'INSERT INTO new_features (name, description) VALUES (?, ?)',
        [name, description],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, description });
        }
      );
    });
  }
}

module.exports = NewFeature;
```

**Step 4: Register Route**

`server.js`:
```javascript
const newFeatureRoutes = require('./routes/newFeatureRoutes');
app.use('/api/new-feature', newFeatureRoutes);
```

### 3.2 Database Migrations

**Create Migration File:**

`migrations/add_new_column.js`:
```javascript
const db = require('../config/database');

const up = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      ALTER TABLE users ADD COLUMN phone_number TEXT
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const down = () => {
  return new Promise((resolve, reject) => {
    // SQLite doesn't support DROP COLUMN easily
    // May need to recreate table
    resolve();
  });
};

module.exports = { up, down };
```

**Run Migration:**
```bash
node migrations/add_new_column.js
```

### 3.3 Authentication Flow

**JWT Token Generation:**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

**Middleware Usage:**
```javascript
// Protect route (authentication only)
router.get('/protected', authenticate, controller.method);

// Protect with authorization
router.post('/admin-only', authenticate, authorize('admin'), controller.method);

// Multiple roles
router.put('/content', authenticate, authorize('instructor', 'admin'), controller.method);
```

---

## 4. Frontend Development

### 4.1 Adding New Page

**Step 1: Create Page Component**

`pages/student/NewPage.js`:
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './NewPage.css';

const NewPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      setData(response.data.items);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="new-page">
      <h1>New Page</h1>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default NewPage;
```

**Step 2: Add Route**

`App.js`:
```javascript
import NewPage from './pages/student/NewPage';

<Route
  path="/student/new-page"
  element={
    <PrivateRoute allowedRoles={['student']}>
      <NewPage />
    </PrivateRoute>
  }
/>
```

**Step 3: Add Navigation Link**

```javascript
<Link to="/student/new-page">New Page</Link>
```

### 4.2 API Service Pattern

**services/api.js:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.3 Context Pattern

**Creating New Context:**

`context/ThemeContext.js`:
```javascript
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 5. Database Development

### 5.1 Query Patterns

**Parameterized Queries (Always!):**
```javascript
// GOOD - Prevents SQL injection
db.run(
  'SELECT * FROM users WHERE email = ?',
  [email],
  (err, row) => { /* ... */ }
);

// BAD - Vulnerable to SQL injection
db.run(
  `SELECT * FROM users WHERE email = '${email}'`,
  (err, row) => { /* ... */ }
);
```

**Async/Await Pattern:**
```javascript
static async findById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
```

### 5.2 Transaction Pattern

```javascript
const runTransaction = async (queries) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        queries.forEach(query => {
          db.run(query.sql, query.params);
        });
        db.run('COMMIT');
        resolve();
      } catch (error) {
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
};
```

---

## 6. API Development

### 6.1 Request/Response Format

**Standard Response:**
```javascript
// Success
res.status(200).json({
  message: 'Success message',
  data: { /* response data */ }
});

// Error
res.status(400).json({
  message: 'Error message',
  error: process.env.NODE_ENV === 'development' ? error : {}
});
```

### 6.2 Validation Pattern

```javascript
const validateInput = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  next();
};

router.post('/endpoint', validateInput, controller.create);
```

---

## 7. Testing

### 7.1 Unit Testing (Jest)

**Install Dependencies:**
```bash
npm install --save-dev jest supertest
```

**Test Example:**

`tests/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/register - success', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'test123',
        role: 'student',
        governmentId: 'TEST/12345'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

**Run Tests:**
```bash
npm test
```

---

## 8. Code Style

### 8.1 Naming Conventions

**Variables:**
```javascript
// camelCase
const userName = 'John';
const isActive = true;
const totalCount = 100;
```

**Constants:**
```javascript
// UPPER_SNAKE_CASE
const API_URL = 'http://localhost:5000';
const MAX_ATTEMPTS = 3;
```

**Functions:**
```javascript
// camelCase, verb-based
function getUserById(id) { }
function calculateScore(answers) { }
function validateEmail(email) { }
```

**Classes:**
```javascript
// PascalCase
class UserModel { }
class QuizController { }
```

### 8.2 Code Formatting

**ESLint Configuration (.eslintrc.json):**
```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

---

## 9. Contributing

### 9.1 Git Workflow

**Branch Naming:**
```
feature/add-password-reset
bugfix/quiz-submission-error
hotfix/security-vulnerability
docs/update-readme
```

**Commit Messages:**
```
feat: Add password reset functionality
fix: Fix quiz submission bug
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify authentication logic
test: Add unit tests for auth
```

**Workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## 10. Common Tasks

### 10.1 Add New User Role

1. Update database CHECK constraint
2. Modify auth middleware
3. Update frontend routing
4. Add role-specific pages

### 10.2 Add New Stage

1. Insert into `stages` table
2. Add questions to `questions` table
3. Add videos to `videos` table
4. Update seeder if needed

### 10.3 Debug Production Issues

```bash
# Check logs
pm2 logs lms-backend

# Monitor resources
pm2 monit

# Database queries
sqlite3 lms.db

# Check environment
pm2 env 0
```

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
