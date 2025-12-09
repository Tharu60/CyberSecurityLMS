# Maintenance Manual
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025

---

## Table of Contents

1. [Routine Maintenance](#1-routine-maintenance)
2. [Database Maintenance](#2-database-maintenance)
3. [Application Maintenance](#3-application-maintenance)
4. [Backup and Recovery](#4-backup-and-recovery)
5. [Monitoring and Logging](#5-monitoring-and-logging)
6. [Performance Tuning](#6-performance-tuning)
7. [Troubleshooting Guide](#7-troubleshooting-guide)
8. [Update Procedures](#8-update-procedures)
9. [User Management](#9-user-management)
10. [Emergency Procedures](#10-emergency-procedures)

---

## 1. Routine Maintenance

### 1.1 Daily Tasks

**Check System Status:**
```bash
# Check if backend is running
pm2 status

# Check system resources
top
df -h
```

**Review Logs:**
```bash
# PM2 logs
pm2 logs lms-backend --lines 100

# System logs
tail -f /var/log/syslog
```

**Monitor Metrics:**
- Active users
- API response times
- Error rates
- Database size

### 1.2 Weekly Tasks

**Security Updates:**
```bash
# Check for npm vulnerabilities
cd backend
npm audit

# Update dependencies
npm audit fix
```

**Database Maintenance:**
```bash
# SQLite integrity check
sqlite3 lms.db "PRAGMA integrity_check;"

# PostgreSQL vacuum
psql -U lms_user -d cybersecurity_lms -c "VACUUM ANALYZE;"
```

**Backup Verification:**
```bash
# Test latest backup
ls -lh /backups/
# Verify backup can be restored
```

### 1.3 Monthly Tasks

**Performance Review:**
- Analyze slow queries
- Review error logs
- Check disk space trends
- Review user growth

**Content Audit:**
- Review questions for accuracy
- Check video availability
- Update outdated content
- Remove broken links

**Security Audit:**
```bash
npm audit
npm outdated
```

### 1.4 Quarterly Tasks

**Full System Audit:**
- Security assessment
- Performance testing
- Backup/restore testing
- Disaster recovery drill

**Documentation Update:**
- Update user manual
- Review API documentation
- Update deployment guides

---

## 2. Database Maintenance

### 2.1 SQLite Maintenance

**Integrity Check:**
```bash
sqlite3 lms.db "PRAGMA integrity_check;"
```

**Optimize Database:**
```bash
# Rebuild database to reclaim space
sqlite3 lms.db "VACUUM;"
```

**Check Database Size:**
```bash
ls -lh backend/lms.db
```

**Analyze Tables:**
```bash
sqlite3 lms.db "ANALYZE;"
```

### 2.2 PostgreSQL Maintenance

**Vacuum Database:**
```bash
# Regular vacuum
psql -U lms_user -d cybersecurity_lms -c "VACUUM;"

# Full vacuum (requires downtime)
psql -U lms_user -d cybersecurity_lms -c "VACUUM FULL;"

# Vacuum with analyze
psql -U lms_user -d cybersecurity_lms -c "VACUUM ANALYZE;"
```

**Reindex:**
```bash
psql -U lms_user -d cybersecurity_lms -c "REINDEX DATABASE cybersecurity_lms;"
```

**Check Table Sizes:**
```sql
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

**Connection Monitoring:**
```sql
SELECT * FROM pg_stat_activity;
```

### 2.3 Data Cleanup

**Remove Old Test Accounts:**
```sql
-- Identify test accounts
SELECT * FROM users
WHERE email LIKE '%test%' OR email LIKE '%@example.com';

-- Delete after verification
DELETE FROM users WHERE id IN (...);
```

**Archive Old Results:**
```sql
-- Results older than 1 year
SELECT * FROM stage_results
WHERE completed_at < DATE('now', '-1 year');

-- Archive to separate table (optional)
CREATE TABLE stage_results_archive AS
SELECT * FROM stage_results
WHERE completed_at < DATE('now', '-1 year');

-- Then delete from main table
DELETE FROM stage_results
WHERE completed_at < DATE('now', '-1 year');
```

---

## 3. Application Maintenance

### 3.1 PM2 Management

**Status Check:**
```bash
pm2 status
```

**Restart Application:**
```bash
# Restart specific app
pm2 restart lms-backend

# Restart all
pm2 restart all
```

**View Logs:**
```bash
# Real-time logs
pm2 logs lms-backend

# Last 100 lines
pm2 logs lms-backend --lines 100

# Error logs only
pm2 logs lms-backend --err
```

**Monitor Resources:**
```bash
pm2 monit
```

**Save PM2 Configuration:**
```bash
pm2 save
```

### 3.2 Update Dependencies

**Check for Updates:**
```bash
cd backend
npm outdated
```

**Update Packages:**
```bash
# Update specific package
npm update package-name

# Update all minor/patch versions
npm update

# Update to latest (including major)
npm install package-name@latest
```

**After Updates:**
```bash
# Test application
npm start

# Run tests (if available)
npm test

# Deploy if successful
pm2 restart lms-backend
```

### 3.3 Log Management

**Configure Log Rotation (PM2):**
```bash
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

**Manual Log Cleanup:**
```bash
# Compress old logs
gzip ~/.pm2/logs/*.log

# Delete logs older than 30 days
find ~/.pm2/logs -name "*.log" -mtime +30 -delete
```

---

## 4. Backup and Recovery

### 4.1 Backup Strategy

**Backup Schedule:**
- **Daily:** Full database backup (retained 7 days)
- **Weekly:** Full system backup (retained 4 weeks)
- **Monthly:** Archive backup (retained 12 months)

### 4.2 Database Backup

**SQLite Backup:**
```bash
#!/bin/bash
# backup_sqlite.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/home/lmsuser/lms/backend/lms.db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
sqlite3 $DB_FILE ".backup $BACKUP_DIR/lms_$DATE.db"

# Compress
gzip $BACKUP_DIR/lms_$DATE.db

# Delete backups older than 30 days
find $BACKUP_DIR -name "lms_*.db.gz" -mtime +30 -delete

echo "Backup completed: lms_$DATE.db.gz"
```

**PostgreSQL Backup:**
```bash
#!/bin/bash
# backup_postgres.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="cybersecurity_lms"
DB_USER="lms_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/lms_$DATE.sql.gz

# Delete backups older than 30 days
find $BACKUP_DIR -name "lms_*.sql.gz" -mtime +30 -delete

echo "Backup completed: lms_$DATE.sql.gz"
```

**Schedule Backup (cron):**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/lmsuser/scripts/backup_postgres.sh >> /var/log/lms_backup.log 2>&1
```

### 4.3 Application Backup

**Backup Application Files:**
```bash
#!/bin/bash
# backup_application.sh

BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d)
APP_DIR="/home/lmsuser/lms"

# Create backup
tar -czf $BACKUP_DIR/lms_app_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=lms.db \
  $APP_DIR

# Delete old backups
find $BACKUP_DIR -name "lms_app_*.tar.gz" -mtime +90 -delete
```

### 4.4 Recovery Procedures

**Restore SQLite Database:**
```bash
# Stop application
pm2 stop lms-backend

# Backup current database
cp backend/lms.db backend/lms_old.db

# Restore from backup
gunzip -c /backups/database/lms_20251027.db.gz > backend/lms.db

# Restart application
pm2 start lms-backend

# Verify
curl http://localhost:5000/health
```

**Restore PostgreSQL Database:**
```bash
# Stop application
pm2 stop lms-backend

# Drop and recreate database
dropdb -U lms_user cybersecurity_lms
createdb -U lms_user cybersecurity_lms

# Restore from backup
gunzip -c /backups/database/lms_20251027.sql.gz | \
  psql -U lms_user -d cybersecurity_lms

# Restart application
pm2 start lms-backend

# Verify
curl http://localhost:5000/health
```

---

## 5. Monitoring and Logging

### 5.1 Application Monitoring

**PM2 Monitoring:**
```bash
# Real-time monitoring
pm2 monit

# Resource usage
pm2 show lms-backend

# Process list
pm2 list
```

**Health Check Endpoint:**
```bash
# Create health check
curl http://localhost:5000/health

# Expected response
{"status":"OK","timestamp":"2025-10-27T10:00:00Z"}
```

### 5.2 Log Locations

**Application Logs:**
- PM2 logs: `~/.pm2/logs/`
- Application logs: Custom logging (if implemented)

**System Logs:**
- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`
- System: `/var/log/syslog`
- PostgreSQL: `/var/log/postgresql/`

### 5.3 Log Analysis

**Check for Errors:**
```bash
# PM2 error logs
pm2 logs lms-backend --err --lines 100

# Nginx errors
tail -100 /var/log/nginx/error.log

# System errors
grep -i error /var/log/syslog | tail -50
```

**Monitor API Requests:**
```bash
# Nginx access log
tail -f /var/log/nginx/access.log

# Filter by status code
grep "500" /var/log/nginx/access.log
```

### 5.4 Alert Configuration

**Email Alerts (example):**
```bash
#!/bin/bash
# check_health.sh

HEALTH_URL="http://localhost:5000/health"
ALERT_EMAIL="admin@yourdomain.com"

if ! curl -s $HEALTH_URL > /dev/null; then
  echo "LMS Health check failed" | mail -s "LMS Alert" $ALERT_EMAIL
fi
```

**Schedule Health Checks:**
```bash
# crontab - every 5 minutes
*/5 * * * * /home/lmsuser/scripts/check_health.sh
```

---

## 6. Performance Tuning

### 6.1 Database Optimization

**Add Indexes (PostgreSQL):**
```sql
-- Frequently queried columns
CREATE INDEX idx_stage_results_user_id ON stage_results(user_id);
CREATE INDEX idx_stage_results_stage_id ON stage_results(stage_id);
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
```

**Analyze Slow Queries:**
```sql
-- PostgreSQL slow query log
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 6.2 Application Optimization

**PM2 Cluster Mode:**
```bash
# Stop current instance
pm2 stop lms-backend
pm2 delete lms-backend

# Start in cluster mode
pm2 start server.js -i max --name lms-backend
pm2 save
```

**Enable Caching (Nginx):**
```nginx
# Nginx cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=lms_cache:10m max_size=1g;

server {
    location /api/ {
        proxy_cache lms_cache;
        proxy_cache_valid 200 5m;
        proxy_pass http://localhost:5000;
    }
}
```

### 6.3 Resource Monitoring

**Check System Resources:**
```bash
# CPU and memory
top
htop

# Disk usage
df -h

# Network usage
iftop
```

**Monitor Database Connections:**
```sql
-- PostgreSQL
SELECT count(*) FROM pg_stat_activity;
```

---

## 7. Troubleshooting Guide

### 7.1 Application Won't Start

**Check PM2 Status:**
```bash
pm2 status
pm2 logs lms-backend --err
```

**Common Issues:**
- Port already in use: `lsof -i :5000`
- Missing environment variables: Check `.env`
- Database connection error: Verify database running
- Module not found: Run `npm install`

### 7.2 Database Connection Issues

**Check Database:**
```bash
# SQLite
sqlite3 lms.db ".tables"

# PostgreSQL
psql -U lms_user -d cybersecurity_lms -c "\dt"
```

**Check Credentials:**
- Verify `.env` file
- Test connection manually
- Check PostgreSQL service: `systemctl status postgresql`

### 7.3 Performance Issues

**High CPU Usage:**
```bash
# Find process
top
# Kill if necessary
kill -9 <PID>
```

**High Memory Usage:**
```bash
# Check memory
free -h
# Restart application
pm2 restart lms-backend
```

**Slow Queries:**
- Check database indexes
- Analyze query plans
- Consider caching

### 7.4 Frontend Issues

**Build Errors:**
```bash
cd client
rm -rf node_modules
npm install
npm run build
```

**API Connection Errors:**
- Check `REACT_APP_API_URL`
- Verify CORS settings
- Check network connectivity

---

## 8. Update Procedures

### 8.1 Application Updates

**1. Backup Everything:**
```bash
./backup_postgres.sh
./backup_application.sh
```

**2. Pull Latest Code:**
```bash
cd /home/lmsuser/lms
git pull origin main
```

**3. Update Dependencies:**
```bash
cd backend
npm install
cd ../client
npm install
```

**4. Run Migrations:**
```bash
node migrations/latest_migration.js
```

**5. Rebuild Frontend:**
```bash
cd client
npm run build
```

**6. Restart Backend:**
```bash
pm2 restart lms-backend
```

**7. Verify:**
```bash
curl http://localhost:5000/health
# Test in browser
```

### 8.2 Rollback Procedure

**If Update Fails:**
```bash
# Stop application
pm2 stop lms-backend

# Restore database
gunzip -c /backups/database/latest.sql.gz | psql -U lms_user -d cybersecurity_lms

# Restore application code
git reset --hard <previous_commit>
npm install

# Restart
pm2 start lms-backend
```

---

## 9. User Management

### 9.1 Create Admin Account

**Via Database:**
```sql
-- Generate bcrypt hash first (use online tool or script)
INSERT INTO users (name, email, password, government_id, role)
VALUES (
  'Admin Name',
  'admin@yourdomain.com',
  '$2b$10$...hashed_password...',
  'ADMN/10001',
  'admin'
);
```

**Via Script:**
```javascript
// scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const password = 'admin_password';
const hashedPassword = bcrypt.hashSync(password, 10);

db.run(`
  INSERT INTO users (name, email, password, government_id, role)
  VALUES (?, ?, ?, ?, ?)
`, ['Admin Name', 'admin@domain.com', hashedPassword, 'ADMN/10001', 'admin']);
```

### 9.2 Reset User Password

```sql
-- Update with new bcrypt hash
UPDATE users
SET password = '$2b$10$...new_hashed_password...'
WHERE email = 'user@email.com';
```

### 9.3 Deactivate User

**Delete User:**
```sql
DELETE FROM users WHERE id = <user_id>;
```

**Note:** Foreign key cascades will delete related data.

---

## 10. Emergency Procedures

### 10.1 Server Crash

**1. Assess Situation:**
```bash
# Check what's running
ps aux | grep node
pm2 status
```

**2. Restart Services:**
```bash
# Restart application
pm2 restart all

# Restart database
sudo systemctl restart postgresql

# Restart web server
sudo systemctl restart nginx
```

**3. Check Logs:**
```bash
pm2 logs --lines 200
tail -100 /var/log/syslog
```

### 10.2 Database Corruption

**1. Stop Application:**
```bash
pm2 stop lms-backend
```

**2. Check Integrity:**
```bash
sqlite3 lms.db "PRAGMA integrity_check;"
```

**3. Restore from Backup:**
```bash
cp lms.db lms_corrupted.db
cp /backups/database/latest.db lms.db
```

**4. Restart:**
```bash
pm2 start lms-backend
```

### 10.3 Security Breach

**1. Immediate Actions:**
```bash
# Stop application
pm2 stop lms-backend

# Block suspicious IPs (if known)
sudo ufw deny from <IP_ADDRESS>

# Change JWT secret
nano .env  # Update JWT_SECRET
```

**2. Investigation:**
- Review logs for unauthorized access
- Check database for unauthorized changes
- Analyze attack vectors

**3. Recovery:**
- Restore from clean backup
- Update passwords
- Deploy security patches
- Restart application

---

## Maintenance Schedule Template

| Task | Daily | Weekly | Monthly | Quarterly |
|------|-------|--------|---------|-----------|
| Check logs | ✅ | | | |
| Monitor resources | ✅ | | | |
| Database backup | ✅ | | | |
| Security updates | | ✅ | | |
| Database optimization | | ✅ | | |
| Performance review | | | ✅ | |
| Full system audit | | | | ✅ |

---

## Emergency Contacts

**Technical Support:**
- System Admin: admin@yourdomain.com
- Development Team: dev@yourdomain.com
- Hosting Provider: support@provider.com

**On-Call Schedule:**
- Weekdays: Primary admin
- Weekends: Backup admin
- Emergency: +1-XXX-XXX-XXXX

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Review Schedule:** Quarterly
