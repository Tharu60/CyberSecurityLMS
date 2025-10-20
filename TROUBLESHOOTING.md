# Troubleshooting Guide

## Common Issues and Solutions

### Frontend Build Errors

#### ✅ FIXED: Bootstrap Icons Missing
**Error:**
```
Module not found: Error: Can't resolve 'bootstrap-icons/font/bootstrap-icons.css'
```

**Solution:**
```bash
cd client
npm install bootstrap-icons
```

#### ✅ FIXED: Badge Import Missing
**Error:**
```
'Badge' is not defined react/jsx-no-undef
```

**Solution:** Already fixed in InitialAssessment.js

---

## Backend Issues

### Database Not Seeded
**Symptom:** No questions or videos showing up

**Solution:**
```bash
cd backend
npm run seed
```

### Port Already in Use
**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database Locked Error
**Symptom:**
```
Error: SQLITE_BUSY: database is locked
```

**Solution:**
```bash
# Close all connections and restart
cd backend
rm lms.db
npm run seed
```

---

## Frontend Issues

### Port 3000 Already in Use
**Symptom:**
```
Something is already running on port 3000
```

**Solution:**
- Press `Y` to use another port
- Or kill the process using port 3000

### CORS Errors
**Symptom:**
```
Access to fetch at 'http://localhost:5000' blocked by CORS policy
```

**Solution:**
1. Ensure backend is running
2. Check `backend/server.js` has `app.use(cors())`
3. Verify API_BASE_URL in `client/src/services/api.js` is `http://localhost:5000/api`

### 401 Unauthorized Errors
**Symptom:**
```
401 Unauthorized - Invalid or expired token
```

**Solution:**
1. Clear browser localStorage
2. Log out and log back in
3. Check JWT_SECRET in backend `.env`

---

## Installation Issues

### npm install Fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Dependencies Version Conflicts
**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

---

## Database Issues

### View Database Contents
```bash
cd backend
sqlite3 lms.db

# Show all tables
.tables

# View users
SELECT * FROM users;

# View questions count
SELECT stage_id, COUNT(*) FROM questions GROUP BY stage_id;

# Exit
.exit
```

### Reset Database Completely
```bash
cd backend
rm lms.db
npm run seed
```

### Check if Database Has Data
```bash
cd backend
sqlite3 lms.db "SELECT COUNT(*) as question_count FROM questions;"
sqlite3 lms.db "SELECT COUNT(*) as video_count FROM videos;"
```

Expected:
- Questions: 110
- Videos: 8

---

## Runtime Errors

### "Cannot read property of undefined"
**Cause:** API response structure mismatch

**Solution:**
1. Check browser console for actual error
2. Verify backend is returning correct data structure
3. Add null checks in component

### Videos Not Playing
**Cause:** Invalid YouTube URL or wrong format

**Solution:**
1. Check video URL in database
2. Should be: `https://www.youtube.com/watch?v=VIDEO_ID`
3. Video player extracts ID automatically

### Questions Not Loading
**Cause:** Stage not found or no questions for stage

**Solution:**
```bash
# Check if stage has questions
cd backend
sqlite3 lms.db "SELECT * FROM questions WHERE stage_id = 1;"
```

---

## Development Tips

### Hot Reload Not Working
**Solution:**
```bash
# Restart the development server
# Frontend: Ctrl+C then npm start
# Backend: Ctrl+C then npm run dev
```

### Changes Not Reflecting
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if you saved the file
4. Ensure you're editing the right file

### ESLint Errors
**Solution:**
```bash
# Disable ESLint temporarily (not recommended)
# Create .env in client folder
ESLINT_NO_DEV_ERRORS=true
```

---

## Testing Checklist

### Before Testing
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database seeded with questions and videos
- [ ] Browser dev tools open (F12)

### Student Flow Test
1. [ ] Register new student account
2. [ ] Login successfully
3. [ ] See dashboard with initial assessment prompt
4. [ ] Take initial assessment (25 questions)
5. [ ] See results and placement stage
6. [ ] Navigate to placed stage
7. [ ] Watch videos (mark as complete)
8. [ ] Take stage quiz (15 questions)
9. [ ] See pass/fail result
10. [ ] Progress to next stage if passed

### API Test (using browser/Postman)
```bash
# Health check
GET http://localhost:5000/api/health

# Login
POST http://localhost:5000/api/auth/login
Body: { "email": "test@test.com", "password": "password" }

# Get stages
GET http://localhost:5000/api/stages
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

---

## Production Deployment Issues

### Environment Variables
Ensure these are set:
```env
# Backend
PORT=5000
JWT_SECRET=secure_random_string_here
NODE_ENV=production

# Frontend (build time)
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Build Errors
```bash
# Frontend build
cd client
npm run build

# Check build folder
ls -la build/
```

---

## Getting Help

### Check Logs
**Backend:**
```bash
cd backend
npm run dev
# Watch terminal for errors
```

**Frontend:**
```bash
# Browser console (F12)
# Check for red errors
```

### Debug Steps
1. Check browser console
2. Check backend terminal
3. Verify database has data
4. Check network tab in browser
5. Verify API responses

### Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| 404 Not Found | Wrong API endpoint | Check route in backend |
| 401 Unauthorized | Token expired/invalid | Login again |
| 500 Internal Server | Backend error | Check backend logs |
| Network Error | Backend not running | Start backend server |
| CORS Error | CORS not configured | Enable CORS in backend |

---

## Quick Fixes

### Start Fresh
```bash
# Backend
cd backend
rm lms.db
npm run seed
npm run dev

# Frontend (new terminal)
cd client
npm start
```

### Clear Everything
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json lms.db
npm install
npm run seed

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## Still Having Issues?

1. **Check all servers are running:**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000

2. **Verify dependencies installed:**
   ```bash
   cd backend && npm list
   cd client && npm list
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 14+
   npm --version   # Should be 6+
   ```

4. **Browser compatibility:**
   - Use latest Chrome, Firefox, or Edge
   - Clear cache and cookies
   - Try incognito/private mode

---

**Most issues are resolved by:**
1. Restarting both servers
2. Re-seeding the database
3. Clearing browser cache
4. Checking the console for actual errors
