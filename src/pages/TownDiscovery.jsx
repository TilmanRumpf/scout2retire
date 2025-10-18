import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites, toggleFavorite } from '../utils/townUtils.jsx';
import toast from 'react-hot-toast';
import OptimizedImage from '../components/OptimizedImage';
import TownImageOverlay from '../components/TownImageOverlay';
import UnifiedErrorBoundary from '../components/UnifiedErrorBoundary';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import TownRadarChart from '../components/TownRadarChart';
import { uiConfig } from '../styles/uiConfig';
import { Sparkles, MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign, Target, CheckCircle } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { getFeatureLimit } from '../utils/paywallUtils.js';

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


export default function TownDiscovery() {
  const [selectedTown, setSelectedTown] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [towns, setTowns] = useState([]);
  const [townsLoading, setTownsLoading] = useState(false);
  const [totalTownCount, setTotalTownCount] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(null);
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState('match');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterMatchRange, setFilterMatchRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const loading = userLoading || townsLoading;
  const error = null;
  const onboardingCompleted = profile?.onboarding_completed || false;
  const userId = user?.id;
  
  // Helper function to check if favorited
  const isFavorited = (townId) => {
    return favorites.some(fav => fav.town_id === townId);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async (townId, townName, townCountry) => {
    if (!user?.id) {
      toast.error('Please log in to save favorites');
      return;
    }
    
    const result = await toggleFavorite(user.id, townId, townName, townCountry);
    if (result.success) {
      // Reload favorites
      const favResult = await fetchFavorites(user.id, 'TownDiscovery');
      if (favResult.success) {
        setFavorites(favResult.favorites);
      }
    }
  };

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const result = await getCurrentUser();
      setUser(result.user);
      setProfile(result.profile);
      setUserLoading(false);
    };
    loadUser();
  }, []);
  
  // Load favorites when user is loaded
  useEffect(() => {
    if (user?.id) {
      const loadFavorites = async () => {
        const result = await fetchFavorites(user.id, 'TownDiscovery');
        if (result.success) {
          setFavorites(result.favorites);
        }
      };
      loadFavorites();
    }
  }, [user]);

  // Load display limit
  useEffect(() => {
    const loadDisplayLimit = async () => {
      const limit = await getFeatureLimit('town_displays');
      setDisplayLimit(limit);
    };
    loadDisplayLimit();
  }, []);
  
  // Load towns
  useEffect(() => {
    const loadTowns = async () => {
      setTownsLoading(true);

      // Check if URL has a specific town ID - if so, force-include it
      const params = new URLSearchParams(location.search);
      const requestedTownId = params.get('town');

      const result = await fetchTowns({
        component: 'TownDiscovery',
        userId: user?.id,
        usePersonalization: !!user?.id,
        townIds: requestedTownId ? [requestedTownId] : undefined // Force-include requested town
      });
      if (result.success) {
        setTowns(result.towns);
        setTotalTownCount(result.towns.length);
      }
      setTownsLoading(false);
    };
    loadTowns();
  }, [user, location.search]); // Add location.search as dependency
  
  // Parse URL parameters and handle town selection
  useEffect(() => {
    if (towns.length === 0) return; // Wait for towns to load

    const params = new URLSearchParams(location.search);
    const townId = params.get('town');
    const regionFilter = params.get('filterRegion');

    if (townId) {
      // User came from a specific town card - show that town
      // CRITICAL: Only set once, don't override when towns reload
      setSelectedTown(prev => prev || townId);
    } else {
      // No URL param - ALWAYS pick a fresh random town with 80%+ match
      const highMatchTowns = towns.filter(t => (t.matchScore || 0) >= 80);

      if (highMatchTowns.length > 0) {
        // Randomly select from high-match towns
        const randomIndex = Math.floor(Math.random() * highMatchTowns.length);
        setSelectedTown(highMatchTowns[randomIndex].id);
      } else {
        // Fallback: if no towns have 80%+, use highest match score
        setSelectedTown(towns[0].id);
      }
    }

    // Set region filter from URL parameter
    if (regionFilter && REGIONS.includes(regionFilter)) {
      setFilterRegion(regionFilter);
    }
  }, [location.search, towns]);

  // Navigate to welcome if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/welcome');
    }
  }, [user, userLoading, navigate]);

  // Get unique countries from towns, filtered by region if selected
  const getUniqueCountries = () => {
    const allCountries = [...new Set(towns.map(town => town.country).filter(Boolean))];
    
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRegion, towns, filterCountry]); // getUniqueCountries omitted to avoid infinite loop

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
    setSearchTerm('');
  };

  // Sort and filter towns
  const getSortedAndFilteredTowns = () => {
    let filtered = [...towns];
    
    // Apply search filter
    if (searchTerm && searchTerm.trim().length > 0) {
      const search = searchTerm.trim().toLowerCase();
      
      filtered = filtered.filter(town => {
        if (!town) return false;
        
        // Search in name, region, and country
        const searchableText = [
          town.name || '',
          town.region || '',
          town.country || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(search);
      });
    }
    
    // Apply region filter - filter by countries in the selected region
    if (filterRegion !== 'all' && REGION_COUNTRIES[filterRegion]) {
      filtered = filtered.filter(town => 
        REGION_COUNTRIES[filterRegion].includes(town.country)
      );
    }
    
    // Apply country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(town => town.country === filterCountry);
    }
    
    // Apply cost range filter
    if (filterCostRange !== 'all') {
      filtered = filtered.filter(town => getCostRange(town.cost_index) === filterCostRange);
    }
    
    // Apply match score filter
    if (filterMatchRange !== 'all') {
      filtered = filtered.filter(town => getMatchRange(town.matchScore) === filterMatchRange);
    }
    
    // Apply sorting
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
        // Keep original order (personalized recommendation order)
        break;
    }
    
    return filtered;
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
  const sortedAndFilteredTowns = getSortedAndFilteredTowns();

  // Apply display limit for free/premium tiers
  const displayedTowns = displayLimit === null
    ? sortedAndFilteredTowns
    : sortedAndFilteredTowns.slice(0, displayLimit);

  const isLimitReached = displayLimit !== null && sortedAndFilteredTowns.length > displayLimit;

  const countries = getUniqueCountries();
  const filterCount = activeFilterCount();

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* Unified Header with integrated filters and menu */}
      <UnifiedHeader
        variant="compact"
        title="Discover"
        totalCount={totalTownCount}
        filteredCount={sortedAndFilteredTowns.length}
        showFilters={true}
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
          resultsCount: displayedTowns.length,
          searchTerm: searchTerm,
          setSearchTerm: setSearchTerm,
          availableTowns: towns,
          setSelectedTown: setSelectedTown
        }}
      />
      
      {/* Spacer for fixed header with filters */}
      <HeaderSpacer hasFilters={true} />

        <UnifiedErrorBoundary variant="compact"
          fallbackTitle="Discovery Error"
          fallbackMessage="We're having trouble loading town recommendations. Please try refreshing the page."
          onReset={() => window.location.reload()}
        >
        {/* Main content - no top padding since HeaderSpacer handles it */}
        <main className="max-w-7xl mx-auto px-4 py-3">
        {error && (
          <div className={`${uiConfig.colors.statusError} border ${uiConfig.colors.borderDanger} p-4 ${uiConfig.layout.radius.lg} mb-6`}>
            {typeof error === 'string' ? error : (error?.message || error?.text || 'An error occurred')}
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
                <OptimizedImage
                  key={`town-image-${selectedTownData.id}`}
                  src={selectedTownData.image_url_1}
                  alt={selectedTownData.name}
                  className="w-full h-full object-cover"
                  fallbackIcon={MapPin}
                  fallbackIconSize={64}
                />
                {userId && (
                  <TownImageOverlay
                    town={selectedTownData}
                    matchScore={selectedTownData.matchScore}
                    isFavorited={isFavorited(selectedTownData.id)}
                    isUpdating={false}
                    enableAnimation={true}
                    onFavoriteClick={async () => {
                      await handleToggleFavorite(selectedTownData.id, selectedTownData.name, selectedTownData.country);
                    }}
                    appealStatement={(() => {
                      if (!selectedTownData.categoryScores) return null; // Will show "Analyzing..."
                      
                      const categories = [
                        { name: "Region", score: selectedTownData.categoryScores.region || 0 },
                        { name: "Climate", score: selectedTownData.categoryScores.climate || 0 },
                        { name: "Culture", score: selectedTownData.categoryScores.culture || 0 },
                        { name: "Hobbies", score: selectedTownData.categoryScores.hobbies || 0 },
                        { name: "Admin", score: selectedTownData.categoryScores.administration || 0 },
                        { name: "Costs", score: selectedTownData.categoryScores.budget || 0 }
                      ];
                      
                      const best = categories.reduce((max, cat) => cat.score > max.score ? cat : max);
                      return `${best.name} Match: ${Math.round(best.score)}%`;
                    })()}
                  />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                    {selectedTownData.name}, {selectedTownData.country}
                  </h2>
                  <div className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                    Score: {Math.round(selectedTownData.matchScore || 0)}%
                  </div>
                </div>

                {/* Town description - moved here right after title */}
                <p className={`${uiConfig.colors.body} mb-6`}>
                  {selectedTownData.description || "No description available for this town."}
                </p>

                {/* Two-column layout for Town Profile and Match Reasons - Always rendered to prevent layout shift */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    {/* Town Profile - Spider Chart Container (LEFT) */}
                    <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className={uiConfig.colors.subtitle} />
                        <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Town Profile</span>
                      </div>
                      <div className="h-64">
                        <TownRadarChart key={selectedTownData.id} townData={selectedTownData} />
                      </div>
                    </div>
                    
                    {/* Why this matches you - Container (RIGHT) */}
                    {selectedTownData.matchReasons && selectedTownData.matchReasons.length > 0 ? (
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={16} className={uiConfig.colors.subtitle} />
                          <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Why this matches you</span>
                        </div>
                        
                        {/* Match reasons in ONBOARDING SEQUENCE ORDER - just key elements */}
                        <div className="space-y-1">
                          {(() => {
                            const reasons = [];
                            const scores = selectedTownData.categoryScores || {};
                            
                            // Follow EXACT onboarding sequence:
                            // 1. REGION (if high match)
                            if (scores.region >= 70) {
                              reasons.push(`Strong region match`);
                            }
                            
                            // 2. CLIMATE (if high match)
                            if (scores.climate >= 70) {
                              reasons.push(`Strong climate match`);
                            }
                            
                            // 3. CULTURE (if high match)
                            if (scores.culture >= 70) {
                              reasons.push(`Strong culture match`);
                            }
                            
                            // 4. HOBBIES (if high match)
                            if (scores.hobbies >= 70) {
                              reasons.push(`Strong hobbies match`);
                            }
                            
                            // 5. ADMIN (if high match)
                            if (scores.administration >= 70) {
                              reasons.push(`Strong admin match`);
                            }
                            
                            // 6. BUDGET/COSTS (if high match)
                            if (scores.budget >= 70) {
                              reasons.push(`Strong budget match`);
                            }
                            
                            // Add any specific location info
                            if (selectedTownData.country) {
                              reasons.push(`Excellent location in ${selectedTownData.country}`);
                            }
                            
                            // Add key practical info from matchReasons
                            if (selectedTownData.matchReasons) {
                              selectedTownData.matchReasons.forEach(r => {
                                // Filter for truly unique/important reasons not covered above
                                if (r.includes('healthcare') || r.includes('Healthcare')) {
                                  reasons.push('Healthcare meets requirements');
                                }
                                if (r.includes('temperature') && !reasons.some(x => x.includes('temperature'))) {
                                  reasons.push(r);
                                }
                              });
                            }
                            
                            // Render all reasons with consistent style
                            return reasons.map((reason, index) => (
                              <div key={index} className={`flex items-center text-sm ${uiConfig.colors.success}`}>
                                <svg className={`${uiConfig.icons.size.sm} mr-2 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {reason}
                              </div>
                            ));
                          })()}
                        </div>
                        {selectedTownData.warnings && selectedTownData.warnings.length > 0 && (
                          <div className="mt-3 p-3 ${uiConfig.colors.statusWarning} ${uiConfig.layout.radius.md}">
                            <h5 className={`text-xs font-medium ${uiConfig.colors.heading} mb-1`}>Considerations:</h5>
                            <div className="space-y-1">
                              {selectedTownData.warnings.map((warning, index) => (
                                <div key={index} className={`text-sm ${uiConfig.colors.body}`}>
                                  {typeof warning === 'string' ? warning : warning.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Loading placeholder for match reasons - no animation for stability
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border} min-h-[150px]`}>
                        <div className="flex items-center gap-2 mb-2 opacity-20">
                          <CheckCircle size={16} />
                          <span className={`text-sm font-medium`}>Loading matches...</span>
                        </div>
                      </div>
                    )}
                  </div>
                
                {/* Category Match Breakdown - Rich Data Boxes - Always rendered with min-height */}
                <div className={`mb-4 ${!selectedTownData.categoryScores ? 'min-h-[400px]' : ''}`}>
                  <h4 className={`text-sm font-semibold ${uiConfig.colors.heading} mb-3`}>Town Data and Ratings</h4>
                  {selectedTownData.categoryScores ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      
                      {/* Region & Geography Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Region</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.region || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.region || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.region || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.country && <div>Country: {selectedTownData.country}</div>}
                          {selectedTownData.region && <div>Region: {selectedTownData.region}</div>}
                          {selectedTownData.geo_region && <div>Geo-region: {selectedTownData.geo_region}</div>}
                          {selectedTownData.geographic_features && (
                            <div>Features: {
                              typeof selectedTownData.geographic_features === 'string'
                                ? selectedTownData.geographic_features.split(',').join(', ')
                                : Array.isArray(selectedTownData.geographic_features)
                                ? selectedTownData.geographic_features.join(', ')
                                : selectedTownData.geographic_features
                            }</div>
                          )}
                          {selectedTownData.elevation_meters != null && <div>Elevation: {selectedTownData.elevation_meters}m</div>}
                          {selectedTownData.distance_to_ocean_km != null && <div>Ocean distance: {selectedTownData.distance_to_ocean_km}km</div>}
                          {selectedTownData.latitude != null && selectedTownData.longitude != null && (
                            <div>Coordinates: {selectedTownData.latitude.toFixed(2)}°, {selectedTownData.longitude.toFixed(2)}°</div>
                          )}
                          {selectedTownData.nearest_airport && <div>Airport: {selectedTownData.nearest_airport}</div>}
                          {selectedTownData.airport_distance != null && <div>Airport distance: {selectedTownData.airport_distance}km</div>}
                          {selectedTownData.population != null && <div>Population: {selectedTownData.population.toLocaleString()}</div>}
                          {selectedTownData.urban_rural_character && <div>Character: {selectedTownData.urban_rural_character}</div>}
                        </div>
                      </div>

                      {/* Climate & Weather Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CloudSun size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Climate</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.climate || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.climate || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.climate || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.climate && <div>Climate type: {selectedTownData.climate}</div>}
                          {selectedTownData.avg_temp_summer != null && <div>Summer temp: {selectedTownData.avg_temp_summer}°C</div>}
                          {selectedTownData.avg_temp_winter != null && <div>Winter temp: {selectedTownData.avg_temp_winter}°C</div>}
                          {selectedTownData.summer_climate_actual && <div>Summer feel: {selectedTownData.summer_climate_actual}</div>}
                          {selectedTownData.winter_climate_actual && <div>Winter feel: {selectedTownData.winter_climate_actual}</div>}
                          {selectedTownData.sunshine_hours != null && <div>Sunshine: {selectedTownData.sunshine_hours} hrs/year</div>}
                          {selectedTownData.sunshine_level_actual && <div>Sunshine level: {selectedTownData.sunshine_level_actual}</div>}
                          {selectedTownData.annual_rainfall != null && <div>Annual rainfall: {selectedTownData.annual_rainfall}mm</div>}
                          {selectedTownData.humidity_average != null && <div>Avg humidity: {selectedTownData.humidity_average}%</div>}
                          {selectedTownData.humidity_level_actual && <div>Humidity feel: {selectedTownData.humidity_level_actual}</div>}
                          {selectedTownData.seasonal_variation_actual && <div>Seasonal variation: {selectedTownData.seasonal_variation_actual}</div>}
                          {selectedTownData.air_quality_index != null && <div>Air quality index: {selectedTownData.air_quality_index}</div>}
                        </div>
                      </div>

                      {/* Culture & Lifestyle Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Culture</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.culture || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.culture || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.culture || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.primary_language && <div>Primary language: {selectedTownData.primary_language}</div>}
                          {selectedTownData.english_proficiency_level && <div>English level: {selectedTownData.english_proficiency_level}</div>}
                          {selectedTownData.expat_community_size && <div>Expat community: {selectedTownData.expat_community_size}</div>}
                          {selectedTownData.cultural_events_rating != null && <div>Cultural events: {selectedTownData.cultural_events_rating}/10</div>}
                          {selectedTownData.nightlife_rating != null && <div>Nightlife: {selectedTownData.nightlife_rating}/10</div>}
                          {selectedTownData.restaurants_rating != null && <div>Restaurants: {selectedTownData.restaurants_rating}/10</div>}
                          {selectedTownData.museums_rating != null && <div>Museums: {selectedTownData.museums_rating}/10</div>}
                          {selectedTownData.shopping_rating != null && <div>Shopping: {selectedTownData.shopping_rating}/10</div>}
                          {selectedTownData.pace_of_life_actual && <div>Pace of life: {selectedTownData.pace_of_life_actual}</div>}
                          {selectedTownData.cultural_landmark_1 && <div>Landmark: {selectedTownData.cultural_landmark_1}</div>}
                          {selectedTownData.social_atmosphere && <div>Social vibe: {selectedTownData.social_atmosphere}</div>}
                        </div>
                      </div>

                      {/* Hobbies & Activities Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <SmilePlus size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Hobbies</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.hobbies || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.hobbies || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.hobbies || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.outdoor_rating != null && <div>Outdoor rating: {selectedTownData.outdoor_rating}/10</div>}
                          {selectedTownData.outdoor_activities_rating != null && <div>Outdoor activities: {selectedTownData.outdoor_activities_rating}/10</div>}
                          {selectedTownData.walkability != null && <div>Walkability: {selectedTownData.walkability}/10</div>}
                          {selectedTownData.beaches_nearby !== null && <div>Beaches: {selectedTownData.beaches_nearby ? 'Yes' : 'No'}</div>}
                          {selectedTownData.golf_courses_count != null && selectedTownData.golf_courses_count > 0 && <div>Golf courses: {selectedTownData.golf_courses_count}</div>}
                          {selectedTownData.hiking_trails_km != null && <div>Hiking trails: {selectedTownData.hiking_trails_km}km</div>}
                          {selectedTownData.tennis_courts_count != null && selectedTownData.tennis_courts_count > 0 && <div>Tennis courts: {selectedTownData.tennis_courts_count}</div>}
                          {selectedTownData.marinas_count != null && selectedTownData.marinas_count > 0 && <div>Marinas: {selectedTownData.marinas_count}</div>}
                          {selectedTownData.ski_resorts_within_100km != null && selectedTownData.ski_resorts_within_100km > 0 && <div>Ski resorts nearby: {selectedTownData.ski_resorts_within_100km}</div>}
                          {selectedTownData.dog_parks_count != null && selectedTownData.dog_parks_count > 0 && <div>Dog parks: {selectedTownData.dog_parks_count}</div>}
                          {selectedTownData.farmers_markets !== null && <div>Farmers markets: {selectedTownData.farmers_markets ? 'Yes' : 'No'}</div>}
                          {selectedTownData.water_bodies && <div>Water: {typeof selectedTownData.water_bodies === 'string' ? selectedTownData.water_bodies.split(',').map(w => w.trim()).join(', ') : selectedTownData.water_bodies}</div>}
                        </div>
                      </div>

                      {/* Admin & Healthcare Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <HousePlus size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Admin</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.administration || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.administration || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.administration || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.healthcare_score != null && <div>Healthcare score: {selectedTownData.healthcare_score}/10</div>}
                          {selectedTownData.safety_score != null && <div>Safety score: {selectedTownData.safety_score}/10</div>}
                          {selectedTownData.healthcare_cost_monthly != null && <div>Healthcare cost: ${selectedTownData.healthcare_cost_monthly}/mo</div>}
                          {selectedTownData.hospital_count !== null && <div>Hospitals: {selectedTownData.hospital_count}</div>}
                          {selectedTownData.nearest_major_hospital_km != null && <div>Major hospital: {selectedTownData.nearest_major_hospital_km}km</div>}
                          {selectedTownData.english_speaking_doctors !== null && <div>English doctors: {selectedTownData.english_speaking_doctors ? 'Yes' : 'No'}</div>}
                          {selectedTownData.visa_on_arrival_countries && <div>Visa on arrival: Yes</div>}
                          {selectedTownData.retirement_visa_available !== null && <div>Retirement visa: {selectedTownData.retirement_visa_available ? 'Yes' : 'No'}</div>}
                          {selectedTownData.digital_nomad_visa !== null && <div>Digital nomad visa: {selectedTownData.digital_nomad_visa ? 'Yes' : 'No'}</div>}
                          {selectedTownData.crime_rate != null && (
                            <div>Crime: {
                              typeof selectedTownData.crime_rate === 'string'
                                ? selectedTownData.crime_rate.substring(0, 30) + (selectedTownData.crime_rate.length > 30 ? '...' : '')
                                : selectedTownData.crime_rate
                            }</div>
                          )}
                          {selectedTownData.natural_disaster_risk !== null && <div>Disaster risk: {selectedTownData.natural_disaster_risk}/10</div>}
                          {selectedTownData.internet_speed != null && <div>Internet: {selectedTownData.internet_speed} Mbps</div>}
                        </div>
                      </div>

                      {/* Costs & Economics Box */}
                      <div className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} className={uiConfig.colors.subtitle} />
                            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>Costs</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            Math.round(selectedTownData.categoryScores.cost || 0) >= 80 ? uiConfig.colors.success :
                            Math.round(selectedTownData.categoryScores.cost || 0) >= 60 ? uiConfig.colors.statusWarning.split(' ')[1] :
                            uiConfig.colors.statusError.split(' ')[1]
                          }`}>
                            {Math.round(selectedTownData.categoryScores.cost || 0)}%
                          </span>
                        </div>
                        <div className={`space-y-0.5 text-xs ${uiConfig.colors.hint}`}>
                          {selectedTownData.cost_of_living_usd != null && <div>Monthly living: ${selectedTownData.cost_of_living_usd}</div>}
                          {selectedTownData.cost_index != null && <div>Cost index: {selectedTownData.cost_index}</div>}
                          {selectedTownData.rent_1bed != null && <div>1-bed rent: ${selectedTownData.rent_1bed}</div>}
                          {selectedTownData.rent_2bed_usd != null && <div>2-bed rent: ${selectedTownData.rent_2bed_usd}</div>}
                          {selectedTownData.groceries_cost != null && <div>Groceries: ${selectedTownData.groceries_cost}</div>}
                          {selectedTownData.meal_cost != null && <div>Meal out: ${selectedTownData.meal_cost}</div>}
                          {selectedTownData.utilities_cost != null && <div>Utilities: ${selectedTownData.utilities_cost}</div>}
                          {(selectedTownData.income_tax_rate_pct !== undefined && selectedTownData.income_tax_rate_pct !== null) && <div>Income tax: {selectedTownData.income_tax_rate_pct}%</div>}
                          {(selectedTownData.sales_tax_rate_pct !== undefined && selectedTownData.sales_tax_rate_pct !== null) && <div>Sales tax: {selectedTownData.sales_tax_rate_pct}%</div>}
                          {(selectedTownData.property_tax_rate_pct !== undefined && selectedTownData.property_tax_rate_pct !== null) && <div>Property tax: {selectedTownData.property_tax_rate_pct}%</div>}
                          {(selectedTownData.tax_haven_status !== undefined) && <div>Tax haven: {selectedTownData.tax_haven_status ? 'Yes' : 'No'}</div>}
                          {(selectedTownData.foreign_income_taxed !== undefined) && <div>Foreign income taxed: {selectedTownData.foreign_income_taxed ? 'Yes' : 'No'}</div>}
                        </div>
                      </div>
                      
                    </div>
                  ) : (
                    // Loading skeleton for category boxes - static placeholders for layout stability
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {['Region', 'Climate', 'Culture', 'Hobbies', 'Admin', 'Costs'].map((category, i) => (
                        <div key={i} className={`p-3 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border} min-h-[120px]`}>
                          <div className="flex items-center justify-between mb-2 opacity-30">
                            <span className={`text-sm font-medium`}>{category}</span>
                            <span className="text-lg font-bold">--</span>
                          </div>
                          <div className="space-y-1 opacity-10">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Town grid */}
        {displayedTowns.length === 0 ? (
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
          <>
            {/* Upgrade hint if limit reached */}
            {isLimitReached && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Showing {displayLimit} of {sortedAndFilteredTowns.length} towns.</strong>
                  {' '}
                  <a href="/pricing" className="underline font-semibold hover:opacity-80">
                    Upgrade to Premium
                  </a>
                  {' '}to see all results.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTowns
              .filter(town => !selectedTownData || String(town.id) !== String(selectedTownData.id))
              .map((town) => (
            <div
              key={town.id}
              className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden ${uiConfig.animation.transition} hover:${uiConfig.layout.shadow.lg} ${
                selectedTownData && String(town.id) === String(selectedTownData.id) ? `ring-2 ${uiConfig.colors.borderActive}` : ''
              }`}
            >
              <div 
                className="relative h-40 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedTown(town.id)}
                title={`View details for ${town.name}`}
              >
                <OptimizedImage
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
                    isFavorited={isFavorited(town.id)}
                    isUpdating={false}
                    onFavoriteClick={async () => {
                      await handleToggleFavorite(town.id, town.name, town.country);
                    }}
                    appealStatement={(() => {
                      if (!town.categoryScores) return null; // Will show "Analyzing..."
                      
                      const categories = [
                        { name: "Region", score: town.categoryScores.region || 0 },
                        { name: "Climate", score: town.categoryScores.climate || 0 },
                        { name: "Culture", score: town.categoryScores.culture || 0 },
                        { name: "Hobbies", score: town.categoryScores.hobbies || 0 },
                        { name: "Admin", score: town.categoryScores.administration || 0 },
                        { name: "Costs", score: town.categoryScores.budget || 0 }
                      ];
                      
                      const best = categories.reduce((max, cat) => cat.score > max.score ? cat : max);
                      return `${best.name} Match: ${Math.round(best.score)}%`;
                    })()}
                  />
                )}
              </div>
              
              <div className="p-4">
                {/* Header: Town Name, Country (left) and Price (right) */}
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
                    <div className={`text-xs ${uiConfig.colors.body} mb-1.5 flex items-center gap-1`}>
                      <span>Matching your preferences</span>
                      <span className={`${uiConfig.colors.hint} text-xs`}>(weighted avg: {town.matchScore}%)</span>
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
                      <span className={`${uiConfig.colors.hint} capitalize`}>Costs</span>
                      <span className={`font-medium ${uiConfig.colors.hint}`}>{Math.round(town.categoryScores.cost || 0)}%</span>
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
                    onClick={() => setSelectedTown(town.id)}
                    className={`px-3 py-1.5 text-xs ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} mx-1`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      const others = favorites.filter(f => String(f.town_id) !== String(town.id))
                                           .map(f => f.town_id);
                      navigate(`/compare?towns=${[...others, town.id].slice(0, 3).join(',')}`);
                    }}
                    className={`px-3 py-1.5 text-xs ${uiConfig.colors.success} hover:underline`}
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          </>
        )}

        {townsLoading && displayedTowns.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
              <span className={`${uiConfig.colors.body}`}>Loading towns...</span>
            </div>
          </div>
        )}
        
        </main>
        </UnifiedErrorBoundary>

    </div>
  );
}