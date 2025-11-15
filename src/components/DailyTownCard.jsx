import React, { useState, useEffect } from 'react';
import { formatTownDisplay } from '../utils/townDisplayUtils';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import TownImageOverlay from './TownImageOverlay';
import { getTownOfTheDay } from '../utils/townUtils.jsx';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { MapPin, DollarSign, Activity, Shield, Users, Thermometer, Plane, MessageCircle, Footprints, Info } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import toast from 'react-hot-toast';
import { getCostStatus, getLuxuryCostNote } from '../utils/scoring/helpers/costUtils';

function DailyTownCard() {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [userBudget, setUserBudget] = useState(null); // User's monthly budget for cost status
  const navigate = useNavigate();

  const userId = user?.id;
  
  // Helper function to check if favorited
  const checkFavorited = (townId) => {
    return favorites.some(fav => fav.town_id === townId);
  };
  
  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const result = await getCurrentUser();
      setUser(result.user);
      setUserLoading(false);

      // Load user budget from preferences
      if (result.user?.id) {
        try {
          const { getOnboardingProgress } = await import('../utils/userpreferences/onboardingUtils');
          const { success, data: preferences } = await getOnboardingProgress(result.user.id);
          if (success && preferences) {
            setUserBudget(preferences.total_monthly_cost || null);
          }
        } catch (err) {
          console.error('Error loading user budget:', err);
        }
      }
    };
    loadUser();
  }, []);
  
  // Load favorites when user is loaded
  useEffect(() => {
    if (user?.id) {
      const loadFavorites = async () => {
        const result = await fetchFavorites(user.id, 'DailyTownCard');
        if (result.success) {
          setFavorites(result.favorites);
        }
      };
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is loaded
        if (!user || userLoading) {
          if (!userLoading) {
            setError("User not found");
            setLoading(false);
          }
          return;
        }
        
        // Get town of the day
        const { success, town: dailyTown, error: townError } = await getTownOfTheDay(user.id);
        
        if (!success) {
          setError(townError?.message || "Failed to fetch town of the day");
          setLoading(false);
          return;
        }
        
        // Town data loaded successfully
        
        setTown(dailyTown);
        
        // Favorite status is now checked via the hook
        // No need to fetch favorites separately
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]); // Only re-run when user ID changes

  const handleFavoriteToggle = async () => {
    if (!userId || isUpdating || !town) return;
    
    setIsUpdating(true);
    try {
      // Toggle favorite
      const result = await toggleFavorite(user.id, town.id, town.town_name, town.country);
      if (result.success) {
        // Reload favorites
        const favResult = await fetchFavorites(user.id, 'DailyTownCard');
        if (favResult.success) {
          setFavorites(favResult.favorites);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if current town is favorited
  const isFavorited = town ? checkFavorited(town.id) : false;

  // Compute cost status if town and budget are available
  const townCost = town ? (town.cost_of_living_usd || town.typical_monthly_living_cost) : null;
  const costStatus = (town && userBudget) ? getCostStatus(userBudget, townCost) : null;
  const luxuryCostNote = (town && userBudget) ? getLuxuryCostNote(userBudget, townCost) : null;

  const handleExploreClick = () => {
    if (town) {
      navigate(`/discover?town=${town.id}`);
    }
  };

  if (loading) {
    return (
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-5 w-full animate-pulse`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 w-32 rounded-md"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-24 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !town) {
    return (
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-5 w-full`}>
        <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-3`}>Today's Recommendation</h3>
        <p className={`${uiConfig.colors.body}`}>
          {error || "No town available today. Check back tomorrow!"}
        </p>
      </div>
    );
  }

  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden w-full`}>
      <div className="relative h-48">
        <OptimizedImage
          src={town.image_url_1}
          alt={town.town_name}
          className="w-full h-full object-cover"
          fallbackIcon={MapPin}
          fallbackIconSize={64}
        />
        
        {userId && town && (
          <TownImageOverlay
            town={town}
            matchScore={town.matchScore}
            isFavorited={isFavorited}
            isUpdating={isUpdating}
            onFavoriteClick={handleFavoriteToggle}
            preferenceCoverage={town.preferenceCoverage}
            appealStatement={(() => {
              // Find the highest scoring category and display it
              const scores = town.categoryScores;
              if (!scores) return "Worth exploring";
              
              // Get all category scores
              const categories = [
                { name: 'Region', score: scores.region || 0 },
                { name: 'Climate', score: scores.climate || 0 },
                { name: 'Culture', score: scores.culture || 0 },
                { name: 'Hobbies', score: scores.hobbies || 0 },
                { name: 'Admin', score: scores.administration || 0 },
                { name: 'Costs', score: scores.cost || 0 }
              ];
              
              // Find the highest scoring category
              const highest = categories.reduce((prev, current) => 
                current.score > prev.score ? current : prev
              );
              
              // Format the appeal statement
              if (highest.score >= 90) {
                return `${highest.name} Match: ${Math.round(highest.score)}%`;
              } else if (highest.score >= 80) {
                return `Strong ${highest.name.toLowerCase()} match`;
              } else if (highest.score >= 70) {
                return `Good ${highest.name.toLowerCase()} fit`;
              } else {
                return `${highest.name}: ${Math.round(highest.score)}%`;
              }
            })()}
          />
        )}
      </div>
      
      <div className="p-5">
        {/* Header: Town Name, Country */}
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <h3 className={`text-lg md:text-xl font-semibold ${uiConfig.colors.heading} mb-1`}>{town.town_name}</h3>
            <p className={`text-sm ${uiConfig.colors.body}`}>{town.country}</p>
          </div>
        </div>
        
        {/* Town Description - responsive height */}
        <div className={`mb-4 ${uiConfig.colors.body} text-sm md:text-base leading-relaxed`}>
          <p className="min-h-[4rem] md:min-h-[4.5rem]">
            {town.description || "Charming European destination offering excellent quality of life, beautiful historic architecture, and affordable living costs. Perfect for retirees seeking authentic culture without Western European prices."}
          </p>
        </div>

        {/* Cost Status Badge */}
        {costStatus && (
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm ${uiConfig.layout.radius.md} ${
              costStatus.level === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              costStatus.level === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
              costStatus.level === 'high' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              <DollarSign size={14} />
              {costStatus.label}
            </span>
          </div>
        )}

        {/* Category Scores Grid - All 6 Onboarding Categories */}
        {town.categoryScores && (
          <>
            <div className={`text-sm ${uiConfig.colors.body} mb-2 flex items-center gap-2`}>
              <span>Matching your preferences</span>
              <span className={`${uiConfig.colors.hint} text-sm`}>(weighted avg: {town.matchScore}%)</span>
            </div>
            <div className="mb-4 grid grid-rows-2 grid-flow-col gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Region</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.region || 0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Climate</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.climate || 0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Culture</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.culture || 0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Hobbies</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.hobbies || 0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Admin</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.administration || 0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${uiConfig.colors.hint} capitalize`}>Costs</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.cost || 0)}%</span>
              </div>
            </div>
          </>
        )}
        
        {/* Summary Statement */}
        <div className={`mb-5 ${uiConfig.colors.body} text-sm md:text-base`}>
          {(() => {
            const summaryParts = [];

            // Culture/Region compatibility
            if (town.categoryScores?.culture >= 70 || town.categoryScores?.region >= 70) {
              summaryParts.push("Strong cultural compatibility");
            }

            // Cost savings
            if (town.cost_index) {
              const savings = 2500 - town.cost_index; // Assuming $2500/mo baseline
              if (savings > 0) {
                summaryParts.push(`Cost-effective: Save $${Math.round(savings)}/month`);
              }
            }

            // Climate match
            if (town.categoryScores?.climate >= 80) {
              summaryParts.push("Ideal climate match");
            }

            // Join with periods
            return summaryParts.length > 0 ? summaryParts.join(". ") + "." :
              "Discover why this could be your perfect retirement destination.";
          })()}
        </div>

        {/* Personalization Note - appears when coverage is low but score is high */}
        {town.personalizationNote && (
          <div className={`flex items-start gap-2 mb-4 p-3 ${uiConfig.layout.radius.md} bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800`}>
            <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {town.personalizationNote}
            </p>
          </div>
        )}

        {/* Luxury Cost Note - appears when high-budget user matched with very cheap town */}
        {luxuryCostNote && (
          <div className={`flex items-start gap-2 mb-4 p-3 ${uiConfig.layout.radius.md} bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 {luxuryCostNote}
            </p>
          </div>
        )}

        <button
          onClick={handleExploreClick}
          className={`w-full px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
        >
          Explore Town
        </button>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(DailyTownCard);
