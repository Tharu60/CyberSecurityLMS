# Test Case Specification
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025
**Project:** Cybersecurity LMS

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Strategy](#2-test-strategy)
3. [Authentication Test Cases](#3-authentication-test-cases)
4. [Student Functionality Test Cases](#4-student-functionality-test-cases)
5. [Instructor Functionality Test Cases](#5-instructor-functionality-test-cases)
6. [Administrator Functionality Test Cases](#6-administrator-functionality-test-cases)
7. [Security Test Cases](#7-security-test-cases)
8. [Performance Test Cases](#8-performance-test-cases)
9. [Compatibility Test Cases](#9-compatibility-test-cases)
10. [Test Data](#10-test-data)

---

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive test cases for the Cybersecurity LMS, covering functional, security, performance, and compatibility testing.

### 1.2 Scope
- **Functional Testing:** All user features and workflows
- **Security Testing:** Authentication, authorization, data protection
- **Performance Testing:** Response times, load handling
- **Compatibility Testing:** Cross-browser and device testing

### 1.3 Test Case Template

| Field | Description |
|-------|-------------|
| **Test Case ID** | Unique identifier (e.g., TC-AUTH-001) |
| **Test Case Name** | Descriptive name |
| **Module** | Feature/module being tested |
| **Priority** | High/Medium/Low |
| **Preconditions** | Required setup before test |
| **Test Steps** | Step-by-step instructions |
| **Test Data** | Input data required |
| **Expected Result** | Expected system behavior |
| **Actual Result** | To be filled during execution |
| **Status** | Pass/Fail/Blocked |
| **Remarks** | Additional notes |

---

## 2. Test Strategy

### 2.1 Testing Levels

| Level | Description | Responsibility |
|-------|-------------|----------------|
| **Unit Testing** | Individual functions/components | Developers |
| **Integration Testing** | Module interactions | QA Team |
| **System Testing** | End-to-end scenarios | QA Team |
| **Acceptance Testing** | User validation | Stakeholders |

### 2.2 Testing Types

- **Functional Testing:** Feature verification
- **Regression Testing:** Bug fix verification
- **Security Testing:** Vulnerability assessment
- **Performance Testing:** Load and stress testing
- **Usability Testing:** User experience validation
- **Compatibility Testing:** Browser/device testing

### 2.3 Test Environment

**Development:**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Database: SQLite (lms.db)

**Staging/Production:**
- Backend: Production API URL
- Frontend: Production domain
- Database: PostgreSQL

### 2.4 Test Tools

- **Manual Testing:** Browser DevTools
- **API Testing:** Postman, cURL
- **Performance:** JMeter, K6
- **Security:** OWASP ZAP, npm audit
- **Browser Testing:** BrowserStack, Selenium

---

## 3. Authentication Test Cases

### TC-AUTH-001: Register with Valid Data

**Module:** User Registration
**Priority:** High
**Preconditions:** User not registered

**Test Steps:**
1. Navigate to registration page
2. Enter name: "Test User"
3. Enter email: "testuser@example.com"
4. Enter password: "Test@123"
5. Confirm password: "Test@123"
6. Enter Government ID: "TEST/12345"
7. Select role: "Student"
8. Click "Register" button

**Test Data:**
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test@123",
  "governmentId": "TEST/12345",
  "role": "student"
}
```

**Expected Result:**
- Registration successful
- JWT token generated
- User redirected to student dashboard
- Success message displayed
- User record created in database

---

### TC-AUTH-002: Register with Duplicate Email

**Module:** User Registration
**Priority:** High
**Preconditions:** Email already exists

**Test Steps:**
1. Navigate to registration page
2. Enter existing email: "student@lms.com"
3. Fill other valid data
4. Click "Register"

**Expected Result:**
- Error message: "Email already registered"
- Registration form remains
- No new record created
- User can modify email

---

### TC-AUTH-003: Register with Invalid Government ID Format

**Module:** User Registration
**Priority:** High
**Preconditions:** None

**Test Steps:**
1. Navigate to registration page
2. Enter Government ID: "INVALID123"
3. Fill other valid data
4. Click "Register"

**Test Data:**
- Invalid formats: "ABC123", "ABCDE/123", "123/ABCDE", "ABCD12345"

**Expected Result:**
- Error: "Government ID must be format XXXX/12345"
- Real-time validation if implemented
- Form not submitted

---

### TC-AUTH-004: Register with Short Password

**Module:** User Registration
**Priority:** Medium
**Preconditions:** None

**Test Steps:**
1. Navigate to registration page
2. Enter password: "12345" (5 characters)
3. Fill other valid data
4. Click "Register"

**Expected Result:**
- Error: "Password must be at least 6 characters"
- Form validation prevents submission

---

### TC-AUTH-005: Register with Password Mismatch

**Module:** User Registration
**Priority:** High
**Preconditions:** None

**Test Steps:**
1. Navigate to registration page
2. Enter password: "Test@123"
3. Confirm password: "Test@456"
4. Click "Register"

**Expected Result:**
- Error: "Passwords do not match"
- Highlight password fields
- Form not submitted

---

### TC-AUTH-006: Login with Valid Credentials

**Module:** User Login
**Priority:** High
**Preconditions:** User registered

**Test Steps:**
1. Navigate to login page
2. Enter email: "student@lms.com"
3. Enter password: "student123"
4. Click "Login"

**Expected Result:**
- Login successful
- JWT token stored in localStorage
- Redirected to dashboard (role-specific)
- User context updated

---

### TC-AUTH-007: Login with Invalid Password

**Module:** User Login
**Priority:** High
**Preconditions:** User exists

**Test Steps:**
1. Navigate to login page
2. Enter valid email
3. Enter wrong password
4. Click "Login"

**Expected Result:**
- Error: "Invalid email or password"
- No token generated
- User remains on login page
- Password field cleared for security

---

### TC-AUTH-008: Login with Non-existent Email

**Module:** User Login
**Priority:** Medium
**Preconditions:** Email doesn't exist

**Test Steps:**
1. Navigate to login page
2. Enter email: "nonexistent@test.com"
3. Enter any password
4. Click "Login"

**Expected Result:**
- Error: "Invalid email or password" (same as wrong password for security)
- No information disclosure about user existence

---

### TC-AUTH-009: Session Persistence After Page Refresh

**Module:** Authentication
**Priority:** High
**Preconditions:** User logged in

**Test Steps:**
1. Login successfully
2. Navigate to any page
3. Refresh browser (F5)
4. Check authentication status

**Expected Result:**
- User remains logged in
- JWT token retrieved from localStorage
- User context restored
- Page renders correctly

---

### TC-AUTH-010: Logout Functionality

**Module:** Authentication
**Priority:** High
**Preconditions:** User logged in

**Test Steps:**
1. Login successfully
2. Navigate to dashboard
3. Click logout button
4. Confirm logout

**Expected Result:**
- Token removed from localStorage
- User context cleared
- Redirected to login page
- Cannot access protected routes

---

### TC-AUTH-011: Token Expiration Handling

**Module:** Authentication
**Priority:** High
**Preconditions:** User logged in with expired token

**Test Steps:**
1. Login successfully
2. Manually expire token (or wait 7 days)
3. Make API request
4. Observe system behavior

**Expected Result:**
- 401 Unauthorized response
- Automatic redirect to login page
- Error message: "Session expired. Please login again"
- Token cleared from localStorage

---

## 4. Student Functionality Test Cases

### TC-STU-001: View Dashboard After Login

**Module:** Student Dashboard
**Priority:** High
**Preconditions:** Student logged in

**Test Steps:**
1. Login as student
2. Observe dashboard

**Expected Result:**
- Progress cards displayed (4 cards)
- Stage cards shown in grid
- Stage 0 (Initial Assessment) visible if not completed
- Locked/unlocked stages correctly indicated
- Completed stages show checkmark
- Navigation menu visible

---

### TC-STU-002: Take Initial Assessment - Full Flow

**Module:** Initial Assessment
**Priority:** High
**Preconditions:**
- Student logged in
- Initial assessment not completed
- 25 questions exist in General Stage

**Test Steps:**
1. Click "Start Initial Assessment"
2. Answer all 25 questions
3. Navigate using Next/Previous buttons
4. Review answers
5. Click "Submit"
6. Confirm submission

**Test Data:**
- Answer pattern resulting in 18/25 (72%) for Stage 3 placement

**Expected Result:**
- All 25 questions displayed
- Progress dots show position
- Navigation works correctly
- Submit enabled only when all answered
- Score: 18/25 (72%)
- Auto-placed to Stage 3
- Detailed results shown
- user_progress updated:
  ```sql
  current_stage = 3
  initial_assessment_completed = 1
  initial_assessment_score = 18
  ```

---

### TC-STU-003: Initial Assessment - Low Score Placement

**Module:** Initial Assessment
**Priority:** High
**Preconditions:** Same as TC-STU-002

**Test Steps:**
1. Start initial assessment
2. Answer to achieve 5/25 (20%)
3. Submit

**Expected Result:**
- Score: 5/25 (20%)
- Auto-placed to Stage 1 (< 25%)
- Message: "Starting at Stage 1: Cybersecurity Basics"
- Only Stage 1 unlocked

---

### TC-STU-004: Initial Assessment - High Score Placement

**Module:** Initial Assessment
**Priority:** High
**Preconditions:** Same as TC-STU-002

**Test Steps:**
1. Start initial assessment
2. Answer to achieve 20/25 (80%)
3. Submit

**Expected Result:**
- Score: 20/25 (80%)
- Auto-placed to Stage 4 (≥ 75%)
- Message: "Starting at Stage 4: Expert-Level Strategies"
- Stages 1-4 unlocked

---

### TC-STU-005: Initial Assessment - Incomplete Submission

**Module:** Initial Assessment
**Priority:** High
**Preconditions:** Assessment in progress

**Test Steps:**
1. Start assessment
2. Answer only 20 questions
3. Leave 5 unanswered
4. Attempt to submit

**Expected Result:**
- Submit button disabled
- Error message: "Please answer all questions"
- Unanswered questions highlighted in progress dots
- Cannot proceed to results

---

### TC-STU-006: Access Locked Stage

**Module:** Stage Access Control
**Priority:** High
**Preconditions:**
- Student at Stage 2
- Stage 4 is locked

**Test Steps:**
1. View dashboard
2. Attempt to click Stage 4 card
3. Or manually navigate to /student/stage/5

**Expected Result:**
- Card not clickable (cursor: not-allowed)
- Tooltip: "Complete previous stages to unlock"
- Manual navigation shows: "Access Denied" or redirects
- Stage remains locked

---

### TC-STU-007: Watch Video in Stage View

**Module:** Video Learning
**Priority:** High
**Preconditions:**
- Student logged in
- Stage unlocked
- Videos exist for stage

**Test Steps:**
1. Click on unlocked stage card
2. Navigate to Stage View
3. Observe video player
4. Click video in playlist
5. Watch video
6. Click "Mark as Complete"

**Expected Result:**
- Stage View page loads
- YouTube video embedded
- Playlist shows 2 videos
- Video plays when clicked
- "Mark as Complete" button visible
- After marking:
  - Checkmark appears on video
  - video_progress updated in DB
  - Completion percentage updates

---

### TC-STU-008: Take Stage Quiz - Pass Scenario

**Module:** Stage Quiz
**Priority:** High
**Preconditions:**
- Student logged in
- Stage 1 unlocked
- 15 questions exist

**Test Steps:**
1. Click "Take Quiz" from Stage View
2. Answer 12/15 questions correctly (80%)
3. Submit quiz

**Test Data:**
- Correct answers for 12 questions
- Incorrect for 3 questions

**Expected Result:**
- Quiz interface loads
- 15 questions displayed one at a time
- Submit button enabled on last question
- Results modal shows:
  - "YOU PASSED!"
  - Score: 12/15 (80%)
  - Required: 60%
  - Detailed breakdown
- stage_results record created:
  ```sql
  score = 12
  total_questions = 15
  passed = true
  attempt_number = 1
  ```
- Stage 2 unlocked
- current_stage updated to 2

---

### TC-STU-009: Take Stage Quiz - Fail Scenario

**Module:** Stage Quiz
**Priority:** High
**Preconditions:** Same as TC-STU-008

**Test Steps:**
1. Take quiz
2. Answer only 8/15 correctly (53%)
3. Submit

**Expected Result:**
- Results modal shows:
  - "YOU FAILED"
  - Score: 8/15 (53%)
  - Required: 60%
  - "Retry Quiz" button
  - Encouragement message
- stage_results record:
  ```sql
  passed = false
  attempt_number = 1
  ```
- Stage 2 remains locked
- current_stage unchanged

---

### TC-STU-010: Retry Failed Quiz

**Module:** Stage Quiz
**Priority:** High
**Preconditions:** Quiz failed once

**Test Steps:**
1. Click "Retry Quiz" from results
2. Take quiz again
3. Answer 10/15 correctly (67%)
4. Submit

**Expected Result:**
- New quiz attempt starts
- Previous answers not pre-filled
- New stage_results record:
  ```sql
  passed = true
  attempt_number = 2
  ```
- Next stage unlocked
- Dashboard shows both attempts in history

---

### TC-STU-011: View Progress Analytics

**Module:** Progress Analytics
**Priority:** Medium
**Preconditions:**
- Student logged in
- At least one stage completed

**Test Steps:**
1. Click "View Progress" from dashboard
2. Observe analytics page

**Expected Result:**
- 4 metric cards displayed:
  - Best Score
  - Average Score
  - Lowest Score
  - Total Attempts
- 5 charts rendered:
  1. Doughnut Chart (completion)
  2. Bar Chart (scores by stage)
  3. Line Chart (performance trend)
  4. Radar Chart (skills assessment)
  5. Polar Area Chart (distribution)
- All charts interactive (hover shows data)
- Color coding correct (green/red)
- Metrics accurately calculated

---

### TC-STU-012: Generate Certificate - Eligible

**Module:** Certificate Generation
**Priority:** High
**Preconditions:**
- Student logged in
- All 5 main stages (1-5) passed
- Certificate not yet generated

**Test Steps:**
1. Navigate to Certificate page
2. Observe eligibility status
3. Click "Generate Certificate"
4. Wait for generation

**Expected Result:**
- "Generate Certificate" button visible and enabled
- After clicking:
  - Certificate generated successfully
  - Unique 16-char code created
  - Certificate displayed:
    - Student name
    - Course name
    - Issue date
    - Verification code
  - certificates table record created
  - "Print Certificate" button available
  - Verification URL displayed

---

### TC-STU-013: Generate Certificate - Not Eligible

**Module:** Certificate Generation
**Priority:** High
**Preconditions:**
- Student logged in
- Only 3 stages completed

**Test Steps:**
1. Navigate to Certificate page
2. Observe page

**Expected Result:**
- "Generate Certificate" button disabled
- Message: "Complete all 5 stages to generate certificate"
- List of remaining stages shown
- Progress indicator displayed
- Cannot generate certificate

---

### TC-STU-014: View Existing Certificate

**Module:** Certificate Display
**Priority:** Medium
**Preconditions:**
- Student logged in
- Certificate already generated

**Test Steps:**
1. Navigate to Certificate page
2. Observe certificate

**Expected Result:**
- Existing certificate displayed
- Message: "Certificate already issued"
- No "Generate" button
- "Print Certificate" button available
- Certificate details correct:
  - Name matches user
  - Code matches database
  - Date matches issued_at

---

### TC-STU-015: Print Certificate

**Module:** Certificate
**Priority:** Low
**Preconditions:**
- Certificate generated
- Student viewing certificate

**Test Steps:**
1. Click "Print Certificate" button
2. Observe print dialog

**Expected Result:**
- Browser print dialog opens
- Print preview shows:
  - Landscape orientation
  - Certificate properly formatted
  - No navigation/buttons
  - High contrast for printing
- Can print to paper or save as PDF

---

### TC-STU-016: Update Profile

**Module:** Profile Management
**Priority:** Medium
**Preconditions:** Student logged in

**Test Steps:**
1. Navigate to profile page
2. Change name to "Updated Name"
3. Click "Save Changes"

**Expected Result:**
- Success message displayed
- Database updated
- User context refreshed
- New name displays in navigation
- updated_at timestamp updated

---

## 5. Instructor Functionality Test Cases

### TC-INS-001: Create New Video

**Module:** Video Management
**Priority:** High
**Preconditions:**
- Logged in as instructor
- At least one stage exists

**Test Steps:**
1. Navigate to Instructor Dashboard
2. Click "Videos" tab
3. Click "Add Video" button
4. Fill form:
   - Title: "Introduction to Cybersecurity"
   - URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   - Description: "Cybersecurity basics"
   - Stage: Stage 1
   - Order: 1
5. Click "Add Video"

**Test Data:**
```json
{
  "title": "Introduction to Cybersecurity",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "description": "Cybersecurity basics",
  "stageId": 1,
  "orderNumber": 1
}
```

**Expected Result:**
- Video created successfully
- Record in videos table
- Video appears in list
- Success message displayed
- Modal closes
- Students can now see video in Stage 1

---

### TC-INS-002: Create Video with Invalid URL

**Module:** Video Management
**Priority:** High
**Preconditions:** Logged in as instructor

**Test Steps:**
1. Click "Add Video"
2. Enter invalid URL: "not-a-url"
3. Fill other fields
4. Submit

**Expected Result:**
- Error: "Please enter valid YouTube URL"
- Form not submitted
- No record created

---

### TC-INS-003: Update Video Details

**Module:** Video Management
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Video exists

**Test Steps:**
1. Go to Videos tab
2. Click "Edit" on a video
3. Change title to "Updated Title"
4. Click "Update Video"

**Expected Result:**
- Video updated in database
- List refreshes with new title
- Success message shown
- Students see updated title

---

### TC-INS-004: Delete Video

**Module:** Video Management
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Video exists

**Test Steps:**
1. Go to Videos tab
2. Click "Delete" on a video
3. Confirm deletion in dialog

**Expected Result:**
- Confirmation dialog appears
- After confirming:
  - Video deleted from database
  - Removed from list
  - Success message
  - Students can no longer see video

---

### TC-INS-005: Create Question

**Module:** Question Management
**Priority:** High
**Preconditions:** Logged in as instructor

**Test Steps:**
1. Navigate to Questions tab
2. Click "Add Question"
3. Fill form:
   - Stage: Stage 1
   - Question: "What is a firewall?"
   - Option A: "Hardware device"
   - Option B: "Software application"
   - Option C: "Network security system"
   - Option D: "All of the above"
   - Correct Answer: D
4. Click "Add Question"

**Expected Result:**
- Question created in database
- Appears in question list
- Success message
- Students will see in quiz

---

### TC-INS-006: Create Question - Missing Fields

**Module:** Question Management
**Priority:** High
**Preconditions:** Logged in as instructor

**Test Steps:**
1. Click "Add Question"
2. Leave Option C empty
3. Fill other fields
4. Submit

**Expected Result:**
- Error: "All fields required"
- Missing field highlighted
- Form not submitted

---

### TC-INS-007: Update Question

**Module:** Question Management
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Question exists

**Test Steps:**
1. Go to Questions tab
2. Click "Edit" on question
3. Change question text
4. Click "Update Question"

**Expected Result:**
- Question updated
- List refreshes
- Changes reflected immediately
- Students see updated question in future quizzes

---

### TC-INS-008: Delete Question

**Module:** Question Management
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Question exists

**Test Steps:**
1. Click "Delete" on question
2. Confirm deletion

**Expected Result:**
- Question deleted from database
- Removed from list
- Warning if students have taken quiz with this question
- Success message

---

### TC-INS-009: View Student Analytics

**Module:** Analytics
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Students exist with progress

**Test Steps:**
1. Navigate to Analytics tab
2. View student list

**Expected Result:**
- Student list displayed with:
  - Name
  - Email
  - Current Stage
  - Completed Stages count
  - Average Score
  - Status badge
- Accurate calculations
- Can sort by columns
- Can filter by status

---

### TC-INS-010: View Individual Student Details

**Module:** Analytics
**Priority:** Medium
**Preconditions:**
- Logged in as instructor
- Students with progress exist

**Test Steps:**
1. Go to Analytics tab
2. Click on student name
3. View detailed analytics

**Expected Result:**
- Detailed view shows:
  - Personal info
  - Progress timeline
  - Stage-by-stage results
  - Attempt history
  - Video completion
- Data accurate and up-to-date

---

## 6. Administrator Functionality Test Cases

### TC-ADM-001: View All Users

**Module:** User Management
**Priority:** High
**Preconditions:** Logged in as admin

**Test Steps:**
1. Navigate to Admin Dashboard
2. View user list

**Expected Result:**
- All users displayed
- Columns: Name, Email, Government ID, Role, Created Date
- User count shown (Total, Students, Instructors, Admins)
- Delete button visible for each user

---

### TC-ADM-002: Filter Users by Role

**Module:** User Management
**Priority:** Medium
**Preconditions:**
- Logged in as admin
- Users of different roles exist

**Test Steps:**
1. View user list
2. Select "Student" from role filter
3. Observe filtered list

**Expected Result:**
- Only students displayed
- Count updates to show student count
- Other roles hidden
- Can reset filter to "All"

---

### TC-ADM-003: Delete User Account

**Module:** User Management
**Priority:** High
**Preconditions:**
- Logged in as admin
- Target user exists
- Target user is not current admin

**Test Steps:**
1. View user list
2. Click "Delete" on a student account
3. Confirm deletion

**Expected Result:**
- Confirmation dialog appears
- Shows warning about irreversible action
- After confirming:
  - User deleted from database
  - Related records handled (cascade)
  - User removed from list
  - Success message
  - User count updated

---

### TC-ADM-004: Attempt to Delete Own Account

**Module:** User Management
**Priority:** High
**Preconditions:** Logged in as admin

**Test Steps:**
1. View user list
2. Locate own account
3. Observe delete button

**Expected Result:**
- Delete button disabled for own account
- Tooltip: "Cannot delete your own account"
- Cannot proceed with deletion
- Must use different admin account to delete

---

### TC-ADM-005: View Platform Statistics

**Module:** Statistics
**Priority:** High
**Preconditions:** Logged in as admin

**Test Steps:**
1. Navigate to Admin Dashboard
2. View statistics section

**Expected Result:**
- User statistics displayed:
  - Total Users
  - Total Students
  - Total Instructors
  - Total Admins
- Content statistics:
  - Total Stages (6)
  - Total Questions (110)
  - Total Videos (8)
- Progress statistics:
  - Students Who Started
  - Completed Initial Assessment
- Completion statistics:
  - Total Stage Completions
- All counts accurate

---

### TC-ADM-006: View Stage Analytics

**Module:** Analytics
**Priority:** Medium
**Preconditions:**
- Logged in as admin
- Students have completed stages

**Test Steps:**
1. View Admin Dashboard
2. Scroll to Stage Analytics section

**Expected Result:**
- Table showing:
  - Stage number
  - Stage name
  - Students completed
  - Average score (if available)
  - Pass rate
- Data accurate
- Sorted by stage number

---

## 7. Security Test Cases

### TC-SEC-001: SQL Injection Attempt - Login

**Module:** Security
**Priority:** High
**Preconditions:** Login page accessible

**Test Steps:**
1. Navigate to login
2. Enter email: `admin' OR '1'='1`
3. Enter password: `password`
4. Submit

**Expected Result:**
- Login fails
- No SQL injection executed
- Error: "Invalid email or password"
- Parameterized queries prevent injection

---

### TC-SEC-002: SQL Injection Attempt - Registration

**Module:** Security
**Priority:** High
**Preconditions:** Registration page accessible

**Test Steps:**
1. Navigate to registration
2. Enter name: `Test'; DROP TABLE users; --`
3. Fill other fields
4. Submit

**Expected Result:**
- Registration processed safely
- No SQL commands executed
- Name stored as literal string
- Database tables intact

---

### TC-SEC-003: XSS Attempt - Question Text

**Module:** Security
**Priority:** High
**Preconditions:** Logged in as instructor

**Test Steps:**
1. Create question
2. Enter question text: `<script>alert('XSS')</script>`
3. Fill other fields
4. Submit

**Expected Result:**
- Question saved with escaped HTML
- When displayed to students:
  - Script tags rendered as text, not executed
  - No alert popup
  - React auto-escaping prevents XSS

---

### TC-SEC-004: Unauthorized API Access

**Module:** Security
**Priority:** High
**Preconditions:** Not logged in

**Test Steps:**
1. Open browser console
2. Send API request without token:
   ```javascript
   fetch('http://localhost:5000/api/stages')
   ```

**Expected Result:**
- 401 Unauthorized response
- Error message: "No token provided" or similar
- No data returned
- Middleware blocks request

---

### TC-SEC-005: Token Tampering

**Module:** Security
**Priority:** High
**Preconditions:** Valid token exists

**Test Steps:**
1. Login successfully
2. Get token from localStorage
3. Modify token slightly
4. Make API request with tampered token

**Expected Result:**
- 401 Unauthorized
- Error: "Invalid token"
- JWT signature verification fails
- Access denied

---

### TC-SEC-006: Role Escalation Attempt

**Module:** Security
**Priority:** High
**Preconditions:** Logged in as student

**Test Steps:**
1. Login as student
2. Manually navigate to `/admin/dashboard`
3. Or send API request to admin endpoint

**Expected Result:**
- Redirected to /unauthorized
- Or 403 Forbidden response
- Error: "Access denied"
- RBAC middleware blocks access

---

### TC-SEC-007: Password Hashing Verification

**Module:** Security
**Priority:** High
**Preconditions:** User account created

**Test Steps:**
1. Register with password: "Test@123"
2. Query database directly:
   ```sql
   SELECT password FROM users WHERE email = 'test@example.com'
   ```

**Expected Result:**
- Password field shows bcrypt hash (60 characters)
- Hash starts with `$2b$10$` (bcrypt identifier)
- Plain text password NOT stored
- Hash differs from original password

---

### TC-SEC-008: CORS Validation

**Module:** Security
**Priority:** Medium
**Preconditions:** Backend running

**Test Steps:**
1. Make request from unauthorized origin:
   ```javascript
   fetch('http://localhost:5000/api/stages', {
     headers: { 'Origin': 'http://malicious-site.com' }
   })
   ```

**Expected Result:**
- CORS error in browser console
- Request blocked by browser
- Backend returns appropriate CORS headers
- Only configured origins allowed

---

## 8. Performance Test Cases

### TC-PERF-001: API Response Time - Simple Query

**Module:** Performance
**Priority:** High
**Preconditions:** Backend running

**Test Steps:**
1. Send GET request to `/api/stages`
2. Measure response time

**Expected Result:**
- Response time < 100ms
- Status: 200 OK
- Data returned correctly

**Tool:** Postman, JMeter

---

### TC-PERF-002: API Response Time - Quiz Submission

**Module:** Performance
**Priority:** High
**Preconditions:**
- Student logged in
- Quiz ready to submit

**Test Steps:**
1. Submit 15-question quiz
2. Measure processing time

**Expected Result:**
- Response time < 200ms
- Score calculated correctly
- Database updated

---

### TC-PERF-003: Page Load Time - Dashboard

**Module:** Performance
**Priority:** High
**Preconditions:** Student logged in

**Test Steps:**
1. Navigate to student dashboard
2. Measure total load time (with DevTools)

**Expected Result:**
- Total load time < 2 seconds
- Time to interactive < 3 seconds
- All resources loaded

---

### TC-PERF-004: Concurrent User Load Test

**Module:** Performance
**Priority:** Medium
**Preconditions:** Load testing environment

**Test Steps:**
1. Simulate 50 concurrent users
2. Each user performs:
   - Login
   - View dashboard
   - Take quiz
3. Monitor system performance

**Expected Result:**
- All requests successful
- Average response time < 500ms
- No errors or timeouts
- Server CPU < 80%
- Memory usage stable

**Tool:** JMeter, K6

---

### TC-PERF-005: Database Query Performance

**Module:** Performance
**Priority:** Medium
**Preconditions:** Database with test data

**Test Steps:**
1. Execute complex query (student progress with joins)
2. Measure execution time

**Expected Result:**
- Query execution < 100ms
- Results accurate
- No N+1 query problems

---

## 9. Compatibility Test Cases

### TC-COMP-001: Chrome Browser Compatibility

**Module:** Compatibility
**Priority:** High
**Preconditions:** Chrome 90+ installed

**Test Steps:**
1. Open application in Chrome
2. Test all major features:
   - Login
   - Dashboard
   - Quiz
   - Video player
   - Charts
3. Check responsive design

**Expected Result:**
- All features work correctly
- No console errors
- UI renders properly
- Videos play
- Charts display

---

### TC-COMP-002: Firefox Browser Compatibility

**Module:** Compatibility
**Priority:** High
**Preconditions:** Firefox 88+ installed

**Test Steps:**
Same as TC-COMP-001

**Expected Result:**
Same as TC-COMP-001

---

### TC-COMP-003: Safari Browser Compatibility

**Module:** Compatibility
**Priority:** High
**Preconditions:** Safari 14+ on macOS/iOS

**Test Steps:**
Same as TC-COMP-001

**Expected Result:**
Same as TC-COMP-001
- Special attention to date/time handling
- LocalStorage functionality

---

### TC-COMP-004: Mobile Device - iPhone

**Module:** Compatibility
**Priority:** High
**Preconditions:** iPhone with iOS 14+

**Test Steps:**
1. Open application on iPhone
2. Test touch interactions
3. Check responsive layout
4. Test all features

**Expected Result:**
- Mobile navigation works (hamburger menu)
- Touch targets adequate (44px min)
- Layout adapts to screen
- All features functional
- Video player works
- Charts render correctly

---

### TC-COMP-005: Mobile Device - Android

**Module:** Compatibility
**Priority:** High
**Preconditions:** Android device (Android 10+)

**Test Steps:**
Same as TC-COMP-004

**Expected Result:**
Same as TC-COMP-004

---

### TC-COMP-006: Tablet - iPad

**Module:** Compatibility
**Priority:** Medium
**Preconditions:** iPad (iPadOS 14+)

**Test Steps:**
1. Open application on iPad
2. Test portrait and landscape modes
3. Verify layout responsiveness

**Expected Result:**
- Optimal layout for tablet screen
- Works in both orientations
- Touch interactions smooth
- All features accessible

---

### TC-COMP-007: Various Screen Sizes

**Module:** Compatibility
**Priority:** High
**Preconditions:** Chrome DevTools or real devices

**Test Steps:**
1. Test at following resolutions:
   - 320px (iPhone SE)
   - 375px (iPhone X)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1366px (Laptop)
   - 1920px (Desktop)
2. Check layout at each size

**Expected Result:**
- Layout adapts correctly at all breakpoints
- No horizontal scroll
- Content readable
- UI elements properly sized
- Navigation appropriate for screen size

---

## 10. Test Data

### 10.1 User Test Accounts

```json
{
  "admin": {
    "email": "admin@lms.com",
    "password": "admin123",
    "governmentId": "ADMN/10001",
    "role": "admin"
  },
  "instructor": {
    "email": "instructor@lms.com",
    "password": "instructor123",
    "governmentId": "INST/10002",
    "role": "instructor"
  },
  "student": {
    "email": "student@lms.com",
    "password": "student123",
    "governmentId": "STUD/10003",
    "role": "student"
  }
}
```

### 10.2 Test Questions (Sample)

```json
{
  "question": "What is a firewall?",
  "options": {
    "A": "Hardware device",
    "B": "Software application",
    "C": "Network security system",
    "D": "All of the above"
  },
  "correctAnswer": "D"
}
```

### 10.3 Test Videos (Sample)

```json
{
  "title": "Introduction to Cybersecurity",
  "url": "https://www.youtube.com/watch?v=inWWhr5tnEA",
  "stage": 1,
  "order": 1
}
```

### 10.4 Government ID Test Values

**Valid:**
- ABCD/12345
- TEST/99999
- USER/00001
- PMAS/25634

**Invalid:**
- ABC/12345 (only 3 letters)
- ABCD/1234 (only 4 digits)
- ABCDE/12345 (5 letters)
- abcd/12345 (lowercase)
- ABCD-12345 (hyphen instead of slash)

---

## Test Execution Summary Template

| Module | Total Cases | Passed | Failed | Blocked | Pass % |
|--------|-------------|--------|--------|---------|--------|
| Authentication | 11 | | | | |
| Student Functions | 16 | | | | |
| Instructor Functions | 10 | | | | |
| Admin Functions | 6 | | | | |
| Security | 8 | | | | |
| Performance | 5 | | | | |
| Compatibility | 7 | | | | |
| **TOTAL** | **63** | | | | |

---

## Bug Report Template

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-XXX |
| **Test Case ID** | TC-XXX-XXX |
| **Severity** | Critical/High/Medium/Low |
| **Priority** | P0/P1/P2/P3 |
| **Summary** | Brief description |
| **Steps to Reproduce** | Detailed steps |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happened |
| **Environment** | Browser, OS, version |
| **Screenshots** | Attach if applicable |
| **Status** | Open/In Progress/Fixed/Closed |

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Total Test Cases:** 63
**Status:** Ready for Execution

**Prepared by:** QA Team
**Approved by:** _______________________
**Date:** _______________________
