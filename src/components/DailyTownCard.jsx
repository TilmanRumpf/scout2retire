import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import SimpleImage from './SimpleImage';
import { getTownOfTheDay, fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import { MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function DailyTownCard() {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
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

  const handleFavoriteToggle = (newState) => {
    setIsFavorited(newState);
    console.log(`Favorite toggled for ${town?.name}: ${newState ? 'Added' : 'Removed'}`);
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
        
        {/* Match Score */}
        {town.matchScore && (
          <div className="absolute top-3 left-3">
            <div className={`px-3 py-1.5 ${uiConfig.layout.radius.full} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
              town.matchScore >= 80 ? 'text-scout-accent-700 dark:text-scout-accent-400' :
              town.matchScore >= 60 ? 'text-gray-700 dark:text-gray-300' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {town.matchScore}% Match
            </div>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          {userId && town && (
            <LikeButton 
              townId={town.id} 
              userId={userId} 
              townName={town.name}
              townCountry={town.country}
              initialState={isFavorited}
              onToggle={handleFavoriteToggle}
            />
          )}
        </div>
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
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleExploreClick}
            className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
          >
            Explore Town
          </button>
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
    </div>
  );
}