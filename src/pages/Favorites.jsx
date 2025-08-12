// pages/Favorites.jsx - Optimized with centralized data caching
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import SimpleImage from '../components/SimpleImage';
import TownImageOverlay from '../components/TownImageOverlay';
import { MapPin } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

// Predefined regions and their countries from onboarding
const REGIONS = [
  'North America',
  'Central America',
  'Caribbean',
  'South America',
  'Europe',
  'Mediterranean',
  'Asia',
  'Africa',
  'Australia & New Zealand',
  'Oceania'
];

const REGION_COUNTRIES = {
  'North America': ['Mexico', 'United States', 'Canada'],
  'Central America': ['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama'],
  'Caribbean': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica', 'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'],
  'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
  'Europe': ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Vatican City'],
  'Mediterranean': ['Spain', 'France', 'Monaco', 'Italy', 'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'Greece', 'Turkey', 'Cyprus', 'Syria', 'Lebanon', 'Israel', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Malta'],
  'Asia': ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'East Timor', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
  'Africa': ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
  'Australia & New Zealand': ['Australia', 'New Zealand'],
  'Oceania': ['Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
};

export default function Favorites() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoriteTowns, setFavoriteTowns] = useState([]);
  const [allTowns, setAllTowns] = useState([]); // All towns for search
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [townsLoading, setTownsLoading] = useState(false);
  
  const loading = userLoading || townsLoading;
  const [sortBy, setSortBy] = useState('match'); // Changed default to 'match'
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterMatchRange, setFilterMatchRange] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Selection mode state
  const [selectedTowns, setSelectedTowns] = useState([]);
  const params = new URLSearchParams(location.search);
  const selectMode = params.get('selectMode');
  
  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const result = await getCurrentUser();
      setUser(result.user);
      setUserLoading(false);
    };
    loadUser();
  }, []);
  
  // Load favorites and all towns when user is loaded
  useEffect(() => {
    if (user?.id) {
      const loadFavoritesData = async () => {
        setTownsLoading(true);
        
        // Load favorites
        const favResult = await fetchFavorites(user.id, 'Favorites');
        if (favResult.success) {
          setFavorites(favResult.favorites);
          
          // Load town data for favorites
          if (favResult.favorites.length > 0) {
            const townIds = favResult.favorites.map(f => f.town_id);
            const townsResult = await fetchTowns({ 
              townIds,
              userId: user.id,
              component: 'Favorites'
            });
            if (townsResult.success) {
              setFavoriteTowns(townsResult.towns);
            }
          }
        }
        
        // Load ALL towns for search functionality
        const allTownsResult = await fetchTowns({ 
          userId: user.id,
          component: 'Favorites-Search'
        });
        if (allTownsResult.success) {
          setAllTowns(allTownsResult.towns);
        }
        
        setTownsLoading(false);
      };
      loadFavoritesData();
    }
  }, [user]);
  
  // Handle toggle favorite
  const handleToggleFavorite = async (townId, townName, townCountry) => {
    if (!user?.id) {
      toast.error('Please log in to save favorites');
      return;
    }
    
    const result = await toggleFavorite(user.id, townId, townName, townCountry);
    if (result.success) {
      // Reload favorites
      const favResult = await fetchFavorites(user.id, 'Favorites');
      if (favResult.success) {
        setFavorites(favResult.favorites);
        
        // Reload town data
        if (favResult.favorites.length > 0) {
          const townIds = favResult.favorites.map(f => f.town_id);
          const townsResult = await fetchTowns({ 
            townIds,
            userId: user.id,
            component: 'Favorites'
          });
          if (townsResult.success) {
            setFavoriteTowns(townsResult.towns);
          }
        } else {
          setFavoriteTowns([]);
        }
      }
    }
  };
  const returnUrl = params.get('returnUrl');
  const isSelectionMode = selectMode === 'compare';

  // Navigate to welcome if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/welcome');
    }
  }, [user, userLoading, navigate]);

  const handleFavoriteChange = async (townId, townName, townCountry) => {
    await handleToggleFavorite(townId, townName, townCountry);
  };

  // Get unique values for filters (using favoriteTowns instead of favorites.towns)
  const getUniqueCountries = () => {
    const allCountries = [...new Set(favoriteTowns.map(town => town?.country).filter(Boolean))];
    
    // If a region is selected, filter countries to only show those in that region
    if (filterRegion !== 'all' && REGION_COUNTRIES[filterRegion]) {
      return allCountries.filter(country => 
        REGION_COUNTRIES[filterRegion].includes(country)
      ).sort();
    }
    
    return allCountries.sort();
  };
  
  // When region changes, reset country filter if the selected country is not in the new region
  useEffect(() => {
    if (filterRegion !== 'all' && filterCountry !== 'all') {
      const availableCountries = getUniqueCountries();
      if (!availableCountries.includes(filterCountry)) {
        setFilterCountry('all');
      }
    }
  }, [filterRegion, filterCountry]); // eslint-disable-line react-hooks/exhaustive-deps
  // getUniqueCountries uses favorites state which changes independently

  // Cost range helper
  const getCostRange = (cost) => {
    if (!cost) return 'unknown';
    if (cost < 2000) return 'under2000';
    if (cost < 3000) return '2000-3000';
    if (cost < 4000) return '3000-4000';
    return 'over4000';
  };

  // Match score range helper
  const getMatchRange = (score) => {
    if (!score) return 'unknown';
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  };

  // Count active filters
  const activeFilterCount = () => {
    let count = 0;
    if (filterCountry !== 'all') count++;
    if (filterRegion !== 'all') count++;
    if (filterCostRange !== 'all') count++;
    if (filterMatchRange !== 'all') count++;
    return count;
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterCountry('all');
    setFilterRegion('all');
    setFilterCostRange('all');
    setFilterMatchRange('all');
  };

  // Check if a town is favorited
  const isFavorited = (townId) => {
    return favorites.some(fav => fav.town_id === townId);
  };

  // Sort and filter towns (both favorites and search results)
  const getSortedAndFilteredTowns = () => {
    let filtered;
    
    // If there's a search term, search ALL towns
    if (searchTerm.trim()) {
      filtered = allTowns.filter(town => 
        town.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        town.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        town.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Otherwise, show only favorites
      filtered = favoriteTowns;
    }
    
    // Apply region filter
    if (filterRegion !== 'all' && REGION_COUNTRIES[filterRegion]) {
      filtered = filtered.filter(town => 
        REGION_COUNTRIES[filterRegion].includes(town.country)
      );
    }
    
    // Apply country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(town => town.country === filterCountry);
    }
    
    if (filterCostRange !== 'all') {
      filtered = filtered.filter(town => getCostRange(town.cost_index) === filterCostRange);
    }
    
    if (filterMatchRange !== 'all') {
      filtered = filtered.filter(town => getMatchRange(town.matchScore) === filterMatchRange);
    }
    
    // Apply sorting (now working directly with town objects)
    switch (sortBy) {
      case 'match':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'cost-low':
        filtered.sort((a, b) => (a.cost_index || 0) - (b.cost_index || 0));
        break;
      case 'cost-high':
        filtered.sort((a, b) => (b.cost_index || 0) - (a.cost_index || 0));
        break;
      case 'region':
        filtered.sort((a, b) => ((b.categoryScores?.region || 0) - (a.categoryScores?.region || 0)));
        break;
      case 'climate':
        filtered.sort((a, b) => ((b.categoryScores?.climate || 0) - (a.categoryScores?.climate || 0)));
        break;
      case 'culture':
        filtered.sort((a, b) => ((b.categoryScores?.culture || 0) - (a.categoryScores?.culture || 0)));
        break;
      case 'hobbies':
        filtered.sort((a, b) => ((b.categoryScores?.hobbies || 0) - (a.categoryScores?.hobbies || 0)));
        break;
      case 'administration':
        filtered.sort((a, b) => ((b.categoryScores?.administration || 0) - (a.categoryScores?.administration || 0)));
        break;
      case 'budget':
        filtered.sort((a, b) => ((b.categoryScores?.budget || 0) - (a.categoryScores?.budget || 0)));
        break;
      case 'date':
      default:
        // Already sorted by date (newest first) from the database
        break;
    }
    
    return filtered;
  };

  const handleCompareSelected = () => {
    if (isSelectionMode && selectedTowns.length > 0) {
      // In selection mode, use the selected towns
      navigate(`${returnUrl || '/compare'}?towns=${selectedTowns.join(',')}`);
    } else {
      // Regular mode - use top 3 favorites
      const selectedTownIds = favorites.slice(0, 3).map(f => f.town_id);
      if (selectedTownIds.length >= 2) {
        navigate(`/compare?towns=${selectedTownIds.join(',')}`);
      } else {
        toast.error("You need at least 2 favorites to compare");
      }
    }
  };
  
  // Toggle town selection in selection mode
  const handleToggleSelection = (townId) => {
    setSelectedTowns(prev => {
      const isSelected = prev.includes(townId);
      if (isSelected) {
        return prev.filter(id => id !== townId);
      } else {
        if (prev.length >= 3) {
          toast.error('Maximum 3 towns can be compared');
          return prev;
        }
        return [...prev, townId];
      }
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>Loading favorites...</div>
      </div>
    );
  }

  const sortedTowns = getSortedAndFilteredTowns();
  const countries = getUniqueCountries();
  const filterCount = activeFilterCount();

  return (
      <div className={`min-h-screen ${uiConfig.colors.page}`}>
        {/* Unified Header with integrated filters and menu */}
      <UnifiedHeader
        variant="compact"
        title={isSelectionMode ? "Select Towns to Compare" : "Favorites"}
        totalCount={searchTerm ? allTowns.length : favorites.length}
        filteredCount={sortedTowns.length}
        showFilters={!isSelectionMode} // Show filters when not in selection mode
        filterProps={{
          variant: "integrated",
          sortBy: sortBy,
          setSortBy: setSortBy,
          filterRegion: filterRegion,
          setFilterRegion: setFilterRegion,
          filterCountry: filterCountry,
          setFilterCountry: setFilterCountry,
          filterCostRange: filterCostRange,
          setFilterCostRange: setFilterCostRange,
          filterMatchRange: filterMatchRange,
          setFilterMatchRange: setFilterMatchRange,
          regions: REGIONS,
          countries: countries,
          filterCount: filterCount,
          clearFilters: clearFilters,
          resultsCount: sortedTowns.length,
          searchTerm: searchTerm,
          setSearchTerm: setSearchTerm,
          searchPlaceholder: "Search all towns..."
        }}
      />
      
      {/* Spacer for fixed header with filters */}
      <HeaderSpacer hasFilters={true} />

      <main className="max-w-7xl mx-auto px-4 py-3">
        {/* Search box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search all towns by name, country, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2 ${uiConfig.colors.card} border ${uiConfig.borders.color} ${uiConfig.layout.radius.md} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {searchTerm && (
            <p className="mt-2 text-sm ${uiConfig.colors.body}">
              Showing {sortedTowns.length} {sortedTowns.length === 1 ? 'town' : 'towns'} 
              {searchTerm && ` matching "${searchTerm}"`}
              {sortedTowns.some(t => !isFavorited(t.id)) && ' (including non-favorites)'}
            </p>
          )}
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-24 w-24 ${uiConfig.colors.muted} mb-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
              No favorites yet
            </h2>
            <p className={`${uiConfig.colors.body} mb-8 max-w-md mx-auto`}>
              Start exploring towns and save your favorites to build your personalized retirement shortlist.
            </p>
            <Link
              to="/discover"
              className={`inline-flex items-center px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`${uiConfig.icons.size.md} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Discover Towns
            </Link>
          </div>
        ) : (
          <>

            {/* Selection mode header */}
            {isSelectionMode && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Select up to 3 towns to compare
                    {selectedTowns.length > 0 && ` (${selectedTowns.length} selected)`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(returnUrl || '/compare')}
                    className={`px-4 py-2 ${uiConfig.colors.btnSecondary} ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompareSelected}
                    disabled={selectedTowns.length === 0}
                    className={`px-4 py-2 ${selectedTowns.length > 0 ? uiConfig.colors.btnPrimary : 'bg-gray-300 text-gray-500 cursor-not-allowed'} ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
                  >
                    Compare {selectedTowns.length > 0 ? `(${selectedTowns.length})` : ''}
                  </button>
                </div>
              </div>
            )}
            
            {/* Regular Compare Button - Show when not in selection mode */}
            {!isSelectionMode && favorites.length >= 2 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleCompareSelected}
                  className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
                >
                  Compare Top 3
                </button>
              </div>
            )}

            {/* Favorites Grid */}
            {sortedTowns.length === 0 ? (
              <div className={`text-center py-12 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg}`}>
                <p className={`${uiConfig.colors.body} mb-4`}>
                  No towns match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className={`text-sm ${uiConfig.colors.accent} hover:opacity-80`}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTowns.map((town) => {
                  if (!town) {
                    // Skip null entries
                    return null;
                  }
                  const isSelected = selectedTowns.includes(town.id);
                  const isFav = isFavorited(town.id);
                  return (
                    <div
                      key={town.id}
                      className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden ${uiConfig.animation.transition} hover:${uiConfig.layout.shadow.lg} ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={isSelectionMode ? () => handleToggleSelection(town.id) : undefined}
                    >
                      <div className="relative h-40">
                        <SimpleImage
                          src={town.image_url_1}
                          alt={town.name}
                          className="w-full h-full object-cover"
                          fallbackIcon={MapPin}
                          fallbackIconSize={48}
                        />
                        
                        {/* Selection mode indicator */}
                        {isSelectionMode && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className={`w-6 h-6 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'} flex items-center justify-center`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {user && !isSelectionMode && (
                          <>
                          <TownImageOverlay
                            town={town}
                            matchScore={town.matchScore}
                            isFavorited={isFav}
                            isUpdating={false}
                            onFavoriteClick={async () => {
                              await handleFavoriteChange(town.id, town.name, town.country);
                            }}
                            appealStatement={
                              town.cost_index <= 1500 ? "Budget-friendly" :
                              town.matchScore >= 80 ? "Strong match" :
                              town.healthcare_score >= 8 ? "Great healthcare" :
                              "Saved favorite"
                            }
                          />
                          </>
                        )}
                      </div>
                      
                      <div className="p-4">
                        {/* Header: Town Name, Country (left) and Cost (right) */}
                        <div className="flex justify-between items-baseline mb-3">
                          <div className={`text-sm ${uiConfig.colors.heading}`}>
                            {town.name}, {town.country}
                          </div>
                          {(town.cost_of_living_usd || town.typical_monthly_living_cost) && (
                            <span className={`text-sm ${uiConfig.colors.body}`}>
                              ${town.cost_of_living_usd || town.typical_monthly_living_cost}/mo
                            </span>
                          )}
                        </div>
                        
                        {/* Highlights - Always 2 lines */}
                        <div className={`mb-3 h-8 ${uiConfig.colors.body} text-xs leading-4`}>
                          {town.insights && town.insights.length > 0 ? (
                            <div className="line-clamp-2">
                              {typeof town.insights[0] === 'string' ? town.insights[0] : town.insights[0].text}
                            </div>
                          ) : town.matchReasons && town.matchReasons.length > 0 ? (
                            <div className="line-clamp-2">
                              {town.matchReasons.slice(0, 2).join('. ')}
                            </div>
                          ) : (
                            <div className="line-clamp-2">
                              {town.highlights ? town.highlights.slice(0, 2).join('. ') : 'Discover this beautiful retirement destination'}
                            </div>
                          )}
                        </div>
                        
                        {/* Category Scores Grid - All 6 Onboarding Categories */}
                        {town.categoryScores && (
                          <>
                            <div className={`text-xs ${uiConfig.colors.body} mb-1.5`}>
                              Matching your preferences:
                            </div>
                            <div className="mb-3 grid grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 text-xs">
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
                          </>
                        )}
                        
                        {/* Synopsis - Always 3 lines */}
                        <p className={`${uiConfig.colors.body} text-xs mb-4 line-clamp-3 h-12 leading-4`}>
                          {town.description || "Discover this beautiful town for your retirement."}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          {isSelectionMode ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelection(town.id);
                              }}
                              className={`px-3 py-1.5 text-xs ${isSelected ? 'bg-blue-500 text-white' : uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md}`}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => navigate(`/discover?town=${town.id}`)}
                                className={`px-3 py-1.5 text-xs ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md}`}
                              >
                                Explore
                              </button>
                              <button
                                onClick={() => {
                                  const otherFavorites = favorites.filter(f => String(f.town_id) !== String(town.id))
                                                                  .map(f => f.town_id);
                                  navigate(`/compare?towns=${[town.id, ...otherFavorites].slice(0, 3).join(',')}`);
                                }}
                                className={`px-3 py-1.5 text-xs ${uiConfig.colors.success} hover:underline`}
                              >
                                Compare
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            {sortedTowns.length > 6 && (
              <div className="mt-8 text-center">
                <Link
                  to="/discover"
                  className={`inline-flex items-center px-4 py-2 ${uiConfig.colors.accent} hover:opacity-80 ${uiConfig.font.weight.medium} ${uiConfig.animation.transition}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${uiConfig.icons.size.md} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add More Towns
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      </div>
  );
}