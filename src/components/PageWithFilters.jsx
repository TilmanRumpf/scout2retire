import FilterBarV3 from './FilterBarV3';

/**
 * PageWithFilters - Wrapper for pages that need filters below the header
 * Keeps filters separate from header to maintain 44px header height
 */
export default function PageWithFilters({ 
  children, 
  showFilters = false, 
  filterProps = {},
  className = ''
}) {
  return (
    <div className={`min-h-screen ${className}`}>
      {/* Filters below header - desktop only */}
      {showFilters && (
        <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[44px] z-40" 
             style={{ top: 'calc(44px + env(safe-area-inset-top))' }}>
          <div className="max-w-7xl mx-auto px-4 py-2">
            <FilterBarV3 {...filterProps} />
          </div>
        </div>
      )}
      
      {/* Page content */}
      {children}
    </div>
  );
}