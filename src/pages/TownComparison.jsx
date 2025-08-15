import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { getCurrentUser } from '../utils/authUtils';
import TownRadarChart from '../components/TownRadarChart';
import LikeButton from '../components/LikeButton';
import TownImageOverlay from '../components/TownImageOverlay';
import UnifiedHeader from '../components/UnifiedHeader';
import ComparePageSpacer from '../components/ComparePageSpacer';
import SwipeableCompareContent from '../components/SwipeableCompareContent';
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

  // Helper to get value for specific category field
  const getCategoryValue = (town, category) => {
    switch (category) {
      case 'overview':
        return (
          <div className="h-full flex flex-col">
            {/* Category Scores Table - Like on Discover page */}
            {town.categoryScores && (
              <div className="mb-4">
                <div className={`text-xs ${uiConfig.colors.body} mb-1.5 flex items-center gap-1`}>
                  <span>Matching your preferences</span>
                  <span className={`${uiConfig.colors.hint} text-xs`}>(weighted avg: {town.matchScore}%)</span>
                </div>
                <div className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Region</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.region || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Climate</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.climate || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Culture</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.culture || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Hobbies</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.hobbies || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Admin</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.administration || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`${uiConfig.colors.hint} capitalize`}>Budget</span>
                    <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.budget || 0)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Description */}
            <p className="line-clamp-5">{town.description || 'No description available.'}</p>
          </div>
        );

      case 'climate':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Climate Description - Show descriptive data first */}
              {(town.climate || town.climate_description) && (
                <div className="mb-2">
                  <h4 className="font-medium text-sm mb-1">Climate Type</h4>
                  <p className="text-sm">{town.climate || town.climate_description}</p>
                </div>
              )}
              
              {/* Seasonal Characteristics */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Seasonal Characteristics</h4>
                <div className="space-y-1 text-sm">
                  {town.summer_climate_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Summer Climate:</span>
                      <span className="font-medium capitalize">{town.summer_climate_actual}</span>
                    </div>
                  )}
                  {town.winter_climate_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Winter Climate:</span>
                      <span className="font-medium capitalize">{town.winter_climate_actual}</span>
                    </div>
                  )}
                  {town.humidity_level_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Humidity:</span>
                      <span className="font-medium capitalize">{town.humidity_level_actual}</span>
                    </div>
                  )}
                  {town.sunshine_level_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Sunshine:</span>
                      <span className="font-medium capitalize">{town.sunshine_level_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.precipitation_level_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Precipitation:</span>
                      <span className="font-medium capitalize">{town.precipitation_level_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {town.seasonal_variation_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Seasonal Variation:</span>
                      <span className="font-medium capitalize">{town.seasonal_variation_actual?.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quantitative Climate Data */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Climate Data</h4>
                <div className="space-y-1 text-sm">
                  {town.avg_temp_summer && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Summer Temperature:</span>
                      <span className="font-medium">{town.avg_temp_summer}°C</span>
                    </div>
                  )}
                  {town.avg_temp_winter && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Winter Temperature:</span>
                      <span className="font-medium">{town.avg_temp_winter}°C</span>
                    </div>
                  )}
                  {town.sunshine_hours && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Sunshine Hours:</span>
                      <span className="font-medium">{town.sunshine_hours} hours/day</span>
                    </div>
                  )}
                  {town.annual_rainfall && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Annual Rainfall:</span>
                      <span className="font-medium">{town.annual_rainfall}mm</span>
                    </div>
                  )}
                  {town.air_quality_index && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Air Quality Index:</span>
                      <span className="font-medium">{town.air_quality_index} AQI</span>
                    </div>
                  )}
                  {town.environmental_health_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Environmental Health:</span>
                      <span className="font-medium">{town.environmental_health_rating}/5</span>
                    </div>
                  )}
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
            <div className="space-y-3 flex-1">
              {/* Geographic Location */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Geographic Location</h4>
                <div className="space-y-1 text-sm">
                  {town.country && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Country:</span>
                      <span className="font-medium">{town.country}</span>
                    </div>
                  )}
                  {town.region && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Region:</span>
                      <span className="font-medium">{town.region}</span>
                    </div>
                  )}
                  {town.regions && town.regions.length > 0 && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Regions:</span>
                      <span className="font-medium text-right">{town.regions.join(', ')}</span>
                    </div>
                  )}
                  {town.population && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Population:</span>
                      <span className="font-medium">{town.population.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Geographic Features */}
              {(town.geographic_features_actual || town.vegetation_type_actual || town.water_bodies) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Geographic Features</h4>
                  <div className="space-y-1 text-sm">
                    {town.geographic_features_actual && town.geographic_features_actual.length > 0 && (
                      <div>
                        <span className={`${uiConfig.colors.hint} block mb-1`}>Features:</span>
                        <div className="flex flex-wrap gap-1">
                          {town.geographic_features_actual.map((feature, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs capitalize">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {town.vegetation_type_actual && town.vegetation_type_actual.length > 0 && (
                      <div className="mt-2">
                        <span className={`${uiConfig.colors.hint} block mb-1`}>Vegetation:</span>
                        <div className="flex flex-wrap gap-1">
                          {town.vegetation_type_actual.map((veg, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs capitalize">
                              {veg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {town.water_bodies && town.water_bodies.length > 0 && (
                      <div className="mt-2">
                        <span className={`${uiConfig.colors.hint} block mb-1`}>Water Bodies:</span>
                        <div className="flex flex-wrap gap-1">
                          {town.water_bodies.map((water, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs">
                              {water}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Transportation Access */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Transportation Access</h4>
                <div className="space-y-1 text-sm">
                  {town.nearest_airport && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Nearest Airport:</span>
                      <span className="font-medium text-right text-xs">{town.nearest_airport}</span>
                    </div>
                  )}
                  {town.airport_distance && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Airport Distance:</span>
                      <span className="font-medium">{town.airport_distance} km</span>
                    </div>
                  )}
                  {town.international_access && town.international_access.length > 0 && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>International Access:</span>
                      <span className="font-medium text-right text-xs">{town.international_access.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'culture':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Language & Communication */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Language & Communication</h4>
                <div className="space-y-1 text-sm">
                  {town.primary_language && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Primary Language:</span>
                      <span className="font-medium">{town.primary_language}</span>
                    </div>
                  )}
                  {town.languages_spoken && town.languages_spoken.length > 0 && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Languages Spoken:</span>
                      <span className="font-medium text-right text-xs">{town.languages_spoken.join(', ')}</span>
                    </div>
                  )}
                  {town.english_proficiency_level && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>English Proficiency:</span>
                      <span className="font-medium capitalize">{town.english_proficiency_level}</span>
                    </div>
                  )}
                  {town.english_speaking_doctors !== undefined && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>English-Speaking Doctors:</span>
                      <span className="font-medium">{town.english_speaking_doctors ? 'Available' : 'Limited'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expat & Social Life */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Expat & Social Life</h4>
                <div className="space-y-1 text-sm">
                  {town.expat_community_size && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Expat Community Size:</span>
                      <span className="font-medium capitalize">{town.expat_community_size}</span>
                    </div>
                  )}
                  {town.expat_population && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Expat Population:</span>
                      <span className="font-medium">{town.expat_population}</span>
                    </div>
                  )}
                  {town.social_atmosphere && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Social Atmosphere:</span>
                      <span className="font-medium capitalize">{town.social_atmosphere}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lifestyle Character */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Lifestyle Character</h4>
                <div className="space-y-1 text-sm">
                  {town.pace_of_life_actual && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Pace of Life:</span>
                      <span className="font-medium capitalize">{town.pace_of_life_actual}</span>
                    </div>
                  )}
                  {town.urban_rural_character && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Urban/Rural:</span>
                      <span className="font-medium capitalize">{town.urban_rural_character}</span>
                    </div>
                  )}
                  {town.traditional_progressive_lean && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Cultural Lean:</span>
                      <span className="font-medium capitalize">{town.traditional_progressive_lean}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Cultural Amenities */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Cultural Amenities</h4>
                <div className="space-y-1 text-sm">
                  {(town.dining_nightlife_level || town.nightlife_rating) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Dining & Nightlife:</span>
                      <span className="font-medium">{town.dining_nightlife_level ? `${town.dining_nightlife_level}/5` : `${town.nightlife_rating}/10`}</span>
                    </div>
                  )}
                  {(town.museums_level || town.museums_rating) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Museums & Arts:</span>
                      <span className="font-medium">{town.museums_level ? `${town.museums_level}/5` : `${town.museums_rating}/10`}</span>
                    </div>
                  )}
                  {(town.cultural_events_level || town.cultural_rating) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Cultural Events:</span>
                      <span className="font-medium">{town.cultural_events_level ? `${town.cultural_events_level}/5` : `${town.cultural_rating}/10`}</span>
                    </div>
                  )}
                  {town.cultural_landmark_1 && (
                    <div className="mt-2">
                      <span className={`${uiConfig.colors.hint} block mb-1`}>Cultural Landmarks:</span>
                      <ul className="text-xs space-y-0.5">
                        <li>• {town.cultural_landmark_1}</li>
                        {town.cultural_landmark_2 && <li>• {town.cultural_landmark_2}</li>}
                        {town.cultural_landmark_3 && <li>• {town.cultural_landmark_3}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'hobbies':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Available Activities */}
              {town.activities_available && town.activities_available.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Available Activities</h4>
                  <div className="flex flex-wrap gap-1">
                    {town.activities_available.map((activity, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs capitalize">
                        {activity.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Supported Interests */}
              {town.interests_supported && town.interests_supported.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Supported Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {town.interests_supported.map((interest, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs capitalize">
                        {interest.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Activity Infrastructure */}
              {town.activity_infrastructure && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Activity Infrastructure</h4>
                  <div className="space-y-1 text-sm">
                    {town.activity_infrastructure.golf_courses && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Golf Courses:</span>
                        <span className="font-medium">{town.activity_infrastructure.golf_courses}</span>
                      </div>
                    )}
                    {town.activity_infrastructure.cycling_paths_km && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Cycling Paths:</span>
                        <span className="font-medium">{town.activity_infrastructure.cycling_paths_km} km</span>
                      </div>
                    )}
                    {town.activity_infrastructure.marinas && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Marinas:</span>
                        <span className="font-medium">{town.activity_infrastructure.marinas}</span>
                      </div>
                    )}
                    {town.activity_infrastructure.ski_resorts_nearby && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Ski Resorts Nearby:</span>
                        <span className="font-medium">{town.activity_infrastructure.ski_resorts_nearby}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Activity Ratings */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Activity Ratings</h4>
                <div className="space-y-1 text-sm">
                  {(town.outdoor_activities_rating || town.outdoor_rating) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Outdoor Activities:</span>
                      <span className="font-medium">{town.outdoor_activities_rating ? `${town.outdoor_activities_rating}/5` : `${town.outdoor_rating}/10`}</span>
                    </div>
                  )}
                  {(town.cultural_events_rating || town.cultural_rating) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Cultural Events:</span>
                      <span className="font-medium">{town.cultural_events_rating ? `${town.cultural_events_rating}/5` : `${town.cultural_rating}/10`}</span>
                    </div>
                  )}
                  {town.restaurants_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Dining Options:</span>
                      <span className="font-medium">{town.restaurants_rating}/10</span>
                    </div>
                  )}
                  {town.nightlife_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Nightlife:</span>
                      <span className="font-medium">{town.nightlife_rating}/10</span>
                    </div>
                  )}
                  {town.shopping_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Shopping:</span>
                      <span className="font-medium">{town.shopping_rating}/5</span>
                    </div>
                  )}
                  {town.wellness_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Wellness Facilities:</span>
                      <span className="font-medium">{town.wellness_rating}/5</span>
                    </div>
                  )}
                  {town.travel_connectivity_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Travel Connectivity:</span>
                      <span className="font-medium">{town.travel_connectivity_rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'administration':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Healthcare */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Healthcare</h4>
                <div className="space-y-1 text-sm">
                  {town.healthcare_score && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Healthcare Quality:</span>
                      <span className="font-medium">{town.healthcare_score}/10</span>
                    </div>
                  )}
                  {town.healthcare_description && (
                    <div className="mt-1">
                      <p className="text-xs">{town.healthcare_description}</p>
                    </div>
                  )}
                  {town.hospital_count && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Hospitals:</span>
                      <span className="font-medium">{town.hospital_count}</span>
                    </div>
                  )}
                  {town.healthcare_specialties_available && town.healthcare_specialties_available.length > 0 && (
                    <div>
                      <span className={`${uiConfig.colors.hint} block mb-1`}>Specialties Available:</span>
                      <div className="flex flex-wrap gap-1">
                        {town.healthcare_specialties_available.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs capitalize">
                            {spec.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {town.medical_specialties_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Medical Specialties:</span>
                      <span className="font-medium">{town.medical_specialties_rating}/5</span>
                    </div>
                  )}
                  {town.insurance_availability_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Insurance Availability:</span>
                      <span className="font-medium">{town.insurance_availability_rating}/5</span>
                    </div>
                  )}
                  {town.english_speaking_doctors !== undefined && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>English-Speaking Doctors:</span>
                      <span className="font-medium">{town.english_speaking_doctors ? 'Available' : 'Limited'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Safety & Security */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Safety & Security</h4>
                <div className="space-y-1 text-sm">
                  {town.safety_score && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Safety Score:</span>
                      <span className="font-medium">{town.safety_score}/10</span>
                    </div>
                  )}
                  {town.safety_description && (
                    <div className="mt-1">
                      <p className="text-xs">{town.safety_description}</p>
                    </div>
                  )}
                  {town.crime_rate && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Crime Rate:</span>
                      <span className="font-medium">{town.crime_rate}</span>
                    </div>
                  )}
                  {town.natural_disaster_risk && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Natural Disaster Risk:</span>
                      <span className={`font-medium ${
                        town.natural_disaster_risk <= 3 ? 'text-green-600 dark:text-green-400' :
                        town.natural_disaster_risk <= 6 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {town.natural_disaster_risk <= 3 ? 'Low' : 
                         town.natural_disaster_risk <= 6 ? 'Moderate' : 'High'} ({town.natural_disaster_risk}/10)
                      </span>
                    </div>
                  )}
                  {town.political_stability_rating && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Political Stability:</span>
                      <span className="font-medium">{town.political_stability_rating}/100</span>
                    </div>
                  )}
                  {town.emergency_services_quality && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Emergency Services:</span>
                      <span className="font-medium">{town.emergency_services_quality}/5</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Visa & Residency */}
              {(town.visa_requirements || town.residency_path_info) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Visa & Residency</h4>
                  <div className="space-y-1 text-sm">
                    {town.visa_requirements && (
                      <>
                        {town.visa_requirements.tourist_visa && (
                          <div className="flex justify-between">
                            <span className={uiConfig.colors.hint}>Tourist Visa:</span>
                            <span className="font-medium capitalize">{town.visa_requirements.tourist_visa}</span>
                          </div>
                        )}
                        {town.visa_requirements.retirement_visa && (
                          <div className="flex justify-between">
                            <span className={uiConfig.colors.hint}>Retirement Visa:</span>
                            <span className="font-medium capitalize">{town.visa_requirements.retirement_visa}</span>
                          </div>
                        )}
                        {town.visa_requirements.difficulty && (
                          <div className="flex justify-between">
                            <span className={uiConfig.colors.hint}>Visa Process:</span>
                            <span className="font-medium capitalize">{town.visa_requirements.difficulty}</span>
                          </div>
                        )}
                      </>
                    )}
                    {town.residency_path_info && (
                      <>
                        {town.residency_path_info.available !== undefined && (
                          <div className="flex justify-between">
                            <span className={uiConfig.colors.hint}>Residency Path:</span>
                            <span className="font-medium">{town.residency_path_info.available ? 'Available' : 'Limited'}</span>
                          </div>
                        )}
                        {town.residency_path_info.years_to_permanent && (
                          <div className="flex justify-between">
                            <span className={uiConfig.colors.hint}>Years to Permanent:</span>
                            <span className="font-medium">{town.residency_path_info.years_to_permanent} years</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Government */}
              {town.government_efficiency_rating && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Government</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Government Efficiency:</span>
                      <span className="font-medium">{town.government_efficiency_rating}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="h-full flex flex-col">
            <div className="space-y-3 flex-1">
              {/* Monthly Living Costs */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Monthly Living Costs</h4>
                <div className="space-y-1 text-sm">
                  {(town.cost_index || town.cost_of_living_usd || town.typical_monthly_living_cost) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Total Monthly Cost:</span>
                      <span className="font-medium text-lg">
                        ${town.typical_monthly_living_cost || town.cost_index || town.cost_of_living_usd}
                      </span>
                    </div>
                  )}
                  {town.healthcare_cost_monthly && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Healthcare (Monthly):</span>
                      <span className="font-medium">${town.healthcare_cost_monthly}</span>
                    </div>
                  )}
                  {town.healthcare_cost && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Healthcare Cost:</span>
                      <span className="font-medium">${town.healthcare_cost}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Housing Costs */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Housing Costs</h4>
                <div className="space-y-1 text-sm">
                  {(town.rent_1bed || town.typical_rent_1bed) && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>1-Bedroom Rent:</span>
                      <span className="font-medium">${town.rent_1bed || town.typical_rent_1bed}/mo</span>
                    </div>
                  )}
                  {town.typical_home_price && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Home Purchase Price:</span>
                      <span className="font-medium">${town.typical_home_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Daily Expenses */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Daily Expenses</h4>
                <div className="space-y-1 text-sm">
                  {town.meal_cost && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Restaurant Meal:</span>
                      <span className="font-medium">${town.meal_cost}</span>
                    </div>
                  )}
                  {town.groceries_cost && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Weekly Groceries:</span>
                      <span className="font-medium">${town.groceries_cost}</span>
                    </div>
                  )}
                  {town.utilities_cost && (
                    <div className="flex justify-between">
                      <span className={uiConfig.colors.hint}>Monthly Utilities:</span>
                      <span className="font-medium">${town.utilities_cost}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Taxes */}
              {(town.tax_rates || town.income_tax_rate_pct || town.property_tax_rate_pct || town.sales_tax_rate_pct) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Taxes</h4>
                  <div className="space-y-1 text-sm">
                    {(town.tax_rates?.income_tax || town.income_tax_rate_pct) && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Income Tax:</span>
                        <span className="font-medium">{town.tax_rates?.income_tax || town.income_tax_rate_pct}%</span>
                      </div>
                    )}
                    {(town.tax_rates?.property_tax || town.property_tax_rate_pct) && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Property Tax:</span>
                        <span className="font-medium">{town.tax_rates?.property_tax || town.property_tax_rate_pct}%</span>
                      </div>
                    )}
                    {(town.tax_rates?.sales_tax || town.sales_tax_rate_pct) && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Sales Tax:</span>
                        <span className="font-medium">{town.tax_rates?.sales_tax || town.sales_tax_rate_pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Transportation */}
              {(town.local_mobility_options || town.regional_connectivity || town.international_access || town.public_transport_quality || town.walkability) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Transportation</h4>
                  <div className="space-y-1 text-sm">
                    {town.local_mobility_options && town.local_mobility_options.length > 0 && (
                      <div>
                        <span className={`${uiConfig.colors.hint} block mb-1`}>Local Mobility:</span>
                        <div className="flex flex-wrap gap-1">
                          {town.local_mobility_options.map((option, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs capitalize">
                              {option.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {town.public_transport_quality && (
                      <div className="flex justify-between mt-2">
                        <span className={uiConfig.colors.hint}>Public Transport:</span>
                        <span className="font-medium">{town.public_transport_quality}/10</span>
                      </div>
                    )}
                    {town.walkability && (
                      <div className="flex justify-between">
                        <span className={uiConfig.colors.hint}>Walkability:</span>
                        <span className="font-medium">{town.walkability}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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