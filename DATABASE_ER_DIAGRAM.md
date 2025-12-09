# Entity Relationship (ER) Diagram
## Cybersecurity Learning Management System Database

**Version:** 1.0
**Date:** October 27, 2025
**Database:** SQLite (Dev) / PostgreSQL (Production)

---

## Table of Contents

1. [ER Diagram Overview](#1-er-diagram-overview)
2. [Detailed ER Diagram](#2-detailed-er-diagram)
3. [Entity Descriptions](#3-entity-descriptions)
4. [Relationship Descriptions](#4-relationship-descriptions)
5. [Cardinality Summary](#5-cardinality-summary)
6. [Constraints and Rules](#6-constraints-and-rules)

---

## 1. ER Diagram Overview

### 1.1 Entities Summary

| Entity | Description | Primary Key | Key Attributes |
|--------|-------------|-------------|----------------|
| **users** | User accounts (students, instructors, admins) | id | email, password, role |
| **stages** | Learning stages (6 total) | id | name, stage_number |
| **questions** | Quiz questions | id | question_text, correct_answer |
| **videos** | Video resources | id | title, url |
| **user_progress** | Student overall progress | id | current_stage, initial_assessment_score |
| **stage_results** | Quiz attempt results | id | score, passed, attempt_number |
| **video_progress** | Video completion tracking | id | completed |
| **certificates** | Issued certificates | id | certificate_code |

### 1.2 Relationship Summary

- **users** → **user_progress** (1:1)
- **users** → **stage_results** (1:N)
- **users** → **video_progress** (1:N)
- **users** → **certificates** (1:1)
- **stages** → **questions** (1:N)
- **stages** → **videos** (1:N)
- **stages** → **stage_results** (1:N)
- **videos** → **video_progress** (1:N)

---

## 2. Detailed ER Diagram

### 2.1 Complete ER Diagram with Attributes

```
┌─────────────────────────────────────────────┐
│                   USERS                     │
│─────────────────────────────────────────────│
│ PK  id              INTEGER                 │
│     name            TEXT                    │
│ UK  email           TEXT                    │
│     password        TEXT (bcrypt hashed)    │
│ UK  government_id   TEXT (XXXX/12345)       │
│     role            TEXT (student/instructor/admin) │
│     created_at      DATETIME                │
│     updated_at      DATETIME                │
└──────────┬──────────────────┬───────────────┘
           │                  │
           │ 1                │ 1
           │                  │
           │                  └──────────────────────────┐
           │                                             │
           │                  ┌──────────────────────────┼────────┐
           │                  │                          │        │
           │ 1                │ 1                        │ 1      │ 1
           │                  │                          │        │
┌──────────▼──────────────────▼──────────┐  ┌────────────▼────────▼─────────┐
│         USER_PROGRESS                  │  │     CERTIFICATES              │
│────────────────────────────────────────│  │───────────────────────────────│
│ PK  id                    INTEGER      │  │ PK  id              INTEGER   │
│ FK  user_id               INTEGER ────────┤ FK  user_id         INTEGER ──┤
│     current_stage         INTEGER      │  │ UK  certificate_code TEXT     │
│     initial_assess_comp   BOOLEAN      │  │     issued_at       DATETIME  │
│     initial_assess_score  INTEGER      │  └───────────────────────────────┘
│     created_at            DATETIME     │
│     updated_at            DATETIME     │
└────────────────────────────────────────┘
           │
           │ 1
           │
           │
           │ N
           │
┌──────────▼──────────────────────────────────────┐
│              STAGE_RESULTS                      │
│─────────────────────────────────────────────────│
│ PK  id                INTEGER                   │
│ FK  user_id           INTEGER ────┐             │
│ FK  stage_id          INTEGER     │             │
│     score             INTEGER     │             │
│     total_questions   INTEGER     │             │
│     passed            BOOLEAN     │             │
│     attempt_number    INTEGER     │             │
│     completed_at      DATETIME    │             │
└───────────────────────────────────┴─────────────┘
                                    │
                                    │ N
                                    │
                                    │ 1
                                    │
┌───────────────────────────────────▼─────────────────┐
│                    STAGES                           │
│─────────────────────────────────────────────────────│
│ PK  id                INTEGER                       │
│     name              TEXT                          │
│     description       TEXT                          │
│     stage_number      INTEGER (0-5)                 │
│     total_questions   INTEGER                       │
│     passing_score     INTEGER                       │
│     created_at        DATETIME                      │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
           │ 1                      │ 1
           │                        │
           │ N                      │ N
           │                        │
┌──────────▼──────────────┐  ┌──────▼──────────────────────────┐
│      QUESTIONS          │  │         VIDEOS                  │
│─────────────────────────│  │─────────────────────────────────│
│ PK  id        INTEGER   │  │ PK  id           INTEGER        │
│ FK  stage_id  INTEGER ──┤  │ FK  stage_id     INTEGER ───────┤
│     question_text TEXT  │  │     title        TEXT           │
│     option_a     TEXT   │  │     url          TEXT (YouTube) │
│     option_b     TEXT   │  │     description  TEXT           │
│     option_c     TEXT   │  │     order_number INTEGER        │
│     option_d     TEXT   │  │     created_at   DATETIME       │
│     correct_ans  TEXT   │  └────────┬────────────────────────┘
│     created_at DATETIME │           │
└─────────────────────────┘           │ 1
                                      │
                                      │ N
                                      │
                        ┌─────────────▼──────────────────────┐
                        │       VIDEO_PROGRESS               │
                        │────────────────────────────────────│
                        │ PK  id              INTEGER        │
                        │ FK  user_id         INTEGER ────┐  │
                        │ FK  video_id        INTEGER     │  │
                        │     completed       BOOLEAN     │  │
                        │     last_watched_at DATETIME    │  │
                        └─────────────────────────────────┴──┘
                                                          │
                                                          │ N
                                                          │
                                                          │ 1
                                                          │
                                    ┌─────────────────────┘
                                    │
                              (back to USERS)
```

---

## 3. Entity Descriptions

### 3.1 USERS Entity

**Purpose:** Store user account information

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique user identifier |
| name | TEXT | NOT NULL | User's full name |
| **email** | TEXT | NOT NULL, UNIQUE | Login credential, email address |
| password | TEXT | NOT NULL | Bcrypt hashed password (60 chars) |
| **government_id** | TEXT | NOT NULL, UNIQUE | Government ID format: XXXX/12345 |
| role | TEXT | NOT NULL, CHECK | 'student', 'instructor', or 'admin' |
| created_at | DATETIME | DEFAULT NOW | Account creation timestamp |
| updated_at | DATETIME | DEFAULT NOW | Last update timestamp |

**Relationships:**
- Has ONE user_progress (if student)
- Has MANY stage_results
- Has MANY video_progress records
- Has ONE certificate (if eligible)

---

### 3.2 STAGES Entity

**Purpose:** Define learning stages

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique stage identifier |
| name | TEXT | NOT NULL | Stage name (e.g., "Cybersecurity Basics") |
| description | TEXT | NULL | Optional stage description |
| stage_number | INTEGER | NOT NULL | 0-5 (0=General, 1-4=Main, 5=Final) |
| total_questions | INTEGER | NOT NULL | Number of questions for this stage |
| passing_score | INTEGER | NOT NULL | Minimum score to pass (60% = 9/15 or 15/25) |
| created_at | DATETIME | DEFAULT NOW | Creation timestamp |

**Stage Details:**
- Stage 0: General Stage (25 questions, 15 to pass)
- Stage 1-4: Main stages (15 questions each, 9 to pass)
- Stage 5: Final stage (25 questions, 15 to pass)

**Relationships:**
- Has MANY questions
- Has MANY videos
- Has MANY stage_results

---

### 3.3 QUESTIONS Entity

**Purpose:** Store quiz questions

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique question identifier |
| **stage_id** | INTEGER | FK → stages(id) | Which stage this question belongs to |
| question_text | TEXT | NOT NULL | The question content |
| option_a | TEXT | NOT NULL | First choice |
| option_b | TEXT | NOT NULL | Second choice |
| option_c | TEXT | NOT NULL | Third choice |
| option_d | TEXT | NOT NULL | Fourth choice |
| correct_answer | TEXT | NOT NULL, CHECK | 'A', 'B', 'C', or 'D' |
| created_at | DATETIME | DEFAULT NOW | Creation timestamp |

**Total Questions:** 110
- General Stage (0): 25
- Each Main Stage (1-4): 15
- Final Stage (5): 25

**Relationships:**
- Belongs to ONE stage

---

### 3.4 VIDEOS Entity

**Purpose:** Store video resources

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique video identifier |
| **stage_id** | INTEGER | FK → stages(id) | Which stage this video belongs to |
| title | TEXT | NOT NULL | Video title |
| url | TEXT | NOT NULL | YouTube video URL |
| description | TEXT | NULL | Optional description |
| order_number | INTEGER | NULL | Display order (1, 2, 3...) |
| created_at | DATETIME | DEFAULT NOW | Creation timestamp |

**Total Videos:** 8 (2 per stage for stages 1-4)

**Relationships:**
- Belongs to ONE stage
- Has MANY video_progress records

---

### 3.5 USER_PROGRESS Entity

**Purpose:** Track overall student progress

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique progress record identifier |
| **user_id** | INTEGER | FK → users(id) | Which student this progress belongs to |
| current_stage | INTEGER | DEFAULT 0 | Highest unlocked stage number (0-5) |
| initial_assessment_completed | BOOLEAN | DEFAULT 0 | Has taken initial assessment? |
| initial_assessment_score | INTEGER | NULL | Score on initial assessment (0-25) |
| created_at | DATETIME | DEFAULT NOW | Record creation |
| updated_at | DATETIME | DEFAULT NOW | Last update |

**Cardinality:** One record per student (1:1 with users)

**Relationships:**
- Belongs to ONE user (student)

---

### 3.6 STAGE_RESULTS Entity

**Purpose:** Record quiz attempts and results

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique result identifier |
| **user_id** | INTEGER | FK → users(id) | Student who took quiz |
| **stage_id** | INTEGER | FK → stages(id) | Which stage was assessed |
| score | INTEGER | NOT NULL | Number of correct answers |
| total_questions | INTEGER | NOT NULL | Total questions in quiz |
| passed | BOOLEAN | NOT NULL | Pass (1) or Fail (0) based on 60% |
| attempt_number | INTEGER | DEFAULT 1 | Attempt count (allows retakes) |
| completed_at | DATETIME | DEFAULT NOW | When quiz was completed |

**Cardinality:** Many records per student per stage (allows retakes)

**Relationships:**
- Belongs to ONE user (student)
- Belongs to ONE stage

---

### 3.7 VIDEO_PROGRESS Entity

**Purpose:** Track video completion by students

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique progress identifier |
| **user_id** | INTEGER | FK → users(id) | Which student |
| **video_id** | INTEGER | FK → videos(id) | Which video |
| completed | BOOLEAN | DEFAULT 0 | Completed (1) or Not (0) |
| last_watched_at | DATETIME | DEFAULT NOW | Last time video was accessed |

**Cardinality:** One record per student per video

**Relationships:**
- Belongs to ONE user (student)
- Belongs to ONE video

---

### 3.8 CERTIFICATES Entity

**Purpose:** Store issued certificates

**Attributes:**

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **id** | INTEGER | PK, AUTOINCREMENT | Unique certificate identifier |
| **user_id** | INTEGER | FK → users(id) | Certificate recipient |
| **certificate_code** | TEXT | NOT NULL, UNIQUE | 16-char hexadecimal verification code |
| issued_at | DATETIME | DEFAULT NOW | When certificate was generated |

**Cardinality:** One certificate per student (1:1 with users)

**Eligibility:** Student must pass all 5 main stages (1-5)

**Relationships:**
- Belongs to ONE user (student)

---

## 4. Relationship Descriptions

### 4.1 User-Centered Relationships

#### Relationship 1: users ↔ user_progress (1:1)

```
┌─────────┐              ┌────────────────┐
│  users  │              │ user_progress  │
│         │──────────────│                │
│ id (PK) │      1:1     │ user_id (FK)   │
└─────────┘              └────────────────┘
```

**Type:** One-to-One
**Description:** Each student has exactly one progress record
**Created:** Automatically when student registers
**Cascade:** DELETE CASCADE (delete progress if user deleted)

---

#### Relationship 2: users → stage_results (1:N)

```
┌─────────┐              ┌────────────────┐
│  users  │              │ stage_results  │
│         │──────────────│                │
│ id (PK) │      1:N     │ user_id (FK)   │
└─────────┘              └────────────────┘
```

**Type:** One-to-Many
**Description:** One student can have many quiz results (multiple stages, multiple attempts)
**Created:** Each time student submits a quiz
**Cascade:** DELETE CASCADE

---

#### Relationship 3: users → video_progress (1:N)

```
┌─────────┐              ┌─────────────────┐
│  users  │              │ video_progress  │
│         │──────────────│                 │
│ id (PK) │      1:N     │ user_id (FK)    │
└─────────┘              └─────────────────┘
```

**Type:** One-to-Many
**Description:** One student can have many video progress records (one per video)
**Created:** When student marks video as complete
**Cascade:** DELETE CASCADE

---

#### Relationship 4: users ↔ certificates (1:1)

```
┌─────────┐              ┌──────────────┐
│  users  │              │ certificates │
│         │──────────────│              │
│ id (PK) │      1:1     │ user_id (FK) │
└─────────┘              └──────────────┘
```

**Type:** One-to-One
**Description:** Each student can have at most one certificate
**Created:** When student completes all 5 main stages
**Cascade:** DELETE CASCADE

---

### 4.2 Stage-Centered Relationships

#### Relationship 5: stages → questions (1:N)

```
┌─────────┐              ┌───────────┐
│ stages  │              │ questions │
│         │──────────────│           │
│ id (PK) │      1:N     │stage_id(FK)│
└─────────┘              └───────────┘
```

**Type:** One-to-Many
**Description:** One stage has many questions
**Count:**
- Stage 0: 25 questions
- Stages 1-4: 15 questions each
- Stage 5: 25 questions
**Cascade:** DELETE CASCADE

---

#### Relationship 6: stages → videos (1:N)

```
┌─────────┐              ┌─────────┐
│ stages  │              │ videos  │
│         │──────────────│         │
│ id (PK) │      1:N     │stage_id │
└─────────┘              └─────────┘
```

**Type:** One-to-Many
**Description:** One stage has many videos
**Count:** Stages 1-4 have 2 videos each (8 total)
**Cascade:** DELETE CASCADE

---

#### Relationship 7: stages → stage_results (1:N)

```
┌─────────┐              ┌────────────────┐
│ stages  │              │ stage_results  │
│         │──────────────│                │
│ id (PK) │      1:N     │ stage_id (FK)  │
└─────────┘              └────────────────┘
```

**Type:** One-to-Many
**Description:** One stage can have many quiz results from different students
**Cascade:** DELETE CASCADE

---

#### Relationship 8: videos → video_progress (1:N)

```
┌─────────┐              ┌─────────────────┐
│ videos  │              │ video_progress  │
│         │──────────────│                 │
│ id (PK) │      1:N     │ video_id (FK)   │
└─────────┘              └─────────────────┘
```

**Type:** One-to-Many
**Description:** One video can have many progress records from different students
**Cascade:** DELETE CASCADE

---

## 5. Cardinality Summary

### 5.1 Cardinality Notation

| Notation | Meaning |
|----------|---------|
| 1:1 | One-to-One |
| 1:N | One-to-Many |
| N:M | Many-to-Many (None in this schema) |

### 5.2 Complete Cardinality Table

| Parent Entity | Child Entity | Cardinality | Relationship Type |
|--------------|--------------|-------------|-------------------|
| users | user_progress | 1:1 | Has one |
| users | stage_results | 1:N | Has many |
| users | video_progress | 1:N | Has many |
| users | certificates | 1:1 | Has one (optional) |
| stages | questions | 1:N | Has many |
| stages | videos | 1:N | Has many |
| stages | stage_results | 1:N | Has many |
| videos | video_progress | 1:N | Has many |

---

## 6. Constraints and Rules

### 6.1 Primary Keys

All tables have auto-incrementing integer primary keys:
- users.id
- stages.id
- questions.id
- videos.id
- user_progress.id
- stage_results.id
- video_progress.id
- certificates.id

### 6.2 Foreign Keys

**Foreign Key Constraints:**

```sql
-- user_progress
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- stage_results
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE

-- video_progress
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE

-- certificates
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- questions
FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE

-- videos
FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
```

### 6.3 Unique Constraints

- users.email (UNIQUE)
- users.government_id (UNIQUE)
- certificates.certificate_code (UNIQUE)

### 6.4 Check Constraints

```sql
-- users.role
CHECK(role IN ('student', 'instructor', 'admin'))

-- questions.correct_answer
CHECK(correct_answer IN ('A', 'B', 'C', 'D'))
```

### 6.5 Business Rules

**Rule 1: Stage Unlocking**
- Students start at stage determined by initial assessment
- Next stage unlocks only after passing current stage with 60%

**Rule 2: Certificate Eligibility**
- Must complete stages 1, 2, 3, 4, and 5 with passing scores
- Only one certificate per student

**Rule 3: Quiz Retakes**
- Unlimited retakes allowed
- Each retake increments attempt_number

**Rule 4: Role Restrictions**
- Only students can register via UI
- Instructors can register via UI
- Admins created manually in database

**Rule 5: Password Security**
- Minimum 6 characters (recommend 8+)
- Hashed using bcrypt before storage
- Never returned in API responses

---

## 7. Indexes (Recommended for Production)

### 7.1 Primary Key Indexes
Automatically created on all `id` columns.

### 7.2 Foreign Key Indexes (PostgreSQL)

```sql
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_stage_results_user_id ON stage_results(user_id);
CREATE INDEX idx_stage_results_stage_id ON stage_results(stage_id);
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_questions_stage_id ON questions(stage_id);
CREATE INDEX idx_videos_stage_id ON videos(stage_id);
```

### 7.3 Unique Indexes

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_government_id ON users(government_id);
CREATE UNIQUE INDEX idx_certificates_code ON certificates(certificate_code);
```

---

## 8. Sample Data Flow

### 8.1 Student Registration Flow

```
1. Insert into users table
   ↓
2. Auto-create record in user_progress table
   ↓
3. Set current_stage = 0
   ↓
4. Set initial_assessment_completed = 0
```

### 8.2 Initial Assessment Flow

```
1. Student takes 25 questions from stage_id = 0
   ↓
2. Calculate score and percentage
   ↓
3. Update user_progress:
   - initial_assessment_completed = 1
   - initial_assessment_score = score
   - current_stage = calculated based on percentage
```

### 8.3 Quiz Submission Flow

```
1. Student submits answers for stage
   ↓
2. Compare with questions.correct_answer
   ↓
3. Calculate score and pass/fail
   ↓
4. Insert into stage_results
   ↓
5. If passed: Update user_progress.current_stage (if higher)
```

### 8.4 Certificate Generation Flow

```
1. Check stage_results for stages 1-5
   ↓
2. Verify all have passed = 1
   ↓
3. Generate unique 16-char hex code
   ↓
4. Insert into certificates table
```

---

## 9. ER Diagram Legend

### 9.1 Symbols Used

```
┌─────────┐     Entity (Table)
│ Entity  │
└─────────┘

──────────      Relationship line

1:1             One-to-One cardinality
1:N             One-to-Many cardinality

PK              Primary Key
FK              Foreign Key
UK              Unique Key
```

### 9.2 Attribute Notation

```
PK  id              Primary Key
FK  user_id         Foreign Key
UK  email           Unique constraint
    name            Regular attribute
```

---

## Summary

**Total Entities:** 8
**Total Relationships:** 8
**Total Foreign Keys:** 8
**Total Indexes:** 11 (recommended)

**Database Design:** 3rd Normal Form (3NF)
**Referential Integrity:** Enforced via Foreign Keys
**Data Integrity:** CHECK constraints on role and correct_answer

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Complete

**Database Schema Ready for:**
- Development (SQLite)
- Production (PostgreSQL)
