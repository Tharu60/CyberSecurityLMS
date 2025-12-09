# System Architecture Document
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Patterns](#2-architecture-patterns)
3. [Component Architecture](#3-component-architecture)
4. [Data Flow](#4-data-flow)
5. [Technology Stack](#5-technology-stack)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Scalability Considerations](#7-scalability-considerations)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. System Overview

### 1.1 System Description

The Cybersecurity LMS is a full-stack web application designed as a three-tier architecture:

- **Presentation Tier:** React SPA (Single Page Application)
- **Application Tier:** Node.js/Express REST API
- **Data Tier:** SQLite (development) / PostgreSQL (production)

### 1.2 High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Client Devices                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐│
│  │ Desktop  │  │  Tablet  │  │  Mobile  │  │  Mobile   ││
│  │ Browser  │  │  Browser │  │  Safari  │  │  Chrome   ││
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬────┘│
└────────┼─────────────┼─────────────┼──────────────┼──────┘
         │             │             │              │
         └─────────────┴─────────────┴──────────────┘
                           │
                    HTTPS (Port 443)
                           │
         ┌─────────────────▼──────────────────┐
         │     CDN / Load Balancer           │
         │  (Cloudflare, AWS CloudFront)      │
         └─────────────────┬──────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │   Web Server / Reverse Proxy       │
         │         (Nginx / Apache)           │
         └─────────────────┬──────────────────┘
                           │
         ┌─────────────────▼──────────────────────────────┐
         │           Application Server                   │
         │  ┌────────────────────────────────────────┐   │
         │  │    React SPA (Static Files)           │   │
         │  │  - HTML, CSS, JavaScript              │   │
         │  │  - Bootstrap Components               │   │
         │  │  - Chart.js Visualizations            │   │
         │  └────────────────────────────────────────┘   │
         │                                                │
         │  ┌────────────────────────────────────────┐   │
         │  │    Node.js/Express API Server         │   │
         │  │  - RESTful API Endpoints              │   │
         │  │  - JWT Authentication                 │   │
         │  │  - Business Logic                     │   │
         │  └──────────────┬─────────────────────────┘   │
         └─────────────────┼──────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │      Database Server               │
         │  ┌──────────────────────────────┐ │
         │  │  SQLite (Dev) / PostgreSQL   │ │
         │  │  - 8 Tables                  │ │
         │  │  - Relational Schema         │ │
         │  │  - Foreign Key Constraints   │ │
         │  └──────────────────────────────┘ │
         └────────────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │    External Services                │
         │  - YouTube (Video Hosting)          │
         │  - Email Service (Future)           │
         └─────────────────────────────────────┘
```

---

## 2. Architecture Patterns

### 2.1 Backend: MVC Pattern

```
Request Flow:

Client Request
     │
     ▼
┌─────────────────┐
│  Express Router │ ◄─── Route definitions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │ ◄─── Authentication, Authorization
└────────┬────────┘      Validation, Error Handling
         │
         ▼
┌─────────────────┐
│   Controller    │ ◄─── Business Logic
└────────┬────────┘      Request Handling
         │
         ▼
┌─────────────────┐
│     Model       │ ◄─── Data Access Layer
└────────┬────────┘      Database Queries
         │
         ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
```

**Example:**
```javascript
// Route
router.post('/stages/:id/questions',
  authenticate,              // Middleware 1
  authorize('student'),      // Middleware 2
  stageController.getQuestions  // Controller
);

// Controller
exports.getQuestions = async (req, res) => {
  const questions = await Question.findByStageId(req.params.id);
  res.json({ questions });
};

// Model
class Question {
  static async findByStageId(stageId) {
    return db.query('SELECT * FROM questions WHERE stage_id = ?', [stageId]);
  }
}
```

### 2.2 Frontend: Component Architecture

```
┌────────────────────────────────────────┐
│             App.js (Root)              │
│         ┌──────────────────┐           │
│         │  AuthContext     │           │
│         │  (Global State)  │           │
│         └──────────────────┘           │
└─────────────────┬──────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐    ┌─────▼────────┐
│  Public Routes │    │ Private Routes│
│  - Login       │    │ - Dashboard   │
│  - Register    │    │ - Quiz        │
│  - Verify Cert │    │ - Progress    │
└────────────────┘    └───────┬───────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
           ┌────────▼────────┐  ┌────────▼────────┐
           │  Shared Components│  │  Page Components│
           │  - PrivateRoute  │  │  - Dashboard    │
           │  - MobileNav     │  │  - Quiz         │
           │  - SwipeableCard │  │  - StageView    │
           └──────────────────┘  └──────────────────┘
```

### 2.3 RESTful API Design

**Resource-Based URLs:**
```
/api/auth/register          POST    - Register user
/api/auth/login             POST    - Login
/api/stages                 GET     - List all stages
/api/stages/:id             GET     - Get specific stage
/api/stages/:id/questions   GET     - Get stage questions
/api/progress/my-progress   GET     - Get user progress
/api/certificates/generate  POST    - Generate certificate
```

**HTTP Methods:**
- GET: Retrieve data
- POST: Create data
- PUT: Update data
- DELETE: Delete data

---

## 3. Component Architecture

### 3.1 Backend Components

**Server Entry Point (server.js):**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/progress', progressRoutes);
// ... more routes

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Controllers (Business Logic):**
- authController: Registration, login, profile
- stageController: Stage CRUD operations
- progressController: Progress tracking, quiz submission
- questionController: Question management
- videoController: Video management
- adminController: User management, statistics
- certificateController: Certificate generation

**Models (Data Layer):**
- User: User account operations
- Stage: Stage data operations
- Question: Question CRUD
- Video: Video CRUD
- Progress: Progress tracking

**Middleware:**
- authenticate: JWT token verification
- authorize: Role-based access control
- errorHandler: Global error handling (future)
- validator: Input validation (future)

### 3.2 Frontend Components

**Context Providers:**
```javascript
<AuthProvider>
  <App />
</AuthProvider>
```

**Routing Structure:**
```javascript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/student/*" element={
      <PrivateRoute allowedRoles={['student']}>
        <StudentRoutes />
      </PrivateRoute>
    } />

    <Route path="/instructor/*" element={
      <PrivateRoute allowedRoles={['instructor', 'admin']}>
        <InstructorRoutes />
      </PrivateRoute>
    } />

    <Route path="/admin/*" element={
      <PrivateRoute allowedRoles={['admin']}>
        <AdminRoutes />
      </PrivateRoute>
    } />
  </Routes>
</BrowserRouter>
```

### 3.3 Service Layer

**API Service (axios):**
```javascript
// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Logout user
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 4. Data Flow

### 4.1 Authentication Flow

```
┌────────┐                ┌────────┐               ┌──────────┐
│ Client │                │  API   │               │ Database │
└───┬────┘                └───┬────┘               └────┬─────┘
    │                         │                          │
    │  POST /auth/register    │                          │
    ├────────────────────────►│                          │
    │  {name, email, pass}    │                          │
    │                         │                          │
    │                         │  Hash password (bcrypt)  │
    │                         │                          │
    │                         │  INSERT user             │
    │                         ├─────────────────────────►│
    │                         │                          │
    │                         │  User created            │
    │                         │◄─────────────────────────┤
    │                         │                          │
    │                         │  Generate JWT token      │
    │                         │                          │
    │  201 + {token, user}    │                          │
    │◄────────────────────────┤                          │
    │                         │                          │
    │  Store token in         │                          │
    │  localStorage           │                          │
    │                         │                          │
    │  Subsequent requests    │                          │
    │  include token          │                          │
    ├────────────────────────►│                          │
    │  Authorization:         │                          │
    │  Bearer <token>         │                          │
    │                         │  Verify token            │
    │                         │                          │
    │                         │  Extract user info       │
    │                         │                          │
    │                         │  Proceed with request    │
    │                         │                          │
```

### 4.2 Quiz Submission Flow

```
Student Dashboard
       │
       ▼
  Click "Take Quiz"
       │
       ▼
  Quiz Component Loads
       │
       ├─► GET /stages/:id/questions
       │   └─► Returns questions (without correct_answer)
       │
       ▼
  Student Answers Questions
  (Stored in component state)
       │
       ▼
  Click "Submit"
       │
       ▼
  POST /progress/stage-assessment
  {stageId, answers: [{questionId, selectedAnswer}]}
       │
       ▼
  Backend Controller
       │
       ├─► Fetch correct answers from DB
       │
       ├─► Compare selected vs correct
       │
       ├─► Calculate score
       │
       ├─► Determine pass/fail (60%)
       │
       ├─► INSERT INTO stage_results
       │
       ├─► IF passed: UPDATE user_progress.current_stage
       │
       └─► Return results {score, passed, results: [...]}
       │
       ▼
  Frontend Displays Results Modal
       │
       └─► If passed: Unlock next stage
```

### 4.3 Certificate Generation Flow

```
Student completes Stage 5
       │
       ▼
  Navigate to /student/certificate
       │
       ▼
  Frontend checks eligibility
       │
       ├─► GET /progress/my-progress
       │   └─► Returns stageResults
       │
       ▼
  Check if all 5 stages passed
       │
       ├─ Not all passed ──► Show "Complete stages" message
       │
       └─ All passed
            │
            ▼
       Show "Generate Certificate" button
            │
            ▼
       Student clicks button
            │
            ▼
       POST /certificates/generate
            │
            ▼
       Backend verifies eligibility again
            │
            ├─► Query stage_results for stages 1-5
            │
            ├─► Verify all passed = true
            │
            ├─► Check certificate doesn't exist
            │
            ├─► Generate unique 16-char hex code
            │
            ├─► INSERT INTO certificates
            │
            └─► Return certificate data
            │
            ▼
       Frontend displays certificate
```

---

## 5. Technology Stack

### 5.1 Backend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 14+ | JavaScript runtime |
| Framework | Express.js | 5.1.0 | Web framework |
| Database | SQLite | 3.x | Development database |
| Database (Prod) | PostgreSQL | 13+ | Production database |
| Authentication | jsonwebtoken | 9.0.2 | JWT tokens |
| Password Hashing | bcryptjs | 3.0.2 | Password encryption |
| CORS | cors | 2.8.5 | Cross-origin requests |
| Environment | dotenv | 17.2.3 | Config management |

### 5.2 Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Library | React | 19.2.0 | UI library |
| Routing | React Router | 7.9.4 | Client-side routing |
| HTTP Client | Axios | 1.12.2 | API requests |
| UI Framework | Bootstrap | 5.3.8 | CSS framework |
| Charts | Chart.js | 4.5.1 | Data visualization |
| State Management | Context API | Built-in | Global state |

### 5.3 Development Tools

- Git: Version control
- npm: Package management
- VS Code: Code editor
- Postman: API testing
- Chrome DevTools: Debugging

---

## 6. Deployment Architecture

### 6.1 Development Environment

```
Developer Machine
├── Backend (Port 5000)
│   ├── Node.js + Express
│   └── SQLite (lms.db)
└── Frontend (Port 3000)
    └── React Dev Server
```

### 6.2 Production Environment (Recommended)

```
┌──────────────────────────────────────────────┐
│           Domain: yourdomain.com             │
└──────────────────┬───────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │    CDN Provider    │
         │   (Cloudflare)     │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────────────┐
         │   Load Balancer (Optional) │
         └─────────┬──────────────────┘
                   │
         ┌─────────▼──────────┐
         │   Nginx/Apache     │
         │   (Reverse Proxy)  │
         └─────────┬──────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
┌──────▼────────┐    ┌──────────▼────────┐
│  Static Files │    │  API Server       │
│  (Frontend)   │    │  (Node.js)        │
│  Port 80/443  │    │  Port 5000        │
└───────────────┘    └──────────┬────────┘
                                │
                     ┌──────────▼────────┐
                     │   PostgreSQL      │
                     │   Port 5432       │
                     └───────────────────┘
```

### 6.3 Scalability Architecture (Future)

```
┌────────────────────────────────────────┐
│       Load Balancer (HAProxy/AWS)      │
└────────────┬───────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼────┐
│ API    │      │  API     │
│ Server │      │  Server  │
│   1    │      │    2     │
└───┬────┘      └─────┬────┘
    │                 │
    └────────┬────────┘
             │
    ┌────────▼─────────┐
    │  Redis Cache     │
    └────────┬─────────┘
             │
    ┌────────▼─────────────┐
    │  PostgreSQL Primary  │
    └────────┬─────────────┘
             │
    ┌────────▼──────────────┐
    │ PostgreSQL Read Replica│
    └───────────────────────┘
```

---

## 7. Scalability Considerations

### 7.1 Current Limitations

**SQLite:**
- Single-user writes
- File-based (no network access)
- Limited concurrency (~50 users)

**Single Server:**
- No horizontal scaling
- Single point of failure
- Limited by server resources

### 7.2 Scalability Path

**Phase 1: Database Migration**
- Migrate SQLite → PostgreSQL
- Supports 1000+ concurrent users
- Network-accessible
- Better query optimization

**Phase 2: Application Scaling**
- PM2 cluster mode (multiple processes)
- Load balancer (Nginx/HAProxy)
- Multiple API servers
- Session sharing (Redis)

**Phase 3: Caching Layer**
- Redis for session storage
- Cache frequently accessed data
- Reduce database load

**Phase 4: CDN Integration**
- Serve static assets from CDN
- Reduce latency globally
- Offload traffic from origin

**Phase 5: Microservices (Future)**
- Separate services:
  - Authentication Service
  - Content Service
  - Progress Service
  - Analytics Service
- Independent scaling
- Technology flexibility

---

## 8. Performance Optimization

### 8.1 Backend Optimizations

**Database:**
- Indexes on foreign keys
- Query optimization
- Connection pooling
- Prepared statements

**API:**
- Response compression (Gzip)
- Pagination for large datasets
- Caching headers
- Rate limiting

**Code:**
- Async/await for I/O
- Avoid blocking operations
- Error handling
- Memory management

### 8.2 Frontend Optimizations

**Code Splitting:**
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quiz = lazy(() => import('./pages/Quiz'));
```

**Bundle Optimization:**
- Minification (production build)
- Tree shaking
- Code splitting
- Lazy loading

**Performance:**
- React.memo for expensive components
- useCallback for functions
- useMemo for calculations
- Debounced inputs

**Network:**
- Axios interceptors
- Request caching
- Minimize API calls
- Parallel requests where possible

### 8.3 Monitoring

**Metrics to Track:**
- API response times
- Database query times
- Error rates
- User sessions
- Resource usage (CPU, RAM)

**Tools:**
- PM2 monitoring
- New Relic / Datadog
- Google Analytics
- Sentry (error tracking)

---

## Summary

**Architecture Type:** Three-tier web application

**Key Characteristics:**
- RESTful API
- Stateless backend (JWT)
- SPA frontend
- Rel ational database

**Strengths:**
- Simple to understand
- Easy to develop
- Scalable path available
- Modern tech stack

**Production Ready:** Yes (with PostgreSQL)

**Scalability:** Good (with proposed enhancements)

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
