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
    preventScrollOnSwipe: true,
    trackMouse: false, // Don't track mouse for mobile swipes
    trackTouch: true,
    delta: 30, // Min distance for swipe (lower than default 50)
  });

  // Apply handlers to a div that wraps the content
  return (
    <div {...handlers} style={{ height: '100%', touchAction: 'pan-y' }}>
      {children}
    </div>
  );
}