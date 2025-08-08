import React, { useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useMobileDetection } from '../hooks/useMobileDetection';

export default function SwipeableOnboardingContent({ children, onNext, onPrevious }) {
  const containerRef = useRef(null);
  const [swipeIndicator, setSwipeIndicator] = useState(null);
  
  // Use the new mobile detection hook
  const { isMobile, isLoading } = useMobileDetection();
  
  const showSwipeIndicator = (direction) => {
    setSwipeIndicator(direction);
    setTimeout(() => setSwipeIndicator(null), 2000);
  };
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      showSwipeIndicator('LEFT ✅');
      if (onNext) {
        onNext();
      }
    },
    onSwipedRight: () => {
      showSwipeIndicator('RIGHT ✅');
      if (onPrevious) {
        onPrevious();
      }
    },
    // More aggressive swipe detection settings
    preventScrollOnSwipe: false, // Allow vertical scrolling
    trackMouse: false, // Mobile only
    trackTouch: true, // Essential for mobile
    delta: 20, // Lower threshold - easier to trigger
    swipeDuration: 3000, // Allow slower swipes
    touchEventOptions: { passive: false }, // Allow preventDefault
    rotationAngle: 0,
  });
  
  // Manual touch handling fallback
  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    let startX = null;
    let startY = null;
    let startTime = null;
    let isTracking = false;
    
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isTracking = true;
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isTracking || !startX || !startY || !startTime) {
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const duration = endTime - startTime;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Detect horizontal swipes
      if (absX > absY && absX > 30 && duration < 2000) {
        if (deltaX > 0) {
          showSwipeIndicator('RIGHT ✅');
          if (onPrevious) onPrevious();
        } else {
          showSwipeIndicator('LEFT ✅');
          if (onNext) onNext();
        }
      }
      
      isTracking = false;
      startX = null;
      startY = null;
      startTime = null;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [onNext, onPrevious, isMobile, isLoading]);
  
  // Main container with react-swipeable handlers and manual fallback
  return (
    <div 
      ref={containerRef}
      {...handlers} 
      style={{ 
        height: '100%',
        minHeight: '100vh',
        // CRITICAL: Allow horizontal swipes but prevent accidental scrolling
        touchAction: 'pan-y', // Only allow vertical panning
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        zIndex: 1,
        // Hardware acceleration for better touch response
        transform: 'translateZ(0)',
        willChange: 'transform',
        // Ensure proper touch handling
        cursor: 'grab'
      }}
    >
      {/* Swipe Feedback */}
      {swipeIndicator && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: swipeIndicator.includes('✅') ? 'rgba(0, 200, 0, 0.9)' : 'rgba(255, 100, 0, 0.9)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            zIndex: 9999,
            fontSize: '16px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>
            {swipeIndicator.includes('LEFT') ? '👈' : '👉'}
          </div>
          {swipeIndicator}
        </div>
      )}
      {children}
    </div>
  );
}