# MySQL Setup Guide for LMS

This guide will help you set up MySQL database for the Learning Management System.

## Prerequisites

- Node.js v14 or higher
- npm (comes with Node.js)
- MySQL v5.7 or higher

## Installation Steps

### 1. Install MySQL

#### Windows
1. Download MySQL installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
2. Run the installer
3. Choose "Developer Default" setup type
4. Set a root password (remember this!)
5. Complete the installation

#### macOS
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt update

# Install MySQL server
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Enter your root password when prompted

# Create database
CREATE DATABASE lms_db;

# Verify database creation
SHOW DATABASES;

# Exit MySQL
exit;
```

### 3. Configure Application

**Backend Configuration:**

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` (if not already exists):
```bash
cp .env.example .env
```

4. Edit `.env` file with your MySQL credentials:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lms_db
DB_PORT=3306
```

### 4. Initialize Database

The database tables will be created automatically when you start the server. However, you need to seed initial data:

```bash
# Seed database with stages, questions, and videos
npm run seed

# Create default users (optional but recommended for testing)
node scripts/createDefaultUsers.js
```

Expected output:
```
╔═══════════════════════════════════════════╗
║   Database Seeding Complete ✓             ║
║                                           ║
║   Stages created: 6                       ║
║   Questions imported: 110                 ║
║   Videos imported: 8                      ║
╚═══════════════════════════════════════════╝
```

### 5. Start the Application

```bash
# Start backend (development mode with hot reload)
npm run dev

# Or start in production mode
npm start
```

Expected output:
```
╔═══════════════════════════════════════════╗
║   Cyber Security LMS API Server           ║
║   Port: 5000                              ║
║   Environment: development                ║
║   Status: Running ✓                       ║
╚═══════════════════════════════════════════╝
Connected to MySQL database
Database tables initialized
```

## Database Schema

The application creates 8 tables automatically:

1. **users** - User accounts with roles
2. **stages** - 6 learning stages
3. **questions** - 110 quiz questions
4. **videos** - 8 educational videos
5. **user_progress** - Student progress tracking
6. **stage_results** - Quiz attempt history
7. **video_progress** - Video completion tracking
8. **certificates** - Generated certificates

## Verification

### Check Database Tables

```bash
# Login to MySQL
mysql -u root -p

# Select database
USE lms_db;

# Show all tables
SHOW TABLES;

# Check users
SELECT id, name, email, role FROM users;

# Check stages
SELECT id, name, stage_number FROM stages;

# Check question count
SELECT COUNT(*) as total FROM questions;

# Check video count
SELECT COUNT(*) as total FROM videos;

# Exit
exit;
```

Expected results:
- Tables: 8 tables
- Users: 3 (if you ran createDefaultUsers.js)
- Stages: 6 stages
- Questions: 110 questions
- Videos: 8 videos

## Default Test Accounts

If you ran `node scripts/createDefaultUsers.js`, you have these accounts:

**Admin Account:**
- Email: admin@lms.com
- Password: admin123

**Instructor Account:**
- Email: instructor@lms.com
- Password: instructor123

**Student Account:**
- Email: student@lms.com
- Password: student123

## Troubleshooting

### Connection Errors

**Error: "Access denied for user 'root'@'localhost'"**

Solution:
```bash
# Reset MySQL root password
mysql -u root -p

# If above doesn't work, try without password
mysql -u root

# Then set password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
exit;

# Update .env with new password
```

**Error: "Can't connect to MySQL server on 'localhost'"**

Solution:
```bash
# Check if MySQL is running
# Windows:
net start MySQL80

# macOS/Linux:
sudo systemctl status mysql
sudo systemctl start mysql
```

**Error: "Database 'lms_db' does not exist"**

Solution:
```bash
mysql -u root -p
CREATE DATABASE lms_db;
exit;
```

### Migration from SQLite

If you had a previous SQLite database and want to keep the data:

1. Export data from SQLite (manual process - export users, progress, etc.)
2. Drop and recreate MySQL database
3. Run seeder for stages, questions, videos
4. Import user data manually

**Note:** The database structure is compatible, but you'll need to manually migrate user-specific data.

### Reset Database

To start fresh:

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS lms_db; CREATE DATABASE lms_db;"

# Reseed
cd backend
npm run seed
node scripts/createDefaultUsers.js
```

## Performance Optimization

### Connection Pooling

The application uses connection pooling (configured in `backend/config/database.js`):

```javascript
connectionLimit: 10  // Adjust based on your needs
```

### Indexes

Important indexes are automatically created:
- Primary keys on all `id` columns
- Unique indexes on `email` and `government_id` in users table
- Foreign key indexes for optimal JOIN performance

## Security Best Practices

1. **Never commit .env file**
   - .env is in .gitignore
   - Use .env.example as template

2. **Use strong passwords**
   - Change default JWT_SECRET
   - Use complex MySQL root password

3. **Limit MySQL user privileges** (Production):
   ```sql
   CREATE USER 'lms_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON lms_db.* TO 'lms_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Enable SSL for MySQL** (Production):
   - Configure SSL certificates
   - Update connection config with SSL options

## Production Deployment

### Environment Variables

Update `.env` for production:

```env
PORT=5000
JWT_SECRET=generate_very_strong_secret_here_minimum_64_chars
NODE_ENV=production

# Production MySQL (e.g., AWS RDS, Digital Ocean)
DB_HOST=your-production-host.amazonaws.com
DB_USER=lms_user
DB_PASSWORD=very_strong_password
DB_NAME=lms_db
DB_PORT=3306
```

### MySQL Production Setup

1. **Use managed MySQL service:**
   - AWS RDS
   - Google Cloud SQL
   - Digital Ocean Managed Databases
   - Azure Database for MySQL

2. **Configure backups:**
   - Enable automated backups
   - Set retention period
   - Test restore procedures

3. **Monitor performance:**
   - Use MySQL slow query log
   - Monitor connection pool usage
   - Set up alerts for errors

## Backup and Restore

### Backup Database

```bash
# Full database backup
mysqldump -u root -p lms_db > lms_backup_$(date +%Y%m%d).sql

# Backup specific tables
mysqldump -u root -p lms_db users user_progress stage_results > user_data_backup.sql
```

### Restore Database

```bash
# Restore from backup
mysql -u root -p lms_db < lms_backup_20250101.sql
```

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - GUI tool for MySQL
- [Node.js mysql2 Documentation](https://github.com/sidorares/node-mysql2)

## Support

If you encounter issues:

1. Check MySQL service is running
2. Verify credentials in .env file
3. Check MySQL error logs
4. Ensure database exists
5. Verify network connectivity (for remote databases)

For application-specific issues, refer to:
- GETTING_STARTED.md
- TROUBLESHOOTING.md
- DATABASE_DOCUMENTATION.md
