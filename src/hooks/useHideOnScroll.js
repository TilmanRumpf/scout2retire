import { useState, useEffect, useRef } from 'react';

export function useHideOnScroll() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    let lastY = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up or at the top
      if (currentScrollY < lastY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide when scrolling down
      else if (currentScrollY > lastY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      lastY = currentScrollY;
      setLastScrollY(currentScrollY);
      setIsScrolling(true);
      
      // Clear existing timeout
      clearTimeout(scrollTimeout.current);
      
      // Show nav after scrolling stops for 1 second
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
        setIsScrolling(false);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  return { isVisible, isScrolling };
}