// SIMPLE IMAGE COMPONENT - NO FANCY SHIT, JUST SHOW THE IMAGE
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function SimpleImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = MapPin,
  fallbackIconSize = 24 
}) {
  const [hasError, setHasError] = useState(false);
  const FallbackIcon = fallbackIcon;
  
  // Debug logging for image issues
  if (import.meta.env.DEV && src) {
    console.log(`SimpleImage rendering: ${alt} - ${src}`);
  }

  // No image or error? Show icon
  if (!src || hasError) {
    return (
      <div className={`${className} ${uiConfig.colors.input} flex items-center justify-center`}>
        <FallbackIcon size={fallbackIconSize} className={uiConfig.colors.muted} />
      </div>
    );
  }

  // Just show the fucking image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}