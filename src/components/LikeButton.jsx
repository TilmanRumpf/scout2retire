import { useState } from 'react';
import { toggleFavorite } from '../utils/townUtils';

export default function LikeButton({ townId, userId, initialState = false, onToggle }) {
  const [isLiked, setIsLiked] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const { success, action } = await toggleFavorite(userId, townId);
      if (success) {
        const newLikedState = action === 'added';
        setIsLiked(newLikedState);
        if (onToggle) onToggle(newLikedState);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-400'} transition-colors ${isLoading ? 'opacity-50' : 'hover:text-red-500'}`}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      {isLiked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}