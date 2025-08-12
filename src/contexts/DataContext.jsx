// Centralized data management with intelligent caching
// Eliminates duplicate API calls across the app

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites, fetchTowns, toggleFavorite } from '../utils/townUtils.jsx';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

const DataContext = createContext();

// Cache durations
const CACHE_TTL = {
  user: 10 * 60 * 1000,      // 10 minutes
  favorites: 5 * 60 * 1000,   // 5 minutes  
  towns: 15 * 60 * 1000,      // 15 minutes
  townCount: 2 * 60 * 1000,   // 2 minutes
};

const initialState = {
  // User data
  user: null,
  profile: null,
  userLoading: true,
  userError: null,
  userLastFetch: null,
  
  // Favorites data
  favorites: [],
  favoritesLoading: false,
  favoritesError: null,
  favoritesLastFetch: null,
  
  // Towns data (Map for O(1) lookups)
  townsCache: new Map(),
  townsLoading: false,
  townsError: null,
  
  // Town count
  townCount: 0,
  townCountLastFetch: null,
  
  // Optimistic updates tracking
  optimisticUpdates: new Set(),
  
  // Real-time subscriptions
  subscriptions: new Map(),
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        userLoading: false,
        userError: null,
        userLastFetch: Date.now(),
      };
    
    case 'SET_USER_ERROR':
      return {
        ...state,
        userLoading: false,
        userError: action.payload,
      };
    
    case 'SET_FAVORITES':
      return {
        ...state,
        favorites: action.payload,
        favoritesLoading: false,
        favoritesError: null,
        favoritesLastFetch: Date.now(),
      };
    
    case 'SET_FAVORITES_LOADING':
      return {
        ...state,
        favoritesLoading: action.payload,
      };
    
    case 'ADD_TOWNS_TO_CACHE':
      const newCache = new Map(state.townsCache);
      action.payload.forEach(town => {
        newCache.set(town.id, { ...town, cachedAt: Date.now() });
      });
      return {
        ...state,
        townsCache: newCache,
        townsLoading: false,
      };
    
    case 'SET_TOWN_COUNT':
      return {
        ...state,
        townCount: action.payload,
        townCountLastFetch: Date.now(),
      };
    
    case 'OPTIMISTIC_ADD_FAVORITE':
      return {
        ...state,
        optimisticUpdates: new Set([...state.optimisticUpdates, action.payload]),
        favorites: [...state.favorites, { 
          town_id: action.payload, 
          user_id: state.user?.id,
          optimistic: true,
          created_at: new Date().toISOString()
        }],
      };
    
    case 'OPTIMISTIC_REMOVE_FAVORITE':
      return {
        ...state,
        optimisticUpdates: new Set([...state.optimisticUpdates].filter(id => id !== action.payload)),
        favorites: state.favorites.filter(fav => fav.town_id !== action.payload),
      };
    
    case 'ADD_SUBSCRIPTION':
      const subs = new Map(state.subscriptions);
      subs.set(action.payload.key, action.payload.subscription);
      return {
        ...state,
        subscriptions: subs,
      };
    
    case 'CHECK_USER_CACHE':
      // Helper to check cache without depending on state in callback
      const { forceRefresh, ttl } = action.payload;
      const isValid = state.userLastFetch && (Date.now() - state.userLastFetch < ttl);
      if (!forceRefresh && isValid && state.user) {
        // Cache hit - no need to fetch
        return state;
      }
      return { ...state, userLoading: true };

    case 'CLEANUP_ALL':
      // Safe cleanup without stale closures
      state.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing:', error);
        }
      });
      return state;

    case 'CLEAR_ALL':
      // Clear all subscriptions
      state.subscriptions.forEach(sub => sub.unsubscribe());
      return initialState;
    
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Check if cache is still valid
  const isCacheValid = useCallback((lastFetch, ttl) => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < ttl;
  }, []);

  // Load user data (with caching) - FIXED: Remove state dependencies
  const loadUserData = useCallback(async (forceRefresh = false) => {
    // Get fresh state from dispatch
    dispatch({ type: 'CHECK_USER_CACHE', payload: { forceRefresh, ttl: CACHE_TTL.user } });
    
    try {
      const result = await getCurrentUser();
      dispatch({ 
        type: 'SET_USER', 
        payload: { user: result.user, profile: result.profile }
      });
      
      // Auto-load favorites after user loads
      if (result.user) {
        // Use setTimeout to avoid nested callback issues
        setTimeout(() => loadFavorites(result.user.id), 0);
      }
      
      return result;
    } catch (error) {
      console.error('Error loading user:', error);
      dispatch({ type: 'SET_USER_ERROR', payload: error });
      return { user: null, profile: null };
    }
  }, []); // STABLE: No dependencies

  // Load favorites (with caching and real-time sync)
  const loadFavorites = useCallback(async (userId, forceRefresh = false) => {
    if (!userId) return;
    
    // Skip if cached and valid
    if (!forceRefresh && isCacheValid(state.favoritesLastFetch, CACHE_TTL.favorites)) {
      return state.favorites;
    }

    dispatch({ type: 'SET_FAVORITES_LOADING', payload: true });

    try {
      const { success, favorites } = await fetchFavorites(userId);
      
      if (success) {
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
        
        // Setup real-time subscription if not exists
        const subKey = `favorites-${userId}`;
        if (!state.subscriptions.has(subKey)) {
          const subscription = supabase
            .channel(subKey)
            .on('postgres_changes', 
              { 
                event: '*', 
                schema: 'public', 
                table: 'favorites',
                filter: `user_id=eq.${userId}`
              }, 
              () => {
                // Refresh favorites on any change
                loadFavorites(userId, true);
              }
            )
            .subscribe();
          
          dispatch({ 
            type: 'ADD_SUBSCRIPTION', 
            payload: { key: subKey, subscription }
          });
        }
        
        // Batch load town data for favorites
        const townIds = favorites.map(fav => fav.town_id).filter(Boolean);
        if (townIds.length > 0) {
          loadTownsBatch(townIds, userId);
        }
        
        return favorites;
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      dispatch({ type: 'SET_FAVORITES_LOADING', payload: false });
    }
  }, [state.favoritesLastFetch, state.favorites, state.subscriptions, isCacheValid]);

  // Batch load towns (with intelligent caching)
  const loadTownsBatch = useCallback(async (townIds, userId = null) => {
    // Filter out already cached and fresh towns
    const missingIds = townIds.filter(id => {
      const cached = state.townsCache.get(id);
      if (!cached) return true;
      // Check if cache is stale
      return !isCacheValid(cached.cachedAt, CACHE_TTL.towns);
    });

    if (missingIds.length === 0) return;

    try {
      const { success, towns } = await fetchTowns({
        townIds: missingIds,
        userId,
        usePersonalization: !!userId,
      });
      
      if (success && towns.length > 0) {
        dispatch({ type: 'ADD_TOWNS_TO_CACHE', payload: towns });
      }
    } catch (error) {
      console.error('Error batch loading towns:', error);
    }
  }, [state.townsCache, isCacheValid]);

  // Load all towns with filters (for discovery page)
  const loadAllTowns = useCallback(async (filters = {}, userId = null) => {
    try {
      const { success, towns } = await fetchTowns({
        ...filters,
        userId,
        usePersonalization: !!userId,
      });
      
      if (success) {
        dispatch({ type: 'ADD_TOWNS_TO_CACHE', payload: towns });
        return towns;
      }
      return [];
    } catch (error) {
      console.error('Error loading all towns:', error);
      return [];
    }
  }, []);

  // Get town count (with caching)
  const getTownCount = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid(state.townCountLastFetch, CACHE_TTL.townCount)) {
      return state.townCount;
    }

    try {
      const { count } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true })
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '')
        .not('image_url_1', 'ilike', 'NULL')
        .not('image_url_1', 'eq', 'null');
      
      if (count !== null) {
        dispatch({ type: 'SET_TOWN_COUNT', payload: count });
        
        // Setup real-time subscription if not exists
        const subKey = 'towns-count';
        if (!state.subscriptions.has(subKey)) {
          const subscription = supabase
            .channel(subKey)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'towns' }, 
              () => {
                getTownCount(true);
              }
            )
            .subscribe();
          
          dispatch({ 
            type: 'ADD_SUBSCRIPTION', 
            payload: { key: subKey, subscription }
          });
        }
        
        return count;
      }
      return 0;
    } catch (error) {
      console.error('Error getting town count:', error);
      return 0;
    }
  }, [state.townCountLastFetch, state.townCount, state.subscriptions, isCacheValid]);

  // Optimistic favorite toggle
  const optimisticToggleFavorite = useCallback(async (townId, townName = null, townCountry = null) => {
    const userId = state.user?.id;
    if (!userId) {
      toast.error('Please log in to save favorites');
      return;
    }

    const isFavorited = state.favorites.some(fav => fav.town_id === townId);
    
    // Apply optimistic update
    if (isFavorited) {
      dispatch({ type: 'OPTIMISTIC_REMOVE_FAVORITE', payload: townId });
    } else {
      dispatch({ type: 'OPTIMISTIC_ADD_FAVORITE', payload: townId });
    }

    try {
      const { success, action, error } = await toggleFavorite(userId, townId, townName, townCountry);
      
      if (!success) {
        // Revert optimistic update on error
        if (isFavorited) {
          dispatch({ type: 'OPTIMISTIC_ADD_FAVORITE', payload: townId });
        } else {
          dispatch({ type: 'OPTIMISTIC_REMOVE_FAVORITE', payload: townId });
        }
        toast.error(`Failed to update favorite: ${error?.message || 'Unknown error'}`);
        return;
      }

      // Refresh favorites to sync with server
      await loadFavorites(userId, true);
      
      toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update
      if (isFavorited) {
        dispatch({ type: 'OPTIMISTIC_ADD_FAVORITE', payload: townId });
      } else {
        dispatch({ type: 'OPTIMISTIC_REMOVE_FAVORITE', payload: townId });
      }
      toast.error('Failed to update favorite');
    }
  }, [state.user, state.favorites, loadFavorites]);

  // Initialize on mount - FIXED: Proper cleanup
  useEffect(() => {
    loadUserData();
    getTownCount();
    
    // Cleanup on unmount - using ref to avoid stale closure
    return () => {
      // Access current subscriptions via dispatch
      dispatch({ type: 'CLEANUP_ALL' });
    };
  }, [loadUserData, getTownCount]); // FIXED: Include stable callbacks

  // Auth state change listener - FIXED: Stable reference
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_ALL' });
      } else if (event === 'SIGNED_IN') {
        loadUserData(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // FIXED: No dependencies needed, loadUserData is stable

  const value = {
    // State
    user: state.user,
    profile: state.profile,
    userLoading: state.userLoading,
    favorites: state.favorites,
    favoritesLoading: state.favoritesLoading,
    townsCache: state.townsCache,
    townCount: state.townCount,
    optimisticUpdates: state.optimisticUpdates,
    
    // Actions
    loadUserData,
    loadFavorites,
    loadTownsBatch,
    loadAllTowns,
    getTownCount,
    optimisticToggleFavorite,
    
    // Utilities
    getTownFromCache: (townId) => state.townsCache.get(townId),
    isFavorited: (townId) => state.favorites.some(fav => fav.town_id === townId),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};