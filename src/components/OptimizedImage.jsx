// Unified image component with optional lazy loading
import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  lazy = false, // Enable lazy loading with intersection observer
  fallbackIcon = MapPin,
  fallbackIconSize = 24,
  rootMargin = '50px', // For lazy loading
  onLoad,
  onError 
}) {
  const [imageSrc, setImageSrc] = useState(lazy ? null : src);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const imgRef = useRef(null);
  const FallbackIcon = fallbackIcon;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;
    
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
      { rootMargin }
    );

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [lazy, rootMargin]);

  // Load image when it's in viewport (for lazy loading)
  useEffect(() => {
    if (!lazy) return;
    
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
  }, [lazy, isIntersecting, src, imageLoadError, onLoad, onError]);

  // Handle non-lazy image errors
  const handleDirectError = () => {
    setImageLoadError(true);
    if (onError) onError();
  };

  // Show fallback if no image or error
  if (!src || imageLoadError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} ${uiConfig.colors.input} flex items-center justify-center`}
      >
        {FallbackIcon && <FallbackIcon size={fallbackIconSize} className={uiConfig.colors.muted} />}
      </div>
    );
  }

  // For lazy loading: show placeholder while loading
  if (lazy && !imageSrc) {
    return (
      <div 
        ref={imgRef}
        className={`${className} ${uiConfig.colors.input} flex items-center justify-center animate-pulse`}
      >
        {FallbackIcon && <FallbackIcon size={fallbackIconSize} className={`${uiConfig.colors.muted} opacity-30`} />}
      </div>
    );
  }

  // Show the image
  return (
    <img
      ref={imgRef}
      src={imageSrc || src}
      alt={alt}
      className={className}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={!lazy ? onLoad : undefined}
      onError={!lazy ? handleDirectError : undefined}
    />
  );
}