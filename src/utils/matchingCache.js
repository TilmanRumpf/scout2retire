// Simple in-memory cache for matching results
const matchCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function getCacheKey(preferences) {
  // Create a deterministic key from preferences
  const key = JSON.stringify({
    budget: preferences.budget,
    climate: preferences.climate,
    lifestyle: preferences.lifestyle,
    administration: preferences.administration
  });
  return key;
}

export function getCachedMatches(preferences) {
  const key = getCacheKey(preferences);
  const cached = matchCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('🎯 Cache hit for matching preferences');
    return cached.data;
  }
  
  return null;
}

export function setCachedMatches(preferences, matches) {
  const key = getCacheKey(preferences);
  matchCache.set(key, {
    data: matches,
    timestamp: Date.now()
  });
  
  // Limit cache size
  if (matchCache.size > 100) {
    const firstKey = matchCache.keys().next().value;
    matchCache.delete(firstKey);
  }
}

export function clearMatchCache() {
  matchCache.clear();
  console.log('🧹 Match cache cleared');
}