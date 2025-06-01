import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTowns, toggleFavorite, fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import LikeButton from '../components/LikeButton';
import TownRadarChart from '../components/TownRadarChart';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';

export default function TownDiscovery() {
  const [towns, setTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the town ID from URL query parameters
  const getTownIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('town');
  };
  
  // Load town data and check if it's a details view
  useEffect(() => {
    // Reset state when URL changes to ensure fresh data loading
    setSelectedTown(null);
    setLoading(true);
    setError(null);
    
    const loadData = async () => {
      try {
        console.log("Loading data with URL:", location.search);
        
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        setUserId(user.id);
        
        // Load user's favorites
        const { success: favSuccess, favorites: userFavorites } = 
          await fetchFavorites(user.id);
          
        if (favSuccess) {
          setFavorites(userFavorites);
        }
        
        // Check if we're viewing a specific town
        const townId = getTownIdFromUrl();
        console.log("Town ID from URL:", townId);
        
        if (townId) {
          // Fetch the specific town
          console.log("Fetching specific town with ID:", townId);
          const { success, towns: fetchedTowns, error: townError } = 
            await fetchTowns({ townIds: [townId] });
            
          if (!success || fetchedTowns.length === 0) {
            console.error("Error fetching town:", townError);
            setError(townError?.message || "Town not found");
            setLoading(false);
            return;
          }
          
          console.log("Found town:", fetchedTowns[0]);
          // Set the selected town
          setSelectedTown(fetchedTowns[0]);
          
          // Check if it's favorited
          if (favSuccess) {
            setIsFavorited(userFavorites.some(fav => fav.town_id === fetchedTowns[0].id));
          }
        } else {
          // Normal discovery view - load towns with filters
          const { success, towns: fetchedTowns, error: townError } = 
            await fetchTowns({ limit: 12 });
            
          if (!success) {
            setError(townError?.message || "Failed to load towns");
            setLoading(false);
            return;
          }
          
          setTowns(fetchedTowns);
        }
      } catch (err) {
        console.error("Error loading towns:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, location.search]); // Re-run when location.search changes
  
  // Handle favorite toggle
  const handleToggleFavorite = async (townId) => {
    if (!userId) return;
    
    try {
      const { success, action, error: toggleError } = 
        await toggleFavorite(userId, townId);
        
      if (!success) {
        toast.error(`Failed to update favorites: ${toggleError.message}`);
        return;
      }
      
      // Update favorites state
      if (action === 'added') {
        // Refetch the town to get full details for the favorites
        const { success: townSuccess, towns: fetchedTowns } = 
          await fetchTowns({ townIds: [townId] });
          
        if (townSuccess && fetchedTowns.length > 0) {
          setFavorites(prev => [...prev, {
            user_id: userId,
            town_id: townId,
            created_at: new Date().toISOString(),
            towns: fetchedTowns[0]
          }]);
        }
      } else {
        setFavorites(prev => prev.filter(fav => fav.town_id !== townId));
      }
      
      // Update local state for the selected town
      if (selectedTown && selectedTown.id === townId) {
        setIsFavorited(action === 'added');
      }
      
      toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites");
    }
  };
  
  // Handle back button for town details
  const handleBackToDiscovery = () => {
    // Clear selected town and navigate to discovery without parameters
    setSelectedTown(null);
    navigate('/discover', { replace: false });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error}
          </div>
          <button
            onClick={handleBackToDiscovery}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Back to Discovery
          </button>
        </div>
        <QuickNav />
      </div>
    );
  }
  
  // If we have a selected town, show the town details view
  if (selectedTown) {
    // Categories for the tabs
    const categories = [
      { id: 'overview', label: 'Overview' },
      { id: 'climate', label: 'Climate' },
      { id: 'cost', label: 'Cost of Living' },
      { id: 'healthcare', label: 'Healthcare' },
      { id: 'lifestyle', label: 'Lifestyle' },
      { id: 'safety', label: 'Safety' },
      { id: 'infrastructure', label: 'Infrastructure' }
    ];
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-4">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDiscovery}
                  className="mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedTown.name}
                </h1>
              </div>
              
              {/* Category tabs */}
              <div className="flex overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
                      activeTab === category.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Town hero section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative h-64">
              {selectedTown.image_url_1 ? (
                <img
                  src={selectedTown.image_url_1}
                  alt={selectedTown.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
              
              {/* Like button */}
              {userId && (
                <div className="absolute top-4 right-4">
                  <LikeButton
                    townId={selectedTown.id}
                    userId={userId}
                    initialState={isFavorited}
                    onToggle={() => handleToggleFavorite(selectedTown.id)}
                  />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {selectedTown.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedTown.country}
                  </p>
                </div>
                <a
                  href={selectedTown.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(selectedTown.name + ', ' + selectedTown.country)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 flex items-center hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View on Map
                </a>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTown.cost_index && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                    ${selectedTown.cost_index}/mo
                  </span>
                )}
                {selectedTown.healthcare_score && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    Healthcare: {selectedTown.healthcare_score}/10
                  </span>
                )}
                {selectedTown.safety_score && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                    Safety: {selectedTown.safety_score}/10
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedTown.description || "No description available."}
              </p>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate(`/compare?towns=${selectedTown.id}`)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                >
                  Compare with Others
                </button>
                <button
                  onClick={() => navigate(`/chat/${selectedTown.id}`)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Chat About This Town
                </button>
              </div>
            </div>
          </div>
          
          {/* Town data content based on active tab */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column with radar chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Town Profile
              </h3>
              <div className="h-64">
                <TownRadarChart townData={selectedTown} />
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Quick Facts</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedTown.population && (
                    <li>Population: {selectedTown.population.toLocaleString()}</li>
                  )}
                  {selectedTown.expat_population && (
                    <li>Expat Community: {selectedTown.expat_population}</li>
                  )}
                  {selectedTown.nearest_airport && (
                    <li>Nearest Airport: {selectedTown.nearest_airport}</li>
                  )}
                  {selectedTown.avg_temp_summer && selectedTown.avg_temp_winter && (
                    <li>Temperature Range: {selectedTown.avg_temp_winter}°C to {selectedTown.avg_temp_summer}°C</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Right column with detailed content based on tab */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {categories.find(cat => cat.id === activeTab)?.label || 'Information'}
              </h3>
              
              {/* Content changes based on active tab */}
              {activeTab === 'overview' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.description || "No description available."}
                  </p>
                  {selectedTown.cultural_landmark_1 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Cultural Landmarks
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>{selectedTown.cultural_landmark_1}</li>
                        {selectedTown.cultural_landmark_2 && <li>{selectedTown.cultural_landmark_2}</li>}
                        {selectedTown.cultural_landmark_3 && <li>{selectedTown.cultural_landmark_3}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'climate' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.climate_description || "No climate information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTown.avg_temp_summer && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Summer Temperature</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedTown.avg_temp_summer}°C
                        </p>
                      </div>
                    )}
                    {selectedTown.avg_temp_winter && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Winter Temperature</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedTown.avg_temp_winter}°C
                        </p>
                      </div>
                    )}
                    {selectedTown.annual_rainfall && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Annual Rainfall</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedTown.annual_rainfall}mm
                        </p>
                      </div>
                    )}
                    {selectedTown.sunshine_hours && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Daily Sunshine</h4>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {selectedTown.sunshine_hours} hrs
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'cost' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.cost_description || "No cost information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTown.cost_index && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Monthly Budget</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${selectedTown.cost_index}
                        </p>
                      </div>
                    )}
                    {selectedTown.rent_1bed && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">1-Bed Apartment</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${selectedTown.rent_1bed}
                        </p>
                      </div>
                    )}
                    {/* Add more cost metrics here */}
                  </div>
                </div>
              )}
              
              {/* Similar structures for other tabs */}
              {activeTab === 'healthcare' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.healthcare_description || "No healthcare information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTown.healthcare_score && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Healthcare Quality</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedTown.healthcare_score}/10
                        </p>
                      </div>
                    )}
                    {/* Additional healthcare metrics would go here */}
                  </div>
                </div>
              )}
              
              {activeTab === 'lifestyle' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.lifestyle_description || "No lifestyle information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Lifestyle metrics would go here */}
                  </div>
                </div>
              )}
              
              {activeTab === 'safety' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.safety_description || "No safety information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTown.safety_score && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">Safety Rating</h4>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedTown.safety_score}/10
                        </p>
                      </div>
                    )}
                    {/* Additional safety metrics would go here */}
                  </div>
                </div>
              )}
              
              {activeTab === 'infrastructure' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedTown.infrastructure_description || "No infrastructure information available."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Infrastructure metrics would go here */}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional town images */}
          {(selectedTown.image_url_2 || selectedTown.image_url_3) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                More Photos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTown.image_url_2 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={selectedTown.image_url_2}
                      alt={`${selectedTown.name} - additional view`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                {selectedTown.image_url_3 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={selectedTown.image_url_3}
                      alt={`${selectedTown.name} - additional view`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        <QuickNav />
      </div>
    );
  }
  
  // Otherwise, render the discovery view (town list)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-4">
      {/* Header for discovery view */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Discover Towns
          </h1>
          {/* Filter options would go here */}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Town grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {towns.map((town) => (
            <div key={town.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                
                {/* Like button */}
                {userId && (
                  <div className="absolute top-2 right-2">
                    <LikeButton
                      townId={town.id}
                      userId={userId}
                      initialState={favorites.some(fav => fav.town_id === town.id)}
                      onToggle={() => handleToggleFavorite(town.id)}
                    />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {town.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {town.country}
                  </span>
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
                
                <button
                  onClick={() => navigate(`/discover?town=${town.id}`)}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <QuickNav />
    </div>
  );
}