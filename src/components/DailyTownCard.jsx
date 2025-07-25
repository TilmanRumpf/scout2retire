import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleImage from './SimpleImage';
import TownImageOverlay from './TownImageOverlay';
import { getTownOfTheDay, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import { getCurrentUser } from '../utils/authUtils';
import { MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import toast from 'react-hot-toast';

export default function DailyTownCard() {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleFavoriteToggle = async () => {
    if (!userId || isUpdating || !town) return;
    
    setIsUpdating(true);
    try {
      const { success, action, error } = await toggleFavorite(userId, town.id);
      
      if (success) {
        const newFavoriteState = action === 'added';
        setIsFavorited(newFavoriteState);
        toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.error(`Failed to update favorite: ${error?.message}`);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorite");
    } finally {
      setIsUpdating(false);
    }
  };

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
        <SimpleImage
          src={town.image_url_1}
          alt={town.name}
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
            appealStatement={(() => {
              // Generate appeal statement based on category scores
              if (town.categoryScores?.culture >= 80 || town.categoryScores?.region >= 80) {
                return "Strong cultural fit";
              }
              if (town.cost_index && 2500 - town.cost_index > 500) {
                return "Great value";
              }
              if (town.categoryScores?.climate >= 80) {
                return "Perfect climate";
              }
              return "Worth exploring";
            })()}
          />
        )}
      </div>
      
      <div className="p-5">
        {/* Header: Town Name, Country */}
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <h3 className={`text-lg md:text-xl font-semibold ${uiConfig.colors.heading} mb-1`}>{town.name}</h3>
            <p className={`text-sm ${uiConfig.colors.body}`}>{town.country}</p>
          </div>
        </div>
        
        {/* Town Description - responsive height */}
        <div className={`mb-4 ${uiConfig.colors.body} text-sm md:text-base leading-relaxed`}>
          <p className="min-h-[4rem] md:min-h-[4.5rem]">
            {town.description || "Charming European destination offering excellent quality of life, beautiful historic architecture, and affordable living costs. Perfect for retirees seeking authentic culture without Western European prices."}
          </p>
        </div>

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
                <span className={`${uiConfig.colors.hint} capitalize`}>Budget</span>
                <span className={`font-medium ${uiConfig.colors.heading}`}>{Math.round(town.categoryScores.budget || 0)}%</span>
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
            
            // Budget savings
            if (town.cost_index) {
              const savings = 2500 - town.cost_index; // Assuming $2500/mo baseline
              if (savings > 0) {
                summaryParts.push(`Budget-friendly: Save $${Math.round(savings)}/month`);
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