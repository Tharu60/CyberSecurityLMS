# Security Documentation
## Cybersecurity Learning Management System

**Version:** 1.0
**Date:** October 27, 2025

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Authentication Security](#2-authentication-security)
3. [Authorization Security](#3-authorization-security)
4. [Data Protection](#4-data-protection)
5. [Network Security](#5-network-security)
6. [Application Security](#6-application-security)
7. [Vulnerability Management](#7-vulnerability-management)
8. [Security Best Practices](#8-security-best-practices)
9. [Security Checklist](#9-security-checklist)
10. [Incident Response](#10-incident-response)

---

## 1. Security Overview

### 1.1 Security Posture

**Current Security Status:**
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ SQL injection prevention
- ✅ XSS protection (React)
- ✅ Role-based access control
- ⚠️ CORS configured (needs production update)
- ❌ HTTPS (required for production)
- ❌ Rate limiting (recommended)
- ❌ CSRF protection (recommended)

### 1.2 Security Principles

**CIA Triad:**
- **Confidentiality:** Data accessible only to authorized users
- **Integrity:** Data remains accurate and unmodified
- **Availability:** System accessible when needed

**Defense in Depth:**
Multiple layers of security controls throughout the system.

---

## 2. Authentication Security

### 2.1 Password Security

**Hashing Algorithm:** bcrypt
```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Hashing
const hashedPassword = bcrypt.hashSync(password, saltRounds);

// Verification
const isMatch = bcrypt.compareSync(password, hashedPassword);
```

**Password Requirements:**
- **Current:** Minimum 6 characters
- **Recommended:** Minimum 8 characters with complexity rules

**Best Practices:**
```javascript
// Enforce stronger passwords
const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return 'Password must be at least 8 characters';
  }
  if (!hasUppercase || !hasLowercase) {
    return 'Password must contain uppercase and lowercase letters';
  }
  if (!hasNumber) {
    return 'Password must contain at least one number';
  }
  if (!hasSpecial) {
    return 'Password must contain at least one special character';
  }
  return null;
};
```

**Security Measures:**
- ✅ Passwords never logged
- ✅ Passwords never returned in API responses
- ✅ Passwords hashed before storage
- ✅ Salt rounds: 10 (industry standard)
- ❌ Password reset not implemented (future)

### 2.2 JWT Token Security

**Token Generation:**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Security Considerations:**

**✅ Current Implementation:**
- Secret key in environment variable
- 7-day expiration
- Minimal payload (no sensitive data)
- HMAC SHA256 algorithm (HS256)

**⚠️ Production Improvements:**
- Use strong secret (32+ random characters)
- Consider shorter expiration (1-24 hours)
- Implement refresh tokens
- Store tokens in HttpOnly cookies (not localStorage)

**Token Verification:**
```javascript
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
```

**Token Revocation:**
- Current: No token revocation (stateless)
- Recommended: Token blacklist with Redis

### 2.3 Session Management

**Current:**
- Stateless JWT (no server-side sessions)
- Tokens stored in localStorage
- 7-day expiration
- No refresh mechanism

**Production Recommendations:**
```javascript
// HttpOnly cookie (prevents XSS)
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

---

## 3. Authorization Security

### 3.1 Role-Based Access Control (RBAC)

**Roles:**
- student
- instructor
- admin

**Middleware Implementation:**
```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

**Usage:**
```javascript
// Student only
router.get('/my-progress',
  authenticate,
  authorize('student'),
  controller.getProgress
);

// Instructor and Admin
router.post('/videos',
  authenticate,
  authorize('instructor', 'admin'),
  controller.createVideo
);

// Admin only
router.delete('/users/:id',
  authenticate,
  authorize('admin'),
  controller.deleteUser
);
```

### 3.2 Access Control Matrix

| Resource | Public | Student | Instructor | Admin |
|----------|--------|---------|------------|-------|
| Register | ✅ | | | |
| Login | ✅ | | | |
| Profile | | ✅ Own | ✅ Own | ✅ All |
| Stages | | ✅ Unlocked | ✅ All | ✅ All |
| Quizzes | | ✅ Unlocked | ✅ All | ✅ All |
| Videos | | ✅ Stage | ✅ All | ✅ All |
| Questions | | | ✅ CRUD | ✅ CRUD |
| Users | | | | ✅ CRUD |
| Certificates | | ✅ Own | | |
| Verify Cert | ✅ | | | |

### 3.3 Ownership Verification

```javascript
// Ensure student accesses only own data
const verifyOwnership = (req, res, next) => {
  const userId = parseInt(req.params.userId);
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.get('/progress/user/:userId',
  authenticate,
  verifyOwnership,
  controller.getUserProgress
);
```

---

## 4. Data Protection

### 4.1 SQL Injection Prevention

**✅ Parameterized Queries:**
```javascript
// SECURE - Parameterized
db.run(
  'SELECT * FROM users WHERE email = ?',
  [email],
  (err, row) => { /* ... */ }
);

// VULNERABLE - String concatenation
db.run(
  `SELECT * FROM users WHERE email = '${email}'`,  // DON'T DO THIS!
  (err, row) => { /* ... */ }
);
```

**All queries use parameterized statements:**
- User queries: ✅
- Stage queries: ✅
- Progress queries: ✅
- All CRUD operations: ✅

### 4.2 XSS Protection

**React Auto-Escaping:**
```javascript
// Safe - React escapes by default
<div>{user.name}</div>
<div>{question.question_text}</div>

// Dangerous - Avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} />  // DON'T USE!
```

**Input Sanitization:**
```javascript
const sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

### 4.3 Data Validation

**Backend Validation:**
```javascript
const validateRegistration = (req, res, next) => {
  const { name, email, password, governmentId } = req.body;

  // Required fields
  if (!name || !email || !password || !governmentId) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Government ID format
  const govIdRegex = /^[A-Z]{4}\/[0-9]{5}$/;
  if (!govIdRegex.test(governmentId)) {
    return res.status(400).json({ message: 'Invalid government ID format' });
  }

  // Password strength
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password too short' });
  }

  next();
};
```

**Frontend Validation:**
- Email format
- Password length
- Government ID format
- Required fields
- Password confirmation match

### 4.4 Sensitive Data Handling

**Never Log:**
```javascript
// BAD
console.log('User password:', password);

// GOOD
console.log('User registration attempt:', { email, role });
```

**Never Return:**
```javascript
// Remove password from response
const userResponse = { ...user };
delete userResponse.password;
res.json({ user: userResponse });
```

**Database Storage:**
- ✅ Passwords: bcrypt hashed
- ✅ Government IDs: Plain text (needed for login)
- ✅ Emails: Plain text (needed for login)
- ❌ Credit cards: Not collected

---

## 5. Network Security

### 5.1 HTTPS/TLS

**Current (Development):**
- HTTP only
- No encryption in transit

**Production Requirements:**
```
✅ HTTPS enabled
✅ Valid SSL/TLS certificate
✅ Redirect HTTP to HTTPS
✅ HSTS header
```

**Nginx Configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 5.2 CORS Configuration

**Current:**
```javascript
const cors = require('cors');
app.use(cors());  // Allows all origins (development only!)
```

**Production:**
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5.3 Security Headers

**Recommended (helmet.js):**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Headers Added:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## 6. Application Security

### 6.1 Rate Limiting

**Not Implemented (Recommended):**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/auth/login', loginLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);
```

### 6.2 CSRF Protection

**Not Implemented (Recommended for production):**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 6.3 Input Validation

**Email Validation:**
```javascript
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
```

**Government ID Validation:**
```javascript
const validateGovernmentId = (govId) => {
  const re = /^[A-Z]{4}\/[0-9]{5}$/;
  return re.test(govId);
};
```

### 6.4 Error Handling

**Production Error Responses:**
```javascript
if (process.env.NODE_ENV === 'production') {
  res.status(500).json({ message: 'Internal server error' });
} else {
  res.status(500).json({
    message: error.message,
    stack: error.stack
  });
}
```

---

## 7. Vulnerability Management

### 7.1 Dependency Scanning

**npm audit:**
```bash
npm audit
npm audit fix
```

**Regular Updates:**
```bash
npm outdated
npm update
```

### 7.2 Common Vulnerabilities

**OWASP Top 10 2021:**

1. **Broken Access Control** ✅ Mitigated (RBAC implemented)
2. **Cryptographic Failures** ✅ Mitigated (bcrypt, JWT)
3. **Injection** ✅ Mitigated (parameterized queries)
4. **Insecure Design** ⚠️ Partial (review needed)
5. **Security Misconfiguration** ⚠️ Production pending
6. **Vulnerable Components** ⚠️ Regular audits needed
7. **Authentication Failures** ✅ Mitigated
8. **Data Integrity Failures** ✅ Mitigated
9. **Logging Failures** ⚠️ Logging minimal
10. **SSRF** ✅ Not applicable

### 7.3 Security Testing

**Automated Scanning:**
- npm audit (dependencies)
- OWASP ZAP (web vulnerabilities)
- Snyk (dependency monitoring)

**Manual Testing:**
- SQL injection attempts
- XSS attempts
- Authentication bypass
- Authorization bypass
- CSRF attacks

---

## 8. Security Best Practices

### 8.1 Development

**Code Review:**
- Security-focused reviews
- Check for hardcoded secrets
- Verify input validation
- Review authentication/authorization

**Secrets Management:**
```bash
# ✅ GOOD - Environment variables
JWT_SECRET=env_variable_here

# ❌ BAD - Hardcoded
const secret = 'hardcoded_secret';
```

**Git Security:**
```gitignore
# .gitignore
.env
*.db
node_modules/
```

### 8.2 Deployment

**Production Checklist:**
- [ ] HTTPS enabled
- [ ] Strong JWT_SECRET (32+ chars)
- [ ] CORS restricted to domain
- [ ] Rate limiting enabled
- [ ] Security headers (helmet.js)
- [ ] Error handling (no stack traces)
- [ ] Logging configured
- [ ] Database credentials secure
- [ ] Default accounts removed
- [ ] npm audit passed

### 8.3 Monitoring

**Log Security Events:**
```javascript
// Login attempts
console.log(`Login attempt: ${email} at ${new Date()}`);

// Failed authentications
console.log(`Failed login: ${email} from ${req.ip}`);

// Authorization failures
console.log(`Access denied: ${req.user.email} tried ${req.path}`);
```

**Monitoring Tools:**
- Sentry (error tracking)
- Loggly (log management)
- New Relic (application monitoring)

---

## 9. Security Checklist

### 9.1 Pre-Production Security Audit

**Authentication & Authorization:**
- [ ] Password hashing implemented (bcrypt)
- [ ] JWT tokens used correctly
- [ ] Token expiration configured
- [ ] RBAC implemented
- [ ] Authorization checked on all endpoints
- [ ] Ownership verification implemented

**Data Protection:**
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection enabled
- [ ] Input validation on frontend and backend
- [ ] Sensitive data never logged
- [ ] Passwords never returned in responses

**Network Security:**
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] CORS configured for production domain
- [ ] Security headers added (helmet.js)
- [ ] HSTS enabled

**Application Security:**
- [ ] Rate limiting implemented
- [ ] CSRF protection added
- [ ] Error handling doesn't expose internals
- [ ] Dependencies updated (npm audit clean)
- [ ] No hardcoded secrets

**Infrastructure:**
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] Logging configured

---

## 10. Incident Response

### 10.1 Security Incident Types

- Unauthorized access
- Data breach
- DDoS attack
- Vulnerability exploit
- Account compromise

### 10.2 Response Plan

**1. Detection**
- Monitor logs
- User reports
- Automated alerts

**2. Containment**
- Disable affected accounts
- Block malicious IPs
- Take system offline if necessary

**3. Investigation**
- Analyze logs
- Identify scope
- Document incident

**4. Recovery**
- Patch vulnerability
- Restore from backup
- Reset compromised credentials

**5. Post-Incident**
- Document lessons learned
- Update security measures
- Notify affected users (if applicable)

### 10.3 Contact Information

**Security Team:**
- Email: security@yourdomain.com
- Emergency: +1-XXX-XXX-XXXX

**Escalation:**
1. Development Team Lead
2. System Administrator
3. CTO/Management

---

## Security Maintenance

**Regular Tasks:**
- Weekly: Review logs
- Monthly: npm audit and update
- Quarterly: Security audit
- Annually: Penetration testing

**Stay Informed:**
- Subscribe to security advisories
- Monitor CVE databases
- Follow OWASP updates

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Security Status:** Production Ready (with recommendations implemented)
