import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import '../styles/SwipeableCard.css';

const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, className = '' }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 75;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    // Calculate drag offset for visual feedback
    if (isDragging) {
      const offset = currentTouch - touchStart;
      // Limit the offset to prevent over-dragging
      setDragOffset(Math.max(-150, Math.min(150, offset)));
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      className={`swipeable-card-wrapper ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {children}

      {/* Swipe indicators */}
      {isDragging && dragOffset > 50 && (
        <div className="swipe-indicator swipe-indicator-right">
          <i className="bi bi-arrow-right-circle-fill"></i>
        </div>
      )}
      {isDragging && dragOffset < -50 && (
        <div className="swipe-indicator swipe-indicator-left">
          <i className="bi bi-arrow-left-circle-fill"></i>
        </div>
      )}
    </div>
  );
};

export default SwipeableCard;
