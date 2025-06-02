import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import { getTownOfTheDay, fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';

export default function DailyTownCard() {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          setError("User not found");
          setLoading(false);
          return;
        }
        setUserId(user.id);
        
        // Get town of the day
        const { success, town: dailyTown, error: townError } = await getTownOfTheDay(user.id);
        
        if (!success) {
          setError(townError?.message || "Failed to fetch town of the day");
          setLoading(false);
          return;
        }
        
        // Log detailed town information for debugging
        console.log("Daily Town Data:", {
          id: dailyTown.id,
          idType: typeof dailyTown.id,
          name: dailyTown.name,
          country: dailyTown.country,
          cost: dailyTown.cost_index
        });
        
        setTown(dailyTown);
        
        // Check if this town is favorited
        if (dailyTown) {
          const { success: favSuccess, favorites } = await fetchFavorites(user.id);
          if (favSuccess && favorites) {
            const isTownFavorited = favorites.some(fav => 
              fav.town_id.toLowerCase() === dailyTown.id.toLowerCase()
            );
            setIsFavorited(isTownFavorited);
            console.log(`Town ${dailyTown.name} (${dailyTown.id}) is ${isTownFavorited ? 'favorited' : 'not favorited'}`);
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFavoriteToggle = (newState) => {
    setIsFavorited(newState);
    console.log(`Favorite toggled for ${town?.name}: ${newState ? 'Added' : 'Removed'}`);
  };

  const handleExploreClick = () => {
    if (town) {
      navigate(`/discover?town=${town.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-24 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-8 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !town) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Town of the Day</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {error || "No town available today. Check back tomorrow!"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full">
      <div className="relative h-40">
        {town.image_url_1 ? (
          <img
            src={town.image_url_1}
            alt={town.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {userId && town && (
            <LikeButton 
              townId={town.id} 
              userId={userId} 
              initialState={isFavorited}
              onToggle={handleFavoriteToggle}
            />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{town.name}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{town.country}</span>
        </div>
        
        <div className="flex space-x-2 mb-3">
          {town.cost_index && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded-full">
              ${town.cost_index}/mo
            </span>
          )}
          {town.healthcare_score && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs rounded-full">
              Healthcare: {town.healthcare_score}/10
            </span>
          )}
          {town.safety_score && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs rounded-full">
              Safety: {town.safety_score}/10
            </span>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {town.description || "Discover this beautiful town for your retirement."}
        </p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleExploreClick}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Explore
          </button>
          <a
            href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 text-sm hover:underline"
          >
            View on Map
          </a>
        </div>
      </div>
    </div>
  );
}