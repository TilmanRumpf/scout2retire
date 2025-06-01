import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, toggleFavorite } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import LikeButton from '../components/LikeButton';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [selectedTowns, setSelectedTowns] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  
  const navigate = useNavigate();

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        setUserId(user.id);
        
        // Fetch user's favorites
        const { success, favorites: userFavorites, error: fetchError } = await fetchFavorites(user.id);
        
        if (!success) {
          setError(fetchError?.message || "Failed to load favorites");
          setLoading(false);
          return;
        }
        
        setFavorites(userFavorites);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [navigate]);
  
  // Handle toggling a favorite
  const handleToggleFavorite = async (townId) => {
    if (!userId) return;
    
    try {
      const { success, action, error: toggleError } = await toggleFavorite(userId, townId);
      
      if (!success) {
        toast.error(`Failed to update favorites: ${toggleError.message}`);
        return;
      }
      
      if (action === 'removed') {
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.town_id !== townId));
        setSelectedTowns(prev => prev.filter(id => id !== townId));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites");
    }
  };
  
  // Handle selection for comparison
  const handleSelectTown = (townId) => {
    if (selectedTowns.includes(townId)) {
      // Deselect town
      setSelectedTowns(prev => prev.filter(id => id !== townId));
    } else {
      // Select town, but limit to 3 towns
      if (selectedTowns.length < 3) {
        setSelectedTowns(prev => [...prev, townId]);
      } else {
        toast.error('You can only compare up to 3 towns at once');
      }
    }
  };
  
  // Navigate to comparison page
  const handleCompare = () => {
    if (selectedTowns.length > 0) {
      navigate(`/compare?towns=${selectedTowns.join(',')}`);
    } else {
      toast.error('Please select at least one town to compare');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Your Favorites
            </h1>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {compareMode ? 'Exit Selection' : 'Select to Compare'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* No favorites message */}
        {favorites.length === 0 && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
              You haven't saved any favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explore towns and add them to your favorites to see them here.
            </p>
            <Link
              to="/discover"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Discover Towns
            </Link>
          </div>
        )}
        
        {/* Compare mode bar */}
        {compareMode && favorites.length > 0 && (
          <div className="sticky top-0 z-10 bg-green-600 dark:bg-green-700 text-white p-4 rounded-lg mb-6 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{selectedTowns.length} of 3</span> towns selected
              </div>
              <button
                onClick={handleCompare}
                disabled={selectedTowns.length === 0}
                className="px-4 py-2 bg-white text-green-600 font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare Selected
              </button>
            </div>
          </div>
        )}
        
        {/* Favorites grid */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const town = favorite.towns;
              const isSelected = selectedTowns.includes(town.id);
              
              return (
                <div 
                  key={town.id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
                    compareMode && isSelected ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
                  }`}
                  onClick={compareMode ? () => handleSelectTown(town.id) : undefined}
                  role={compareMode ? "button" : undefined}
                  tabIndex={compareMode ? 0 : undefined}
                >
                  {/* Town image */}
                  <div className="relative h-48">
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
                    
                    {/* Like button */}
                    {userId && !compareMode && (
                      <div className="absolute top-2 right-2">
                        <LikeButton
                          townId={town.id}
                          userId={userId}
                          initialState={true}
                          onToggle={() => handleToggleFavorite(town.id)}
                        />
                      </div>
                    )}
                    
                    {/* Compare checkbox */}
                    {compareMode && (
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Match percentage */}
                    {town.match_percentage && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {town.match_percentage}% Match
                      </div>
                    )}
                  </div>
                  
                  {/* Town details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {town.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {town.country}
                        </p>
                      </div>
                      {!compareMode && (
                        <a
                          href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 dark:text-green-400 text-sm hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {town.cost_index && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                          ${town.cost_index}/mo
                        </span>
                      )}
                      {town.healthcare_score && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          Healthcare: {town.healthcare_score}/10
                        </span>
                      )}
                      {town.safety_score && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          Safety: {town.safety_score}/10
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {town.description || "No description available."}
                    </p>
                    
                    {!compareMode && (
                      <div className="flex gap-2">
                        <Link
                          to={`/discover?town=${town.id}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-md transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/chat/${town.id}`}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-center py-2 rounded-md transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Town Chat
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
    </div>
  );
}