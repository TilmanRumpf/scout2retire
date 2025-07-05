// LazyImage component with intersection observer for lazy loading
import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = MapPin,
  fallbackIconSize = 24,
  onLoad,
  onError 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef(null);
  const FallbackIcon = fallbackIcon;

  // Intersection Observer to detect when image is in viewport
  useEffect(() => {
    const currentElement = imgRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  // Load image when it's in viewport
  useEffect(() => {
    if (isIntersecting && src && !imageLoadError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setImageLoadError(true);
        if (onError) onError();
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, imageLoadError, onLoad, onError]);

  // Show fallback if no image or error
  if (!src || imageLoadError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} ${uiConfig.colors.input} flex items-center justify-center`}
      >
        <FallbackIcon size={fallbackIconSize} className={uiConfig.colors.muted} />
      </div>
    );
  }

  // Show placeholder while loading
  if (!imageSrc) {
    return (
      <div 
        ref={imgRef}
        className={`${className} ${uiConfig.colors.input} flex items-center justify-center animate-pulse`}
      >
        <FallbackIcon size={fallbackIconSize} className={`${uiConfig.colors.muted} opacity-30`} />
      </div>
    );
  }

  // Show loaded image
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}