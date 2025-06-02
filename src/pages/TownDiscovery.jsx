import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTowns, fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import LikeButton from '../components/LikeButton';
import QuickNav from '../components/QuickNav';
import TownRadarChart from '../components/TownRadarChart';
import toast from 'react-hot-toast';

export default function TownDiscovery() {
  const [towns, setTowns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const townId = params.get('town');
    if (townId) {
      setSelectedTown(townId);
    }
  }, [location.search]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        setUserId(user.id);

        // Get user's favorites
        const { success: favSuccess, favorites: userFavorites } = await fetchFavorites(user.id);
        if (favSuccess) {
          console.log("Loaded favorites:", userFavorites.length);
          setFavorites(userFavorites);
        }

        // Fetch towns
        const { success: townSuccess, towns: allTowns } = await fetchTowns({ limit: 20 });
        if (townSuccess) {
          setTowns(allTowns);
          
          // If a town is selected in URL, make sure it's in our data
          if (selectedTown) {
            const found = allTowns.find(t => String(t.id) === String(selectedTown));
            if (!found) {
              // Fetch the specific town if not in main list
              const { success: singleSuccess, towns: singleTown } = 
                await fetchTowns({ townIds: [selectedTown] });
              if (singleSuccess && singleTown.length > 0) {
                setTowns(prev => [...prev, singleTown[0]]);
              }
            }
          }
        } else {
          setError("Failed to load towns");
        }
      } catch (err) {
        console.error("Error loading town discovery data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, selectedTown]);

  // Check if a town is favorited
  const isFavorited = (townId) => {
    return favorites.some(fav => String(fav.town_id) === String(townId));
  };

  // IMPORTANT: Remove toast calls from here since they're handled in the LikeButton component
  const handleLikeToggle = (isLiked, action, townId) => {
    console.log(`Town ${townId} ${action}`);
    
    // Update local favorites state without showing toasts
    if (action === 'added') {
      const town = towns.find(t => String(t.id) === String(townId));
      if (town) {
        setFavorites(prev => [...prev, {
          user_id: userId,
          town_id: townId,
          towns: town,
          created_at: new Date().toISOString()
        }]);
      }
    } else {
      setFavorites(prev => prev.filter(fav => String(fav.town_id) !== String(townId)));
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading towns...</div>
      </div>
    );
  }

  // Get selected town data
  const getSelectedTownData = () => {
    if (!selectedTown) return null;
    return towns.find(town => String(town.id) === String(selectedTown));
  };

  const selectedTownData = getSelectedTownData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Discover Towns</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Selected town detail */}
        {selectedTownData && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 md:h-80">
                {selectedTownData.image_url_1 ? (
                  <img
                    src={selectedTownData.image_url_1}
                    alt={selectedTownData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {userId && (
                    <LikeButton
                      townId={selectedTownData.id}
                      userId={userId}
                      initialState={isFavorited(selectedTownData.id)}
                      onToggle={handleLikeToggle}
                    />
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedTownData.name}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{selectedTownData.country}</p>
                  </div>
                  <a
                    href={selectedTownData.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(selectedTownData.name + ', ' + selectedTownData.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 text-sm hover:underline"
                  >
                    View on Map
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTownData.cost_index && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-sm rounded-full">
                      ${selectedTownData.cost_index}/mo
                    </span>
                  )}
                  {selectedTownData.healthcare_score && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-sm rounded-full">
                      Healthcare: {selectedTownData.healthcare_score}/10
                    </span>
                  )}
                  {selectedTownData.safety_score && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-sm rounded-full">
                      Safety: {selectedTownData.safety_score}/10
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedTownData.description || "No description available for this town."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Town Profile</h3>
                    <div className="h-64">
                      <TownRadarChart townData={selectedTownData} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Key Information</h3>
                    <div className="space-y-3">
                      {selectedTownData.population && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Population: </span>
                          <span className="text-gray-600 dark:text-gray-400">{selectedTownData.population.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedTownData.climate && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Climate: </span>
                          <span className="text-gray-600 dark:text-gray-400">{selectedTownData.climate}</span>
                        </div>
                      )}
                      {selectedTownData.expat_population && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Expat Community: </span>
                          <span className="text-gray-600 dark:text-gray-400">{selectedTownData.expat_population}</span>
                        </div>
                      )}
                      {selectedTownData.healthcare_description && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Healthcare: </span>
                          <span className="text-gray-600 dark:text-gray-400">{selectedTownData.healthcare_description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Town grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {towns.map((town) => (
            <div
              key={town.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
                selectedTownData && String(town.id) === String(selectedTownData.id) ? 'ring-2 ring-green-500' : ''
              }`}
            >
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
                  {userId && (
                    <LikeButton
                      townId={town.id}
                      userId={userId}
                      initialState={isFavorited(town.id)}
                      onToggle={handleLikeToggle}
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
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {town.description || "Discover this beautiful town for your retirement."}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/discover?town=${town.id}`)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    Explore
                  </button>
                  <button
                    onClick={() => {
                      const others = favorites.filter(f => String(f.town_id) !== String(town.id))
                                           .map(f => f.town_id);
                      navigate(`/compare?towns=${[...others, town.id].slice(0, 3).join(',')}`);
                    }}
                    className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <QuickNav />
    </div>
  );
}