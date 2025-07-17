// Utility to clear all Supabase auth data from browser storage
export function clearSupabaseAuthData() {
  console.log('Clearing Supabase auth data...');
  
  // Get all localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Supabase auth keys typically contain 'supabase' or 'sb-'
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all Supabase-related keys
  keysToRemove.forEach(key => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage just in case
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      console.log(`Removing from session: ${key}`);
      sessionStorage.removeItem(key);
    }
  }
  
  console.log(`Cleared ${keysToRemove.length} auth items from storage`);
  
  // Clear any cookies that might exist
  document.cookie.split(";").forEach(function(c) { 
    if (c.includes('supabase') || c.includes('sb-')) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    }
  });
  
  console.log('All Supabase auth data cleared!');
  console.log('Please refresh the page to complete the cleanup.');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.clearSupabaseAuth = clearSupabaseAuthData;
}