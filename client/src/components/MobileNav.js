import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Offcanvas, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../styles/MobileNav.css';

const MobileNav = () => {
  const [show, setShow] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Touch handlers for swipe gesture
  const onTouchStart = (e) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe right from left edge opens menu
    if (isRightSwipe && touchStart < 50) {
      handleShow();
    }

    // Swipe left closes menu
    if (isLeftSwipe && show) {
      handleClose();
    }
  };

  useEffect(() => {
    // Add touch event listeners to detect swipe from edge
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, show]);

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  // Get menu items based on role
  const getMenuItems = () => {
    if (!user) return [];

    const role = user.role;

    if (role === 'student') {
      return [
        { icon: 'bi-house-door', label: 'Dashboard', path: '/student/dashboard' },
        { icon: 'bi-bar-chart', label: 'My Progress', path: '/student/progress' },
        { icon: 'bi-award', label: 'Certificate', path: '/student/certificate' },
      ];
    }

    if (role === 'instructor') {
      return [
        { icon: 'bi-house-door', label: 'Dashboard', path: '/instructor/dashboard' },
      ];
    }

    if (role === 'admin') {
      return [
        { icon: 'bi-house-door', label: 'Dashboard', path: '/admin/dashboard' },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <Button
        variant="outline-light"
        className="mobile-nav-toggle d-lg-none"
        onClick={handleShow}
        aria-label="Open navigation menu"
      >
        <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
      </Button>

      {/* Offcanvas Sidebar */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        className="mobile-nav-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className="bi bi-shield-lock-fill me-2"></i>
            Cyber Security LMS
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* User Info */}
          <div className="mobile-nav-user">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-info">
              <h6 className="mb-0">{user?.name}</h6>
              <small className="text-muted">{user?.email}</small>
              <br />
              <Badge bg="primary" className="mt-1">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </div>
          </div>

          <hr />

          {/* Navigation Menu */}
          <nav className="mobile-nav-menu">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <i className={`bi ${item.icon} me-3`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          <hr />

          {/* Logout Button */}
          <button className="mobile-nav-item mobile-nav-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-3"></i>
            Logout
          </button>

          {/* Swipe Hint */}
          <div className="swipe-hint mt-4">
            <small className="text-muted">
              <i className="bi bi-arrow-left-right me-1"></i>
              Swipe right from edge to open menu
            </small>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MobileNav;
