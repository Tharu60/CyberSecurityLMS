# API Documentation
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025
**Base URL:** `http://localhost:5000/api` (Development)
**Production URL:** `https://yourdomain.com/api`

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Authentication](#2-authentication)
3. [Authentication Endpoints](#3-authentication-endpoints)
4. [Stage Endpoints](#4-stage-endpoints)
5. [Progress Endpoints](#5-progress-endpoints)
6. [Video Endpoints](#6-video-endpoints)
7. [Question Endpoints](#7-question-endpoints)
8. [Certificate Endpoints](#8-certificate-endpoints)
9. [Admin Endpoints](#9-admin-endpoints)
10. [Error Handling](#10-error-handling)
11. [Rate Limiting](#11-rate-limiting)
12. [Postman Collection](#12-postman-collection)

---

## 1. Introduction

### 1.1 Overview
The Cybersecurity LMS provides a RESTful API for all system operations including authentication, content management, progress tracking, and certificate generation.

### 1.2 API Characteristics
- **Architecture:** REST
- **Data Format:** JSON
- **Authentication:** JWT Bearer Token
- **Content-Type:** application/json
- **Character Encoding:** UTF-8

### 1.3 Base Configuration

**Development:**
```
Base URL: http://localhost:5000/api
Port: 5000
Database: SQLite (lms.db)
```

**Production:**
```
Base URL: https://yourdomain.com/api
Port: 443 (HTTPS)
Database: PostgreSQL
```

### 1.4 HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

---

## 2. Authentication

### 2.1 JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### 2.2 Token Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "student|instructor|admin",
  "iat": 1698765432,
  "exp": 1699370232
}
```

### 2.3 Token Expiration

- **Lifetime:** 7 days
- **Renewal:** Not implemented (user must re-login)
- **Storage:** localStorage (frontend)

### 2.4 Obtaining a Token

Tokens are obtained through:
1. POST `/auth/register` - Registration
2. POST `/auth/login` - Login

### 2.5 Example Request with Token

```bash
curl -X GET http://localhost:5000/api/stages \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## 3. Authentication Endpoints

### 3.1 Register User

**Endpoint:** `POST /auth/register`
**Authentication:** None (Public)
**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student",
  "governmentId": "ABCD/12345"
}
```

**Request Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Not empty |
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 6 characters |
| role | string | Yes | "student" or "instructor" |
| governmentId | string | Yes | Format: XXXX/12345, unique |

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "governmentId": "ABCD/12345",
    "role": "student"
  }
}
```

**Error Responses:**

```json
// 400 - Email already exists
{
  "message": "Email already registered"
}

// 400 - Invalid government ID format
{
  "message": "Government ID must be in format XXXX/12345"
}

// 400 - Government ID already exists
{
  "message": "Government ID already registered"
}

// 400 - Validation error
{
  "message": "All fields are required"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "student",
    "governmentId": "ABCD/12345"
  }'
```

---

### 3.2 Login

**Endpoint:** `POST /auth/login`
**Authentication:** None (Public)
**Description:** Authenticate user and obtain JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

### 3.3 Get Profile

**Endpoint:** `GET /auth/profile`
**Authentication:** Required
**Authorization:** All roles
**Description:** Get current user's profile information

**Request Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "governmentId": "ABCD/12345",
    "role": "student",
    "created_at": "2025-10-27T10:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3.4 Update Profile

**Endpoint:** `PUT /auth/profile`
**Authentication:** Required
**Authorization:** All roles
**Description:** Update user profile

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "NewPassword123"
}
```

**Note:** All fields optional. Only provided fields will be updated.

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Updated",
    "email": "john.new@example.com",
    "role": "student"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Email already in use"
}
```

---

## 4. Stage Endpoints

### 4.1 Get All Stages

**Endpoint:** `GET /stages`
**Authentication:** Required
**Authorization:** All roles
**Description:** Get list of all learning stages

**Response for Students (200):**
```json
{
  "stages": [
    {
      "id": 1,
      "name": "Cybersecurity Basics",
      "stage_number": 1,
      "total_questions": 15,
      "passing_score": 9,
      "unlocked": true,
      "completed": false
    },
    {
      "id": 2,
      "name": "Intermediate Concepts",
      "stage_number": 2,
      "total_questions": 15,
      "passing_score": 9,
      "unlocked": false,
      "completed": false
    }
  ]
}
```

**Response for Instructors/Admins (200):**
```json
{
  "stages": [
    {
      "id": 1,
      "name": "Cybersecurity Basics",
      "stage_number": 1,
      "total_questions": 15,
      "passing_score": 9
    }
  ]
}
```

---

### 4.2 Get Stage by ID

**Endpoint:** `GET /stages/:id`
**Authentication:** Required
**Authorization:** All roles
**Description:** Get detailed information about specific stage

**URL Parameters:**
- `id` (integer) - Stage ID

**Success Response (200):**
```json
{
  "stage": {
    "id": 1,
    "name": "Cybersecurity Basics",
    "description": "Introduction to cybersecurity fundamentals",
    "stage_number": 1,
    "total_questions": 15
  },
  "videos": [
    {
      "id": 1,
      "title": "Introduction to Cybersecurity",
      "url": "https://youtube.com/watch?v=xxxxx",
      "order_number": 1
    },
    {
      "id": 2,
      "title": "Network Security Basics",
      "url": "https://youtube.com/watch?v=yyyyy",
      "order_number": 2
    }
  ],
  "questionCount": 15
}
```

**Error Response (404):**
```json
{
  "message": "Stage not found"
}
```

---

### 4.3 Get Stage Questions

**Endpoint:** `GET /stages/:id/questions`
**Authentication:** Required
**Authorization:** Students (must have unlocked stage), Instructors, Admins
**Description:** Get quiz questions for a stage

**Success Response (200):**
```json
{
  "stage": {
    "id": 1,
    "name": "Cybersecurity Basics",
    "totalQuestions": 15,
    "passingScore": 9
  },
  "questions": [
    {
      "id": 10,
      "question_text": "What is a firewall?",
      "option_a": "Hardware device",
      "option_b": "Software application",
      "option_c": "Network security system",
      "option_d": "All of the above"
    }
  ]
}
```

**Note:** `correct_answer` field is NOT included in response (only during scoring)

**Error Response (403):**
```json
{
  "message": "Stage not unlocked. Complete previous stages first."
}
```

---

### 4.4 Create Stage

**Endpoint:** `POST /stages`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Create a new learning stage

**Request Body:**
```json
{
  "name": "New Stage",
  "description": "Description of the stage",
  "stageNumber": 6,
  "totalQuestions": 20,
  "passingScore": 12
}
```

**Success Response (201):**
```json
{
  "message": "Stage created successfully",
  "stage": {
    "id": 7,
    "name": "New Stage",
    "stage_number": 6,
    "total_questions": 20,
    "passing_score": 12
  }
}
```

---

### 4.5 Update Stage

**Endpoint:** `PUT /stages/:id`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Update stage details

**Request Body:**
```json
{
  "name": "Updated Stage Name",
  "description": "Updated description",
  "totalQuestions": 25,
  "passingScore": 15
}
```

**Success Response (200):**
```json
{
  "message": "Stage updated successfully",
  "stage": { /* updated stage data */ }
}
```

---

### 4.6 Delete Stage

**Endpoint:** `DELETE /stages/:id`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Delete a stage

**Success Response (200):**
```json
{
  "message": "Stage deleted successfully"
}
```

---

## 5. Progress Endpoints

### 5.1 Get My Progress

**Endpoint:** `GET /progress/my-progress`
**Authentication:** Required
**Authorization:** Student only
**Description:** Get current student's progress and quiz history

**Success Response (200):**
```json
{
  "progress": {
    "id": 1,
    "user_id": 5,
    "current_stage": 2,
    "initial_assessment_completed": true,
    "initial_assessment_score": 18,
    "completed_stages": 1,
    "total_stages": 6
  },
  "stageResults": [
    {
      "id": 1,
      "stage_id": 1,
      "stage_name": "Cybersecurity Basics",
      "stage_number": 1,
      "score": 12,
      "total_questions": 15,
      "passed": true,
      "attempt_number": 1,
      "completed_at": "2025-10-27T12:00:00Z"
    }
  ]
}
```

---

### 5.2 Submit Initial Assessment

**Endpoint:** `POST /progress/initial-assessment`
**Authentication:** Required
**Authorization:** Student only
**Description:** Submit initial 25-question assessment for placement

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A"
    },
    {
      "questionId": 2,
      "selectedAnswer": "C"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "Initial assessment completed",
  "score": 18,
  "total": 25,
  "percentage": 72,
  "startingStage": 3,
  "results": [
    {
      "questionId": 1,
      "selectedAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    },
    {
      "questionId": 2,
      "selectedAnswer": "C",
      "correctAnswer": "B",
      "isCorrect": false
    }
  ]
}
```

**Auto-Placement Logic:**
- Score < 25% (< 6 correct) → Stage 1
- Score 25-50% (6-12 correct) → Stage 2
- Score 50-75% (13-18 correct) → Stage 3
- Score ≥ 75% (19+ correct) → Stage 4

---

### 5.3 Submit Stage Assessment

**Endpoint:** `POST /progress/stage-assessment`
**Authentication:** Required
**Authorization:** Student only
**Description:** Submit stage quiz answers

**Request Body:**
```json
{
  "stageId": 1,
  "answers": [
    {
      "questionId": 10,
      "selectedAnswer": "B"
    },
    {
      "questionId": 11,
      "selectedAnswer": "A"
    }
  ]
}
```

**Success Response - Pass (200):**
```json
{
  "message": "Quiz passed! Moving to next stage.",
  "score": 12,
  "total": 15,
  "percentage": 80,
  "passed": true,
  "requiredPercentage": 60,
  "results": [
    {
      "questionId": 10,
      "selectedAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true
    }
  ]
}
```

**Success Response - Fail (200):**
```json
{
  "message": "Quiz failed. You can retry.",
  "score": 8,
  "total": 15,
  "percentage": 53,
  "passed": false,
  "requiredPercentage": 60,
  "results": [ /* detailed results */ ]
}
```

---

### 5.4 Mark Video Completed

**Endpoint:** `POST /progress/video-completed`
**Authentication:** Required
**Authorization:** All roles
**Description:** Mark a video as completed

**Request Body:**
```json
{
  "videoId": 1
}
```

**Success Response (200):**
```json
{
  "message": "Video marked as completed"
}
```

---

### 5.5 Get Video Progress

**Endpoint:** `GET /progress/videos?stageId=1`
**Authentication:** Required
**Authorization:** All roles
**Description:** Get student's video completion progress

**Query Parameters:**
- `stageId` (optional) - Filter by specific stage

**Success Response (200):**
```json
{
  "videoProgress": [
    {
      "id": 1,
      "user_id": 5,
      "video_id": 1,
      "completed": true,
      "title": "Introduction to Cybersecurity",
      "stage_id": 1
    },
    {
      "id": 2,
      "user_id": 5,
      "video_id": 2,
      "completed": false,
      "title": "Network Security",
      "stage_id": 1
    }
  ]
}
```

---

### 5.6 Get User Progress (Instructor/Admin)

**Endpoint:** `GET /progress/user/:userId`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Get specific user's progress (for analytics)

**URL Parameters:**
- `userId` (integer) - User ID

**Success Response (200):**
```json
{
  "progress": { /* user progress object */ },
  "stageResults": [ /* array of quiz results */ ],
  "videoProgress": [ /* array of video completions */ ]
}
```

---

## 6. Video Endpoints

### 6.1 Get Videos by Stage

**Endpoint:** `GET /videos/stage/:stageId`
**Authentication:** Required
**Authorization:** All roles
**Description:** Get all videos for a specific stage

**URL Parameters:**
- `stageId` (integer) - Stage ID

**Success Response (200):**
```json
{
  "videos": [
    {
      "id": 1,
      "stage_id": 1,
      "title": "Introduction to Cybersecurity",
      "url": "https://youtube.com/watch?v=xxxxx",
      "description": "Learn the basics of cybersecurity",
      "order_number": 1
    }
  ]
}
```

---

### 6.2 Get All Videos

**Endpoint:** `GET /videos`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Get all videos in the system

**Success Response (200):**
```json
{
  "videos": [
    {
      "id": 1,
      "stage_id": 1,
      "title": "Introduction to Cybersecurity",
      "url": "https://youtube.com/watch?v=xxxxx",
      "description": "Learn the basics",
      "order_number": 1,
      "created_at": "2025-10-27T10:00:00Z"
    }
  ]
}
```

---

### 6.3 Create Video

**Endpoint:** `POST /videos`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Create a new video resource

**Request Body:**
```json
{
  "stageId": 1,
  "title": "New Cybersecurity Video",
  "url": "https://youtube.com/watch?v=xxxxx",
  "description": "Video description",
  "orderNumber": 3
}
```

**Success Response (201):**
```json
{
  "message": "Video created successfully",
  "video": {
    "id": 9,
    "stage_id": 1,
    "title": "New Cybersecurity Video",
    "url": "https://youtube.com/watch?v=xxxxx",
    "description": "Video description",
    "order_number": 3
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid YouTube URL"
}
```

---

### 6.4 Update Video

**Endpoint:** `PUT /videos/:id`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Update video details

**URL Parameters:**
- `id` (integer) - Video ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "url": "https://youtube.com/watch?v=yyyyy",
  "description": "Updated description",
  "orderNumber": 1
}
```

**Success Response (200):**
```json
{
  "message": "Video updated successfully",
  "video": { /* updated video data */ }
}
```

---

### 6.5 Delete Video

**Endpoint:** `DELETE /videos/:id`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Delete a video

**URL Parameters:**
- `id` (integer) - Video ID

**Success Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

---

## 7. Question Endpoints

### 7.1 Get Questions by Stage

**Endpoint:** `GET /questions/stage/:stageId`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Get all questions for a stage (with correct answers)

**URL Parameters:**
- `stageId` (integer) - Stage ID

**Success Response (200):**
```json
{
  "questions": [
    {
      "id": 10,
      "stage_id": 1,
      "question_text": "What is a firewall?",
      "option_a": "Hardware device",
      "option_b": "Software application",
      "option_c": "Network security system",
      "option_d": "All of the above",
      "correct_answer": "D"
    }
  ]
}
```

---

### 7.2 Create Question

**Endpoint:** `POST /questions`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Create a new question

**Request Body:**
```json
{
  "stageId": 1,
  "questionText": "What is encryption?",
  "optionA": "Converting data to code",
  "optionB": "Deleting data",
  "optionC": "Copying data",
  "optionD": "Moving data",
  "correctAnswer": "A"
}
```

**Success Response (201):**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": 111,
    "stage_id": 1,
    "question_text": "What is encryption?",
    "option_a": "Converting data to code",
    "option_b": "Deleting data",
    "option_c": "Copying data",
    "option_d": "Moving data",
    "correct_answer": "A"
  }
}
```

**Error Response (400):**
```json
{
  "message": "All fields are required"
}
```

---

### 7.3 Update Question

**Endpoint:** `PUT /questions/:id`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Update question details

**URL Parameters:**
- `id` (integer) - Question ID

**Request Body:**
```json
{
  "questionText": "Updated question text?",
  "optionA": "Updated option A",
  "optionB": "Updated option B",
  "optionC": "Updated option C",
  "optionD": "Updated option D",
  "correctAnswer": "B"
}
```

**Success Response (200):**
```json
{
  "message": "Question updated successfully",
  "question": { /* updated question data */ }
}
```

---

### 7.4 Delete Question

**Endpoint:** `DELETE /questions/:id`
**Authentication:** Required
**Authorization:** Instructor, Admin
**Description:** Delete a question

**URL Parameters:**
- `id` (integer) - Question ID

**Success Response (200):**
```json
{
  "message": "Question deleted successfully"
}
```

---

## 8. Certificate Endpoints

### 8.1 Generate Certificate

**Endpoint:** `POST /certificates/generate`
**Authentication:** Required
**Authorization:** Student only
**Description:** Generate certificate after completing all stages

**Preconditions:**
- All 5 main stages (1-5) must be completed with passing scores
- Certificate not already generated

**Success Response (201):**
```json
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

**Error Response (400):**
```json
{
  "message": "You must complete all 5 stages before generating certificate"
}

// Or

{
  "message": "Certificate already generated"
}
```

---

### 8.2 Get My Certificate

**Endpoint:** `GET /certificates/my-certificate`
**Authentication:** Required
**Authorization:** Student only
**Description:** Get user's certificate if it exists

**Success Response (200):**
```json
{
  "certificate": {
    "id": 1,
    "user_id": 5,
    "certificate_code": "a1b2c3d4e5f67890",
    "user_name": "John Doe",
    "email": "john@example.com",
    "issued_at": "2025-10-27T15:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Certificate not found"
}
```

---

### 8.3 Verify Certificate

**Endpoint:** `GET /certificates/verify/:code`
**Authentication:** None (Public)
**Authorization:** Public
**Description:** Verify certificate authenticity by code

**URL Parameters:**
- `code` (string) - 16-character hex certificate code

**Success Response (200):**
```json
{
  "valid": true,
  "certificate": {
    "code": "a1b2c3d4e5f67890",
    "userName": "John Doe",
    "issuedAt": "2025-10-27T15:00:00Z"
  }
}
```

**Invalid Certificate (404):**
```json
{
  "valid": false,
  "message": "Certificate not found"
}
```

---

## 9. Admin Endpoints

### 9.1 Get All Users

**Endpoint:** `GET /admin/users?role=student`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Get list of all users with optional role filter

**Query Parameters:**
- `role` (optional) - Filter by role: student, instructor, admin

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "government_id": "ABCD/12345",
      "role": "student",
      "created_at": "2025-10-27T10:00:00Z"
    }
  ],
  "count": 85
}
```

---

### 9.2 Get User by ID

**Endpoint:** `GET /admin/users/:id`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Get detailed user information with progress

**URL Parameters:**
- `id` (integer) - User ID

**Success Response (200):**
```json
{
  "user": {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "government_id": "ABCD/12345",
    "role": "student",
    "created_at": "2025-10-27T10:00:00Z"
  },
  "progress": {
    "current_stage": 2,
    "initial_assessment_completed": true,
    "initial_assessment_score": 18
  },
  "stageResults": [
    {
      "stage_name": "Cybersecurity Basics",
      "score": 12,
      "total": 15,
      "passed": true
    }
  ]
}
```

---

### 9.3 Delete User

**Endpoint:** `DELETE /admin/users/:id`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Delete user account

**URL Parameters:**
- `id` (integer) - User ID

**Restrictions:**
- Cannot delete own account

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Cannot delete your own account"
}
```

---

### 9.4 Get Platform Statistics

**Endpoint:** `GET /admin/statistics`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Get comprehensive platform statistics

**Success Response (200):**
```json
{
  "statistics": {
    "users": {
      "total_users": 100,
      "total_students": 85,
      "total_instructors": 10,
      "total_admins": 5
    },
    "stages": {
      "total_stages": 6
    },
    "questions": {
      "total_questions": 110
    },
    "videos": {
      "total_videos": 8
    },
    "progress": {
      "students_who_started": 75,
      "completed_initial_assessment": 70
    },
    "completions": {
      "total_stage_completions": 250
    }
  }
}
```

---

### 9.5 Get Analytics

**Endpoint:** `GET /admin/analytics`
**Authentication:** Required
**Authorization:** Admin only
**Description:** Get stage completion analytics

**Success Response (200):**
```json
{
  "analytics": [
    {
      "id": 1,
      "name": "Cybersecurity Basics",
      "stage_number": 1,
      "students_completed": 50
    },
    {
      "id": 2,
      "name": "Intermediate Concepts",
      "stage_number": 2,
      "students_completed": 42
    }
  ]
}
```

---

## 10. Error Handling

### 10.1 Error Response Format

All errors follow this structure:

```json
{
  "message": "Human-readable error message",
  "error": {} // Only in development mode
}
```

### 10.2 Common Errors

**401 Unauthorized - Missing Token**
```json
{
  "message": "No token provided"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "message": "Invalid token"
}
```

**403 Forbidden - Insufficient Permissions**
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "message": "An error occurred. Please try again later."
}
```

---

## 11. Rate Limiting

### 11.1 Current Implementation

**Status:** Not implemented (recommended for production)

### 11.2 Recommended Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Quiz Submission | 3 requests | 1 hour |

### 11.3 Implementation (Express Rate Limit)

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many requests, please try again later.'
});

app.use('/api/auth/login', authLimiter);
```

---

## 12. Postman Collection

### 12.1 Import Collection

**Collection Name:** Cybersecurity LMS API

**Variables:**
```json
{
  "base_url": "http://localhost:5000/api",
  "token": "{{token}}"
}
```

### 12.2 Sample Requests

**1. Register**
```
POST {{base_url}}/auth/register
Body: {
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "role": "student",
  "governmentId": "TEST/12345"
}
```

**2. Login**
```
POST {{base_url}}/auth/login
Body: {
  "email": "test@test.com",
  "password": "test123"
}
```

**3. Get Stages (Authenticated)**
```
GET {{base_url}}/stages
Headers: {
  "Authorization": "Bearer {{token}}"
}
```

### 12.3 Pre-request Scripts

**Save Token After Login:**
```javascript
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

---

## API Testing Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "test123",
    "role": "student",
    "governmentId": "TEST/12345"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

**Get Stages (with token):**
```bash
curl -X GET http://localhost:5000/api/stages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Submit Quiz:**
```bash
curl -X POST http://localhost:5000/api/progress/stage-assessment \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "stageId": 1,
    "answers": [
      {"questionId": 10, "selectedAnswer": "A"},
      {"questionId": 11, "selectedAnswer": "C"}
    ]
  }'
```

---

## JavaScript/Axios Examples

### Setup Axios Instance

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
```

### Example Requests

```javascript
// Register
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get Stages
const getStages = async () => {
  const response = await api.get('/stages');
  return response.data.stages;
};

// Submit Quiz
const submitQuiz = async (stageId, answers) => {
  const response = await api.post('/progress/stage-assessment', {
    stageId,
    answers
  });
  return response.data;
};

// Generate Certificate
const generateCertificate = async () => {
  const response = await api.post('/certificates/generate');
  return response.data.certificate;
};
```

---

## Summary

**Total Endpoints:** 35+

| Module | Endpoints |
|--------|-----------|
| Authentication | 4 |
| Stages | 6 |
| Progress | 6 |
| Videos | 5 |
| Questions | 4 |
| Certificates | 3 |
| Admin | 5 |

**Authentication:** JWT Bearer Token
**Data Format:** JSON
**Status:** Production Ready

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Complete

**Prepared by:** Development Team
**Contact:** developer@lms.com
