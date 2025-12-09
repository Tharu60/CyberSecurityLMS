# Database Documentation
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025
**Database:** SQLite (Development) / PostgreSQL (Production)

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Schema Design](#2-schema-design)
3. [Table Specifications](#3-table-specifications)
4. [Relationships](#4-relationships)
5. [Indexes](#5-indexes)
6. [Data Dictionary](#6-data-dictionary)
7. [Sample Queries](#7-sample-queries)
8. [Migration Scripts](#8-migration-scripts)
9. [Backup and Recovery](#9-backup-and-recovery)

---

## 1. Database Overview

### 1.1 Database Information

**Development Environment:**
- **Type:** SQLite
- **Version:** 3.x
- **File:** `backend/lms.db`
- **Size:** ~5MB (with sample data)
- **Encoding:** UTF-8

**Production Environment (Recommended):**
- **Type:** PostgreSQL
- **Version:** 13+
- **Encoding:** UTF-8
- **Collation:** en_US.UTF-8

### 1.2 Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 8 |
| Total Foreign Keys | 7 |
| Default Users | 3 (admin, instructor, student) |
| Default Stages | 6 (0-5) |
| Default Questions | 110 |
| Default Videos | 8 |

### 1.3 Design Principles

- **Normalization:** 3NF (Third Normal Form)
- **Referential Integrity:** Foreign key constraints
- **Data Types:** Appropriate for each field
- **Timestamps:** Track creation and updates
- **Cascading:** Careful consideration for deletions

---

## 2. Schema Design

### 2.1 Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │◄────┐
│ name        │     │
│ email       │     │
│ password    │     │
│ govt_id     │     │
│ role        │     │
│ created_at  │     │
│ updated_at  │     │
└─────────────┘     │
                    │
        ┌───────────┴───────────┬───────────────┬───────────┐
        │                       │               │           │
        │                       │               │           │
┌───────▼───────┐    ┌──────────▼────┐    ┌────▼────────┐ │
│ user_progress │    │ stage_results │    │video_progres│ │
│───────────────│    │───────────────│    │─────────────│ │
│ id (PK)       │    │ id (PK)       │    │ id (PK)     │ │
│ user_id (FK)  │    │ user_id (FK)  │    │ user_id(FK) │ │
│ current_stage │    │ stage_id (FK) │    │ video_id(FK)│ │
│ init_assess_  │    │ score         │    │ completed   │ │
│ completed     │    │ total_q       │    └─────────────┘ │
│ init_assess_  │    │ passed        │                    │
│ score         │    │ attempt_num   │                    │
└───────────────┘    └───────────────┘                    │
                              │                           │
                              │                           │
┌─────────────┐               │                           │
│   stages    │               │                           │
│─────────────│               │                           │
│ id (PK)     │◄──────────────┴────────┐                  │
│ name        │                        │                  │
│ description │                        │                  │
│ stage_number│                        │                  │
│ total_q     │                        │                  │
│ passing_sc  │                        │                  │
└──────┬──────┘                        │                  │
       │                               │                  │
       │                               │                  │
   ┌───▼─────────┐              ┌──────▼────┐            │
   │  questions  │              │  videos   │            │
   │─────────────│              │───────────│            │
   │ id (PK)     │              │ id (PK)   │◄───────────┘
   │ stage_id(FK)│              │stage_id   │
   │ question_tx │              │ title     │
   │ option_a-d  │              │ url       │
   │ correct_ans │              │ descript  │
   └─────────────┘              │ order_num │
                                └───────────┘

┌───────────────┐
│ certificates  │
│───────────────│
│ id (PK)       │
│ user_id (FK)  │──────────┐
│ cert_code     │          │
│ issued_at     │          │
└───────────────┘          │
                           │
                    (connects to users)
```

### 2.2 Table Relationships

| Parent Table | Child Table | Relationship | Cascade |
|--------------|-------------|--------------|---------|
| users | user_progress | 1:1 | DELETE CASCADE |
| users | stage_results | 1:N | DELETE CASCADE |
| users | video_progress | 1:N | DELETE CASCADE |
| users | certificates | 1:1 | DELETE CASCADE |
| stages | questions | 1:N | DELETE CASCADE |
| stages | videos | 1:N | DELETE CASCADE |
| stages | stage_results | 1:N | DELETE CASCADE |

---

## 3. Table Specifications

### 3.1 users

**Purpose:** Store user account information

**Table Definition (SQLite):**
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

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| name | TEXT | NO | - | User's full name |
| email | TEXT | NO | - | Email (unique, login credential) |
| password | TEXT | NO | - | Bcrypt hashed password (60 chars) |
| government_id | TEXT | NO | - | Format: XXXX/12345 (unique) |
| role | TEXT | NO | - | 'student', 'instructor', or 'admin' |
| created_at | DATETIME | NO | CURRENT_TIMESTAMP | Account creation |
| updated_at | DATETIME | NO | CURRENT_TIMESTAMP | Last update |

**Constraints:**
- PRIMARY KEY: id
- UNIQUE: email, government_id
- CHECK: role IN ('student', 'instructor', 'admin')

**Indexes:**
- PRIMARY: id
- UNIQUE: email
- UNIQUE: government_id

**Sample Data:**
```sql
INSERT INTO users (name, email, password, government_id, role) VALUES
('Admin User', 'admin@lms.com', '$2b$10$...', 'ADMN/10001', 'admin'),
('Instructor User', 'instructor@lms.com', '$2b$10$...', 'INST/10002', 'instructor'),
('Student User', 'student@lms.com', '$2b$10$...', 'STUD/10003', 'student');
```

---

### 3.2 stages

**Purpose:** Define learning stages

**Table Definition:**
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

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| name | TEXT | NO | - | Stage name (e.g., "Cybersecurity Basics") |
| description | TEXT | YES | NULL | Stage description |
| stage_number | INTEGER | NO | - | 0-5 (0=General, 1-4=Main, 5=Final) |
| total_questions | INTEGER | NO | - | Number of questions |
| passing_score | INTEGER | NO | - | Minimum score to pass |
| created_at | DATETIME | NO | CURRENT_TIMESTAMP | Creation timestamp |

**Sample Data:**
```sql
INSERT INTO stages (name, description, stage_number, total_questions, passing_score) VALUES
('General Stage', 'Initial assessment', 0, 25, 15),
('Cybersecurity Basics', 'Foundation concepts', 1, 15, 9),
('Intermediate Concepts', 'Building on basics', 2, 15, 9),
('Advanced Topics', 'Complex scenarios', 3, 15, 9),
('Expert-Level Strategies', 'Advanced techniques', 4, 15, 9),
('Final Stage', 'Comprehensive assessment', 5, 25, 15);
```

---

### 3.3 questions

**Purpose:** Store quiz questions

**Table Definition:**
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
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| stage_id | INTEGER | YES | NULL | Foreign key to stages |
| question_text | TEXT | NO | - | Question content |
| option_a | TEXT | NO | - | First option |
| option_b | TEXT | NO | - | Second option |
| option_c | TEXT | NO | - | Third option |
| option_d | TEXT | NO | - | Fourth option |
| correct_answer | TEXT | NO | - | 'A', 'B', 'C', or 'D' |
| created_at | DATETIME | NO | CURRENT_TIMESTAMP | Creation timestamp |

**Total Questions:** 110
- General Stage (0): 25
- Each Main Stage (1-4): 15
- Final Stage (5): 25

---

### 3.4 videos

**Purpose:** Store video resources

**Table Definition:**
```sql
CREATE TABLE videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id INTEGER,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    order_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| stage_id | INTEGER | YES | NULL | Foreign key to stages |
| title | TEXT | NO | - | Video title |
| url | TEXT | NO | - | YouTube URL |
| description | TEXT | YES | NULL | Video description |
| order_number | INTEGER | YES | NULL | Display order (1, 2, 3...) |
| created_at | DATETIME | NO | CURRENT_TIMESTAMP | Creation timestamp |

**Total Videos:** 8 (2 per Stage 1-4)

---

### 3.5 user_progress

**Purpose:** Track overall student progress

**Table Definition:**
```sql
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    current_stage INTEGER DEFAULT 0,
    initial_assessment_completed BOOLEAN DEFAULT 0,
    initial_assessment_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| user_id | INTEGER | YES | NULL | Foreign key to users |
| current_stage | INTEGER | NO | 0 | Highest unlocked stage |
| initial_assessment_completed | BOOLEAN | NO | 0 | Has taken initial assessment |
| initial_assessment_score | INTEGER | YES | NULL | Score (0-25) |
| created_at | DATETIME | NO | CURRENT_TIMESTAMP | Record creation |
| updated_at | DATETIME | NO | CURRENT_TIMESTAMP | Last update |

**Relationship:** One record per student

---

### 3.6 stage_results

**Purpose:** Record quiz attempts and results

**Table Definition:**
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| user_id | INTEGER | YES | NULL | Student who took quiz |
| stage_id | INTEGER | YES | NULL | Stage assessed |
| score | INTEGER | NO | - | Number correct |
| total_questions | INTEGER | NO | - | Total questions |
| passed | BOOLEAN | NO | - | Pass/fail (60% threshold) |
| attempt_number | INTEGER | NO | 1 | Attempt count |
| completed_at | DATETIME | NO | CURRENT_TIMESTAMP | Completion time |

**Relationship:** Multiple records per student per stage (retakes allowed)

---

### 3.7 video_progress

**Purpose:** Track video completion

**Table Definition:**
```sql
CREATE TABLE video_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    video_id INTEGER,
    completed BOOLEAN DEFAULT 0,
    last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| user_id | INTEGER | YES | NULL | Student |
| video_id | INTEGER | YES | NULL | Video watched |
| completed | BOOLEAN | NO | 0 | Completion status |
| last_watched_at | DATETIME | NO | CURRENT_TIMESTAMP | Last access time |

---

### 3.8 certificates

**Purpose:** Store issued certificates

**Table Definition:**
```sql
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    certificate_code TEXT UNIQUE NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| user_id | INTEGER | YES | NULL | Certificate recipient |
| certificate_code | TEXT | NO | - | 16-char hex code (unique) |
| issued_at | DATETIME | NO | CURRENT_TIMESTAMP | Issuance timestamp |

**Relationship:** One certificate per student

---

## 4. Relationships

### 4.1 One-to-One Relationships

**users ↔ user_progress**
- Each student has one progress record
- Created automatically upon student registration

**users ↔ certificates**
- Each student can have one certificate
- Created when all stages completed

### 4.2 One-to-Many Relationships

**users → stage_results**
- One student can have multiple quiz results
- Allows for retakes (multiple attempts per stage)

**users → video_progress**
- One student can have multiple video progress records
- One record per video per student

**stages → questions**
- One stage has many questions
- Questions belong to one stage

**stages → videos**
- One stage has many videos
- Videos belong to one stage

**stages → stage_results**
- One stage can have many results from different students

---

## 5. Indexes

### 5.1 Primary Key Indexes

Automatically created on all `id` columns:
- users(id)
- stages(id)
- questions(id)
- videos(id)
- user_progress(id)
- stage_results(id)
- video_progress(id)
- certificates(id)

### 5.2 Unique Indexes

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_government_id ON users(government_id);
CREATE UNIQUE INDEX idx_certificates_code ON certificates(certificate_code);
```

### 5.3 Foreign Key Indexes (Recommended for PostgreSQL)

```sql
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_stage_results_user_id ON stage_results(user_id);
CREATE INDEX idx_stage_results_stage_id ON stage_results(stage_id);
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_questions_stage_id ON questions(stage_id);
CREATE INDEX idx_videos_stage_id ON videos(stage_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
```

---

## 6. Data Dictionary

### 6.1 Field Definitions

**Boolean Fields:**
- 0 = False
- 1 = True

**Role Values:**
- 'student' - Learning users
- 'instructor' - Content managers
- 'admin' - System administrators

**Correct Answer Values:**
- 'A', 'B', 'C', 'D' - Must be uppercase

**Password Format:**
- Bcrypt hash (60 characters)
- Example: `$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM`

**Government ID Format:**
- Regex: `/^[A-Z]{4}\/[0-9]{5}$/`
- Example: ABCD/12345

**Certificate Code Format:**
- 16-character hexadecimal
- Example: a1b2c3d4e5f67890

---

## 7. Sample Queries

### 7.1 User Queries

**Get all students:**
```sql
SELECT id, name, email, government_id, created_at
FROM users
WHERE role = 'student'
ORDER BY created_at DESC;
```

**Get user with progress:**
```sql
SELECT u.*, up.current_stage, up.initial_assessment_completed,
       up.initial_assessment_score
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.id = 5;
```

**Count users by role:**
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### 7.2 Progress Queries

**Get student's stage results:**
```sql
SELECT sr.*, s.name as stage_name, s.stage_number
FROM stage_results sr
JOIN stages s ON sr.stage_id = s.id
WHERE sr.user_id = 5
ORDER BY sr.completed_at DESC;
```

**Get passed stages for student:**
```sql
SELECT DISTINCT s.*
FROM stages s
JOIN stage_results sr ON s.id = sr.stage_id
WHERE sr.user_id = 5 AND sr.passed = 1
ORDER BY s.stage_number;
```

**Calculate average score:**
```sql
SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_percentage
FROM stage_results
WHERE user_id = 5;
```

### 7.3 Stage Queries

**Get stage with videos and question count:**
```sql
SELECT s.*,
       COUNT(DISTINCT v.id) as video_count,
       COUNT(DISTINCT q.id) as question_count
FROM stages s
LEFT JOIN videos v ON s.id = v.stage_id
LEFT JOIN questions q ON s.id = q.stage_id
WHERE s.id = 1
GROUP BY s.id;
```

**Get students who completed a stage:**
```sql
SELECT u.name, u.email, sr.score, sr.total_questions, sr.completed_at
FROM stage_results sr
JOIN users u ON sr.user_id = u.id
WHERE sr.stage_id = 1 AND sr.passed = 1
ORDER BY sr.score DESC;
```

### 7.4 Analytics Queries

**Platform statistics:**
```sql
SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM stages) as total_stages,
    (SELECT COUNT(*) FROM questions) as total_questions,
    (SELECT COUNT(*) FROM videos) as total_videos,
    (SELECT COUNT(*) FROM user_progress WHERE initial_assessment_completed = 1) as assessments_completed,
    (SELECT COUNT(*) FROM stage_results WHERE passed = 1) as total_completions;
```

**Stage completion rates:**
```sql
SELECT s.stage_number, s.name,
       COUNT(DISTINCT sr.user_id) as students_completed
FROM stages s
LEFT JOIN stage_results sr ON s.id = sr.stage_id AND sr.passed = 1
WHERE s.stage_number BETWEEN 1 AND 5
GROUP BY s.id
ORDER BY s.stage_number;
```

### 7.5 Certificate Queries

**Get certificate with user info:**
```sql
SELECT c.*, u.name as user_name, u.email
FROM certificates c
JOIN users u ON c.user_id = u.id
WHERE c.certificate_code = 'a1b2c3d4e5f67890';
```

**Check certificate eligibility:**
```sql
SELECT u.id, u.name,
       COUNT(DISTINCT sr.stage_id) as stages_completed,
       CASE
           WHEN COUNT(DISTINCT sr.stage_id) >= 5 THEN 'Eligible'
           ELSE 'Not Eligible'
       END as eligibility
FROM users u
LEFT JOIN stage_results sr ON u.id = sr.user_id
    AND sr.passed = 1
    AND sr.stage_id BETWEEN 1 AND 5
WHERE u.role = 'student'
GROUP BY u.id;
```

---

## 8. Migration Scripts

### 8.1 SQLite to PostgreSQL Migration

**Step 1: Export SQLite Data**
```bash
sqlite3 lms.db .dump > lms_dump.sql
```

**Step 2: Convert SQL (Manual edits needed)**
- Replace `AUTOINCREMENT` with `SERIAL`
- Replace `TEXT` with `VARCHAR(255)` or `TEXT`
- Replace `DATETIME` with `TIMESTAMP`
- Replace `BOOLEAN` values (0/1) with TRUE/FALSE

**Step 3: Create PostgreSQL Schema**
```sql
-- See schema files in migrations/
```

**Step 4: Import Data**
```bash
psql -U lms_user -d cybersecurity_lms -f lms_converted.sql
```

### 8.2 Add Government ID Field (Migration)

```sql
-- Add column
ALTER TABLE users ADD COLUMN government_id TEXT;

-- Update existing users with default values
UPDATE users SET government_id =
    CASE
        WHEN role = 'admin' THEN 'ADMN/' || printf('%05d', id)
        WHEN role = 'instructor' THEN 'INST/' || printf('%05d', id)
        ELSE 'USER/' || printf('%05d', id)
    END;

-- Add constraints
ALTER TABLE users ALTER COLUMN government_id SET NOT NULL;
CREATE UNIQUE INDEX idx_users_government_id ON users(government_id);
```

---

## 9. Backup and Recovery

### 9.1 SQLite Backup

**Command Line:**
```bash
# Backup
sqlite3 backend/lms.db ".backup backup/lms_backup_$(date +%Y%m%d).db"

# Or copy file
cp backend/lms.db backup/lms_backup_$(date +%Y%m%d).db
```

**Scheduled Backup (Linux/macOS):**
```bash
# Add to crontab
0 2 * * * /path/to/backup_script.sh
```

**backup_script.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 /path/to/lms.db ".backup $BACKUP_DIR/lms_$DATE.db"
# Keep only last 30 days
find $BACKUP_DIR -name "lms_*.db" -mtime +30 -delete
```

### 9.2 PostgreSQL Backup

**Manual Backup:**
```bash
pg_dump -U lms_user -d cybersecurity_lms > backup_$(date +%Y%m%d).sql
```

**Scheduled Backup:**
```bash
# Add to crontab
0 2 * * * pg_dump -U lms_user cybersecurity_lms | gzip > /backups/lms_$(date +\%Y\%m\%d).sql.gz
```

### 9.3 Restore

**SQLite:**
```bash
# Restore from backup
cp backup/lms_backup_20251027.db backend/lms.db
```

**PostgreSQL:**
```bash
# Drop and recreate database
dropdb cybersecurity_lms
createdb cybersecurity_lms
psql -U lms_user -d cybersecurity_lms < backup_20251027.sql
```

---

## Maintenance

### Check Database Integrity (SQLite)
```bash
sqlite3 lms.db "PRAGMA integrity_check;"
```

### Optimize Database (SQLite)
```bash
sqlite3 lms.db "VACUUM;"
```

### View Database Size
```bash
ls -lh backend/lms.db
```

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Complete
