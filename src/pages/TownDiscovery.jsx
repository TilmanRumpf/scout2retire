import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTowns, fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import LikeButton from '../components/LikeButton';
import PageErrorBoundary from '../components/PageErrorBoundary';
import QuickNav from '../components/QuickNav';
import TownRadarChart from '../components/TownRadarChart';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import { Sparkles } from 'lucide-react';

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
            console.log("Personalized recommendations loaded!");
            console.log("User preferences:", userPrefs);
            console.log("Top 3 towns with scores:", allTowns.slice(0, 3).map(t => ({
              name: t.name,
              score: t.matchScore,
              reasons: t.matchReasons,
              categoryScores: t.categoryScores
            })));
          } else {
            console.log("Using general recommendations");
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold mb-2`}>
            Finding your perfect matches...
          </div>
          <div className={`text-sm ${uiConfig.colors.hint}`}>
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
    <div className={`min-h-screen ${uiConfig.colors.page} pb-16 md:pb-4`}>
      {/* Header */}
      <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-xl font-bold ${uiConfig.colors.heading}`}>Discover Towns</h1>
              {isPersonalized && onboardingCompleted && (
                <p className={`text-sm ${uiConfig.colors.success} mt-1 flex items-center gap-1`}>
                  <Sparkles size={16} className="text-scout-accent-600" />
                  Personalized recommendations based on your preferences
                </p>
              )}
              {onboardingCompleted && userPreferences && (
                <div className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                  Matching: Budget ${userPreferences.costs?.total_monthly_budget || 'Any'} • 
                  Healthcare {userPreferences.administration?.healthcare_quality?.join('/') || 'Any'} • 
                  {userPreferences.region_preferences?.countries?.length || 0} regions
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <PageErrorBoundary
        fallbackTitle="Discovery Error"
        fallbackMessage="We're having trouble loading town recommendations. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className={`${uiConfig.colors.statusError} border ${uiConfig.colors.borderDanger} p-4 ${uiConfig.layout.radius.lg} mb-6`}>
            {error}
          </div>
        )}

        {/* Personalization Status - Only show if onboarding is NOT completed */}
        {!onboardingCompleted && (
          <div className={`${uiConfig.colors.statusInfo} border ${uiConfig.layout.radius.lg} p-4 mb-6`}>
            <div className="flex items-center">
              <svg className={`${uiConfig.icons.size.md} mr-2`} fill="currentColor" viewBox="0 0 20 20">
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
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className="relative h-64 md:h-80">
                {selectedTownData.image_url_1 ? (
                  <img
                    src={selectedTownData.image_url_1}
                    alt={selectedTownData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${uiConfig.colors.input} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${uiConfig.colors.muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                
                {/* Match Score Badge with Confidence */}
                {selectedTownData.matchScore && (
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className={`px-3 py-1.5 ${uiConfig.layout.radius.full} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
                      selectedTownData.matchScore >= 80 ? 'text-scout-accent-700 dark:text-scout-accent-400' :
                      selectedTownData.matchScore >= 60 ? 'text-gray-700 dark:text-gray-300' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {selectedTownData.matchScore}% Match
                    </div>
                    {selectedTownData.confidence && (
                      <div className={`px-3 py-1 ${uiConfig.layout.radius.full} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm text-xs ${
                        selectedTownData.confidence === 'High' ? 'text-scout-accent-700 dark:text-scout-accent-400' :
                        selectedTownData.confidence === 'Medium' ? 'text-gray-600 dark:text-gray-400' :
                        'text-gray-500 dark:text-gray-500'
                      }`}>
                        {selectedTownData.confidence} Confidence
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className={`text-2xl font-bold ${uiConfig.colors.heading}`}>{selectedTownData.name}</h2>
                    <p className={`text-lg ${uiConfig.colors.body}`}>{selectedTownData.country}</p>
                  </div>
                  <a
                    href={selectedTownData.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(selectedTownData.name + ', ' + selectedTownData.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${uiConfig.colors.success} text-sm hover:underline`}
                  >
                    View on Map
                  </a>
                </div>

                {/* Premium Insights */}
                {selectedTownData.insights && selectedTownData.insights.length > 0 && (
                  <div className={`mb-4 p-3 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.lg}`}>
                    <h4 className={`text-sm font-medium ${uiConfig.colors.heading} mb-2`}>Key Insights</h4>
                    <div className="space-y-1">
                      {selectedTownData.insights.map((insight, index) => (
                        <div key={index} className={`text-sm ${uiConfig.colors.body}`}>
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {selectedTownData.highlights && selectedTownData.highlights.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedTownData.highlights.map((highlight, index) => (
                      <span key={index} className={`px-3 py-1 ${uiConfig.colors.badge} text-xs ${uiConfig.layout.radius.full} font-medium`}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                {/* Match Reasons */}
                {selectedTownData.matchReasons && selectedTownData.matchReasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>Why this matches you:</h4>
                    <div className="space-y-1">
                      {selectedTownData.matchReasons.map((reason, index) => (
                        <div key={index} className={`flex items-center text-sm ${uiConfig.colors.success}`}>
                          <svg className={`${uiConfig.icons.size.sm} mr-2 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {reason}
                        </div>
                      ))}
                    </div>
                    {selectedTownData.warnings && selectedTownData.warnings.length > 0 && (
                      <div className="mt-3 p-3 ${uiConfig.colors.statusWarning} ${uiConfig.layout.radius.md}">
                        <h5 className={`text-xs font-medium ${uiConfig.colors.heading} mb-1`}>Considerations:</h5>
                        <div className="space-y-1">
                          {selectedTownData.warnings.map((warning, index) => (
                            <div key={index} className={`text-sm ${uiConfig.colors.body}`}>
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Category Match Breakdown */}
                {selectedTownData.categoryScores && (
                  <div className={`mb-4 p-3 ${uiConfig.colors.page} ${uiConfig.layout.radius.lg}`}>
                    <h4 className={`text-sm font-medium ${uiConfig.colors.body} mb-3`}>Match Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedTownData.categoryScores).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className={`text-xs ${uiConfig.colors.hint} capitalize`}>{category}</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-24 h-2 ${uiConfig.progress.track} ${uiConfig.layout.radius.full} overflow-hidden`}>
                              <div 
                                className={`h-full ${uiConfig.animation.transition} ${
                                  score >= 80 ? uiConfig.progress.high :
                                  score >= 60 ? uiConfig.progress.medium :
                                  uiConfig.progress.low
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              score >= 80 ? uiConfig.colors.success :
                              score >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                              uiConfig.colors.statusWarning.split(' ')[1]
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
                    <span className={`px-3 py-1 ${uiConfig.colors.statusSuccess} text-sm ${uiConfig.layout.radius.full}`}>
                      ${selectedTownData.cost_index}/mo
                    </span>
                  )}
                  {selectedTownData.healthcare_score && (
                    <span className={`px-3 py-1 ${uiConfig.colors.statusInfo} text-sm ${uiConfig.layout.radius.full}`}>
                      Healthcare: {selectedTownData.healthcare_score}/10
                    </span>
                  )}
                  {selectedTownData.safety_score && (
                    <span className={`px-3 py-1 ${uiConfig.colors.badge} text-sm ${uiConfig.layout.radius.full}`}>
                      Safety: {selectedTownData.safety_score}/10
                    </span>
                  )}
                </div>

                <p className={`${uiConfig.colors.body} mb-6`}>
                  {selectedTownData.description || "No description available for this town."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>Town Profile</h3>
                    <div className="h-64">
                      <TownRadarChart townData={selectedTownData} />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>Key Information</h3>
                    <div className="space-y-3">
                      {selectedTownData.population && (
                        <div>
                          <span className={`font-medium ${uiConfig.colors.body}`}>Population: </span>
                          <span className={`${uiConfig.colors.hint}`}>{selectedTownData.population.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedTownData.climate && (
                        <div>
                          <span className={`font-medium ${uiConfig.colors.body}`}>Climate: </span>
                          <span className={`${uiConfig.colors.hint}`}>{selectedTownData.climate}</span>
                        </div>
                      )}
                      {selectedTownData.expat_population && (
                        <div>
                          <span className={`font-medium ${uiConfig.colors.body}`}>Expat Community: </span>
                          <span className={`${uiConfig.colors.hint}`}>{selectedTownData.expat_population}</span>
                        </div>
                      )}
                      {selectedTownData.healthcare_description && (
                        <div>
                          <span className={`font-medium ${uiConfig.colors.body}`}>Healthcare: </span>
                          <span className={`${uiConfig.colors.hint}`}>{selectedTownData.healthcare_description}</span>
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
              className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden ${uiConfig.animation.transition} hover:${uiConfig.layout.shadow.lg} ${
                selectedTownData && String(town.id) === String(selectedTownData.id) ? `ring-2 ${uiConfig.colors.borderActive}` : ''
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
                  <div className={`w-full h-full ${uiConfig.colors.input} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${uiConfig.colors.muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                
                {/* Match Score with Value Rating */}
                {town.matchScore && (
                  <div className="absolute top-2 left-2">
                    <div className={`px-2 py-1 ${uiConfig.layout.radius.full} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm text-xs font-medium ${
                      town.matchScore >= 80 ? 'text-scout-accent-700 dark:text-scout-accent-400' :
                      town.matchScore >= 60 ? 'text-gray-700 dark:text-gray-300' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {town.matchScore}%
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
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>{town.name}</h3>
                  <span className={`text-sm ${uiConfig.colors.hint}`}>{town.country}</span>
                </div>
                
                {/* Premium Insights or Match Reasons */}
                {town.insights && town.insights.length > 0 ? (
                  <div className="mb-3">
                    <div className={`text-xs ${uiConfig.colors.accent} font-medium line-clamp-2`}>
                      {town.insights[0]}
                    </div>
                  </div>
                ) : town.matchReasons && town.matchReasons.length > 0 ? (
                  <div className="mb-3 space-y-1">
                    {town.matchReasons.slice(0, 2).map((reason, index) => (
                      <div key={index} className={`text-xs ${uiConfig.colors.success} line-clamp-1`}>
                        {reason}
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {/* Highlights */}
                {town.highlights && town.highlights.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {town.highlights.slice(0, 2).map((highlight, index) => (
                      <span key={index} className={`px-2 py-0.5 ${uiConfig.colors.badge} text-[10px] ${uiConfig.layout.radius.full}`}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Category Scores Grid - All 6 Onboarding Categories */}
                {town.categoryScores && (
                  <div className="mb-3 grid grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 text-xs">
                    {/* These will flow top-to-bottom (2 rows), then right (3 columns) */}
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Region</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.region || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Climate</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.climate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Culture</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.culture || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Hobbies</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.hobbies || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Admin</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.administration || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`${uiConfig.colors.hint} capitalize`}>Budget</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{town.categoryScores.budget || 0}%</span>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2 mb-3">
                  {town.cost_index && (
                    <span className={`px-2 py-1 ${uiConfig.colors.statusSuccess} text-xs ${uiConfig.layout.radius.full}`}>
                      ${town.cost_index}/mo
                    </span>
                  )}
                  {town.healthcare_score && (
                    <span className={`px-2 py-1 ${uiConfig.colors.statusInfo} text-xs ${uiConfig.layout.radius.full}`}>
                      Healthcare: {town.healthcare_score}/10
                    </span>
                  )}
                </div>
                
                <p className={`${uiConfig.colors.body} text-sm mb-4 line-clamp-2`}>
                  {town.description || "Discover this beautiful town for your retirement."}
                </p>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/discover?town=${town.id}`)}
                    className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md}`}
                  >
                    Explore
                  </button>
                  <button
                    onClick={() => {
                      const others = favorites.filter(f => String(f.town_id) !== String(town.id))
                                           .map(f => f.town_id);
                      navigate(`/compare?towns=${[...others, town.id].slice(0, 3).join(',')}`);
                    }}
                    className={`px-3 py-1 text-sm ${uiConfig.colors.success} hover:underline`}
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </main>
      </PageErrorBoundary>

      {/* Bottom Navigation (Mobile) */}
      <QuickNav />
    </div>
  );
}