import { useState, useEffect } from 'react';
import { toggleFavorite } from '../utils/townUtils.jsx';
import toast from 'react-hot-toast';

export default function LikeButton({ 
  townId, 
  userId, 
  initialState = false, 
  onToggle,
  townName = null,      // Added as optional prop
  townCountry = null    // Added as optional prop
}) {
  const [isLiked, setIsLiked] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update local state if props change
  useEffect(() => {
    setIsLiked(initialState);
    // Reset error state when props change
    setError(null);
  }, [initialState, townId, userId]);

  // Props are tracked for changes

  const handleToggle = async () => {
    // Don't proceed if already loading or missing required data
    if (isLoading) return;
    if (!userId || !townId) {
      console.error("Missing required data for like button:", { userId, townId });
      setError("Missing data");
      toast.error("Unable to update favorites");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure IDs are properly formatted as strings
      const stringUserId = String(userId);
      const stringTownId = String(townId);
      
      console.log(`Toggling like for town ${stringTownId} by user ${stringUserId}. Current state: ${isLiked}`);
      
      // Pass town name and country if available
      const { success, action, error } = await toggleFavorite(
        stringUserId, 
        stringTownId,
        townName,      // Added
        townCountry    // Added
      );
      
      // Process toggle response
      
      if (success) {
        const newLikedState = action === 'added';
        // Update state based on action
        
        // Update local state
        setIsLiked(newLikedState);
        
        // Notify parent component with more detailed information
        if (onToggle) {
          onToggle(newLikedState, action, stringTownId);
        }
        
        // Show success toast
        toast.success(newLikedState ? 'Added to favorites' : 'Removed from favorites');
      } else {
        console.error("Error in toggleFavorite:", error);
        setError(error?.message || "Unknown error");
        toast.error(`Failed to update favorites: ${error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setError(error?.message || "Unknown error");
      toast.error("An error occurred while updating favorites");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a loading indicator if we don't have required data
  if (!userId || !townId) {
    return (
      <button 
        disabled
        className="p-2 rounded-full text-gray-300 dark:text-gray-600 opacity-50"
        aria-label="Favorites not available"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm
        ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'} 
        transition-all ${isLoading ? 'opacity-50' : 'hover:text-red-500 hover:shadow-md'}`}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      title={error ? `Error: ${error}` : (isLiked ? "Remove from favorites" : "Add to favorites")}
    >
      {isLoading ? (
        // Loading spinner
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isLiked ? (
        // Filled heart for liked state
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        // Outline heart for not liked state
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}