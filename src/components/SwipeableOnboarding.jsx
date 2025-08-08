import React, { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SwipeableOnboarding({ children, onNext, onPrevious }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Map paths to indices
  const pathToIndex = {
    '/onboarding/current-status': 0,
    '/onboarding/region': 1,
    '/onboarding/climate': 2,
    '/onboarding/culture': 3,
    '/onboarding/hobbies': 4,
    '/onboarding/administration': 5,
    '/onboarding/costs': 6
  };
  
  const indexToPath = Object.entries(pathToIndex).reduce((acc, [path, idx]) => {
    acc[idx] = path;
    return acc;
  }, {});
  
  // Update index when location changes
  useEffect(() => {
    const newIndex = pathToIndex[location.pathname];
    if (newIndex !== undefined && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [location.pathname]);
  
  const handleChangeIndex = (index) => {
    const newPath = indexToPath[index];
    if (newPath) {
      // Trigger the appropriate navigation
      if (index > activeIndex && onNext) {
        onNext();
      } else if (index < activeIndex && onPrevious) {
        onPrevious();
      }
    }
  };
  
  // Only enable swipeable on mobile
  const isMobile = window.innerWidth < 768;
  
  if (!isMobile || pathToIndex[location.pathname] === undefined) {
    // Not mobile or not a swipeable path - render children normally
    return children;
  }
  
  return (
    <SwipeableViews
      index={activeIndex}
      onChangeIndex={handleChangeIndex}
      enableMouseEvents={false}
      resistance
      threshold={10}
      style={{ height: '100%' }}
      containerStyle={{ height: '100%' }}
      slideStyle={{ height: '100%', overflow: 'auto' }}
    >
      {/* Render placeholders for all steps */}
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} style={{ height: '100%' }}>
          {i === activeIndex ? children : <div />}
        </div>
      ))}
    </SwipeableViews>
  );
}