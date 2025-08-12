// Optimized hooks for accessing cached data
// Replaces direct API calls with intelligent caching

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../contexts/DataContext';

// Hook for current user (replaces getCurrentUser calls) - FIXED
export const useCurrentUser = () => {
  const { user, profile, userLoading, loadUserData } = useData();
  
  // Auto-load on mount if needed
  useEffect(() => {
    if (!user && !userLoading) {
      loadUserData();
    }
  }, []); // Empty deps to only run once on mount
  
  return {
    user,
    profile,
    loading: userLoading,
    isAuthenticated: !!user,
    refresh: () => loadUserData(true),
  };
};

// Hook for favorites (replaces fetchFavorites calls)
export const useFavorites = () => {
  const { 
    favorites, 
    favoritesLoading, 
    optimisticUpdates,
    optimisticToggleFavorite,
    isFavorited,
    user 
  } = useData();
  
  return {
    favorites,
    loading: favoritesLoading,
    hasPendingUpdates: optimisticUpdates.size > 0,
    toggleFavorite: optimisticToggleFavorite,
    isFavorited,
    count: favorites.length,
  };
};

// Hook for individual town data
export const useTown = (townId) => {
  const { getTownFromCache, loadTownsBatch, user } = useData();
  const [loading, setLoading] = useState(false);
  
  const town = useMemo(() => {
    return getTownFromCache(townId);
  }, [townId, getTownFromCache]);
  
  useEffect(() => {
    if (townId && !town) {
      setLoading(true);
      loadTownsBatch([townId], user?.id).finally(() => {
        setLoading(false);
      });
    }
  }, [townId, town, loadTownsBatch, user]);
  
  return {
    town,
    loading,
  };
};

// Hook for multiple towns
export const useTowns = (townIds = []) => {
  const { townsCache, loadTownsBatch, user } = useData();
  const [loading, setLoading] = useState(false);
  
  const towns = useMemo(() => {
    if (!townIds || townIds.length === 0) return [];
    return townIds
      .map(id => townsCache.get(id))
      .filter(Boolean);
  }, [townIds, townsCache]);
  
  const missingIds = useMemo(() => {
    if (!townIds) return [];
    return townIds.filter(id => !townsCache.has(id));
  }, [townIds, townsCache]);
  
  useEffect(() => {
    if (missingIds.length > 0) {
      setLoading(true);
      loadTownsBatch(missingIds, user?.id).finally(() => {
        setLoading(false);
      });
    }
  }, [missingIds.length, loadTownsBatch, user?.id]); // FIXED: Use length instead of join
  
  return {
    towns,
    loading,
    found: towns.length,
    requested: townIds.length,
  };
};

// Hook for all towns with filters (discovery page)
export const useAllTowns = (filters = {}) => {
  const { loadAllTowns, townsCache, user } = useData();
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create stable filter key
  const filterKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);
  
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await loadAllTowns(filters, user?.id);
        if (!cancelled) {
          setTowns(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('Error loading towns:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    load();
    
    return () => {
      cancelled = true;
    };
  }, [filterKey, loadAllTowns, user]);
  
  return {
    towns,
    loading,
    error,
    count: towns.length,
  };
};

// Hook for town count
export const useTownCount = () => {
  const { townCount, getTownCount } = useData();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (townCount === 0) {
      setLoading(true);
      getTownCount().finally(() => {
        setLoading(false);
      });
    }
  }, [townCount, getTownCount]);
  
  return {
    count: townCount,
    loading,
    refresh: () => getTownCount(true),
  };
};

// Hook for favorite towns (combines favorites with full town data)
export const useFavoriteTowns = () => {
  const { favorites } = useFavorites();
  const townIds = useMemo(() => {
    return favorites.map(fav => fav.town_id).filter(Boolean);
  }, [favorites]);
  
  const { towns, loading } = useTowns(townIds);
  
  return {
    favoriteTowns: towns,
    loading,
    count: towns.length,
  };
};

// Hook for checking if user can perform actions
export const useUserCapabilities = () => {
  const { user, profile } = useCurrentUser();
  
  return {
    canFavorite: !!user,
    canCompare: !!user && profile?.onboarding_completed,
    isOnboarded: profile?.onboarding_completed || false,
    isPremium: profile?.subscription_status === 'premium',
  };
};

// Performance monitoring hook
export const useDataPerformance = () => {
  const { townsCache, favorites } = useData();
  const [stats, setStats] = useState({
    cacheSize: 0,
    favoritesCount: 0,
    cacheHitRate: 0,
  });
  
  useEffect(() => {
    const cacheSize = townsCache.size;
    const favoritesCount = favorites.length;
    
    // Track cache performance in development - DISABLED to prevent flashing
    // if (process.env.NODE_ENV === 'development') {
    //   const performance = window.performance || {};
    //   const entries = performance.getEntriesByType?.('resource') || [];
    //   const apiCalls = entries.filter(e => e.name.includes('supabase'));
    //   
    //   console.log('Data Cache Performance:', {
    //     cacheSize,
    //     favoritesCount,
    //     apiCallsThisSession: apiCalls.length,
    //     averageResponseTime: apiCalls.reduce((sum, e) => sum + e.duration, 0) / apiCalls.length || 0,
    //   });
    // }
    
    setStats({
      cacheSize,
      favoritesCount,
      cacheHitRate: cacheSize > 0 ? (cacheSize / (cacheSize + 10)) * 100 : 0,
    });
  }, [townsCache.size, favorites.length]); // Use primitive values as deps
  
  return stats;
};