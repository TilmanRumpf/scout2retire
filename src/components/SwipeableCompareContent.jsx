import React from 'react';
import { useSwipeable } from 'react-swipeable';

export default function SwipeableCompareContent({ children, categories, activeCategory, onCategoryChange }) {
  const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < categories.length - 1) {
        onCategoryChange(categories[currentIndex + 1].id);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        onCategoryChange(categories[currentIndex - 1].id);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    trackTouch: true,
    delta: 30,
  });

  return (
    <div {...handlers} style={{ touchAction: 'pan-y' }}>
      {children}
    </div>
  );
}