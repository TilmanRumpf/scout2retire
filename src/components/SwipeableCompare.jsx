import React, { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';

export default function SwipeableCompare({ activeCategory, categories, onCategoryChange, children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Map category IDs to indices
  const categoryToIndex = categories.reduce((acc, cat, idx) => {
    acc[cat.id] = idx;
    return acc;
  }, {});
  
  // Update index when category changes
  useEffect(() => {
    const newIndex = categoryToIndex[activeCategory];
    if (newIndex !== undefined && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeCategory]);
  
  const handleChangeIndex = (index) => {
    const category = categories[index];
    if (category && onCategoryChange) {
      onCategoryChange(category.id);
    }
  };
  
  // Only enable swipeable on mobile
  const isMobile = window.innerWidth < 768;
  
  if (!isMobile) {
    // Not mobile - render children normally
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
      {/* Render all category views */}
      {categories.map((_, i) => (
        <div key={i} style={{ height: '100%' }}>
          {i === activeIndex ? children : <div />}
        </div>
      ))}
    </SwipeableViews>
  );
}