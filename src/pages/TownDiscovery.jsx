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
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
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
        
        // Get current user and their profile
        const { user, profile } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        setUserId(user.id);
        
        // Check onboarding status from the profile
        setOnboardingCompleted(profile?.onboarding_completed || false);

        // Get user's favorites
        const { success: favSuccess, favorites: userFavorites } = await fetchFavorites(user.id);
        if (favSuccess) {
          console.log("Loaded favorites:", userFavorites.length);
          setFavorites(userFavorites);
        }

        // Fetch towns with personalization
        const { 
          success: townSuccess, 
          towns: allTowns, 
          isPersonalized: isPersonalizedResult,
          userPreferences: userPrefs
        } = await fetchTowns({ 
          limit: 20, 
          userId: user.id 
        });

        if (townSuccess) {
          setTowns(allTowns);
          setIsPersonalized(isPersonalizedResult);
          setUserPreferences(userPrefs); // Store the user preferences
          
          // Log personalization status
          if (isPersonalizedResult) {
            console.log("✅ Personalized recommendations loaded!");
            console.log("User preferences:", userPrefs);
            console.log("Top 3 towns with scores:", allTowns.slice(0, 3).map(t => ({
              name: t.name,
              score: t.matchScore,
              reasons: t.matchReasons,
              categoryScores: t.categoryScores
            })));
          } else {
            console.log("ℹ️ Using general recommendations");
          }
          
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
        <div className="text-center">
          <div className="animate-pulse text-green-600 font-semibold mb-2">
            Finding your perfect matches...
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Analyzing your preferences
          </div>
        </div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Discover Towns</h1>
              {isPersonalized && onboardingCompleted && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✨ Personalized recommendations based on your preferences
                </p>
              )}
              {onboardingCompleted && userPreferences && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Matching: Budget ${userPreferences.costs?.total_monthly_budget || 'Any'} • 
                  Healthcare {userPreferences.administration?.healthcare_quality?.join('/') || 'Any'} • 
                  {userPreferences.region_preferences?.countries?.length || 0} regions
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Personalization Status - Only show if onboarding is NOT completed */}
        {!onboardingCompleted && (
          <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                Complete your onboarding to get personalized recommendations!{' '}
                <button 
                  onClick={() => navigate('/onboarding/status')}
                  className="underline hover:no-underline font-medium"
                >
                  Start here
                </button>
              </span>
            </div>
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
                
                {/* Match Score Badge with Details */}
                {selectedTownData.matchScore && (
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTownData.matchScore >= 80 ? 'bg-green-600 text-white' :
                      selectedTownData.matchScore >= 60 ? 'bg-yellow-600 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      {selectedTownData.matchScore}% match
                    </div>
                  </div>
                )}
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

                {/* Match Reasons */}
                {selectedTownData.matchReasons && selectedTownData.matchReasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why this matches you:</h4>
                    <div className="space-y-1">
                      {selectedTownData.matchReasons.map((reason, index) => (
                        <div key={index} className="flex items-center text-sm text-green-700 dark:text-green-300">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {reason}
                        </div>
                      ))}
                    </div>
                    {selectedTownData.warnings && selectedTownData.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedTownData.warnings.map((warning, index) => (
                          <div key={index} className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Category Match Breakdown */}
                {selectedTownData.categoryScores && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Match Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedTownData.categoryScores).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              score >= 80 ? 'text-green-600 dark:text-green-400' :
                              score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-orange-600 dark:text-orange-400'
                            }`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
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
                
                {/* Match Score with Category Breakdown */}
                {town.matchScore && (
                  <div className="absolute top-2 left-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      town.matchScore >= 80 ? 'bg-green-600 text-white' :
                      town.matchScore >= 60 ? 'bg-yellow-600 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      {town.matchScore}% match
                    </div>
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
                
                {/* Match Reasons & Warnings */}
                {town.matchReasons && town.matchReasons.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {town.matchReasons.slice(0, 2).map((reason, index) => (
                      <div key={index} className="text-xs text-green-700 dark:text-green-300 line-clamp-1">
                        {reason}
                      </div>
                    ))}
                    {town.warnings && town.warnings.length > 0 && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 line-clamp-1">
                        {town.warnings[0]}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Category Scores Mini-Visualization */}
                {town.categoryScores && (
                  <div className="mb-3 flex gap-1 flex-wrap">
                    {Object.entries(town.categoryScores).slice(0, 4).map(([category, score]) => (
                      <div key={category} className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 capitalize">{category}:</span>
                        <div className="w-8 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
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