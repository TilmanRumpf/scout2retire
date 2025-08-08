/**
 * HeaderSpacer - Adds spacing for fixed header on all devices
 * This prevents content from going under the fixed header
 * @param {boolean} hasFilters - Whether the header has a second row (desktop or both)
 * @param {boolean} hasMobileSecondRow - Whether mobile specifically has a second row (defaults to hasFilters for backward compatibility)
 */
export default function HeaderSpacer({ hasFilters = false, hasMobileSecondRow = null }) {
  // For backward compatibility, if hasMobileSecondRow is not specified, use hasFilters
  const mobileHasSecondRow = hasMobileSecondRow !== null ? hasMobileSecondRow : hasFilters;
  
  // Determine the appropriate class based on screen size
  const getClassName = () => {
    if (!hasFilters) {
      return "ios-header-spacer"; // Basic spacing, no second row
    }
    
    // Build responsive classes
    const classes = [];
    
    // Mobile classes
    if (mobileHasSecondRow) {
      classes.push("ios-header-spacer-mobile-second-row");
    } else {
      classes.push("ios-header-spacer-mobile-no-second-row");
    }
    
    // Desktop class (always use the full spacing if hasFilters is true)
    classes.push("md:ios-header-spacer-with-filters");
    
    return classes.join(" ");
  };
  
  return (
    <div 
      className={getClassName()}
      aria-hidden="true"
    />
  );
}