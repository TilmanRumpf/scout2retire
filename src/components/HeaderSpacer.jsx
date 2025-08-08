/**
 * HeaderSpacer - Adds spacing for fixed header on all devices
 * This prevents content from going under the fixed header
 * @param {boolean} hasFilters - Whether the header has a second row with filters
 */
export default function HeaderSpacer({ hasFilters = false }) {
  return (
    <div 
      className={hasFilters ? "ios-header-spacer-with-filters" : "ios-header-spacer"}
      aria-hidden="true"
    />
  );
}