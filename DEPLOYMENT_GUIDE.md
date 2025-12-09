# Deployment Guide
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Production Deployment Options](#3-production-deployment-options)
4. [Heroku Deployment](#4-heroku-deployment)
5. [VPS Deployment](#5-vps-deployment)
6. [Frontend Deployment](#6-frontend-deployment)
7. [Environment Configuration](#7-environment-configuration)
8. [Post-Deployment](#8-post-deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

**For Development:**
- Node.js v14+ LTS (recommend v18)
- npm v6+ (or yarn)
- Git
- Code editor (VS Code recommended)

**For Production:**
- Node.js v14+ LTS
- PostgreSQL 13+ (recommended)
- Nginx or Apache (for reverse proxy)
- SSL certificate (Let's Encrypt)
- Domain name

### 1.2 System Requirements

**Minimum:**
- CPU: 1 core
- RAM: 512MB
- Storage: 10GB
- OS: Linux (Ubuntu 20.04+)

**Recommended:**
- CPU: 2+ cores
- RAM: 2GB+
- Storage: 20GB SSD
- OS: Ubuntu 22.04 LTS

---

## 2. Local Development Setup

### 2.1 Clone Repository

```bash
git clone https://github.com/yourusername/lms.git
cd lms
```

### 2.2 Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

**.env Configuration:**
```env
PORT=5000
JWT_SECRET=your_very_secure_random_secret_key_change_this
NODE_ENV=development
```

**Seed Database:**
```bash
npm run seed
```

**Start Backend:**
```bash
npm start
# Or for development with auto-reload
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2.3 Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

### 2.4 Verify Installation

1. Navigate to `http://localhost:3000`
2. Login with test account:
   - Email: `student@lms.com`
   - Password: `student123`
3. Verify dashboard loads correctly

---

## 3. Production Deployment Options

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Heroku** | Easy, Git-based, Add-ons | Limited free tier | $7+/month |
| **Railway** | Modern, Simple, Free tier | New platform | Free-$5+/month |
| **DigitalOcean** | Full control, Affordable | Manual setup | $5+/month |
| **AWS** | Scalable, Reliable | Complex, Expensive | Variable |
| **Vercel/Netlify** | Frontend only | Backend separate | Free-$20/month |

**Recommended:**
- **Small projects:** Heroku + Vercel
- **Medium projects:** DigitalOcean VPS
- **Large projects:** AWS/Azure

---

## 4. Heroku Deployment

### 4.1 Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### 4.2 Deploy Backend to Heroku

**Step 1: Login to Heroku**
```bash
heroku login
```

**Step 2: Create Heroku App**
```bash
cd backend
heroku create your-lms-api
```

**Step 3: Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

**Step 4: Set Environment Variables**
```bash
heroku config:set JWT_SECRET="your_secure_secret_key"
heroku config:set NODE_ENV=production
```

**Step 5: Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**Step 6: Run Database Migrations**
```bash
heroku run npm run migrate
heroku run npm run seed
```

**Step 7: Open App**
```bash
heroku open
```

Your API is now at: `https://your-lms-api.herokuapp.com`

### 4.3 Heroku Configuration Files

**Procfile:**
```
web: node server.js
```

**package.json** (add scripts):
```json
{
  "scripts": {
    "start": "node server.js",
    "migrate": "node migrations/migrate.js",
    "seed": "node scripts/runSeeder.js"
  }
}
```

---

## 5. VPS Deployment

### 5.1 Initial Server Setup

**Connect to VPS:**
```bash
ssh root@your_server_ip
```

**Update System:**
```bash
apt update && apt upgrade -y
```

**Create Non-Root User:**
```bash
adduser lmsuser
usermod -aG sudo lmsuser
su - lmsuser
```

### 5.2 Install Dependencies

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Verify: v18.x.x
```

**Install PostgreSQL:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Install Nginx:**
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Install PM2:**
```bash
sudo npm install -g pm2
```

### 5.3 Setup PostgreSQL

**Create Database:**
```bash
sudo -u postgres psql

CREATE DATABASE cybersecurity_lms;
CREATE USER lms_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cybersecurity_lms TO lms_user;
\q
```

### 5.4 Deploy Application

**Clone Repository:**
```bash
cd /home/lmsuser
git clone https://github.com/yourusername/lms.git
cd lms/backend
```

**Install Dependencies:**
```bash
npm install --production
```

**Configure Environment:**
```bash
nano .env
```

**.env (Production):**
```env
PORT=5000
JWT_SECRET=your_very_secure_production_secret
NODE_ENV=production

# PostgreSQL
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cybersecurity_lms
DB_USER=lms_user
DB_PASSWORD=secure_password

# CORS
CORS_ORIGIN=https://yourdomain.com
```

**Run Migrations:**
```bash
node migrations/migrate.js
npm run seed
```

**Start with PM2:**
```bash
pm2 start server.js --name lms-backend
pm2 save
pm2 startup
```

### 5.5 Configure Nginx

**Create Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/lms
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.6 Setup SSL with Let's Encrypt

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain Certificate:**
```bash
sudo certbot --nginx -d api.yourdomain.com
```

**Auto-Renewal:**
```bash
sudo certbot renew --dry-run
```

---

## 6. Frontend Deployment

### 6.1 Vercel Deployment (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Deploy**
```bash
cd client
vercel
```

**Step 4: Configure Environment**
- Add environment variable in Vercel dashboard:
  - `REACT_APP_API_URL` = `https://api.yourdomain.com/api`

**Step 5: Deploy to Production**
```bash
vercel --prod
```

### 6.2 Netlify Deployment

**Step 1: Build Frontend**
```bash
cd client
npm run build
```

**Step 2: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 3: Deploy**
```bash
netlify deploy --prod --dir=build
```

**Step 4: Configure**
- Add environment variable: `REACT_APP_API_URL`
- Add redirects for SPA:

**netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6.3 VPS Frontend Deployment

**Build Frontend:**
```bash
cd client
npm run build
```

**Copy to Server:**
```bash
scp -r build/* lmsuser@your_server:/var/www/lms/
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/lms;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
    }
}
```

**Setup SSL:**
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 7. Environment Configuration

### 7.1 Backend Environment Variables

**Development (.env):**
```env
PORT=5000
JWT_SECRET=dev_secret_change_in_production
NODE_ENV=development
```

**Production (.env):**
```env
PORT=5000
JWT_SECRET=your_very_secure_random_production_secret_minimum_32_characters
NODE_ENV=production

# Database (PostgreSQL)
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cybersecurity_lms
DB_USER=lms_user
DB_PASSWORD=your_secure_database_password

# CORS
CORS_ORIGIN=https://yourdomain.com

# Optional
MAX_REQUEST_SIZE=10mb
LOG_LEVEL=info
```

### 7.2 Frontend Environment Variables

**Development (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Production (.env.production):**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
```

---

## 8. Post-Deployment

### 8.1 Verification Checklist

- [ ] Backend API responding at production URL
- [ ] Frontend loading correctly
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard displays properly
- [ ] Can take initial assessment
- [ ] Can access videos
- [ ] Can submit quiz
- [ ] Charts rendering correctly
- [ ] Mobile responsive working
- [ ] SSL certificate valid
- [ ] CORS configured correctly

### 8.2 Create Admin Account

**Method 1: Direct Database**
```sql
INSERT INTO users (name, email, password, government_id, role)
VALUES (
  'Admin Name',
  'admin@yourdomain.com',
  '$2b$10$...',  -- Generate bcrypt hash
  'ADMN/10001',
  'admin'
);
```

**Method 2: Script**
```bash
node scripts/createAdmin.js
```

### 8.3 Performance Optimization

**Enable Gzip (Nginx):**
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;
```

**PM2 Cluster Mode:**
```bash
pm2 start server.js -i max --name lms-backend
```

### 8.4 Monitoring Setup

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

**Health Check Endpoint:**
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});
```

---

## 9. Troubleshooting

### 9.1 Common Issues

**Port Already in Use:**
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Database Connection Error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check credentials
psql -U lms_user -d cybersecurity_lms
```

**CORS Errors:**
- Verify `CORS_ORIGIN` in backend .env
- Check API URL in frontend .env
- Ensure protocol matches (http/https)

**PM2 App Not Starting:**
```bash
pm2 logs lms-backend
pm2 restart lms-backend
```

**Nginx 502 Bad Gateway:**
```bash
# Check backend is running
pm2 status
# Check Nginx error logs
sudo tail -f /var/nginx/error.log
```

### 9.2 Rollback Procedure

**Heroku:**
```bash
heroku releases
heroku rollback v123
```

**VPS:**
```bash
cd /home/lmsuser/lms
git log --oneline
git reset --hard <previous_commit>
pm2 restart lms-backend
```

### 9.3 Emergency Contacts

- **Hosting Provider:** support@provider.com
- **DNS Provider:** support@dns.com
- **Development Team:** dev@yourdomain.com

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL certificates ready
- [ ] DNS records configured

**Deployment:**
- [ ] Code deployed to server
- [ ] Database migrated
- [ ] Dependencies installed
- [ ] Services started
- [ ] Nginx configured
- [ ] SSL enabled

**Post-Deployment:**
- [ ] All functionality tested
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Documentation updated
- [ ] Team notified

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
