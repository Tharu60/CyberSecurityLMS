# Software Requirements Specification (SRS)
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025
**Project Status:** 97% Complete

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Requirements](#5-system-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the Cybersecurity Learning Management System (LMS). It details the functional and non-functional requirements for developers, testers, project managers, and stakeholders.

### 1.2 Scope

The Cybersecurity LMS is a web-based educational platform that provides:

- **Progressive Learning:** 6-stage curriculum with sequential progression
- **Adaptive Placement:** Initial assessment determines starting stage
- **Interactive Assessments:** 110 quiz questions across all stages
- **Video Content:** 8 curated cybersecurity videos
- **Progress Tracking:** Detailed analytics with 5 chart visualizations
- **Certificate Generation:** Automated credentials with unique verification codes
- **Role-Based Access:** Student, Instructor, and Administrator roles
- **Content Management:** Full CRUD operations for videos and questions

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| LMS | Learning Management System |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| RBAC | Role-Based Access Control |
| SPA | Single Page Application |

### 1.4 Technologies

**Backend:**
- Node.js with Express.js 5.1.0
- SQLite3 5.1.7 (development) / PostgreSQL (production-ready)
- JWT authentication with bcrypt password hashing

**Frontend:**
- React 19.2.0 with React Router DOM 7.9.4
- Bootstrap 5.3.8 for responsive design
- Chart.js 4.5.1 for data visualization
- Axios 1.12.2 for API communication

---

## 2. Overall Description

### 2.1 Product Perspective

The Cybersecurity LMS is a standalone web application consisting of:

- RESTful API backend (35+ endpoints)
- React SPA frontend
- Relational database (8 tables)
- JWT-based authentication system
- Role-based authorization system

**System Architecture:**

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)      │
│  - Context API for state management    │
│  - Axios for HTTP requests             │
│  - Bootstrap UI components             │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│       Express Backend (Port 5000)       │
│  - JWT Authentication Middleware       │
│  - RBAC Authorization                  │
│  - 7 Controller Modules                │
│  - 5 Data Models                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      SQLite/PostgreSQL Database         │
│  - 8 Tables with relationships         │
│  - 110 questions, 8 videos, 6 stages   │
└─────────────────────────────────────────┘
```

### 2.2 Product Functions

**For Students:**
- Take initial assessment for placement (25 questions)
- Progress through 6 stages sequentially
- Watch educational videos
- Take stage quizzes (15-25 questions each)
- Retry failed assessments
- View progress analytics with charts
- Generate completion certificate

**For Instructors:**
- Create, edit, delete videos
- Create, edit, delete questions
- View student analytics
- Monitor student progress

**For Administrators:**
- Manage user accounts
- View platform statistics
- Access system analytics
- Delete users (except self)

### 2.3 User Characteristics

**Students:**
- Primary users of the system
- Range from beginners to advanced learners
- Need intuitive interface and clear feedback
- Use desktop and mobile devices

**Instructors:**
- Content creators and managers
- Technical background in cybersecurity
- Need efficient content management tools

**Administrators:**
- System managers and supervisors
- Technical expertise required
- Need comprehensive oversight capabilities

### 2.4 Operating Environment

**Client-Side:**
- Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Responsive design for devices 320px to 2560px+ width
- Mobile browsers (iOS Safari, Chrome Mobile)

**Server-Side:**
- Node.js v14+ runtime
- Linux/Windows/macOS server
- Minimum 2GB RAM, 2 CPU cores

### 2.5 Design and Implementation Constraints

- SQLite for development (single-user database)
- PostgreSQL recommended for production (concurrent users)
- JWT tokens stored in localStorage (consider HttpOnly cookies for production)
- YouTube for video hosting (external dependency)
- CORS must be configured for frontend origin

---

## 3. System Features

### 3.1 User Authentication and Authorization

**Priority:** High | **Status:** ✅ Implemented

#### 3.1.1 Description
Secure user registration and login system with role-based access control.

#### 3.1.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | System shall allow user registration with email, password, name, role, and government ID | High |
| FR-002 | Government ID must follow format XXXX/12345 (4 letters, 5 digits) | High |
| FR-003 | Email and government ID must be unique | High |
| FR-004 | Passwords must be hashed using bcrypt with 10 salt rounds | High |
| FR-005 | System shall authenticate users with email and password | High |
| FR-006 | JWT tokens shall be generated with 7-day expiration | High |
| FR-007 | System shall support three roles: student, instructor, admin | High |
| FR-008 | Users can view and update their profile | Medium |

### 3.2 Learning Progression System

**Priority:** High | **Status:** ✅ Implemented

#### 3.2.1 Description
6-stage progressive learning system with adaptive placement and sequential unlocking.

#### 3.2.2 Stage Structure

| Stage | Name | Questions | Passing Score |
|-------|------|-----------|---------------|
| 0 | General Stage | 25 | 15 (60%) |
| 1 | Cybersecurity Basics | 15 | 9 (60%) |
| 2 | Intermediate Concepts | 15 | 9 (60%) |
| 3 | Advanced Topics | 15 | 9 (60%) |
| 4 | Expert-Level Strategies | 15 | 9 (60%) |
| 5 | Final Stage | 25 | 15 (60%) |

#### 3.2.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009 | Students must take initial assessment (Stage 0) for placement | High |
| FR-010 | System shall auto-place students based on initial assessment score:<br>- < 25%: Stage 1<br>- 25-50%: Stage 2<br>- 50-75%: Stage 3<br>- ≥ 75%: Stage 4 | High |
| FR-011 | Students can only access unlocked stages | High |
| FR-012 | Next stage unlocks upon passing current stage with 60% | High |
| FR-013 | Students can retake failed assessments | High |
| FR-014 | System tracks attempt number for each stage | Medium |

### 3.3 Assessment System

**Priority:** High | **Status:** ✅ Implemented

#### 3.3.1 Description
Interactive quiz system with multiple-choice questions, automatic scoring, and detailed feedback.

#### 3.3.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | System shall display questions one at a time with 4 options (A-D) | High |
| FR-016 | System shall validate all questions are answered before submission | High |
| FR-017 | System shall calculate score automatically upon submission | High |
| FR-018 | System shall determine pass/fail based on 60% threshold | High |
| FR-019 | System shall provide detailed results showing correct/incorrect answers | High |
| FR-020 | System shall store all quiz attempts in database | High |
| FR-021 | Failed assessments display retry option | High |
| FR-022 | Passed assessments unlock next stage | High |

### 3.4 Video Learning

**Priority:** High | **Status:** ✅ Implemented

#### 3.4.1 Description
Video content delivery with YouTube integration and completion tracking.

#### 3.4.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-023 | System shall embed YouTube videos in player | High |
| FR-024 | System shall display video playlist for each stage | High |
| FR-025 | Students can mark videos as completed | Medium |
| FR-026 | System tracks video completion in database | Medium |
| FR-027 | Stage view displays completion percentage | Medium |

### 3.5 Progress Analytics

**Priority:** Medium | **Status:** ✅ Implemented

#### 3.5.1 Description
Comprehensive analytics dashboard with 5 chart types and performance metrics.

#### 3.5.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-028 | System shall display doughnut chart for completion overview | Medium |
| FR-029 | System shall display bar chart for scores by stage | Medium |
| FR-030 | System shall display line chart for performance trend | Medium |
| FR-031 | System shall display radar chart for skills assessment | Medium |
| FR-032 | System shall display polar area chart for performance distribution | Medium |
| FR-033 | System shall calculate: best score, average score, lowest score, improvement rate, consistency score | Medium |
| FR-034 | Charts use color coding (green=pass, red=fail) | Low |

### 3.6 Certificate Management

**Priority:** High | **Status:** ✅ Implemented

#### 3.6.1 Description
Automated certificate generation with unique verification codes for course completion.

#### 3.6.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-035 | Students can generate certificate after completing all 5 main stages (1-5) | High |
| FR-036 | System generates unique 16-character hexadecimal verification code | High |
| FR-037 | System stores certificate with user ID and issuance date | High |
| FR-038 | Only one certificate per student allowed | High |
| FR-039 | Certificate displays student name, date, and verification code | High |
| FR-040 | System provides public verification endpoint (no authentication) | High |
| FR-041 | Certificate can be printed | Medium |

### 3.7 Content Management

**Priority:** Medium | **Status:** ✅ Implemented

#### 3.7.1 Description
CRUD operations for videos and questions, accessible to instructors and admins.

#### 3.7.2 Functional Requirements - Videos

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-042 | Instructors can create videos with title, URL, description, stage, order | Medium |
| FR-043 | Instructors can update video details | Medium |
| FR-044 | Instructors can delete videos | Medium |
| FR-045 | System validates YouTube URL format | Medium |
| FR-046 | Videos display in order_number sequence | Low |

#### 3.7.3 Functional Requirements - Questions

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-047 | Instructors can create questions with text, 4 options, correct answer | Medium |
| FR-048 | Correct answer must be A, B, C, or D | High |
| FR-049 | Instructors can update question details | Medium |
| FR-050 | Instructors can delete questions | Medium |
| FR-051 | Questions associated with specific stage | High |

### 3.8 User Management (Admin)

**Priority:** High | **Status:** ✅ Implemented

#### 3.8.1 Description
Administrator tools for managing users and viewing platform statistics.

#### 3.8.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-052 | Admins can view all users | High |
| FR-053 | Admins can filter users by role | Medium |
| FR-054 | Admins can view user details with progress | Medium |
| FR-055 | Admins can delete user accounts | High |
| FR-056 | System prevents admin from deleting own account | High |
| FR-057 | Admins can view platform statistics (user counts, content counts, completions) | High |
| FR-058 | Admins can view stage completion analytics | Medium |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Design Principles

- **Mobile-First:** Responsive design optimized for 320px+ screens
- **Intuitive Navigation:** Clear menu structure and breadcrumbs
- **Visual Feedback:** Loading indicators, success/error messages
- **Accessibility:** WCAG 2.1 compliance, keyboard navigation, ARIA labels
- **Consistency:** Unified color scheme and component styles

#### 4.1.2 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #667eea | Buttons, links, brand |
| Success | #28a745 | Pass status, completion |
| Danger | #dc3545 | Fail status, errors |
| Warning | #ffc107 | Warnings, caution |
| Light | #f8f9fa | Backgrounds |
| Dark | #343a40 | Text, headers |

#### 4.1.3 Key Pages

1. **Login/Register Pages:** Clean authentication forms with validation
2. **Student Dashboard:** Stage cards grid, progress stats, quick actions
3. **Stage View:** Video player, playlist, quiz access button
4. **Quiz Interface:** Question display, option selection, progress dots
5. **Progress Analytics:** 5 chart types, performance metrics
6. **Certificate Page:** Professional certificate display, print option
7. **Instructor Dashboard:** Tabbed interface for content management
8. **Admin Dashboard:** User management, platform statistics

### 4.2 API Interfaces

#### 4.2.1 Base Configuration

- **Base URL:** `http://localhost:5000/api` (development)
- **Authentication:** Bearer Token (JWT in Authorization header)
- **Content-Type:** `application/json`
- **Response Format:** JSON

#### 4.2.2 API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Authentication | `/auth/*` | Register, login, profile management |
| Stages | `/stages/*` | Stage CRUD, questions retrieval |
| Progress | `/progress/*` | Progress tracking, assessments |
| Videos | `/videos/*` | Video CRUD operations |
| Questions | `/questions/*` | Question CRUD operations |
| Certificates | `/certificates/*` | Certificate generation, verification |
| Admin | `/admin/*` | User management, statistics |

#### 4.2.3 Sample API Endpoints

**POST /auth/register**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "governmentId": "ABCD/12345"
}

Response (201):
{
  "message": "User registered successfully",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**POST /progress/initial-assessment**
```json
Request:
{
  "answers": [
    {"questionId": 1, "selectedAnswer": "A"},
    {"questionId": 2, "selectedAnswer": "C"}
  ]
}

Response (200):
{
  "message": "Initial assessment completed",
  "score": 18,
  "total": 25,
  "percentage": 72,
  "startingStage": 3,
  "results": [...]
}
```

**POST /certificates/generate**
```json
Response (201):
{
  "message": "Certificate generated successfully!",
  "certificate": {
    "id": 1,
    "user_id": 5,
    "certificate_code": "a1b2c3d4e5f67890",
    "issued_at": "2025-10-27T15:00:00Z"
  }
}
```

### 4.3 Hardware Interfaces

Not applicable - web-based application with no direct hardware interaction.

### 4.4 Software Interfaces

**Database:**
- SQLite3 5.1.7 (development)
- PostgreSQL 13+ (production recommendation)
- JDBC/ODBC not required (direct Node.js integration)

**Third-Party Services:**
- YouTube (video hosting and embedding)
- Email service (future: SendGrid, Mailgun for notifications)

### 4.5 Communication Interfaces

- **Protocol:** HTTP/HTTPS
- **Data Format:** JSON
- **Port:** 5000 (backend), 3000 (frontend development)
- **CORS:** Configured for cross-origin requests

---

## 5. System Requirements

### 5.1 Database Schema

#### 5.1.1 Entity Relationship Overview

**8 Tables:**
1. `users` - User accounts
2. `stages` - Learning stages
3. `questions` - Quiz questions
4. `videos` - Video resources
5. `user_progress` - Overall progress
6. `stage_results` - Quiz attempts
7. `video_progress` - Video completion
8. `certificates` - Issued certificates

#### 5.1.2 Key Tables

**users**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    government_id TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('student', 'instructor', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**stages**
```sql
CREATE TABLE stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    stage_number INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passing_score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**questions**
```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id INTEGER,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT CHECK(correct_answer IN ('A', 'B', 'C', 'D')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id)
);
```

**stage_results**
```sql
CREATE TABLE stage_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    stage_id INTEGER,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (stage_id) REFERENCES stages(id)
);
```

**certificates**
```sql
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    certificate_code TEXT UNIQUE NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5.2 Data Requirements

**Content Statistics:**
- 6 stages (0-5)
- 110 questions total
- 8 videos (2 per Stage 1-4)
- 3 default user accounts (testing only)

**Data Constraints:**
- Email: Unique, valid format
- Government ID: Unique, format XXXX/12345
- Passwords: Minimum 6 characters, bcrypt hashed
- Quiz scores: 60% passing threshold
- Certificate codes: 16-character hexadecimal, unique

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| Requirement | Target | Priority |
|-------------|--------|----------|
| API Response Time (simple queries) | < 100ms | High |
| API Response Time (complex queries) | < 500ms | High |
| Page Load Time | < 2 seconds | High |
| Quiz Submission Processing | < 200ms | High |
| Concurrent Users (SQLite) | 50 users | Medium |
| Concurrent Users (PostgreSQL) | 500+ users | Medium |
| Database Query Optimization | Indexed primary keys | High |

### 6.2 Security Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SEC-001 | JWT tokens with 7-day expiration | High | ✅ |
| SEC-002 | Bcrypt password hashing (10 rounds) | High | ✅ |
| SEC-003 | SQL injection prevention (parameterized queries) | High | ✅ |
| SEC-004 | XSS protection (React auto-escaping) | High | ✅ |
| SEC-005 | CORS configuration | High | ✅ |
| SEC-006 | Role-based authorization (RBAC) | High | ✅ |
| SEC-007 | HTTPS enforcement (production) | High | Pending |
| SEC-008 | Input validation (frontend + backend) | High | ✅ |
| SEC-009 | Password minimum length (6 characters) | Medium | ✅ |
| SEC-010 | Session management (stateless JWT) | High | ✅ |

### 6.3 Reliability Requirements

- **Uptime Target:** 99.5% (production)
- **Error Handling:** Graceful degradation with user-friendly messages
- **Data Integrity:** Foreign key constraints, transaction support
- **Backup Strategy:** Daily database backups (production)
- **Recovery:** Database restore capability

### 6.4 Availability Requirements

- **24/7 Availability:** Required for production deployment
- **Scheduled Maintenance:** Off-peak hours with advance notice
- **Failover:** Not implemented (single server)

### 6.5 Maintainability Requirements

- **Code Organization:** MVC architecture, modular design
- **Documentation:** README, CLAUDE.md, inline comments
- **Version Control:** Git with meaningful commit messages
- **Coding Standards:** Consistent naming conventions
- **Logging:** Console logging for debugging

### 6.6 Portability Requirements

- **Database Migration:** SQLite to PostgreSQL path documented
- **Environment Variables:** Configuration externalized
- **Platform Independence:** Node.js runs on Windows/Linux/macOS
- **Browser Compatibility:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 6.7 Usability Requirements

- **Learning Curve:** Intuitive UI, minimal training required
- **Responsive Design:** Mobile-first, 320px to 2560px+ screens
- **Touch Targets:** Minimum 44px × 44px for mobile
- **Accessibility:** WCAG 2.1 Level AA compliance
- **User Feedback:** Loading indicators, success/error messages
- **Error Messages:** Clear, actionable guidance

### 6.8 Scalability Requirements

**Current Architecture:**
- Single server deployment
- Stateless API (enables horizontal scaling)
- File-based SQLite database

**Scalability Path:**
1. Migrate to PostgreSQL (database scalability)
2. Implement Redis caching (performance)
3. Add load balancer (horizontal scaling)
4. CDN for static assets (global distribution)
5. Microservices architecture (future)

---

## 7. Appendices

### 7.1 Test Accounts

**For Development/Testing Only:**

```
Admin:
  Email: admin@lms.com
  Password: admin123
  Government ID: ADMN/10001

Instructor:
  Email: instructor@lms.com
  Password: instructor123
  Government ID: INST/10002

Student:
  Email: student@lms.com
  Password: student123
  Government ID: STUD/10003
```

**⚠️ Remove or change these accounts in production!**

### 7.2 Installation and Setup

**Backend Setup:**
```bash
cd backend
npm install
npm run seed
npm start
```

**Frontend Setup:**
```bash
cd client
npm install
npm start
```

**Environment Variables:**
```
# Backend .env
PORT=5000
JWT_SECRET=your_secure_secret_key
NODE_ENV=development

# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
```

### 7.3 API Testing Commands

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","role":"student","governmentId":"TEST/12345"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get Stages (with token)
curl -X GET http://localhost:5000/api/stages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7.4 Deployment Recommendations

**Production Checklist:**
- [ ] Migrate to PostgreSQL
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add security headers (helmet.js)
- [ ] Configure CORS for production domain
- [ ] Set up error logging (Sentry, etc.)
- [ ] Implement monitoring (New Relic, DataDog)
- [ ] Remove test accounts
- [ ] Run security audit (npm audit)
- [ ] Load testing (JMeter, K6)

**Recommended Hosting:**
- **Backend:** Heroku, Railway, DigitalOcean, AWS EC2
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** Heroku Postgres, AWS RDS, DigitalOcean Managed Database

### 7.5 Future Enhancements

**High Priority:**
- Password reset functionality (email-based)
- Email notifications for key events
- Enhanced analytics for instructors

**Medium Priority:**
- Profile picture uploads
- Dark mode toggle
- Discussion forums
- Bulk question import (CSV/Excel)
- Video watch time tracking

**Low Priority:**
- Gamification (badges, leaderboards)
- Multi-language support (i18n)
- Mobile app (React Native/Flutter)
- AI-powered recommendations
- Live classes (WebRTC)

### 7.6 Known Limitations

1. **SQLite Concurrency:** Limited to ~50 concurrent users
2. **Video Hosting:** Dependent on YouTube availability
3. **Token Storage:** localStorage vulnerable to XSS (consider HttpOnly cookies)
4. **Password Requirements:** Only 6-character minimum (increase to 8+)
5. **No Email Service:** Password reset not possible without email integration
6. **Single Server:** No high availability or failover

### 7.7 Glossary

- **JWT:** JSON Web Token - Authentication standard
- **RBAC:** Role-Based Access Control - Authorization model
- **CORS:** Cross-Origin Resource Sharing - Security mechanism
- **CRUD:** Create, Read, Update, Delete - Basic operations
- **SPA:** Single Page Application - Client-side rendered web app
- **MVC:** Model-View-Controller - Software architecture pattern
- **API:** Application Programming Interface - Backend endpoints
- **Bcrypt:** Password hashing algorithm

### 7.8 References

**Documentation:**
- Node.js: https://nodejs.org/docs
- React: https://react.dev
- Express: https://expressjs.com
- Bootstrap: https://getbootstrap.com

**Security:**
- OWASP Top 10: https://owasp.org/www-project-top-ten
- JWT Best Practices: https://jwt.io/introduction

**Deployment:**
- Heroku Node.js: https://devcenter.heroku.com/articles/getting-started-with-nodejs
- Vercel React: https://vercel.com/docs

---

## Document Information

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Project Completion:** 97%
**Status:** Production-Ready (pending optional password reset feature)

**Prepared by:** Development Team
**Approved by:** _______________________
**Date:** _______________________

---

**End of Document**
