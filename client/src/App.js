import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import StudentDashboard from './pages/student/Dashboard';
import StudentProgress from './pages/student/Progress';
import Certificate from './pages/student/Certificate';
import InstructorDashboard from './pages/instructor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import InitialAssessment from './pages/student/InitialAssessment';
import StageView from './pages/student/StageView';
import Quiz from './pages/student/Quiz';
import Unauthorized from './pages/Unauthorized';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './styles/MobileOptimizations.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student routes */}
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute roles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/initial-assessment"
            element={
              <PrivateRoute roles={['student']}>
                <InitialAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/stage/:id"
            element={
              <PrivateRoute roles={['student']}>
                <StageView />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/quiz/:stageId"
            element={
              <PrivateRoute roles={['student']}>
                <Quiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <PrivateRoute roles={['student']}>
                <StudentProgress />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/certificate"
            element={
              <PrivateRoute roles={['student']}>
                <Certificate />
              </PrivateRoute>
            }
          />

          {/* Instructor routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <PrivateRoute roles={['instructor']}>
                <InstructorDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
