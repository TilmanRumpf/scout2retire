// Temporary API call logger to identify duplicates
// DELETE THIS FILE after optimization

window.API_CALLS = [];
window.API_CALL_SUMMARY = {};

export function logAPICall(table, operation, component) {
  const call = {
    time: Date.now(),
    table,
    operation,
    component,
    timestamp: new Date().toISOString()
  };
  
  window.API_CALLS.push(call);
  
  // Track duplicates
  const key = `${table}-${operation}`;
  if (!window.API_CALL_SUMMARY[key]) {
    window.API_CALL_SUMMARY[key] = { count: 0, components: [] };
  }
  window.API_CALL_SUMMARY[key].count++;
  if (!window.API_CALL_SUMMARY[key].components.includes(component)) {
    window.API_CALL_SUMMARY[key].components.push(component);
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`🔵 API: ${table}.${operation} from ${component}`);
  }
}

// Helper to show duplicates
window.showAPIDuplicates = () => {
  console.log('=== API CALL SUMMARY ===');
  Object.entries(window.API_CALL_SUMMARY).forEach(([key, data]) => {
    if (data.count > 1) {
      console.log(`❌ ${key}: ${data.count} calls from`, data.components);
    } else {
      console.log(`✅ ${key}: ${data.count} call from`, data.components);
    }
  });
  console.log('Total calls:', window.API_CALLS.length);
};

// Reset tracking
window.resetAPITracking = () => {
  window.API_CALLS = [];
  window.API_CALL_SUMMARY = {};
  console.log('API tracking reset');
};

console.log('API Logger loaded. Use window.showAPIDuplicates() to see summary');