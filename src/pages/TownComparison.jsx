import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { getCurrentUser } from '../utils/authUtils';
import TownRadarChart from '../components/TownRadarChart';
import LikeButton from '../components/LikeButton';
import TownImageOverlay from '../components/TownImageOverlay';
import UnifiedHeader from '../components/UnifiedHeader';
import ComparePageSpacer from '../components/ComparePageSpacer';
import SwipeableCompareContent from '../components/SwipeableCompareContent';
import CategoryContent from '../components/TownComparison/CategoryContent';
import { Eye, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function TownComparison() {
  const [towns, setTowns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedTownIds, setSelectedTownIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  // Categories for comparison tabs - Aligned with onboarding steps
  const categories = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'region', label: 'Region', icon: Globe },
    { id: 'climate', label: 'Climate', icon: CloudSun },
    { id: 'culture', label: 'Culture', icon: Users },
    { id: 'hobbies', label: 'Hobbies', icon: SmilePlus },
    { id: 'administration', label: 'Admin', icon: HousePlus },
    { id: 'budget', label: 'Budget', icon: DollarSign }
  ];

  // Load initial data only once
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

        // Get favorites
        const { success: favSuccess, favorites: userFavorites, error: favError } = await fetchFavorites(user.id);
        
        if (!favSuccess) {
          console.error("Error fetching favorites:", favError);
          setError("Failed to load favorites");
          setLoading(false);
          return;
        }

        setFavorites(userFavorites);

        // Parse town IDs from URL
        const params = new URLSearchParams(location.search);
        const townIdsParam = params.get('towns');
        const urlTownIds = townIdsParam ? townIdsParam.split(',') : [];
        
        if (urlTownIds.length > 0) {
          // Set selected town IDs from URL
          setSelectedTownIds(urlTownIds.slice(0, 3)); // Max 3 towns
        } else if (userFavorites.length > 0) {
          // Use top favorites (up to 3) as default selection
          const defaultSelection = userFavorites
            .slice(0, 3)
            .map(fav => fav.town_id);
          setSelectedTownIds(defaultSelection);
        }

      } catch (err) {
        console.error("Error loading comparison data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Only run once on mount

  // Fetch towns when selected IDs change
  useEffect(() => {
    if (!userId || selectedTownIds.length === 0) {
      setTowns([]);
      return;
    }

    const fetchSelectedTowns = async () => {
      try {
        const { success, towns: fetchedTowns, error: townError } = 
          await fetchTowns({ 
            townIds: selectedTownIds,
            userId: userId,
            usePersonalization: true
          });
        
        if (success && fetchedTowns.length > 0) {
          setTowns(fetchedTowns);
        } else {
          console.error("Error fetching selected towns:", townError);
          setTowns([]);
        }
      } catch (err) {
        console.error("Error fetching towns:", err);
        setTowns([]);
      }
    };

    fetchSelectedTowns();
  }, [selectedTownIds, userId]);
  
  // Update URL when selection changes (separate effect to avoid loops)
  useEffect(() => {
    if (selectedTownIds.length > 0) {
      const newUrl = `/compare?towns=${selectedTownIds.join(',')}`;
      // Only update if different from current URL
      if (window.location.pathname + window.location.search !== newUrl) {
        navigate(newUrl, { replace: true });
      }
    } else {
      // Clear URL params if no selection
      if (window.location.search) {
        navigate('/compare', { replace: true });
      }
    }
  }, [selectedTownIds, navigate]);

  // Handle town selection toggle
  const handleTownSelection = (townId) => {
    if (selectedTownIds.includes(townId)) {
      // Deselect town
      setSelectedTownIds(prev => prev.filter(id => id !== townId));
    } else {
      // Select town (max 3)
      if (selectedTownIds.length >= 3) {
        toast.error('Maximum 3 towns can be compared at once. Deselect a town first.');
        return;
      }
      setSelectedTownIds(prev => [...prev, townId]);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (townId) => {
    if (!userId) return;

    try {
      const { success, action, error: toggleError } = await toggleFavorite(userId, townId);
      
      if (!success) {
        toast.error(`Failed to update favorites: ${toggleError.message}`);
        return;
      }

      // Update local favorites state
      if (action === 'added') {
        const { success: townSuccess, towns: fetchedTowns } = await fetchTowns({ 
          townIds: [townId],
          userId: userId,  // Include userId for personalized scores
          usePersonalization: true
        });
        if (townSuccess && fetchedTowns.length > 0) {
          setFavorites(prev => [...prev, {
            user_id: userId,
            town_id: townId,
            created_at: new Date().toISOString(),
            towns: fetchedTowns[0]
          }]);
        }
      } else {
        // Remove from favorites
        setFavorites(prev => prev.filter(fav => fav.town_id !== townId));
        
        // Also remove from comparison
        setTowns(prev => {
          const updatedTowns = prev.filter(town => town.id !== townId);
          
          // Update URL to reflect the change
          const remainingTownIds = updatedTowns.map(t => t.id);
          if (remainingTownIds.length > 0) {
            navigate(`/compare?towns=${remainingTownIds.join(',')}`, { replace: true });
          } else {
            // If no towns left, redirect to favorites
            setTimeout(() => {
              navigate('/favorites');
            }, 1000); // Small delay to show the toast message
          }
          
          return updatedTowns;
        });
      }

      toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites");
    }
  };

  // Helper to check if a town is favorited
  const isFavorited = (townId) => {
    return favorites.some(fav => fav.town_id === townId);
  };

  // Handle removing a town from comparison (same as deselecting)
  const handleRemoveTown = (townId) => {
    setSelectedTownIds(prev => prev.filter(id => id !== townId));
    toast.success('Town removed from comparison');
  };

  // Helper to get the overall rating for a category
  const getCategoryRating = (town, category) => {
    switch (category) {
      case 'climate':
        return town.climate_rating || null;
      case 'cost':
        // Convert cost index to a rating (lower cost = higher rating)
        // Assuming $1000 = 10/10, $5000 = 1/10
        if (town.cost_index) {
          const rating = Math.max(1, Math.min(10, 11 - (town.cost_index / 500)));
          return Math.round(rating);
        }
        return null;
      case 'region':
        return town.categoryScores?.region ? Math.round(town.categoryScores.region / 10) : null;
      case 'culture':
        return town.categoryScores?.culture ? Math.round(town.categoryScores.culture / 10) : null;
      case 'hobbies':
        return town.categoryScores?.hobbies ? Math.round(town.categoryScores.hobbies / 10) : null;
      case 'administration':
        return town.categoryScores?.administration ? Math.round(town.categoryScores.administration / 10) : null;
      case 'budget':
        return town.categoryScores?.budget ? Math.round(town.categoryScores.budget / 10) : null;
      default:
        return null;
    }
  };

  // getCategoryValue function removed - replaced by CategoryContent component
  // Render loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading town comparison...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-16 md:pb-4`}>
      <UnifiedHeader 
        title="Compare Towns"
        tabs={categories.map(category => ({
          id: category.id,
          label: category.label,
          icon: category.icon,
          isActive: activeCategory === category.id,
          onClick: () => setActiveCategory(category.id)
        }))}
      />
      
      {/* Special spacer for Compare page - tabs need extra space on mobile */}
      <ComparePageSpacer />

      <SwipeableCompareContent 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      >
        <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Town Selection Section - Mobile and Desktop */}
        <div className="mb-6">
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Comparing {selectedTownIds.length} of {favorites.length} Favorites
            </span>
          </div>
          
          {/* Favorite towns as selectable bubbles - sorted alphabetically */}
          <div className="flex flex-wrap gap-2">
            {favorites
              .sort((a, b) => {
                const nameA = (a.towns?.name || a.town_name || '').toLowerCase();
                const nameB = (b.towns?.name || b.town_name || '').toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((fav) => {
              const isSelected = selectedTownIds.includes(fav.town_id);
              const town = fav.towns || {};
              
              return (
                <div
                  key={fav.town_id}
                  onClick={() => !isSelected && handleTownSelection(fav.town_id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                      ? 'bg-scout-accent-600 text-white border-2 border-scout-accent-600 shadow-md' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-scout-accent-400 dark:hover:border-scout-accent-500 cursor-pointer'
                  }`}
                  role="button"
                  tabIndex={isSelected ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isSelected) handleTownSelection(fav.town_id);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Deselect' : 'Select'} ${town.name || fav.town_name}`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{town.name || fav.town_name}</span>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTown(fav.town_id);
                      }}
                      className="ml-0.5 text-white/80 hover:text-white transition-colors"
                      aria-label={`Remove ${town.name || fav.town_name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {favorites.length === 0 && (
            <div className="text-center py-4">
              <p className={`${uiConfig.colors.hint} mb-2`}>No favorites yet</p>
              <button
                onClick={() => navigate('/discover')}
                className={`text-sm ${uiConfig.colors.accent} hover:underline`}
              >
                Browse towns to add favorites
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className={`${uiConfig.colors.statusError} border ${uiConfig.colors.borderDanger.replace('border-', '')} p-4 rounded-lg mb-6`}>
            {error}
            {error.includes("No towns selected") && (
              <button
                onClick={() => navigate('/favorites')}
                className={`mt-2 text-sm ${uiConfig.colors.error} underline`}
              >
                Go to Favorites
              </button>
            )}
          </div>
        )}

        {/* Town comparison grid */}
        {selectedTownIds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {towns.map((town) => (
              <div key={town.id} className={`${uiConfig.colors.card} rounded-lg shadow-md overflow-hidden`}>
                {/* Town header with image */}
                <div className="relative h-40">
                  {town.image_url_1 ? (
                    <img
                      src={town.image_url_1}
                      alt={town.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${uiConfig.colors.muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                  {/* Image overlay with all buttons like discover page */}
                  {userId && (
                    <TownImageOverlay
                      town={town}
                      matchScore={town.matchScore}
                      isFavorited={isFavorited(town.id)}
                      isUpdating={false}
                      onFavoriteClick={() => handleToggleFavorite(town.id)}
                      appealStatement={town.appealStatement}
                    />
                  )}
                </div>

                {/* Town name and country with match score */}
                <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>{town.name}</h2>
                      <p className={`text-sm ${uiConfig.colors.hint}`}>{town.country}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                        {activeCategory === 'overview' && town.matchScore ? `${Math.round(town.matchScore)}%` :
                         activeCategory === 'region' && town.categoryScores?.region ? `${Math.round(town.categoryScores.region)}%` :
                         activeCategory === 'climate' && town.categoryScores?.climate ? `${Math.round(town.categoryScores.climate)}%` :
                         activeCategory === 'culture' && town.categoryScores?.culture ? `${Math.round(town.categoryScores.culture)}%` :
                         activeCategory === 'hobbies' && town.categoryScores?.hobbies ? `${Math.round(town.categoryScores.hobbies)}%` :
                         activeCategory === 'administration' && town.categoryScores?.administration ? `${Math.round(town.categoryScores.administration)}%` :
                         activeCategory === 'budget' && town.categoryScores?.budget ? `${Math.round(town.categoryScores.budget)}%` :
                         'N/A'}
                      </p>
                      <p className={`text-sm ${uiConfig.colors.hint}`}>
                        {activeCategory === 'overview' ? 'Overall Match' :
                         activeCategory === 'region' ? 'Region Match' :
                         activeCategory === 'climate' ? 'Climate Match' :
                         activeCategory === 'culture' ? 'Culture Match' :
                         activeCategory === 'hobbies' ? 'Hobbies Match' :
                         activeCategory === 'administration' ? 'Admin Match' :
                         activeCategory === 'budget' ? 'Budget Match' :
                         ''}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Radar chart for quick comparison - only show on overview tab */}
                {activeCategory === 'overview' && (
                  <div className={`p-4 border-b ${uiConfig.colors.borderLight} h-[14rem]`}>
                    <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>Town Profile</h3>
                    <div className="h-[11rem]">
                      <TownRadarChart townData={town} />
                    </div>
                  </div>
                )}

                {/* Category content with swipe support on mobile */}
                <div className="p-4 min-h-[30rem]">
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>
                    {activeCategory === 'overview' ? 'Overview' : 'Summary'}
                  </h3>
                  <div className={`text-sm ${uiConfig.colors.body} h-full`}>
                    <CategoryContent town={town} category={activeCategory} />
                  </div>
                </div>

                {/* View details button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => navigate(`/discover?town=${town.id}`)}
                    className={`w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 ${uiConfig.colors.heading} rounded-md transition-colors text-sm`}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`${uiConfig.colors.hint} mb-4`}>
              {favorites.length > 0 
                ? "Select up to 3 towns from your favorites above to compare"
                : "No favorites yet. Add some towns to your favorites first."}
            </p>
            {favorites.length === 0 && (
              <button
                onClick={() => navigate('/discover')}
                className={`px-4 py-2 ${uiConfig.colors.btnPrimary} rounded-md`}
              >
                Browse Towns
              </button>
            )}
          </div>
        )}
        </main>
      </SwipeableCompareContent>

    </div>
  );
}