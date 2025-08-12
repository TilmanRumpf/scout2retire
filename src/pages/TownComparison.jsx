import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser, useFavorites, useTowns } from '../hooks/useOptimizedData';
import { fetchTowns } from '../utils/townUtils.jsx';
import TownRadarChart from '../components/TownRadarChart';
import LikeButton from '../components/LikeButton';
import UnifiedHeader from '../components/UnifiedHeader';
import ComparePageSpacer from '../components/ComparePageSpacer';
import SwipeableCompareContent from '../components/SwipeableCompareContent';
import ComparisonGrid from '../components/ComparisonGrid';
import { Eye, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function TownComparison() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use DataContext hooks
  const { user, loading: userLoading } = useCurrentUser();
  const { favorites, toggleFavorite: optimisticToggleFavorite, isFavorited } = useFavorites();
  
  // Parse town IDs from URL immediately
  const townIdsFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const townIdsParam = params.get('towns');
    if (!townIdsParam) return [];
    
    return townIdsParam
      .split(',')
      .map(id => id.trim())
      .filter(id => id);
  }, [location.search]);

  // Local state for towns data (we'll fetch directly for now)
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = user?.id;

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

  // Load data based on URL or favorites
  useEffect(() => {
    const loadComparisonData = async () => {
      // Check authentication
      if (!userLoading && !user) {
        navigate('/welcome');
        return;
      }
      
      if (userLoading) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine which towns to load
        let townIdsToLoad = townIdsFromUrl;
        
        // If no towns in URL, use top favorites
        if (townIdsToLoad.length === 0 && favorites.length > 0) {
          const favoriteTownIds = favorites
            .slice(0, 3)
            .map(fav => fav.town_id);
          
          // Update URL with favorite town IDs
          navigate(`/compare?towns=${favoriteTownIds.join(',')}`, { replace: true });
          townIdsToLoad = favoriteTownIds;
        }
        
        // If still no towns, show error
        if (townIdsToLoad.length === 0) {
          setError('No towns selected for comparison. Please select towns from your favorites.');
          setLoading(false);
          return;
        }
        
        // Validate max 3 towns
        if (townIdsToLoad.length > 3) {
          setError('Maximum 3 towns can be compared at once');
          setLoading(false);
          return;
        }
        
        // Fetch the actual town data
        const { success, towns: fetchedTowns } = await fetchTowns({
          townIds: townIdsToLoad,
          userId: user.id,
          usePersonalization: true
        });
        
        if (success && fetchedTowns) {
          setTowns(fetchedTowns);
        } else {
          setError('Failed to load town data');
        }
      } catch (err) {
        console.error('Error loading comparison data:', err);
        setError('An error occurred loading comparison data');
      } finally {
        setLoading(false);
      }
    };
    
    loadComparisonData();
  }, [user, userLoading, navigate, townIdsFromUrl, favorites]);

  // Handle favorite toggle
  const handleToggleFavorite = async (townId) => {
    if (!userId) return;
    
    const town = towns.find(t => String(t.id) === String(townId));
    if (town) {
      await optimisticToggleFavorite(townId, town.name, town.country);
      
      // Check if the town is still favorited after toggle
      const isStillFavorited = favorites.some(fav => String(fav.town_id) === String(townId));
      
      // If removed from favorites and it was in comparison, remove it
      if (!isStillFavorited) {
        const remainingTowns = towns.filter(t => String(t.id) !== String(townId));
        setTowns(remainingTowns);
        
        if (remainingTowns.length > 0) {
          const remainingIds = remainingTowns.map(t => t.id);
          navigate(`/compare?towns=${remainingIds.join(',')}`, { replace: true });
        } else {
          // If no towns left, redirect to favorites after a brief delay
          toast.success('No towns left to compare. Redirecting to favorites...');
          setTimeout(() => {
            navigate('/favorites');
          }, 1500);
        }
      }
    }
  };

  // Add town to comparison
  const handleAddTown = () => {
    if (towns.length >= 3) {
      toast.error('Maximum 3 towns can be compared at once');
      return;
    }
    // Navigate to favorites page with a return URL
    navigate('/favorites?selectMode=compare&returnUrl=/compare');
  };

  // Remove town from comparison
  const handleRemoveTown = (townId) => {
    const remainingTowns = towns.filter(t => String(t.id) !== String(townId));
    setTowns(remainingTowns);
    
    if (remainingTowns.length > 0) {
      const remainingIds = remainingTowns.map(t => t.id);
      navigate(`/compare?towns=${remainingIds.join(',')}`, { replace: true });
    } else {
      navigate('/favorites');
    }
  };

  // Get data for specific category
  const getCategoryData = (town, category) => {
    switch (category) {
      case 'overview':
        return {
          'Overall Match': town.matchScore || town.overall_match || 0,
          'Cost Index': 100 - (town.cost_index / 50), // Inverse for better = lower cost
          'Healthcare': town.healthcare_score * 10 || 0,
          'Safety': town.safety_score * 10 || 0,
          'Internet': town.internet_score * 10 || 0,
          'English Speaking': town.english_proficiency * 10 || 0
        };
      case 'region':
        return {
          'Region Match': town.categoryScores?.region || 0,
          'Timezone Compatibility': town.timezone_compatibility || 0,
          'Flight Time': 100 - (town.flight_hours || 0) * 5, // Inverse for shorter = better
          'Cultural Similarity': town.cultural_similarity || 0,
          'Language Ease': town.language_ease || 0
        };
      case 'climate':
        return {
          'Climate Match': town.categoryScores?.climate || 0,
          'Temperature': town.avg_temp_score || 0,
          'Sunshine': town.sunshine_hours / 30 || 0,
          'Rainfall': 100 - (town.rainfall_mm / 20) || 0, // Inverse for less = better
          'Humidity': 100 - town.humidity || 0, // Inverse for less = better
          'Air Quality': town.air_quality || 0
        };
      case 'culture':
        return {
          'Culture Match': town.categoryScores?.culture || 0,
          'Food Scene': town.food_scene || 0,
          'Arts & Music': town.arts_music || 0,
          'Social Life': town.social_life || 0,
          'Expat Community': town.expat_community || 0,
          'Local Friendliness': town.local_friendliness || 0
        };
      case 'hobbies':
        return {
          'Hobbies Match': town.categoryScores?.hobbies || 0,
          'Outdoor Activities': town.outdoor_activities || 0,
          'Sports Facilities': town.sports_facilities || 0,
          'Cultural Activities': town.cultural_activities || 0,
          'Shopping': town.shopping || 0,
          'Nightlife': town.nightlife || 0
        };
      case 'administration':
        return {
          'Admin Match': town.categoryScores?.administration || 0,
          'Visa Ease': town.visa_ease || 0,
          'Residency Process': town.residency_ease || 0,
          'Tax Benefits': town.tax_benefits || 0,
          'Banking': town.banking_ease || 0,
          'Property Rights': town.property_rights || 0
        };
      case 'budget':
        return {
          'Budget Match': town.categoryScores?.budget || 0,
          'Affordability': 100 - (town.cost_index / 50) || 0,
          'Housing Costs': 100 - (town.housing_cost / 50) || 0,
          'Food Costs': 100 - (town.food_cost / 50) || 0,
          'Healthcare Costs': 100 - (town.healthcare_cost / 50) || 0,
          'Transportation': 100 - (town.transport_cost / 50) || 0
        };
      default:
        return {};
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader title="Compare Towns" />
        <ComparePageSpacer />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader title="Compare Towns" />
        <ComparePageSpacer />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/favorites')}
              className={uiConfig.components.button}
            >
              Go to Favorites
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader title="Compare Towns" />
      <ComparePageSpacer />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Compare Towns</h1>
          <p className="text-gray-600">Comparing {towns.length} of 3 towns:</p>
        </div>

        {/* Add Town Button */}
        {towns.length < 3 && (
          <button
            onClick={handleAddTown}
            className={`${uiConfig.components.button} mb-4`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Town
          </button>
        )}

        {/* Towns Grid */}
        {towns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No towns to compare. Please select towns from your favorites.</p>
            <button
              onClick={() => navigate('/favorites')}
              className={uiConfig.components.button}
            >
              Go to Favorites
            </button>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg flex items-center whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <cat.icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Comparison Content */}
            <SwipeableCompareContent
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            >
              <ComparisonGrid
                towns={towns}
                activeCategory={activeCategory}
                getCategoryData={getCategoryData}
                handleRemoveTown={handleRemoveTown}
                handleToggleFavorite={handleToggleFavorite}
                isFavorited={isFavorited}
                userId={userId}
              />
            </SwipeableCompareContent>
          </>
        )}
      </div>
    </div>
  );
}