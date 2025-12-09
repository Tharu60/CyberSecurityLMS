# Cyber Security LMS - Learning Management System

A comprehensive Learning Management System designed specifically for Cybersecurity education with role-based access control, progressive stage learning, and interactive assessments.

## 🚀 Features Implemented

### Backend (Node.js + Express + MySQL)

✅ **Complete Backend API**
- User authentication with JWT tokens
- Role-based access control (Student, Instructor, Admin)
- RESTful API endpoints for all resources
- MySQL database with complete schema
- Password encryption with bcrypt
- Database seeding with questions and videos

✅ **Database Models**
- Users (with role management)
- Stages (6-stage progression system)
- Questions (110 questions across all stages)
- Videos (8 curated video resources)
- User Progress tracking
- Stage Results
- Video Progress
- Certificates

✅ **API Endpoints**
- `/api/auth` - Authentication (login, register, profile)
- `/api/stages` - Stage management
- `/api/progress` - Progress tracking and assessments
- `/api/questions` - Question management (Instructor/Admin)
- `/api/videos` - Video management
- `/api/admin` - Admin dashboard statistics

### Frontend (React + Bootstrap)

✅ **Infrastructure**
- React Router setup
- Authentication Context
- Private Route protection
- API service layer with Axios
- Bootstrap integration
- Modern, responsive UI design

✅ **Pages Created**
- Login page with validation
- Register page with role selection
- Authentication flow

## 📋 Project Structure

```
LMS/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL database configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Stage.js             # Stage model
│   │   ├── Question.js          # Question model
│   │   ├── Video.js             # Video model
│   │   └── Progress.js          # Progress tracking model
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── stageController.js   # Stage management
│   │   ├── progressController.js # Progress tracking
│   │   ├── questionController.js # Question management
│   │   ├── videoController.js   # Video management
│   │   └── adminController.js   # Admin operations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── stageRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── videoRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js              # JWT verification & authorization
│   ├── utils/
│   │   └── seeder.js            # Database seeder
│   ├── scripts/
│   │   └── runSeeder.js         # Seeder runner
│   ├── server.js                # Express server
│   ├── .env                     # Environment variables
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.js  # Route protection
│   │   ├── pages/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── student/         # Student pages (to be completed)
│   │   │   ├── instructor/      # Instructor pages (to be completed)
│   │   │   └── admin/           # Admin pages (to be completed)
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication state management
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── styles/
│   │   │   └── Auth.css         # Authentication page styles
│   │   └── App.js               # Main app with routing
│   └── package.json
│
├── QUESTION.txt                  # Question bank (imported)
├── Video.txt                     # Video resources (imported)
├── CLAUDE.md                     # Project documentation
└── README.md                     # This file
```

## 🎯 Learning Flow

### 1. Initial Assessment (General Stage)
- 25 questions to determine starting level
- Score < 25% → Start at Stage 1
- Score 25-50% → Start at Stage 2
- Score 50-75% → Start at Stage 3
- Score > 75% → Start at Stage 4

### 2. Progressive Stages
- **Stage 1**: Cybersecurity Basics (15 questions, 60% to pass)
- **Stage 2**: Intermediate Concepts (15 questions, 60% to pass)
- **Stage 3**: Advanced Topics (15 questions, 60% to pass)
- **Stage 4**: Expert-Level Strategies (15 questions, 60% to pass)

### 3. Final Stage
- 25 comprehensive questions
- Certificate upon completion

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE lms_db;
exit;
```

4. Create `.env` file (already created):
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lms_db
DB_PORT=3306
```

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Client will run on `http://localhost:3000`

## 📝 To-Do List (Remaining Tasks)

### Frontend Pages (High Priority)

1. **Student Dashboard** - `/client/src/pages/student/Dashboard.js`
   - Show current progress
   - Display unlocked/locked stages
   - Show completion percentage
   - Link to initial assessment (if not completed)

2. **Initial Assessment** - `/client/src/pages/student/InitialAssessment.js`
   - 25-question quiz
   - Auto-placement based on score
   - Results page with starting stage

3. **Stage View** - `/client/src/pages/student/StageView.js`
   - Display stage videos
   - Mark videos as completed
   - Quiz button to start stage assessment

4. **Quiz Component** - `/client/src/pages/student/Quiz.js`
   - Question display
   - Answer selection
   - Submit and get results
   - Pass/fail messaging

5. **Instructor Dashboard** - `/client/src/pages/instructor/Dashboard.js`
   - View all students
   - Monitor progress
   - Add/edit questions and videos

6. **Admin Dashboard** - `/client/src/pages/admin/Dashboard.js`
   - User management
   - Platform statistics
   - Analytics charts

7. **Unauthorized Page** - `/client/src/pages/Unauthorized.js`
   - Access denied message

### Components to Build

8. **Navbar** - `/client/src/components/Navbar.js`
   - Logo
   - Navigation links based on role
   - Logout button

9. **Sidebar** - `/client/src/components/Sidebar.js`
   - Collapsible on mobile
   - Role-specific menu items

10. **ProgressBar** - `/client/src/components/ProgressBar.js`
    - Visual progress indicator

11. **VideoPlayer** - `/client/src/components/VideoPlayer.js`
    - YouTube embed
    - Mark as completed button

12. **StageCard** - `/client/src/components/StageCard.js`
    - Stage information
    - Lock/unlock indicator
    - Progress indicator

### Features to Implement

13. **Progress Tracking Charts** (using Chart.js/react-chartjs-2)
    - Completion rate chart
    - Score trends
    - Time spent per stage

14. **Certificate Generation**
    - Create certificate on final stage completion
    - Download as PDF

15. **Password Reset**
    - Forgot password functionality
    - Email verification (optional)

16. **Mobile Optimizations**
    - Touch gestures
    - Swipe navigation
    - Responsive quiz interface

17. **Testing**
    - Test all user flows
    - Fix any bugs

18. **Performance Optimization**
    - Code splitting
    - Lazy loading
    - Image optimization

## 🎨 Design System

### Colors
- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Purple)
- Success: `#28a745`
- Warning: `#ffc107`
- Danger: `#dc3545`

### Breakpoints
- Mobile: `320px - 768px`
- Tablet: `768px - 1024px`
- Desktop: `1024px+`

## 🔐 User Roles

### Student
- Take initial assessment
- Progress through stages
- Watch videos
- Take quizzes
- View progress and certificates

### Instructor
- View all students
- Monitor student progress
- Add/edit questions
- Add/edit videos
- Generate reports

### Admin
- All instructor permissions
- Manage users (add/edit/delete)
- View platform statistics
- Access all analytics

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Stages
- `GET /api/stages` - Get all stages
- `GET /api/stages/:id` - Get stage by ID
- `GET /api/stages/:id/questions` - Get questions for assessment
- `POST /api/stages` - Create stage (Instructor/Admin)
- `PUT /api/stages/:id` - Update stage (Instructor/Admin)
- `DELETE /api/stages/:id` - Delete stage (Admin)

### Progress
- `GET /api/progress/my-progress` - Get current user progress
- `POST /api/progress/initial-assessment` - Submit initial assessment
- `POST /api/progress/stage-assessment` - Submit stage quiz
- `POST /api/progress/video-completed` - Mark video complete
- `GET /api/progress/videos` - Get video progress

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/statistics` - Get platform stats
- `GET /api/admin/analytics` - Get student analytics

## 📊 Database Schema

### Tables
- `users` - User accounts with roles
- `stages` - Learning stages
- `questions` - Quiz questions
- `videos` - Learning videos
- `user_progress` - User learning progress
- `stage_results` - Quiz results per stage
- `video_progress` - Video completion tracking
- `certificates` - Issued certificates

## 🤝 Contributing

This is a learning management system for cybersecurity education. To contribute:

1. Follow the existing code structure
2. Maintain responsive design principles
3. Test all features thoroughly
4. Document new features

## 📄 License

ISC

## 👨‍💻 Development Status

**Current Status**: Backend complete, Frontend in progress (40% complete)

**Next Steps**:
1. Build Student Dashboard
2. Build Quiz components
3. Build Initial Assessment
4. Add progress tracking visualization
5. Complete remaining dashboards

---

**Built with ❤️ for Cybersecurity Education using Node.js, React, Express, MySQL, Bootstrap**
