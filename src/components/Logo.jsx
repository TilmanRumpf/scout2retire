import React from 'react';
import { useTheme } from '../contexts/useTheme';
import OptimizedImage from './OptimizedImage';
import { useNavigate } from 'react-router-dom';
import { uiConfig } from '../styles/uiConfig';

/**
 * Logo Component - Displays Scout2Retire logo with automatic theme detection
 * 
 * @param {Object} props
 * @param {string} props.variant - 'full' or 'symbol' - determines which logo to show
 * @param {string} props.className - Optional CSS classes for sizing/styling
 * @param {Function} props.onClick - Optional click handler
 * @param {string} props.navigateTo - Optional route to navigate on click
 * @param {boolean} props.showFallbackText - Whether to show text if image fails (default: true)
 * @param {string} props.alt - Alt text for accessibility (default: 'Scout2Retire')
 */
export default function Logo({ 
  variant = 'symbol',
  className = '',
  onClick,
  navigateTo,
  showFallbackText = true,
  alt = 'Scout2Retire'
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Logo URLs from Supabase storage
  const logoUrls = {
    full: {
      light: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/logos/S2R-Regular-Solid.png',
      dark: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/logos/S2R-Light-Solid.png'
    },
    symbol: {
      light: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/logos/S2R-Symbol-Solid.png',
      dark: 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/logos/S2R-Symbol-Light.png'
    }
  };
  
  // Select appropriate logo based on variant and theme
  const logoUrl = logoUrls[variant]?.[theme] || logoUrls.full.light;
  
  // Handle click events
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (navigateTo) {
      e.preventDefault();
      navigate(navigateTo);
    }
  };
  
  // Determine if logo should be clickable
  const isClickable = !!(onClick || navigateTo);
  
  // Fallback text based on variant
  const fallbackText = variant === 'symbol' ? (
    <span className={`font-bold ${className}`}>
      S<span className={uiConfig.colors.accent}>2</span>R
    </span>
  ) : (
    <span className={`font-bold ${className}`}>
      Scout<span className={uiConfig.colors.accent}>2</span>Retire
    </span>
  );
  
  // Logo image component
  const logoImage = (
    <OptimizedImage
      src={logoUrl}
      alt={alt}
      className={`${className} ${isClickable ? 'cursor-pointer' : ''}`}
      lazy={true}
      onError={(e) => {
        // If image fails to load and fallback text is enabled, hide the broken image
        if (showFallbackText) {
          e.target.style.display = 'none';
        }
      }}
    />
  );
  
  // Wrap in button if clickable
  if (isClickable) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center border-0 bg-transparent p-0 ${isClickable ? 'hover:opacity-80 transition-opacity' : ''} focus:outline-none`}
        aria-label={alt}
      >
        {logoImage}
        {showFallbackText && (
          <span className="hidden" aria-hidden="true">
            {fallbackText}
          </span>
        )}
      </button>
    );
  }
  
  // Return just the image if not clickable
  return (
    <div className="inline-flex items-center">
      {logoImage}
      {showFallbackText && (
        <span className="hidden" aria-hidden="true">
          {fallbackText}
        </span>
      )}
    </div>
  );
}