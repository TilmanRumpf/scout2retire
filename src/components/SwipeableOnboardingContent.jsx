import React from 'react';
import { useSwipeable } from 'react-swipeable';

export default function SwipeableOnboardingContent({ children, onNext, onPrevious }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('[SWIPE] Detected LEFT swipe - moving to next step');
      if (onNext) onNext();
    },
    onSwipedRight: () => {
      console.log('[SWIPE] Detected RIGHT swipe - moving to previous step');
      if (onPrevious) onPrevious();
    },
    onSwiping: (eventData) => {
      console.log('[SWIPE] Swiping:', eventData);
    },
    onTouchStartOrOnMouseDown: () => {
      console.log('[SWIPE] Touch started');
    },
    preventScrollOnSwipe: false, // Allow vertical scrolling
    trackMouse: false, // Don't track mouse for mobile swipes
    trackTouch: true,
    delta: 25, // Lower threshold for easier swipes on mobile
    swipeDuration: 1000, // Allow slower swipes
    touchEventOptions: { passive: false }, // Allow preventDefault for iOS
  });

  // Apply handlers to a div that wraps the content with proper iOS touch configuration
  return (
    <div 
      {...handlers} 
      style={{ 
        height: '100%', 
        touchAction: 'pan-y pinch-zoom', // Allow vertical scroll and zoom
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        zIndex: 1,
        overscrollBehavior: 'contain', // Prevent overscroll from interfering
      }}
      onTouchStart={(e) => {
        console.log('[SWIPE] Native touch start event');
        // Ensure touch events are not blocked
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}