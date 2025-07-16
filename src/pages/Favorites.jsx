// pages/Favorites.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, toggleFavorite } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import SimpleImage from '../components/SimpleImage';
import TownImageOverlay from '../components/TownImageOverlay';
import { MapPin } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
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
  const [favorites, setFavorites] = useState([]);
  // Note: totalFavoriteCount was removed as it was unused
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('match'); // Changed default to 'match'
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterMatchRange, setFilterMatchRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // loadFavorites is only called on mount and doesn't need to be in dependencies

  const loadFavorites = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      setUserId(user.id);
      
      const { success, favorites: userFavorites, error } = await fetchFavorites(user.id);
      if (success) {
        setFavorites(userFavorites);
      } else {
        console.error("Error loading favorites:", error);
        toast.error("Failed to load favorites");
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (townId, isFavorited) => {
    if (!isFavorited) {
      // Remove from favorites list when unfavorited
      setFavorites(prev => prev.filter(fav => fav.town_id !== townId));
      toast.success("Removed from favorites");
    }
  };

  // Get unique values for filters
  const getUniqueCountries = () => {
    const allCountries = [...new Set(favorites.map(fav => fav.towns?.country).filter(Boolean))];
    
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

  // Sort and filter favorites
  const getSortedAndFilteredFavorites = () => {
    let filtered = [...favorites];
    
    // Apply region filter - filter by countries in the selected region
    if (filterRegion !== 'all' && REGION_COUNTRIES[filterRegion]) {
      filtered = filtered.filter(fav => 
        REGION_COUNTRIES[filterRegion].includes(fav.towns?.country)
      );
    }
    
    // Apply country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(fav => fav.towns?.country === filterCountry);
    }
    
    if (filterCostRange !== 'all') {
      filtered = filtered.filter(fav => getCostRange(fav.towns?.cost_index) === filterCostRange);
    }
    
    if (filterMatchRange !== 'all') {
      filtered = filtered.filter(fav => getMatchRange(fav.towns?.matchScore) === filterMatchRange);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'match':
        filtered.sort((a, b) => (b.towns?.matchScore || 0) - (a.towns?.matchScore || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.towns?.name || '').localeCompare(b.towns?.name || ''));
        break;
      case 'cost-low':
        filtered.sort((a, b) => (a.towns?.cost_index || 0) - (b.towns?.cost_index || 0));
        break;
      case 'cost-high':
        filtered.sort((a, b) => (b.towns?.cost_index || 0) - (a.towns?.cost_index || 0));
        break;
      case 'region':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.region || 0) - (a.towns?.categoryScores?.region || 0)));
        break;
      case 'climate':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.climate || 0) - (a.towns?.categoryScores?.climate || 0)));
        break;
      case 'culture':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.culture || 0) - (a.towns?.categoryScores?.culture || 0)));
        break;
      case 'hobbies':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.hobbies || 0) - (a.towns?.categoryScores?.hobbies || 0)));
        break;
      case 'administration':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.administration || 0) - (a.towns?.categoryScores?.administration || 0)));
        break;
      case 'budget':
        filtered.sort((a, b) => ((b.towns?.categoryScores?.budget || 0) - (a.towns?.categoryScores?.budget || 0)));
        break;
      case 'date':
      default:
        // Already sorted by date (newest first) from the database
        break;
    }
    
    return filtered;
  };

  const handleCompareSelected = () => {
    const selectedTowns = favorites.slice(0, 3).map(f => f.town_id);
    if (selectedTowns.length >= 2) {
      navigate(`/compare?towns=${selectedTowns.join(',')}`);
    } else {
      toast.error("You need at least 2 favorites to compare");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>Loading favorites...</div>
      </div>
    );
  }

  const sortedFavorites = getSortedAndFilteredFavorites();
  const countries = getUniqueCountries();
  const filterCount = activeFilterCount();

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* Unified Header with integrated filters and menu */}
      <UnifiedHeader
        variant="compact"
        title="Favorites"
        totalCount={favorites.length}
        filteredCount={sortedFavorites.length}
        showFilters={favorites.length > 0} // Only show filters if there are favorites
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
          resultsCount: sortedFavorites.length
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-3">
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

            {/* Compare Button - Show separately when there are enough favorites */}
            {favorites.length >= 2 && (
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
            {sortedFavorites.length === 0 ? (
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
                {sortedFavorites.map((favorite) => {
                  const town = favorite.towns;
                  return (
                    <div
                      key={favorite.town_id}
                      className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden ${uiConfig.animation.transition} hover:${uiConfig.layout.shadow.lg}`}
                    >
                      <div className="relative h-40">
                        <SimpleImage
                          src={town.image_url_1}
                          alt={town.name}
                          className="w-full h-full object-cover"
                          fallbackIcon={MapPin}
                          fallbackIconSize={48}
                        />
                        
                        {userId && (
                          <TownImageOverlay
                            town={town}
                            matchScore={town.matchScore}
                            isFavorited={true}
                            isUpdating={false}
                            onFavoriteClick={async () => {
                              const { success, action, error } = await toggleFavorite(userId, town.id);
                              if (success) {
                                handleFavoriteChange(town.id, action === 'added');
                                toast.success(action === 'added' ? 'Added to favorites' : 'Removed from favorites');
                              } else {
                                toast.error(`Failed to update favorite: ${error?.message}`);
                              }
                            }}
                            appealStatement={
                              town.cost_index <= 1500 ? "Budget-friendly" :
                              town.matchScore >= 80 ? "Strong match" :
                              town.healthcare_score >= 8 ? "Great healthcare" :
                              "Saved favorite"
                            }
                          />
                        )}
                      </div>
                      
                      <div className="p-4">
                        {/* Header: Town Name, Country (left) and Cost (right) */}
                        <div className="flex justify-between items-baseline mb-3">
                          <div className={`text-sm ${uiConfig.colors.heading}`}>
                            {town.name}, {town.country}
                          </div>
                          {town.cost_index && (
                            <span className={`text-sm ${uiConfig.colors.body}`}>
                              ${town.cost_index}/mo
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            {sortedFavorites.length > 6 && (
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