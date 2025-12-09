import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const getNavLinks = () => {
    if (!user) {
      // Public navigation links
      return [
        { path: '/about', label: 'About', icon: 'bi-info-circle' },
        { path: '/blog', label: 'Blog', icon: 'bi-journal-text' },
      ];
    }

    // Role-based navigation with About and Blog
    const commonLinks = [
      { path: '/about', label: 'About', icon: 'bi-info-circle' },
      { path: '/blog', label: 'Blog', icon: 'bi-journal-text' },
    ];

    switch (user.role) {
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: 'bi-house-door' },
          { path: '/student/progress', label: 'Progress', icon: 'bi-graph-up' },
          { path: '/student/certificate', label: 'Certificate', icon: 'bi-award' },
          ...commonLinks,
        ];
      case 'instructor':
        return [
          { path: '/instructor/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
          ...commonLinks,
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-shield-check' },
          ...commonLinks,
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to={user ? `/${user.role}/dashboard` : '/about'} className="navbar-brand">
          <div className="brand-icon">
            <i className="bi bi-shield-lock"></i>
          </div>
          <div className="brand-text">
            <span className="brand-name">CyberSec</span>
            <span className="brand-subtitle">LMS</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {user ? (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Login</span>
              </Link>
              <Link to="/register" className="register-btn">
                <i className="bi bi-person-plus"></i>
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="mobile-logout-btn">
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Login</span>
              </Link>
              <Link to="/register" className="mobile-register-btn" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-person-plus"></i>
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
