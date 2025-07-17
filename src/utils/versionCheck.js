// Version check to force reload when app is updated
const APP_VERSION = '1.0.1'; // Increment this when deploying critical fixes
const VERSION_KEY = 'scout2retire_app_version';

export function checkAppVersion() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  if (storedVersion && storedVersion !== APP_VERSION) {
    // Version mismatch - clear cache and reload
    console.log(`App version changed from ${storedVersion} to ${APP_VERSION}. Reloading...`);
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Update stored version
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    // Force hard reload
    window.location.reload(true);
  } else if (!storedVersion) {
    // First time visitor
    localStorage.setItem(VERSION_KEY, APP_VERSION);
  }
}

// Auto-refresh if page has been open too long (12 hours)
export function setupAutoRefresh() {
  const MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours
  const loadTime = Date.now();
  
  setInterval(() => {
    if (Date.now() - loadTime > MAX_AGE) {
      console.log('Page has been open for 12+ hours. Refreshing to get latest version...');
      window.location.reload(true);
    }
  }, 60 * 60 * 1000); // Check every hour
}