import React, { useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useMobileDetection } from '../hooks/useMobileDetection';

export default function SwipeableOnboardingContent({ children, onNext, onPrevious }) {
  const containerRef = useRef(null);
  const [swipeIndicator, setSwipeIndicator] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  
  // Use the new mobile detection hook
  const { isMobile, deviceInfo, isLoading } = useMobileDetection();
  
  console.log('🔥 [SWIPEABLE] Component mounted, handlers available:', { onNext: !!onNext, onPrevious: !!onPrevious });
  console.log('🔥 [SWIPEABLE] Mobile detection from hook:', { 
    isMobile, 
    deviceInfo, 
    isLoading,
    width: deviceInfo?.width,
    userAgent: deviceInfo?.userAgent?.includes('iPhone') ? 'iPhone' : deviceInfo?.userAgent?.includes('Android') ? 'Android' : 'Other'
  });
  
  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
    console.log('🟡 [DEBUG]', message);
  };
  
  const showSwipeIndicator = (direction) => {
    setSwipeIndicator(direction);
    addDebugInfo(`Swipe indicator: ${direction}`);
    setTimeout(() => setSwipeIndicator(null), 2000);
  };
  
  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      console.log('🔥 [SWIPE] ✅ LEFT SWIPE SUCCESS! Moving to next step');
      addDebugInfo(`LEFT swipe detected - calling onNext`);
      showSwipeIndicator('LEFT ✅');
      if (onNext) {
        console.log('🔥 [SWIPE] Calling onNext()...');
        onNext();
      } else {
        console.log('🚨 [SWIPE] onNext is not available!');
        addDebugInfo('ERROR: onNext not available');
      }
    },
    onSwipedRight: (eventData) => {
      console.log('🔥 [SWIPE] ✅ RIGHT SWIPE SUCCESS! Moving to previous step');
      addDebugInfo(`RIGHT swipe detected - calling onPrevious`);
      showSwipeIndicator('RIGHT ✅');
      if (onPrevious) {
        console.log('🔥 [SWIPE] Calling onPrevious()...');
        onPrevious();
      } else {
        console.log('🚨 [SWIPE] onPrevious is not available!');
        addDebugInfo('ERROR: onPrevious not available');
      }
    },
    onSwiping: (eventData) => {
      // Less verbose logging - only show significant movements
      if (Math.abs(eventData.deltaX) > 20) {
        console.log('🟡 [SWIPE] Swiping:', {
          dir: eventData.dir,
          deltaX: eventData.deltaX,
          deltaY: eventData.deltaY,
          velocity: eventData.velocity,
          first: eventData.first
        });
        if (eventData.first) {
          addDebugInfo(`Swipe starting: ${eventData.dir}, deltaX: ${eventData.deltaX}`);
        }
      }
    },
    onTouchStartOrOnMouseDown: (eventData) => {
      console.log('🟢 [SWIPE] Touch started');
      addDebugInfo('Touch started');
    },
    onSwipeStart: (eventData) => {
      console.log('🟡 [SWIPE] Swipe started:', eventData.dir);
      addDebugInfo(`Swipe started: ${eventData.dir}`);
    },
    // More aggressive swipe detection settings
    preventScrollOnSwipe: false, // Allow vertical scrolling
    trackMouse: false, // Mobile only
    trackTouch: true, // Essential for mobile
    delta: 20, // Lower threshold - easier to trigger
    swipeDuration: 3000, // Allow slower swipes
    touchEventOptions: { passive: false }, // Allow preventDefault
    rotationAngle: 0,
    // Additional callbacks for debugging
    onTap: () => {
      console.log('🔵 [SWIPE] Tap detected');
      addDebugInfo('Tap detected');
    },
    onSwipedUp: () => console.log('🔵 [SWIPE] Up swipe (ignored)'),
    onSwipedDown: () => console.log('🔵 [SWIPE] Down swipe (ignored)')
  });

  console.log('🔥 [SWIPEABLE] Handlers created:', !!handlers);
  
  // ULTIMATE FALLBACK: Manual touch handling with ultra-aggressive detection
  useEffect(() => {
    addDebugInfo(`Setting up ULTIMATE touch handling: isMobile=${isMobile}, isLoading=${isLoading}`);
    
    if (isLoading) {
      console.log('🟡 [SWIPE] Waiting for mobile detection to complete...');
      return;
    }
    
    let startX = null;
    let startY = null;
    let startTime = null;
    let isTracking = false;
    
    const handleTouchStart = (e) => {
      console.log('🟢 [MANUAL] Touch start - touches:', e.touches.length);
      addDebugInfo(`Manual touch start: ${e.touches.length} touches`);
      
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isTracking = true;
        console.log('🟢 [MANUAL] Tracking started:', { startX, startY });
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isTracking || !startX || !startY || !startTime) {
        console.log('🔴 [MANUAL] Touch end ignored - not tracking');
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
      
      console.log('🔴 [MANUAL] Touch end analysis:', { 
        deltaX, deltaY, duration,
        absX, absY,
        isHorizontal: absX > absY,
        meetsThreshold: absX > 50,
        fastEnough: duration < 1000
      });
      
      addDebugInfo(`Manual touch end: deltaX=${deltaX}, duration=${duration}ms`);
      
      // ULTRA AGGRESSIVE detection: lower thresholds for easier triggering
      if (absX > absY && absX > 30 && duration < 2000) {
        if (deltaX > 0) {
          console.log('🔥 [MANUAL] ✅ RIGHT SWIPE - calling onPrevious');
          addDebugInfo('MANUAL RIGHT SWIPE SUCCESS');
          showSwipeIndicator('MANUAL RIGHT ✅');
          if (onPrevious) onPrevious();
        } else {
          console.log('🔥 [MANUAL] ✅ LEFT SWIPE - calling onNext');
          addDebugInfo('MANUAL LEFT SWIPE SUCCESS');
          showSwipeIndicator('MANUAL LEFT ✅');
          if (onNext) onNext();
        }
      } else {
        addDebugInfo('Manual swipe failed criteria');
      }
      
      isTracking = false;
      startX = null;
      startY = null;
      startTime = null;
    };
    
    const container = containerRef.current;
    if (container) {
      console.log('🔧 [SWIPE] Adding manual touch listeners');
      addDebugInfo('Adding manual touch listeners');
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        console.log('🔧 [SWIPE] Removing manual touch listeners');
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    } else {
      console.log('🚨 [SWIPE] No container ref available!');
      addDebugInfo('ERROR: No container ref');
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
      onTouchStart={(e) => {
        console.log('🟢 [NATIVE] Touch start:', {
          touches: e.touches.length,
          clientX: e.touches[0]?.clientX,
          clientY: e.touches[0]?.clientY,
          target: e.target.tagName
        });
        addDebugInfo(`Native touch start: ${e.touches.length} touches`);
      }}
      onTouchMove={(e) => {
        // Only log significant movements
        if (e.touches[0] && Math.random() < 0.05) { // 5% sampling
          console.log('🔵 [NATIVE] Touch move sample');
        }
      }}
      onTouchEnd={(e) => {
        console.log('🔴 [NATIVE] Touch end');
        addDebugInfo('Native touch end');
      }}
    >
      {/* Enhanced Debug Panel */}
      <div 
        style={{
          position: 'fixed',
          top: '130px',
          left: '4px',
          background: 'rgba(0, 150, 50, 0.95)',
          color: 'white',
          padding: '8px',
          borderRadius: '6px',
          zIndex: 9999,
          fontSize: '10px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          maxWidth: '200px',
          fontFamily: 'monospace'
        }}
      >
        <div style={{ color: '#00ff00' }}>📱 SWIPE DEBUG v2.0</div>
        Mobile: {isLoading ? '⏳' : (isMobile ? '✅ YES' : '❌ NO')}
        <br />
        Width: {deviceInfo?.width || 'N/A'}
        <br />
        Touch: {deviceInfo?.isTouchDevice ? '✅ YES' : '❌ NO'}
        <br />
        Device: {deviceInfo?.userAgent?.includes('iPhone') ? '📱 iPhone' : 
                deviceInfo?.userAgent?.includes('Android') ? '🤖 Android' : '💻 Other'}
        <br />
        Handlers: {!!onNext ? '✅' : '❌'} Next, {!!onPrevious ? '✅' : '❌'} Prev
        <br />
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#ccffcc' }}>
          Recent events:
          {debugInfo.slice(-3).map((info, i) => (
            <div key={i}>• {info.length > 25 ? info.substring(0, 25) + '...' : info}</div>
          ))}
        </div>
      </div>
      
      {/* ISOLATED SWIPE TEST AREA */}
      <div
        style={{
          position: 'fixed',
          top: '300px',
          right: '10px',
          width: '150px',
          height: '80px',
          background: 'rgba(255, 0, 255, 0.8)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
        {...handlers}
        onTouchStart={(e) => {
          console.log('🟣 ISOLATED: Touch started on test area');
          addDebugInfo('ISOLATED: Touch started');
        }}
        onTouchEnd={(e) => {
          console.log('🟣 ISOLATED: Touch ended on test area');
          addDebugInfo('ISOLATED: Touch ended');
        }}
      >
        ISOLATED<br/>SWIPE TEST<br/>
        (Swipe me!)
      </div>

      {/* Enhanced Swipe Feedback */}
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