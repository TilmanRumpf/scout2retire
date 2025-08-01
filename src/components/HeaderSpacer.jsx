/**
 * HeaderSpacer - Adds spacing for fixed header on iOS devices only
 * This prevents content from going under the fixed header
 */
export default function HeaderSpacer() {
  return (
    <div 
      className="ios-header-spacer"
      style={{
        /* Default: no spacing for non-iOS devices */
        height: 0,
        /* iOS devices will override this with CSS */
      }}
      aria-hidden="true"
    />
  );
}