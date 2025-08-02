// src/components/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

/**
 * Standardized page header component
 * Created: 02AUG25
 * Ensures consistent header height and prevents content overlap
 */
export default function PageHeader({ 
  title, 
  showBack = false, 
  backPath = '/', 
  rightAction = null,
  variant = 'mobile' // mobile, desktop, withSearch, compact
}) {
  return (
    <>
      {/* Sticky header */}
      <header className={uiConfig.header.styles.container}>
        <div className={`${uiConfig.header.styles.innerContainer} ${uiConfig.header.heights[variant]}`}>
          <div className={showBack || rightAction ? uiConfig.header.styles.withBackButton : ''}>
            {/* Left side - Back button or title */}
            <div className="flex items-center">
              {showBack && (
                <Link 
                  to={backPath} 
                  className={uiConfig.header.styles.backButton}
                  aria-label="Go back"
                >
                  <ChevronLeft size={24} />
                </Link>
              )}
              <h1 className={uiConfig.header.styles.title}>{title}</h1>
            </div>
            
            {/* Right side - Optional action */}
            {rightAction && (
              <div className={uiConfig.header.styles.actionButton}>
                {rightAction}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Spacer div to push content down */}
      {/* This ensures content isn't hidden under the sticky header */}
      <div className={uiConfig.header.heights[variant]} aria-hidden="true" />
    </>
  );
}