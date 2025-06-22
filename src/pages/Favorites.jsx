// pages/Favorites.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import TownCard from '../components/TownCard';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import { Filter, X, ChevronDown, SortDesc } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('match'); // Changed default to 'match'
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterMatchRange, setFilterMatchRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

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
    const countries = [...new Set(favorites.map(fav => fav.towns?.country).filter(Boolean))];
    return countries.sort();
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(favorites.map(fav => fav.towns?.region).filter(Boolean))];
    return regions.sort();
  };

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
    
    // Apply filters
    if (filterCountry !== 'all') {
      filtered = filtered.filter(fav => fav.towns?.country === filterCountry);
    }
    
    if (filterRegion !== 'all') {
      filtered = filtered.filter(fav => fav.towns?.region === filterRegion);
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
      case 'healthcare':
        filtered.sort((a, b) => (b.towns?.healthcare_score || 0) - (a.towns?.healthcare_score || 0));
        break;
      case 'safety':
        filtered.sort((a, b) => (b.towns?.safety_score || 0) - (a.towns?.safety_score || 0));
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
  const regions = getUniqueRegions();
  const filterCount = activeFilterCount();

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Header */}
      <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className={`${uiConfig.font.size.xl} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>My Favorites</h1>
            <Link to="/profile" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className={`${uiConfig.icons.size.lg} ${uiConfig.colors.body}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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
            {/* Filters and Sorting Section */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 mb-6`}>
              {/* Sort and Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <SortDesc size={16} className={uiConfig.colors.body} />
                    <label htmlFor="sort" className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                    >
                      <option value="match">Best Match %</option>
                      <option value="date">Recently Added</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="cost-low">Cost (Low to High)</option>
                      <option value="cost-high">Cost (High to Low)</option>
                      <option value="healthcare">Healthcare Score</option>
                      <option value="safety">Safety Score</option>
                    </select>
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.btnSecondary} ${uiConfig.font.size.sm} ${showFilters ? uiConfig.colors.accent : ''}`}
                  >
                    <Filter size={16} />
                    Filters
                    {filterCount > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 ${uiConfig.layout.radius.full} ${uiConfig.colors.badge} text-xs`}>
                        {filterCount}
                      </span>
                    )}
                    <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Results Count and Actions */}
                <div className="flex items-center gap-3">
                  <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                    {sortedFavorites.length} {sortedFavorites.length === 1 ? 'town' : 'towns'}
                  </span>
                  {favorites.length >= 2 && (
                    <button
                      onClick={handleCompareSelected}
                      className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.md}`}
                    >
                      Compare Top 3
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className={`mt-4 pt-4 border-t ${uiConfig.colors.border}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Country Filter */}
                    <div>
                      <label className={`block ${uiConfig.font.size.xs} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1`}>
                        Country
                      </label>
                      <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className={`w-full px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                      >
                        <option value="all">All Countries</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    {/* Region Filter */}
                    {regions.length > 0 && (
                      <div>
                        <label className={`block ${uiConfig.font.size.xs} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1`}>
                          Region
                        </label>
                        <select
                          value={filterRegion}
                          onChange={(e) => setFilterRegion(e.target.value)}
                          className={`w-full px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                        >
                          <option value="all">All Regions</option>
                          {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Cost Range Filter */}
                    <div>
                      <label className={`block ${uiConfig.font.size.xs} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1`}>
                        Monthly Cost
                      </label>
                      <select
                        value={filterCostRange}
                        onChange={(e) => setFilterCostRange(e.target.value)}
                        className={`w-full px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                      >
                        <option value="all">All Ranges</option>
                        <option value="under2000">Under $2,000</option>
                        <option value="2000-3000">$2,000 - $3,000</option>
                        <option value="3000-4000">$3,000 - $4,000</option>
                        <option value="over4000">Over $4,000</option>
                      </select>
                    </div>

                    {/* Match Score Filter */}
                    <div>
                      <label className={`block ${uiConfig.font.size.xs} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1`}>
                        Match Score
                      </label>
                      <select
                        value={filterMatchRange}
                        onChange={(e) => setFilterMatchRange(e.target.value)}
                        className={`w-full px-3 py-1.5 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                      >
                        <option value="all">All Scores</option>
                        <option value="excellent">Excellent (80%+)</option>
                        <option value="good">Good (60-79%)</option>
                        <option value="fair">Fair (40-59%)</option>
                        <option value="low">Low (Below 40%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {filterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className={`mt-3 flex items-center gap-1 text-sm ${uiConfig.colors.accent} hover:opacity-80`}
                    >
                      <X size={14} />
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Filter Pills */}
            {filterCount > 0 && !showFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filterCountry !== 'all' && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} text-xs`}>
                    Country: {filterCountry}
                    <button onClick={() => setFilterCountry('all')} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterRegion !== 'all' && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} text-xs`}>
                    Region: {filterRegion}
                    <button onClick={() => setFilterRegion('all')} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterCostRange !== 'all' && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} text-xs`}>
                    Cost: {filterCostRange === 'under2000' ? 'Under $2k' : filterCostRange === 'over4000' ? 'Over $4k' : `$${filterCostRange}`}
                    <button onClick={() => setFilterCostRange('all')} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterMatchRange !== 'all' && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} text-xs`}>
                    Match: {filterMatchRange}
                    <button onClick={() => setFilterMatchRange('all')} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                )}
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
                {sortedFavorites.map((favorite) => (
                  <TownCard
                    key={favorite.town_id}
                    town={favorite.towns}
                    userId={userId}
                    initiallyFavorited={true}
                    onFavoriteChange={handleFavoriteChange}
                    variant="default"
                  />
                ))}
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

      {/* Bottom Navigation (Mobile) */}
      <QuickNav />
    </div>
  );
}