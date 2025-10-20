# 🗄️ Database Commands Reference

## Quick Database Inspection Guide

### Method 1: SQLite Command Line

```bash
# Navigate to backend
cd backend

# Open database
sqlite3 lms.db
```

### Inside SQLite Shell:

#### List All Tables
```sql
.tables
```

#### View Table Structure
```sql
.schema users
.schema stages
.schema questions
.schema videos
.schema user_progress
.schema stage_results
.schema video_progress
.schema certificates
```

#### Count Records in Each Table
```sql
-- Count users
SELECT COUNT(*) as user_count FROM users;

-- Count by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Count stages
SELECT COUNT(*) as stage_count FROM stages;

-- Count questions
SELECT COUNT(*) as question_count FROM questions;

-- Count questions by stage
SELECT stage_id, COUNT(*) as count FROM questions GROUP BY stage_id;

-- Count videos
SELECT COUNT(*) as video_count FROM videos;

-- Count certificates issued
SELECT COUNT(*) as certificate_count FROM certificates;
```

#### View All Users
```sql
SELECT id, name, email, role, created_at FROM users;
```

#### View Specific User Details
```sql
-- Replace 1 with actual user ID
SELECT * FROM users WHERE id = 1;

-- Find by email
SELECT * FROM users WHERE email = 'student@lms.com';

-- Find by role
SELECT * FROM users WHERE role = 'student';
```

#### View All Stages
```sql
SELECT id, name, stage_number, total_questions, passing_score FROM stages ORDER BY stage_number;
```

#### View Questions (Sample)
```sql
-- First 10 questions
SELECT id, stage_id, question_text, correct_answer FROM questions LIMIT 10;

-- Questions for specific stage
SELECT id, question_text, correct_answer FROM questions WHERE stage_id = 1;

-- Count questions per stage
SELECT
  s.name as stage_name,
  COUNT(q.id) as question_count
FROM stages s
LEFT JOIN questions q ON s.id = q.stage_id
GROUP BY s.id
ORDER BY s.stage_number;
```

#### View Videos
```sql
SELECT id, title, stage_id, url, duration FROM videos ORDER BY stage_id, order_number;

-- Videos by stage
SELECT * FROM videos WHERE stage_id = 1;
```

#### View Student Progress
```sql
-- All progress records
SELECT
  u.name,
  u.email,
  p.current_stage,
  p.completed_stages,
  p.average_score,
  p.initial_assessment_completed
FROM user_progress p
JOIN users u ON p.user_id = u.id;

-- Specific student
SELECT * FROM user_progress WHERE user_id = 1;
```

#### View Stage Results (Quiz Attempts)
```sql
-- All attempts
SELECT
  u.name,
  s.name as stage_name,
  sr.score,
  sr.total_questions,
  sr.passed,
  sr.attempt_number,
  sr.completed_at
FROM stage_results sr
JOIN users u ON sr.user_id = u.id
JOIN stages s ON sr.stage_id = s.id
ORDER BY sr.completed_at DESC;

-- Student's attempts
SELECT * FROM stage_results WHERE user_id = 1 ORDER BY completed_at DESC;
```

#### View Certificates
```sql
SELECT
  c.id,
  u.name,
  u.email,
  c.certificate_code,
  c.issued_at
FROM certificates c
JOIN users u ON c.user_id = u.id
ORDER BY c.issued_at DESC;
```

#### Advanced Queries

**Student Performance Summary:**
```sql
SELECT
  u.name as student_name,
  COUNT(DISTINCT sr.stage_id) as stages_attempted,
  AVG(CASE WHEN sr.passed = 1 THEN 1.0 ELSE 0.0 END) * 100 as pass_rate,
  AVG((sr.score * 100.0) / sr.total_questions) as avg_score_pct
FROM users u
LEFT JOIN stage_results sr ON u.id = sr.user_id
WHERE u.role = 'student'
GROUP BY u.id
ORDER BY avg_score_pct DESC;
```

**Video Completion Stats:**
```sql
SELECT
  u.name,
  COUNT(vp.video_id) as videos_completed,
  (COUNT(vp.video_id) * 100.0 / (SELECT COUNT(*) FROM videos)) as completion_pct
FROM users u
LEFT JOIN video_progress vp ON u.id = vp.user_id AND vp.completed = 1
WHERE u.role = 'student'
GROUP BY u.id;
```

**Top Performing Students:**
```sql
SELECT
  u.name,
  u.email,
  p.completed_stages,
  ROUND(p.average_score, 2) as avg_score,
  COUNT(sr.id) as total_attempts
FROM users u
JOIN user_progress p ON u.id = p.user_id
LEFT JOIN stage_results sr ON u.id = sr.user_id
WHERE u.role = 'student'
GROUP BY u.id
ORDER BY p.completed_stages DESC, p.average_score DESC
LIMIT 10;
```

#### Modify Data (Use with Caution!)

**Update User Role:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

**Delete User:**
```sql
DELETE FROM users WHERE id = 5;
```

**Reset Student Progress:**
```sql
-- Delete all progress for a user
DELETE FROM user_progress WHERE user_id = 1;
DELETE FROM stage_results WHERE user_id = 1;
DELETE FROM video_progress WHERE user_id = 1;
DELETE FROM certificates WHERE user_id = 1;
```

**Delete All Stage Results:**
```sql
DELETE FROM stage_results;
```

#### Export Data

**Export to CSV:**
```sql
.headers on
.mode csv
.output users.csv
SELECT * FROM users;
.output stdout
```

**Export Table Structure:**
```sql
.output schema.sql
.dump
.output stdout
```

#### Other Useful Commands

```sql
-- Show current settings
.show

-- Turn on column headers
.headers on

-- Change output mode
.mode column    -- Columnar output
.mode table     -- Table format
.mode csv       -- CSV format
.mode json      -- JSON format

-- Exit SQLite
.exit
-- or
.quit
```

---

## Method 2: Using DB Browser for SQLite (GUI)

### Download and Install:
1. Go to https://sqlitebrowser.org/
2. Download for your OS (Windows/Mac/Linux)
3. Install the application

### How to Use:
1. Open DB Browser for SQLite
2. Click "Open Database"
3. Navigate to `D:\Inner creations\LMS\backend\lms.db`
4. Browse tables, run queries, view data visually

**Features:**
- Visual table browser
- SQL query editor
- Data editing
- Schema viewer
- Import/Export tools

---

## Method 3: Using Node.js Script

Create a quick inspection script:

```javascript
// backend/scripts/inspectDatabase.js
import db from '../config/database.js';

console.log('=== DATABASE INSPECTION ===\n');

// Count users
db.all('SELECT role, COUNT(*) as count FROM users GROUP BY role', (err, rows) => {
  if (!err) {
    console.log('Users by Role:');
    rows.forEach(row => console.log(`  ${row.role}: ${row.count}`));
    console.log('');
  }
});

// Count other tables
const tables = ['stages', 'questions', 'videos', 'certificates'];
tables.forEach(table => {
  db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
    if (!err) {
      console.log(`${table}: ${row.count} records`);
    }
  });
});

setTimeout(() => {
  console.log('\n=== INSPECTION COMPLETE ===');
  process.exit(0);
}, 1000);
```

Run it:
```bash
cd backend
node scripts/inspectDatabase.js
```

---

## Method 4: Using VS Code Extension

1. Install "SQLite" extension by alexcvzz
2. Right-click on `lms.db` file
3. Select "Open Database"
4. View tables in sidebar
5. Right-click table → "Show Table"

---

## Method 5: Quick Check via API

Use your browser or Postman:

```bash
# Get all users (requires admin token)
GET http://localhost:5000/api/admin/users

# Get statistics
GET http://localhost:5000/api/admin/statistics

# Get your progress (requires student token)
GET http://localhost:5000/api/progress/my-progress
```

---

## Common Checks for Debugging

### 1. Verify Database Seeded Correctly
```sql
SELECT
  (SELECT COUNT(*) FROM stages) as stage_count,
  (SELECT COUNT(*) FROM questions) as question_count,
  (SELECT COUNT(*) FROM videos) as video_count,
  (SELECT COUNT(*) FROM users) as user_count;
```

Expected Results:
- stages: 6
- questions: 110
- videos: 8
- users: 3+ (depends on registrations)

### 2. Check User Passwords (should be hashed)
```sql
SELECT id, name, email,
  SUBSTR(password, 1, 10) || '...' as password_preview,
  role
FROM users;
```

Passwords should start with `$2b$` (bcrypt hash)

### 3. Verify Student Progress
```sql
SELECT
  u.name,
  CASE
    WHEN p.initial_assessment_completed = 1 THEN 'Yes'
    ELSE 'No'
  END as assessment_done,
  p.current_stage,
  p.completed_stages
FROM users u
LEFT JOIN user_progress p ON u.id = p.user_id
WHERE u.role = 'student';
```

### 4. Check for Missing Data
```sql
-- Stages without questions
SELECT s.id, s.name, COUNT(q.id) as question_count
FROM stages s
LEFT JOIN questions q ON s.id = q.stage_id
GROUP BY s.id
HAVING question_count = 0;

-- Stages without videos (stages 1-4 should have videos)
SELECT s.id, s.name, COUNT(v.id) as video_count
FROM stages s
LEFT JOIN videos v ON s.id = v.stage_id
WHERE s.stage_number BETWEEN 1 AND 4
GROUP BY s.id
HAVING video_count = 0;
```

---

## Troubleshooting

### Database Locked Error
```bash
# Close all connections
# Then restart the backend server
```

### Cannot Find Database
```bash
# Check if file exists
ls backend/lms.db

# If missing, reseed:
cd backend
npm run seed
```

### Corrupted Database
```bash
# Backup first
cp backend/lms.db backend/lms.db.backup

# Delete and recreate
rm backend/lms.db
npm run seed
node scripts/createDefaultUsers.js
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Open DB | `sqlite3 lms.db` |
| List tables | `.tables` |
| View schema | `.schema table_name` |
| Count records | `SELECT COUNT(*) FROM table;` |
| View users | `SELECT * FROM users;` |
| Exit | `.exit` |
| Help | `.help` |

---

**Pro Tip:** Use DB Browser for SQLite for the easiest visual inspection!

