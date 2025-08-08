import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { getCurrentUser } from '../utils/authUtils';
import TownRadarChart from '../components/TownRadarChart';
import LikeButton from '../components/LikeButton';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import { Eye, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function TownComparison() {
  const [towns, setTowns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  // Categories for comparison tabs - Updated to match the 6 onboarding categories
  const categories = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'region', label: 'Region', icon: Globe },
    { id: 'climate', label: 'Climate', icon: CloudSun },
    { id: 'culture', label: 'Culture', icon: Users },
    { id: 'hobbies', label: 'Hobbies', icon: SmilePlus },
    { id: 'administration', label: 'Admin', icon: HousePlus },
    { id: 'budget', label: 'Costs', icon: DollarSign }
  ];

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
        const getSelectedTownIds = () => {
          const params = new URLSearchParams(location.search);
          const townIds = params.get('towns');
          return townIds ? townIds.split(',') : [];
        };

        // Get selected town IDs from URL or use top favorites if none specified
        const selectedTownIds = getSelectedTownIds();
        let townsToFetch = [];

        if (selectedTownIds.length > 0) {
          // Fetch specified towns all at once
          const { success, towns: fetchedTowns, error: townError } = 
            await fetchTowns({ townIds: selectedTownIds });
          
          if (success && fetchedTowns.length > 0) {
            townsToFetch = fetchedTowns;
          } else {
            console.error("Error fetching selected towns:", townError);
          }
        } else if (userFavorites.length > 0) {
          // Use top favorites (up to 3)
          const favoriteTownIds = userFavorites
            .slice(0, 3)
            .map(fav => fav.town_id);

          // Update URL with these town IDs
          navigate(`/compare?towns=${favoriteTownIds.join(',')}`, { replace: true });

          // Fetch all towns at once
          const { success, towns: fetchedTowns, error: townError } = 
            await fetchTowns({ townIds: favoriteTownIds });
          
          if (success && fetchedTowns.length > 0) {
            townsToFetch = fetchedTowns;
          } else {
            console.error("Error fetching favorite towns:", townError);
          }
        }

        if (townsToFetch.length === 0) {
          setError("No towns selected for comparison. Please select towns from your favorites.");
        } else {
          setTowns(townsToFetch);
        }

      } catch (err) {
        console.error("Error loading comparison data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, location.search]);

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
        const { success: townSuccess, towns: fetchedTowns } = await fetchTowns({ townIds: [townId] });
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

  // Handle removing a town from comparison
  const handleRemoveTown = (townId) => {
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
        }, 1000); // Small delay for animation
      }
      
      return updatedTowns;
    });
    
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

  // Helper to get value for specific category field
  const getCategoryValue = (town, category) => {
    switch (category) {
      case 'overview':
        return (
          <div className="h-full flex flex-col">
            <p className="mb-2 min-h-[7.5rem] line-clamp-5">{town.description || 'No description available.'}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {town.cost_index && (
                <span className={`px-2 py-1 ${uiConfig.colors.statusSuccess} text-xs rounded-full`}>
                  ${town.cost_index}/mo
                </span>
              )}
              {town.categoryScores && (
                <>
                  {town.categoryScores.region && (
                    <span className={`px-2 py-1 ${uiConfig.colors.statusInfo} text-xs rounded-full`}>
                      Region: {Math.round(town.categoryScores.region)}%
                    </span>
                  )}
                  {town.categoryScores.administration && (
                    <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 text-xs rounded-full">
                      Admin: {Math.round(town.categoryScores.administration)}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'climate':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.climate_description || 'No climate information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Live Weather Section */}
              <div className="bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 rounded-lg p-3 h-[4rem] flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  {/* Animated weather icon */}
                  <div className="relative">
                    <svg className={`w-10 h-10 text-amber-500 ${uiConfig.animation.pulse}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className={`font-medium ${uiConfig.colors.body}`}>Live Weather</p>
                    <p className={`text-xs ${uiConfig.colors.hint}`}>Check current conditions</p>
                  </div>
                </div>
              </div>
              
              {/* Temperature Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[5.5rem]">
                <h4 className="font-medium text-sm mb-2">Temperature</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={uiConfig.colors.hint}>Summer:</span>
                    <span className="ml-1 font-medium">{town.avg_temp_summer ? `${town.avg_temp_summer}°C` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className={uiConfig.colors.hint}>Winter:</span>
                    <span className="ml-1 font-medium">{town.avg_temp_winter ? `${town.avg_temp_winter}°C` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Precipitation & Sunshine Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Precipitation & Sunshine</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Annual Rainfall:</span>
                    <span className="font-medium">{town.annual_rainfall ? `${town.annual_rainfall}mm` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Daily Sunshine:</span>
                    <span className="font-medium">{town.sunshine_hours ? `${town.sunshine_hours} hours` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Humidity:</span>
                    <span className="font-medium">{town.humidity_level || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'cost':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.cost_description || 'No cost information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Housing Costs Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Housing Costs</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>1-Bedroom Rent:</span>
                    <span className="font-medium">{town.rent_1bed ? `$${town.rent_1bed}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>2-Bedroom Rent:</span>
                    <span className="font-medium">{town.rent_2bed ? `$${town.rent_2bed}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Buy Price/m²:</span>
                    <span className="font-medium">{town.property_buy_sqm ? `$${town.property_buy_sqm}` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Daily Expenses Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[9rem]">
                <h4 className="font-medium text-sm mb-2">Daily Expenses</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Restaurant Meal:</span>
                    <span className="font-medium">{town.meal_cost ? `$${town.meal_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Weekly Groceries:</span>
                    <span className="font-medium">{town.groceries_cost ? `$${town.groceries_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Monthly Utilities:</span>
                    <span className="font-medium">{town.utilities_cost ? `$${town.utilities_cost}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Public Transport:</span>
                    <span className="font-medium">{town.transport_cost ? `$${town.transport_cost}/mo` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Total Costs/Month Section */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Total Costs/Month</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    ${town.cost_index || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'region':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.description || 'Explore this region\'s unique characteristics and accessibility.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Location Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Location Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Country:</span>
                    <span className="font-medium">{town.country || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Region:</span>
                    <span className="font-medium">{town.region || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Population:</span>
                    <span className="font-medium">{town.population ? town.population.toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Region Score */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Region Match</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    {town.categoryScores?.region ? `${Math.round(town.categoryScores.region)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'culture':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.culture_description || 'Discover the cultural richness and social atmosphere of this location.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Cultural Features */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Cultural Features</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Language:</span>
                    <span className="font-medium">{town.primary_language || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Cultural Scene:</span>
                    <span className="font-medium">{town.cultural_rating ? `${town.cultural_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Expat Community:</span>
                    <span className="font-medium">{town.expat_population || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Culture Score */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Culture Match</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    {town.categoryScores?.culture ? `${Math.round(town.categoryScores.culture)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'hobbies':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.lifestyle_description || 'Explore activities and lifestyle opportunities in this area.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Activities & Recreation */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Activities & Recreation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Outdoor Activities:</span>
                    <span className="font-medium">{town.outdoor_rating ? `${town.outdoor_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Dining Options:</span>
                    <span className="font-medium">{town.restaurants_rating ? `${town.restaurants_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Nightlife:</span>
                    <span className="font-medium">{town.nightlife_rating ? `${town.nightlife_rating}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Hobbies Score */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Hobbies Match</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    {town.categoryScores?.hobbies ? `${Math.round(town.categoryScores.hobbies)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'administration':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.healthcare_description || town.safety_description || 'Administrative services, healthcare, and safety information.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Healthcare & Safety */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Healthcare & Safety</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Healthcare Quality:</span>
                    <span className="font-medium">{town.healthcare_score ? `${town.healthcare_score}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Safety Score:</span>
                    <span className="font-medium">{town.safety_score ? `${town.safety_score}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Infrastructure:</span>
                    <span className="font-medium">{town.infrastructure_score ? `${town.infrastructure_score}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Admin Score */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Admin Match</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    {town.categoryScores?.administration ? `${Math.round(town.categoryScores.administration)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>
              {town.cost_description || 'Understand the cost of living and budget requirements.'}
            </p>
            <div className="space-y-3 flex-1">
              {/* Budget Overview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Budget Overview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Monthly Cost:</span>
                    <span className="font-medium">{town.cost_index ? `$${town.cost_index}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Housing (1BR):</span>
                    <span className="font-medium">{town.rent_1bed ? `$${town.rent_1bed}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Tax Regime:</span>
                    <span className="font-medium">{town.tax_rate || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Budget Score */}
              <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg p-3 h-[4rem] flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-xs ${uiConfig.colors.hint} mb-1`}>Budget Match</p>
                  <p className={`text-2xl font-bold ${uiConfig.colors.success}`}>
                    {town.categoryScores?.budget ? `${Math.round(town.categoryScores.budget)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'healthcare':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.healthcare_description || 'No healthcare information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Medical Facilities Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Medical Facilities</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Hospitals:</span>
                    <span className="font-medium">{town.hospital_count || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Clinics:</span>
                    <span className="font-medium">{town.clinic_count || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Emergency Response:</span>
                    <span className="font-medium">{town.emergency_response_time || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Healthcare Access Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[9rem]">
                <h4 className="font-medium text-sm mb-2">Healthcare Access</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>English Doctors:</span>
                    <span className={`font-medium ${town.english_speaking_doctors === true ? uiConfig.colors.success : town.english_speaking_doctors === false ? uiConfig.colors.statusWarning.replace('bg-yellow-100', 'text-orange-600').replace('text-yellow-800', '').replace('dark:bg-yellow-900', 'dark:text-orange-400').replace('dark:text-yellow-200', '') : ''}`}>
                      {town.english_speaking_doctors === true ? 'Available' : town.english_speaking_doctors === false ? 'Limited' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Insurance Cost:</span>
                    <span className="font-medium">{town.healthcare_cost ? `$${town.healthcare_cost}/mo` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Specialists:</span>
                    <span className="font-medium">{town.specialist_availability || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Dental Care:</span>
                    <span className="font-medium">{town.dental_care_quality ? `${town.dental_care_quality}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Healthcare System Type - Fixed Height */}
              <div className="text-xs text-center p-2 bg-gray-100 dark:bg-gray-700 rounded h-[2rem] flex items-center justify-center">
                <span className={uiConfig.colors.hint}>System: </span>
                <span className="font-medium ml-1">{town.healthcare_system_type || 'N/A'}</span>
              </div>
            </div>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.lifestyle_description || 'No lifestyle information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Community & Culture Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Community & Culture</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Expat Community:</span>
                    <span className="font-medium">{town.expat_population || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Cultural Scene:</span>
                    <span className="font-medium">{town.cultural_rating ? `${town.cultural_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Nightlife:</span>
                    <span className="font-medium">{town.nightlife_rating ? `${town.nightlife_rating}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Activities & Amenities Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Activities & Amenities</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Dining Options:</span>
                    <span className="font-medium">{town.restaurants_rating ? `${town.restaurants_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Outdoor Activities:</span>
                    <span className="font-medium">{town.outdoor_rating ? `${town.outdoor_rating}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Quality of Life:</span>
                    <span className="font-medium">{town.quality_of_life ? `${town.quality_of_life}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.safety_description || 'No safety information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Safety Metrics Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Safety Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Crime Rate:</span>
                    <span className="font-medium">{town.crime_rate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Safety Ranking:</span>
                    <span className="font-medium">{town.safety_ranking || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Police Reliability:</span>
                    <span className="font-medium">{town.police_reliability ? `${town.police_reliability}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Risk Factors Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[6rem]">
                <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Natural Disaster Risk:</span>
                    <span className={`font-medium ${
                      town.natural_disaster_risk <= 3 ? uiConfig.colors.success : 
                      town.natural_disaster_risk <= 6 ? 'text-amber-600 dark:text-amber-400' : 
                      town.natural_disaster_risk > 6 ? uiConfig.colors.error : ''
                    }`}>
                      {town.natural_disaster_risk !== undefined ?
                        (town.natural_disaster_risk <= 3 ? 'Low' : 
                         town.natural_disaster_risk <= 6 ? 'Moderate' : 'High') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Political Stability:</span>
                    <span className="font-medium">{town.political_stability ? `${town.political_stability}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'infrastructure':
        return (
          <div className="h-full flex flex-col">
            <p className={`mb-3 ${uiConfig.colors.body} min-h-[7.5rem] line-clamp-5`}>{town.infrastructure_description || 'No infrastructure information available.'}</p>
            <div className="space-y-3 flex-1">
              {/* Transportation Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[9rem]">
                <h4 className="font-medium text-sm mb-2">Transportation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Public Transport:</span>
                    <span className="font-medium">{town.public_transport_quality ? `${town.public_transport_quality}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Walkability:</span>
                    <span className="font-medium">{town.walkability ? `${town.walkability}/10` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Nearest Airport:</span>
                    <span className="font-medium text-xs">{town.nearest_airport || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>City Center to Airport:</span>
                    <span className="font-medium">{town.airport_distance ? `${town.airport_distance} km` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Connectivity & Services Section - Fixed Height */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 h-[7.5rem]">
                <h4 className="font-medium text-sm mb-2">Connectivity & Services</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Internet Speed:</span>
                    <span className="font-medium">{town.internet_speed ? `${town.internet_speed} Mbps` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Mobile Coverage:</span>
                    <span className="font-medium">{town.mobile_coverage || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={uiConfig.colors.hint}>Utilities Reliability:</span>
                    <span className="font-medium">{town.utilities_reliability ? `${town.utilities_reliability}/10` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return 'No data available for this category';
    }
  };

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
        showComparison={true}
        comparisonProps={{
          towns: towns,
          onRemoveTown: handleRemoveTown,
          maxTowns: 3
        }}
      />
      
      {/* Spacer for fixed header with tabs */}
      <HeaderSpacer hasFilters={true} />

      <main className="max-w-7xl mx-auto px-4 py-6">
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
        {towns.length > 0 ? (
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
                  {/* Like button */}
                  {userId && (
                    <div className="absolute top-2 right-2">
                      <LikeButton
                        townId={town.id}
                        userId={userId}
                        initialState={isFavorited(town.id)}
                        onToggle={() => handleToggleFavorite(town.id)}
                      />
                    </div>
                  )}
                </div>

                {/* Town name and country */}
                <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>{town.name}</h2>
                      <p className={`text-sm ${uiConfig.colors.hint}`}>{town.country}</p>
                    </div>
                    <a
                      href={town.google_maps_link || `https://www.google.com/maps/search/${encodeURIComponent(town.name + ', ' + town.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${uiConfig.colors.success} text-sm hover:underline`}
                    >
                      View on Map
                    </a>
                  </div>
                </div>

                {/* Category rating - show on all tabs except overview */}
                {activeCategory !== 'overview' && (
                  <div className={`px-4 py-3 border-b ${uiConfig.colors.borderLight}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold ${uiConfig.colors.body}`}>
                        {categories.find(cat => cat.id === activeCategory)?.label}
                      </span>
                      <span className={`text-lg font-bold ${uiConfig.colors.accent} dark:text-sky-400`}>
                        {activeCategory === 'climate' && getCategoryRating(town, activeCategory) === null && town.climate_summary
                          ? town.climate_summary
                          : getCategoryRating(town, activeCategory) !== null
                          ? `${getCategoryRating(town, activeCategory)}/10`
                          : activeCategory === 'climate'
                          ? 'Pleasant'
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Radar chart for quick comparison - only show on overview tab */}
                {activeCategory === 'overview' && (
                  <div className={`p-4 border-b ${uiConfig.colors.borderLight} h-[14rem]`}>
                    <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>Town Profile</h3>
                    <div className="h-[11rem]">
                      <TownRadarChart townData={town} />
                    </div>
                  </div>
                )}

                {/* Category content */}
                <div className="p-4 min-h-[30rem]">
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>
                    {activeCategory === 'overview' ? 'Overview' : 'Summary'}
                  </h3>
                  <div className={`text-sm ${uiConfig.colors.body} h-full`}>
                    {getCategoryValue(town, activeCategory)}
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

            {/* Add town card if less than 3 towns */}
            {towns.length < 3 && (
              <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-2 border-dashed ${uiConfig.colors.border} h-96`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${uiConfig.colors.muted} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className={`${uiConfig.colors.hint} text-center mb-4`}>
                  Add another town to compare
                </p>
                <button
                  onClick={() => navigate('/favorites')}
                  className={`px-4 py-2 ${uiConfig.colors.btnPrimary} rounded-md`}
                >
                  Select from Favorites
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`${uiConfig.colors.hint} mb-4`}>
              No towns to compare. Please select towns from your favorites.
            </p>
            <button
              onClick={() => navigate('/favorites')}
              className={`px-4 py-2 ${uiConfig.colors.btnPrimary} rounded-md`}
            >
              Go to Favorites
            </button>
          </div>
        )}
      </main>

    </div>
  );
}