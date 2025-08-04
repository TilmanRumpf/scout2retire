/**
 * HeaderSpacer - Adds spacing for fixed header on all devices
 * This prevents content from going under the fixed header
 */
export default function HeaderSpacer() {
  return (
    <div 
      className="ios-header-spacer"
      aria-hidden="true"
    />
  );
}