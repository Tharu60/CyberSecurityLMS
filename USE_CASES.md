# Use Case Specification
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025
**Project:** Cybersecurity LMS

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Actors](#2-actors)
3. [Use Case Diagram](#3-use-case-diagram)
4. [Student Use Cases](#4-student-use-cases)
5. [Instructor Use Cases](#5-instructor-use-cases)
6. [Administrator Use Cases](#6-administrator-use-cases)
7. [System Use Cases](#7-system-use-cases)

---

## 1. Introduction

### 1.1 Purpose
This document provides detailed use case specifications for the Cybersecurity Learning Management System. Each use case describes how actors interact with the system to achieve specific goals.

### 1.2 Scope
This document covers all functional use cases for:
- Student learning and assessment activities
- Instructor content management activities
- Administrator system management activities
- System automated processes

### 1.3 Use Case Template

Each use case follows this structure:
- **Use Case ID:** Unique identifier
- **Use Case Name:** Descriptive name
- **Actor(s):** Primary and secondary actors
- **Priority:** High/Medium/Low
- **Preconditions:** Required state before execution
- **Postconditions:** System state after execution
- **Main Flow:** Primary success scenario
- **Alternative Flows:** Variations of the main flow
- **Exception Flows:** Error scenarios

---

## 2. Actors

### 2.1 Primary Actors

| Actor | Description | Responsibilities |
|-------|-------------|------------------|
| **Student** | Learner using the platform | Take assessments, watch videos, track progress, earn certificates |
| **Instructor** | Content creator and manager | Create/manage videos and questions, view student analytics |
| **Administrator** | System manager | Manage users, view platform statistics, oversee system operations |

### 2.2 Secondary Actors

| Actor | Description |
|-------|-------------|
| **System** | Automated processes (scoring, stage unlocking, certificate generation) |
| **Database** | Data storage and retrieval |
| **Email Service** | Email notifications (future implementation) |
| **YouTube** | External video hosting service |

---

## 3. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CYBERSECURITY LMS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Student                                                        │
│    │                                                            │
│    ├──► Register                                               │
│    ├──► Login                                                  │
│    ├──► Take Initial Assessment                                │
│    ├──► View Stages                                            │
│    ├──► Watch Videos                                           │
│    ├──► Take Stage Quiz                                        │
│    ├──► Retry Failed Quiz                                      │
│    ├──► View Progress Analytics                                │
│    ├──► Generate Certificate                                   │
│    ├──► View Certificate                                       │
│    └──► Update Profile                                         │
│                                                                 │
│  Instructor                                                     │
│    │                                                            │
│    ├──► Login                                                  │
│    ├──► Create Video                                           │
│    ├──► Update Video                                           │
│    ├──► Delete Video                                           │
│    ├──► Create Question                                        │
│    ├──► Update Question                                        │
│    ├──► Delete Question                                        │
│    ├──► View Student Analytics                                 │
│    └──► Update Profile                                         │
│                                                                 │
│  Administrator                                                  │
│    │                                                            │
│    ├──► Login                                                  │
│    ├──► View All Users                                         │
│    ├──► Filter Users by Role                                   │
│    ├──► Delete User                                            │
│    ├──► View Platform Statistics                               │
│    ├──► View Stage Analytics                                   │
│    └──► Update Profile                                         │
│                                                                 │
│  Public User                                                    │
│    │                                                            │
│    └──► Verify Certificate                                     │
│                                                                 │
│  System (Automated)                                             │
│    │                                                            │
│    ├──► Calculate Quiz Score                                   │
│    ├──► Determine Auto-Placement                               │
│    ├──► Unlock Next Stage                                      │
│    └──► Generate Certificate Code                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Student Use Cases

### UC-S01: Register New Account

**Actor:** Student (or Instructor)
**Priority:** High
**Preconditions:** None
**Postconditions:** User account created, JWT token generated, user logged in

**Main Flow:**
1. User navigates to registration page
2. System displays registration form
3. User enters:
   - Full name
   - Email address
   - Password
   - Password confirmation
   - Government ID (format: XXXX/12345)
   - Role selection (Student/Instructor)
4. User submits form
5. System validates input data
6. System checks email uniqueness
7. System checks government ID uniqueness and format
8. System hashes password using bcrypt
9. System creates user account in database
10. System creates user_progress record (if student)
11. System generates JWT token
12. System returns token and user data
13. System redirects user to dashboard

**Alternative Flows:**

**A1: Email Already Exists**
- At step 6, if email exists:
  - System displays error: "Email already registered"
  - User modifies email and resubmits

**A2: Invalid Government ID Format**
- At step 7, if format invalid:
  - System displays error: "Government ID must be format XXXX/12345"
  - User corrects format and resubmits

**A3: Government ID Already Exists**
- At step 7, if government ID exists:
  - System displays error: "Government ID already registered"
  - User enters different ID and resubmits

**A4: Password Mismatch**
- At step 5, if passwords don't match:
  - System displays error: "Passwords do not match"
  - User re-enters passwords

**Exception Flows:**

**E1: Database Connection Error**
- At step 9, if database error occurs:
  - System displays: "Registration failed. Please try again later"
  - Transaction rolled back

**E2: Server Error**
- At any step, if server error occurs:
  - System logs error
  - System displays generic error message
  - User can retry registration

---

### UC-S02: User Login

**Actor:** Student, Instructor, or Administrator
**Priority:** High
**Preconditions:** User has registered account
**Postconditions:** User authenticated, JWT token generated, redirected to role-specific dashboard

**Main Flow:**
1. User navigates to login page
2. System displays login form
3. User enters email and password
4. User submits form
5. System validates input
6. System queries database for user by email
7. System compares password hash using bcrypt
8. System generates JWT token (7-day expiration)
9. System returns token and user data
10. System stores token in localStorage
11. System redirects based on role:
    - Student → Student Dashboard
    - Instructor → Instructor Dashboard
    - Admin → Admin Dashboard

**Alternative Flows:**

**A1: Invalid Credentials**
- At step 7, if password doesn't match:
  - System displays: "Invalid email or password"
  - User can retry or navigate to registration

**A2: User Not Found**
- At step 6, if email not found:
  - System displays: "Invalid email or password" (same message for security)
  - User can retry or register

**Exception Flows:**

**E1: Database Error**
- At step 6, if database error:
  - System displays: "Login failed. Please try again"
  - User can retry after brief delay

---

### UC-S03: Take Initial Assessment

**Actor:** Student
**Priority:** High
**Preconditions:**
- Student is logged in
- Initial assessment not yet completed
- 25 questions exist in General Stage (stage_number = 0)

**Postconditions:**
- Assessment score recorded
- Student auto-placed to starting stage
- user_progress updated with starting stage

**Main Flow:**
1. Student navigates to dashboard
2. System checks if initial assessment completed
3. System displays "Start Initial Assessment" button
4. Student clicks button
5. System retrieves 25 questions from General Stage
6. System displays first question with 4 options
7. Student selects an answer
8. System stores selected answer in state
9. Student clicks "Next" button
10. Repeat steps 6-9 for all 25 questions
11. System displays progress dots showing position
12. After last question, system enables "Submit" button
13. Student clicks "Submit"
14. System validates all questions answered
15. System sends answers to backend
16. System calculates score by comparing answers
17. System determines percentage: (score / 25) × 100
18. System applies auto-placement logic:
    - < 25% (< 6 correct) → Start at Stage 1
    - 25-50% (6-12 correct) → Start at Stage 2
    - 50-75% (13-18 correct) → Start at Stage 3
    - ≥ 75% (19+ correct) → Start at Stage 4
19. System updates user_progress:
    - Sets current_stage
    - Sets initial_assessment_completed = true
    - Sets initial_assessment_score
20. System displays results modal showing:
    - Score (X/25)
    - Percentage
    - Starting stage
    - Detailed answer breakdown (correct/incorrect)
21. Student clicks "Continue to Dashboard"
22. System redirects to dashboard with stages unlocked

**Alternative Flows:**

**A1: Student Navigates Between Questions**
- At step 9, student can click "Previous" to review
- System maintains selected answers
- Student can change answers before submission

**A2: Incomplete Answers**
- At step 14, if not all questions answered:
  - System displays: "Please answer all questions"
  - Submit button remains disabled
  - Student completes remaining questions

**Exception Flows:**

**E1: Network Error During Submission**
- At step 15, if network fails:
  - System displays: "Submission failed. Please try again"
  - Answers retained in browser
  - Student can resubmit

**E2: Server Error During Scoring**
- At step 16, if server error:
  - System logs error
  - System displays: "Unable to process assessment"
  - Student can retry submission

---

### UC-S04: View Available Stages

**Actor:** Student
**Priority:** High
**Preconditions:**
- Student is logged in
- Initial assessment completed

**Postconditions:** Student views stage cards with lock/unlock status

**Main Flow:**
1. Student navigates to dashboard
2. System retrieves all stages from database
3. System retrieves student's current_stage from user_progress
4. System retrieves completed stages from stage_results
5. For each stage, system determines:
   - Unlocked: stage_number ≤ current_stage
   - Completed: passing result exists in stage_results
6. System displays stage cards in grid layout:
   - Stages 1-4: 15 questions each
   - Stage 5 (Final): 25 questions
7. Each card shows:
   - Stage name
   - Stage description
   - Lock icon (if locked)
   - Checkmark badge (if completed)
   - Pass/fail status with color coding
   - Score (if attempted)
8. Unlocked stages are clickable
9. Locked stages show tooltip: "Complete previous stages to unlock"

**Alternative Flows:**

**A1: Student Hasn't Completed Initial Assessment**
- At step 2, if initial_assessment_completed = false:
  - System displays "Start Initial Assessment" card prominently
  - All stages show as locked
  - System prompts student to take assessment first

**A2: Failed Stage Retry Available**
- At step 7, if stage failed (passed = false):
  - Card displays "Retry" button
  - Shows previous attempt score
  - Student can retake immediately

---

### UC-S05: Watch Stage Videos

**Actor:** Student
**Priority:** High
**Preconditions:**
- Student is logged in
- Stage is unlocked
- Videos exist for the stage

**Postconditions:**
- Video played
- Optionally marked as completed
- Progress tracked in video_progress table

**Main Flow:**
1. Student clicks on unlocked stage card
2. System navigates to Stage View page
3. System retrieves stage details from database
4. System retrieves videos for stage (ordered by order_number)
5. System retrieves student's video_progress for stage
6. System displays:
   - Stage header with name and description
   - Video playlist (left sidebar on desktop)
   - Embedded YouTube player (main area)
   - "Mark as Complete" button
   - "Take Quiz" button
7. System loads first video (or last watched) in player
8. Student clicks video in playlist
9. System updates player with selected video
10. YouTube player loads and plays video
11. Student watches video
12. Student clicks "Mark as Complete" button
13. System sends request to backend
14. System creates/updates video_progress record:
    - Sets completed = true
    - Updates last_watched_at timestamp
15. System updates playlist UI:
    - Checkmark appears on completed videos
    - Completion percentage updates
16. Student can watch other videos or take quiz

**Alternative Flows:**

**A1: No Videos for Stage**
- At step 4, if no videos exist:
  - System displays message: "No videos available for this stage"
  - "Take Quiz" button prominently displayed
  - Student can proceed directly to quiz

**A2: All Videos Completed**
- When all videos marked complete:
  - System displays: "All videos completed! 100%"
  - "Take Quiz" button highlighted
  - Encouragement message displayed

**A3: Mobile View**
- On mobile devices (< 768px):
  - Playlist appears below video player
  - Cards instead of sidebar list
  - Swipeable video navigation

**Exception Flows:**

**E1: YouTube Video Unavailable**
- At step 10, if video fails to load:
  - System displays: "Video temporarily unavailable"
  - Student can try other videos
  - Mark complete button disabled

**E2: Network Error Marking Complete**
- At step 13, if request fails:
  - System displays: "Unable to update progress"
  - Student can retry marking complete

---

### UC-S06: Take Stage Quiz

**Actor:** Student
**Priority:** High
**Preconditions:**
- Student is logged in
- Stage is unlocked
- Questions exist for the stage

**Postconditions:**
- Quiz score calculated
- Pass/fail determined
- stage_results record created
- Next stage unlocked if passed
- current_stage updated if passed

**Main Flow:**
1. Student clicks "Take Quiz" button from Stage View
2. System navigates to Quiz page
3. System retrieves stage details
4. System retrieves questions for stage (without correct_answer field)
5. System displays:
   - Question counter (e.g., "Question 1/15")
   - Progress dots showing position
   - Current question text
   - Four radio button options (A, B, C, D)
   - "Previous" button (disabled on Q1)
   - "Next" button
6. Student selects an answer
7. System stores answer in local state
8. Student clicks "Next" button
9. System advances to next question
10. Repeat steps 6-9 for all questions
11. On last question, system shows "Submit" button
12. System validates all questions answered
13. Student clicks "Submit"
14. System displays confirmation dialog
15. Student confirms submission
16. System sends answers array to backend:
    ```json
    {
      "stageId": 1,
      "answers": [
        {"questionId": 10, "selectedAnswer": "A"},
        {"questionId": 11, "selectedAnswer": "C"},
        ...
      ]
    }
    ```
17. Backend retrieves correct answers from database
18. Backend compares selected answers with correct answers
19. Backend calculates score (number of correct answers)
20. Backend calculates percentage: (score / total) × 100
21. Backend determines pass/fail: percentage ≥ 60%
22. Backend checks for previous attempts
23. Backend creates stage_results record:
    - user_id, stage_id, score, total_questions, passed
    - attempt_number (incremented if retry)
24. If passed:
    - Backend updates user_progress.current_stage (if higher)
    - Unlocks next stage
25. Backend returns results with detailed breakdown
26. System displays results modal:
    - Pass/Fail status (color coded)
    - Score (e.g., "12/15")
    - Percentage (e.g., "80%")
    - Required percentage (60%)
    - Detailed answer review:
      - Question text
      - Selected answer
      - Correct answer
      - ✓ or ✗ indicator
27. If passed:
    - "Continue to Dashboard" button
    - Success message
28. If failed:
    - "Retry Quiz" button
    - "Return to Stage" button
    - Encouragement message
29. Student clicks button to continue

**Alternative Flows:**

**A1: Student Navigates Between Questions**
- At step 8, student clicks "Previous" button
- System loads previous question with saved answer
- Student can review and change answers
- Student continues forward when ready

**A2: Incomplete Submission Attempt**
- At step 12, if not all questions answered:
  - System displays: "Please answer all questions before submitting"
  - Submit button disabled
  - Unanswered questions highlighted in progress dots
  - Student completes remaining questions

**A3: Quiz Retry (After Failure)**
- At step 28, student clicks "Retry Quiz"
- System reloads quiz with same or randomized questions
- Attempt number incremented
- Previous answers not pre-filled
- Student takes quiz again

**A4: Confirmation Dialog Cancelled**
- At step 15, student clicks "Cancel"
- System returns to last question
- Answers preserved
- Student can review before resubmitting

**Exception Flows:**

**E1: Network Error During Submission**
- At step 16, if network fails:
  - System displays: "Unable to submit quiz. Please check connection"
  - Answers retained in browser session
  - "Retry Submission" button available
  - Student can resubmit when connection restored

**E2: Server Error During Scoring**
- At step 18-24, if server error:
  - System logs error details
  - System displays: "Quiz submission failed. Please try again"
  - Answers retained
  - Student can resubmit

**E3: Database Error Recording Results**
- At step 23, if database error:
  - Transaction rolled back
  - System displays error message
  - Student can retry entire submission

---

### UC-S07: View Progress Analytics

**Actor:** Student
**Priority:** Medium
**Preconditions:**
- Student is logged in
- Student has completed at least one assessment

**Postconditions:** Student views detailed performance analytics

**Main Flow:**
1. Student clicks "View Progress" from dashboard
2. System navigates to Progress Analytics page
3. System retrieves student's data:
   - user_progress record
   - All stage_results records
   - Calculated metrics
4. System calculates performance metrics:
   - Best score (highest percentage)
   - Average score (mean of all attempts)
   - Lowest score (lowest percentage)
   - Improvement rate (trend calculation)
   - Consistency score (standard deviation)
   - Total attempts (count of stage_results)
   - Stages completed (count of passed stages)
5. System displays metric cards at top
6. System generates 5 chart visualizations:

   **Chart 1: Doughnut Chart (Completion Overview)**
   - Completed stages (green segment)
   - Remaining stages (gray segment)
   - Percentage in center

   **Chart 2: Bar Chart (Scores by Stage)**
   - X-axis: Stage names
   - Y-axis: Score percentage (0-100)
   - Green bars: Passed stages (≥60%)
   - Red bars: Failed attempts (<60%)
   - Shows highest score if multiple attempts

   **Chart 3: Line Chart (Performance Trend)**
   - X-axis: Attempt sequence
   - Y-axis: Score percentage
   - Multiple lines if retries exist
   - Trend line showing improvement

   **Chart 4: Radar Chart (Skills Assessment)**
   - Multiple axes: One per stage
   - Polygonal area showing performance across stages
   - Ideal performance line (100%) for reference

   **Chart 5: Polar Area Chart (Performance Distribution)**
   - Circular segments for each stage
   - Segment size proportional to score
   - Color intensity shows pass/fail

7. All charts are responsive and interactive:
   - Hover shows detailed data
   - Legend toggles data visibility
   - Resize with window
8. Student can scroll through all visualizations

**Alternative Flows:**

**A1: No Quiz Attempts Yet**
- At step 3, if no stage_results exist:
  - System displays message: "Complete assessments to see analytics"
  - Charts show placeholder/empty state
  - Encouragement to start learning

**A2: Only Initial Assessment Completed**
- If only initial assessment taken:
  - System shows limited metrics
  - Charts display single data point
  - Message: "Complete more stages for detailed analytics"

**Exception Flows:**

**E1: Chart Rendering Error**
- If Chart.js fails to render:
  - System displays data in table format as fallback
  - Error logged for debugging
  - Student can still view numerical data

---

### UC-S08: Generate Certificate

**Actor:** Student
**Priority:** High
**Preconditions:**
- Student is logged in
- Student has completed all 5 main stages (1-5) with passing scores
- Certificate not already generated for this student

**Postconditions:**
- Certificate created in database
- Unique verification code generated
- Certificate ready for viewing/printing

**Main Flow:**
1. Student completes final stage (Stage 5) with passing score
2. System displays success message with certificate prompt
3. Student navigates to Certificate page
4. System checks eligibility:
   - Queries stage_results for stages 1-5
   - Verifies each stage has passed = true
5. System checks if certificate already exists
6. System displays "Generate Certificate" button
7. Student clicks button
8. System sends request to backend
9. Backend validates eligibility again (server-side check)
10. Backend generates unique 16-character hexadecimal code:
    ```javascript
    crypto.randomBytes(8).toString('hex')
    // Example: "a1b2c3d4e5f67890"
    ```
11. Backend creates certificate record:
    ```sql
    INSERT INTO certificates (user_id, certificate_code, issued_at)
    VALUES (5, 'a1b2c3d4e5f67890', CURRENT_TIMESTAMP)
    ```
12. Backend returns certificate data
13. System displays certificate:
    - Professional layout (landscape orientation)
    - Border design
    - "Certificate of Completion" heading
    - Student name (centered, large font)
    - Course name: "Cybersecurity LMS Course"
    - Issuance date (formatted: "October 27, 2025")
    - Verification code
    - Decorative elements
14. System shows action buttons:
    - "Print Certificate"
    - "Share" (future feature)
15. System displays verification URL:
    ```
    https://yourdomain.com/certificates/verify/a1b2c3d4e5f67890
    ```

**Alternative Flows:**

**A1: Certificate Already Exists**
- At step 5, if certificate exists:
  - System skips generation
  - Displays existing certificate
  - Shows "Certificate already issued" message
  - Student can view/print existing certificate

**A2: Not Eligible (Stages Not Completed)**
- At step 4, if any stage not passed:
  - System displays:
    - "Complete all 5 stages to generate certificate"
    - List of pending stages
    - Progress indicator
  - "Generate Certificate" button disabled
  - Student redirected to complete remaining stages

**A3: Print Certificate**
- At step 14, student clicks "Print"
- System triggers browser print dialog
- CSS media queries optimize for print:
  - Landscape orientation
  - Page-sized layout
  - No navigation/buttons
  - High contrast for printing
- Student prints to paper or PDF

**Exception Flows:**

**E1: Duplicate Code Generated (Extremely Rare)**
- At step 11, if code exists (UNIQUE constraint violation):
  - System catches error
  - Regenerates new code
  - Retries insertion
  - Maximum 3 retry attempts

**E2: Database Error**
- At step 11, if insert fails:
  - System displays: "Certificate generation failed"
  - Error logged
  - Student can retry generation

**E3: Network Error**
- At step 8, if request fails:
  - System displays: "Unable to generate certificate"
  - "Retry" button available
  - Student can retry when connection restored

---

### UC-S09: Update Profile

**Actor:** Student, Instructor, or Administrator
**Priority:** Medium
**Preconditions:** User is logged in
**Postconditions:** Profile information updated in database

**Main Flow:**
1. User clicks profile icon/link
2. System displays profile page showing:
   - Current name
   - Current email
   - Password change option
   - Government ID (read-only)
   - Role (read-only)
3. User modifies:
   - Name (optional)
   - Email (optional)
   - Password (optional)
4. If changing password:
   - User enters new password
   - User confirms new password
5. User clicks "Save Changes"
6. System validates input:
   - Email format valid
   - Email unique (if changed)
   - Password minimum 6 characters
   - Passwords match (if changing)
7. System sends update request to backend
8. Backend validates data again
9. If password changed:
   - Backend hashes new password with bcrypt
10. Backend updates user record:
    ```sql
    UPDATE users
    SET name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ```
11. Backend returns updated user data
12. System updates local user context
13. System displays success message
14. Profile page reflects changes

**Alternative Flows:**

**A1: Email Already Taken**
- At step 8, if email exists for different user:
  - Backend returns error
  - System displays: "Email already in use"
  - User modifies email or cancels

**A2: Password Mismatch**
- At step 6, if passwords don't match:
  - System displays: "Passwords do not match"
  - User re-enters passwords

**A3: No Changes Made**
- At step 5, if no fields modified:
  - System displays: "No changes to save"
  - Save button disabled
  - User can continue editing or exit

**Exception Flows:**

**E1: Database Error**
- At step 10, if update fails:
  - Transaction rolled back
  - System displays error message
  - Changes not saved
  - User can retry

---

## 5. Instructor Use Cases

### UC-I01: Create Video

**Actor:** Instructor (or Administrator)
**Priority:** Medium
**Preconditions:**
- User is logged in as instructor or admin
- At least one stage exists in database

**Postconditions:** New video added to database and visible to students in that stage

**Main Flow:**
1. Instructor navigates to Instructor Dashboard
2. System displays dashboard with tabs
3. Instructor clicks "Videos" tab
4. System displays list of existing videos
5. Instructor clicks "Add Video" button
6. System displays video creation modal with form:
   - Title (text input, required)
   - YouTube URL (text input, required)
   - Description (textarea, optional)
   - Stage (dropdown, required)
   - Order Number (number input, optional)
7. Instructor fills in form:
   - Enters video title
   - Pastes YouTube URL
   - Optionally adds description
   - Selects stage from dropdown
   - Optionally sets order number
8. Instructor clicks "Add Video" button
9. System validates input:
   - Title not empty
   - URL not empty
   - URL is valid YouTube format
   - Stage selected
10. System sends request to backend
11. Backend validates data again
12. Backend extracts video ID from YouTube URL
13. Backend creates video record:
    ```sql
    INSERT INTO videos (stage_id, title, url, description, order_number, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ```
14. Backend returns new video data
15. System closes modal
16. System refreshes video list
17. New video appears in list
18. System displays success message

**Alternative Flows:**

**A1: Invalid YouTube URL**
- At step 11, if URL not valid YouTube format:
  - Backend returns error
  - System displays: "Please enter valid YouTube URL"
  - Instructor corrects URL

**A2: Order Number Auto-Assignment**
- At step 7, if order number not provided:
  - Backend calculates: MAX(order_number) + 1 for that stage
  - Video placed at end of stage playlist

**A3: Cancel Creation**
- At any step before 9, instructor clicks "Cancel"
  - Modal closes
  - No data saved
  - Video list unchanged

**Exception Flows:**

**E1: Database Error**
- At step 13, if insert fails:
  - Backend returns error
  - System displays: "Failed to create video"
  - Instructor can retry

**E2: Duplicate Video**
- If same URL exists for stage:
  - System warns: "Video may already exist for this stage"
  - Instructor can proceed or cancel

---

### UC-I02: Update Video

**Actor:** Instructor (or Administrator)
**Priority:** Medium
**Preconditions:**
- User is logged in as instructor/admin
- Video exists in database

**Postconditions:** Video details updated in database

**Main Flow:**
1. Instructor navigates to Videos tab
2. System displays video list
3. Instructor clicks "Edit" button on specific video
4. System displays edit modal with pre-filled form:
   - Current title
   - Current URL
   - Current description
   - Current stage
   - Current order number
5. Instructor modifies fields
6. Instructor clicks "Update Video"
7. System validates input (same as create)
8. System sends update request to backend
9. Backend validates and updates:
    ```sql
    UPDATE videos
    SET title = ?, url = ?, description = ?, stage_id = ?, order_number = ?
    WHERE id = ?
    ```
10. Backend returns updated video data
11. System closes modal
12. System refreshes video list
13. Updated video shows new details
14. System displays success message

**Alternative Flows:**

**A1: No Changes Made**
- At step 6, if no fields modified:
  - Update proceeds anyway (updates updated_at if exists)
  - Or system displays: "No changes made"

**A2: Stage Changed**
- If instructor changes stage:
  - Video moved to different stage
  - Order number may need adjustment
  - Students in new stage can now see it

---

### UC-I03: Delete Video

**Actor:** Instructor (or Administrator)
**Priority:** Low
**Preconditions:**
- User is logged in as instructor/admin
- Video exists in database

**Postconditions:**
- Video removed from database
- Related video_progress records remain (for history)

**Main Flow:**
1. Instructor navigates to Videos tab
2. System displays video list
3. Instructor clicks "Delete" button on specific video
4. System displays confirmation dialog:
   - "Are you sure you want to delete this video?"
   - Video title shown
   - "Cancel" and "Delete" buttons
5. Instructor clicks "Delete"
6. System sends delete request to backend
7. Backend deletes video:
    ```sql
    DELETE FROM videos WHERE id = ?
    ```
8. Backend returns success response
9. System removes video from list (UI update)
10. System displays success message: "Video deleted successfully"

**Alternative Flows:**

**A1: Cancel Deletion**
- At step 5, instructor clicks "Cancel"
  - Confirmation dialog closes
  - No action taken
  - Video remains in list

**Exception Flows:**

**E1: Foreign Key Constraint (If Strict)**
- At step 7, if video_progress references exist:
  - System displays warning
  - Option to proceed with cascade delete
  - Or cancel operation

**E2: Database Error**
- At step 7, if delete fails:
  - System displays error message
  - Video remains in database
  - Instructor can retry

---

### UC-I04: Create Question

**Actor:** Instructor (or Administrator)
**Priority:** Medium
**Preconditions:**
- User is logged in as instructor/admin
- At least one stage exists

**Postconditions:** New question added to database

**Main Flow:**
1. Instructor navigates to Questions tab
2. System displays question list (paginated)
3. Instructor clicks "Add Question" button
4. System displays question creation modal:
   - Stage (dropdown, required)
   - Question Text (textarea, required)
   - Option A (text input, required)
   - Option B (text input, required)
   - Option C (text input, required)
   - Option D (text input, required)
   - Correct Answer (radio buttons: A/B/C/D, required)
5. Instructor fills in all fields
6. Instructor selects correct answer
7. Instructor clicks "Add Question"
8. System validates:
   - All fields filled
   - Correct answer selected
9. System sends request to backend
10. Backend creates question:
    ```sql
    INSERT INTO questions (stage_id, question_text, option_a, option_b,
                          option_c, option_d, correct_answer, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ```
11. Backend returns new question data
12. System closes modal
13. System refreshes question list
14. New question appears
15. System displays success message

**Alternative Flows:**

**A1: Missing Required Fields**
- At step 8, if any field empty:
  - System highlights missing fields
  - Error message: "All fields required"
  - Instructor completes fields

**A2: No Correct Answer Selected**
- At step 8, if correct answer not selected:
  - Error: "Please select correct answer"
  - Instructor selects answer

---

### UC-I05: View Student Analytics

**Actor:** Instructor (or Administrator)
**Priority:** Medium
**Preconditions:**
- User is logged in as instructor/admin
- Students exist in system

**Postconditions:** Instructor views student performance data

**Main Flow:**
1. Instructor navigates to Analytics tab
2. System displays student list with columns:
   - Name
   - Email
   - Current Stage
   - Completed Stages (count)
   - Average Score (calculated)
   - Status badge (Active/Inactive/Completed)
3. System calculates for each student:
   - Completed stages count from stage_results
   - Average score from all attempts
   - Status based on recent activity
4. Instructor can sort by any column
5. Instructor can filter by status
6. Instructor clicks on student name
7. System displays detailed student view:
   - Personal information
   - Progress timeline
   - Stage-by-stage results
   - Attempt history
   - Video completion status
   - Time spent estimates
8. Instructor can export data (future feature)

**Alternative Flows:**

**A1: No Students Enrolled**
- At step 2, if no students:
  - System displays: "No students enrolled yet"
  - Empty state illustration

**A2: Student Not Started**
- If student registered but not started:
  - Status: "Not Started"
  - Current stage: "-"
  - Average score: "N/A"

---

## 6. Administrator Use Cases

### UC-A01: View All Users

**Actor:** Administrator
**Priority:** High
**Preconditions:** User is logged in as administrator
**Postconditions:** Admin views complete user list

**Main Flow:**
1. Admin navigates to Admin Dashboard
2. System displays user management section
3. System queries all users from database
4. System displays user table with columns:
   - Name
   - Email
   - Government ID
   - Role
   - Created Date
   - Actions (Delete button)
5. Admin sees user count at top
6. Admin can scroll through list
7. System displays all roles with counts:
   - Total Users
   - Students
   - Instructors
   - Admins

**Alternative Flows:**

**A1: Filter by Role**
- Admin selects role from dropdown (All/Student/Instructor/Admin)
- System filters list to show only selected role
- Count updates to show filtered count

**A2: Search Users** (Future enhancement)
- Admin enters search term
- System filters by name or email
- Results update in real-time

---

### UC-A02: Delete User

**Actor:** Administrator
**Priority:** High
**Preconditions:**
- User is logged in as administrator
- Target user exists in database
- Target user is not the current admin

**Postconditions:**
- User account deleted
- Related data handled (cascade or retain)

**Main Flow:**
1. Admin views user list
2. Admin clicks "Delete" button for specific user
3. System checks if target is current admin
4. System displays confirmation dialog:
   - "Are you sure you want to delete [User Name]?"
   - Warning: "This action cannot be undone"
   - User email and role shown
   - "Cancel" and "Delete" buttons
5. Admin clicks "Delete"
6. System sends delete request
7. Backend performs deletion:
   ```sql
   -- Option 1: Cascade delete (removes all related data)
   DELETE FROM users WHERE id = ?

   -- Related data deleted automatically:
   -- - user_progress
   -- - stage_results
   -- - video_progress
   -- - certificates
   ```
8. Backend returns success
9. System removes user from list
10. System updates user counts
11. System displays success message: "User deleted successfully"

**Alternative Flows:**

**A1: Cannot Delete Self**
- At step 3, if target is current admin:
  - Delete button disabled
  - Tooltip: "Cannot delete your own account"
  - Admin must use different account to delete this admin

**A2: Cancel Deletion**
- At step 5, admin clicks "Cancel"
  - Dialog closes
  - No action taken
  - User remains in system

**Exception Flows:**

**E1: Database Error**
- At step 7, if deletion fails:
  - Transaction rolled back
  - System displays error
  - User remains in database

**E2: User Has Certificate**
- At step 7, additional warning:
  - "User has earned certificate"
  - "Deletion will invalidate certificate"
  - Admin must confirm again

---

### UC-A03: View Platform Statistics

**Actor:** Administrator
**Priority:** High
**Preconditions:** Admin is logged in
**Postconditions:** Admin views comprehensive platform metrics

**Main Flow:**
1. Admin navigates to Admin Dashboard
2. System displays statistics section
3. System queries database for metrics:
   ```sql
   -- User counts
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM users WHERE role = 'student';

   -- Content counts
   SELECT COUNT(*) FROM stages;
   SELECT COUNT(*) FROM questions;
   SELECT COUNT(*) FROM videos;

   -- Progress metrics
   SELECT COUNT(DISTINCT user_id) FROM user_progress
   WHERE initial_assessment_completed = 1;

   -- Completion metrics
   SELECT COUNT(*) FROM stage_results WHERE passed = 1;
   ```
4. System displays statistics cards:

   **User Statistics:**
   - Total Users: 100
   - Total Students: 85
   - Total Instructors: 10
   - Total Admins: 5

   **Content Statistics:**
   - Total Stages: 6
   - Total Questions: 110
   - Total Videos: 8

   **Progress Statistics:**
   - Students Who Started: 75
   - Completed Initial Assessment: 70

   **Completion Statistics:**
   - Total Stage Completions: 250
   - Certificates Issued: 20

5. System displays stage analytics table:
   - Stage name
   - Stage number
   - Students completed
   - Average score
   - Pass rate

6. System can generate visual charts (future)

**Alternative Flows:**

**A1: Export Statistics** (Future)
- Admin clicks "Export Report"
- System generates PDF/CSV
- Download begins

**A2: Date Range Filter** (Future)
- Admin selects date range
- Statistics filtered to timeframe
- Charts update accordingly

---

## 7. System Use Cases

### UC-SYS01: Auto-Calculate Quiz Score

**Actor:** System
**Priority:** High
**Trigger:** Student submits quiz
**Preconditions:** Valid quiz submission received
**Postconditions:** Score calculated and returned

**Main Flow:**
1. System receives quiz submission from student
2. System extracts:
   - Stage ID
   - Array of answers (questionId + selectedAnswer)
3. System queries database for correct answers:
   ```sql
   SELECT id, correct_answer
   FROM questions
   WHERE id IN (?, ?, ...)
   ```
4. System creates answer key map:
   ```javascript
   {
     10: 'A',
     11: 'C',
     12: 'B',
     ...
   }
   ```
5. System iterates through submitted answers
6. For each answer:
   - Compare selectedAnswer with correct_answer
   - If match: increment score, mark as correct
   - If no match: mark as incorrect
7. System calculates:
   - Total score (number correct)
   - Percentage: (score / totalQuestions) × 100
   - Pass status: percentage ≥ 60
8. System builds results array:
   ```javascript
   [
     {
       questionId: 10,
       selectedAnswer: 'A',
       correctAnswer: 'A',
       isCorrect: true
     },
     ...
   ]
   ```
9. System returns response to frontend

**Exception Flows:**

**E1: Missing Question**
- If questionId not found in database:
  - Log error
  - Exclude from scoring
  - Continue with remaining questions

**E2: Invalid Answer Format**
- If selectedAnswer not A/B/C/D:
  - Mark as incorrect
  - Log warning

---

### UC-SYS02: Auto-Unlock Next Stage

**Actor:** System
**Priority:** High
**Trigger:** Student passes stage quiz
**Preconditions:** Quiz passed with ≥60%
**Postconditions:** Next stage unlocked for student

**Main Flow:**
1. System determines quiz passed
2. System retrieves current stage_number
3. System calculates next_stage = stage_number + 1
4. System checks if next stage exists (stage_number ≤ 5)
5. System retrieves student's current_stage from user_progress
6. If next_stage > current_stage:
   - System updates user_progress:
     ```sql
     UPDATE user_progress
     SET current_stage = ?, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?
     ```
7. System returns success with updated stage info
8. Frontend reflects unlocked stage immediately

**Alternative Flows:**

**A1: Final Stage Completed**
- At step 4, if stage_number = 5:
  - No next stage to unlock
  - System checks certificate eligibility
  - System prompts certificate generation

**A2: Already Higher Stage**
- At step 6, if current_stage already higher:
  - No update needed (student retaking earlier stage)
  - Stage remains unchanged

---

### UC-SYS03: Generate Unique Certificate Code

**Actor:** System
**Priority:** High
**Trigger:** Student requests certificate generation
**Preconditions:** Student completed all required stages
**Postconditions:** Unique code generated and stored

**Main Flow:**
1. System receives certificate generation request
2. System verifies eligibility (all 5 stages passed)
3. System generates random code:
   ```javascript
   const crypto = require('crypto');
   const code = crypto.randomBytes(8).toString('hex');
   // Produces 16-character hex string
   // Example: "a1b2c3d4e5f67890"
   ```
4. System checks code uniqueness:
   ```sql
   SELECT id FROM certificates WHERE certificate_code = ?
   ```
5. If unique:
   - Proceed to insert
6. If duplicate (extremely rare):
   - Regenerate new code
   - Check again
   - Max 3 attempts
7. System inserts certificate:
   ```sql
   INSERT INTO certificates (user_id, certificate_code, issued_at)
   VALUES (?, ?, CURRENT_TIMESTAMP)
   ```
8. System returns certificate data

**Exception Flows:**

**E1: Max Retry Attempts Exceeded**
- If 3 duplicate codes generated:
  - Log critical error
  - Return error to frontend
  - Request manual intervention

**E2: Constraint Violation**
- If UNIQUE constraint fails:
  - Catch error
  - Regenerate code
  - Retry insertion

---

## 8. Public Use Cases

### UC-P01: Verify Certificate

**Actor:** Public User (no authentication required)
**Priority:** Medium
**Preconditions:** Certificate code provided
**Postconditions:** Certificate validity confirmed

**Main Flow:**
1. User navigates to verification URL:
   ```
   https://domain.com/certificates/verify/a1b2c3d4e5f67890
   ```
2. System extracts certificate code from URL
3. System sends request to backend (no auth required)
4. Backend queries database:
   ```sql
   SELECT c.certificate_code, c.issued_at, u.name, u.email
   FROM certificates c
   JOIN users u ON c.user_id = u.id
   WHERE c.certificate_code = ?
   ```
5. If found:
   - Backend returns:
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
6. System displays verification result:
   - ✓ "Valid Certificate"
   - Certificate holder name
   - Issuance date
   - Course name
   - Verification code
7. User can print verification page

**Alternative Flows:**

**A1: Invalid Certificate Code**
- At step 4, if code not found:
  - Backend returns:
    ```json
    {
      "valid": false,
      "message": "Certificate not found"
    }
    ```
  - System displays:
    - ✗ "Invalid Certificate"
    - "This certificate code is not valid"
    - "Please check the code and try again"

**A2: Direct Code Entry** (Future)
- Verification page with input field
- User manually enters code
- System validates on submit

---

## Document Summary

This use case document covers:

**Student Use Cases:** 9 use cases
- Registration, Login, Assessment, Quiz, Videos, Progress, Certificate, Profile

**Instructor Use Cases:** 5 use cases
- Video management (Create/Update/Delete), Question management, Analytics

**Administrator Use Cases:** 3 use cases
- User management, Statistics viewing, User deletion

**System Use Cases:** 3 use cases
- Auto-scoring, Stage unlocking, Certificate code generation

**Public Use Cases:** 1 use case
- Certificate verification

**Total:** 21 comprehensive use cases covering all system functionality

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Complete

**Prepared by:** Development Team
**Approved by:** _______________________
**Date:** _______________________
