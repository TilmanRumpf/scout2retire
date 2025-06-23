import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getValidatedImage, getFallbackImage } from '../utils/imageValidation';
import { uiConfig } from '../styles/uiConfig';

/**
 * Enhanced LazyImage component with validation and intelligent fallbacks
 * Prevents bad images (like rabbits for Panama) and ensures every location has an appropriate image
 */
export default function LazyImageValidated({ 
  location, // Pass the full location object for context
  src, 
  alt, 
  className = '', 
  fallbackIcon = MapPin,
  fallbackIconSize = 48,
  onImageError = null,
  priority = false // Load immediately for above-the-fold images
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(priority);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.01
      }
    );

    const element = document.getElementById(`lazy-image-${alt}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [alt, priority]);

  // Validate and load image when in view
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      try {
        // If we have a location object, use intelligent validation
        if (location) {
          const validatedUrl = await getValidatedImage(location);
          setImageSrc(validatedUrl);
        } else if (src) {
          // Fallback to provided src if no location context
          setImageSrc(src);
        } else {
          // No image available, use fallback
          const fallback = location ? getFallbackImage(location) : null;
          setImageSrc(fallback);
          if (!fallback) {
            setImageError(true);
          }
        }
      } catch (error) {
        console.error('Error loading image:', error);
        // Try to use fallback
        if (location) {
          const fallback = getFallbackImage(location);
          setImageSrc(fallback);
        } else {
          setImageError(true);
        }
      }
    };

    loadImage();
  }, [isInView, src, location]);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    
    // Try fallback if we have location context
    if (location && imageSrc !== getFallbackImage(location)) {
      const fallback = getFallbackImage(location);
      setImageSrc(fallback);
      setImageError(false); // Reset error to try fallback
    } else {
      setImageError(true);
      if (onImageError) {
        onImageError();
      }
    }
  };

  // Render placeholder while not in view
  if (!isInView) {
    return (
      <div 
        id={`lazy-image-${alt}`}
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
        aria-label={alt}
      />
    );
  }

  // Render error state with icon
  if (imageError || !imageSrc) {
    const Icon = fallbackIcon;
    return (
      <div 
        className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}
        aria-label={alt}
      >
        <div className="text-center p-4">
          <Icon 
            size={fallbackIconSize} 
            className={`${uiConfig.colors.muted} mx-auto mb-2`} 
          />
          <p className={`text-xs ${uiConfig.colors.muted}`}>
            {location?.name || alt}
          </p>
          {location?.country && (
            <p className={`text-xs ${uiConfig.colors.hint}`}>
              {location.country}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show skeleton while loading */}
      {!imageLoaded && (
        <div 
          className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse absolute inset-0`}
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {/* Attribution if using fallback */}
      {imageLoaded && location && imageSrc === getFallbackImage(location) && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-tl">
          Generic {location.country} image
        </div>
      )}
    </>
  );
}