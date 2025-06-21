// pages/Favorites.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites } from '../utils/townUtils';
import { getCurrentUser } from '../utils/authUtils';
import TownCard from '../components/TownCard';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'cost'
  const [filterCountry, setFilterCountry] = useState('all');
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

  // Get unique countries for filter
  const getUniqueCountries = () => {
    const countries = [...new Set(favorites.map(fav => fav.towns?.country).filter(Boolean))];
    return countries.sort();
  };

  // Sort favorites based on selected criteria
  const getSortedFavorites = () => {
    let sorted = [...favorites];
    
    // Apply country filter first
    if (filterCountry !== 'all') {
      sorted = sorted.filter(fav => fav.towns?.country === filterCountry);
    }
    
    // Then apply sorting
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => (a.towns?.name || '').localeCompare(b.towns?.name || ''));
        break;
      case 'cost':
        sorted.sort((a, b) => (a.towns?.cost_index || 0) - (b.towns?.cost_index || 0));
        break;
      case 'date':
      default:
        // Already sorted by date (newest first) from the database
        break;
    }
    
    return sorted;
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

  const sortedFavorites = getSortedFavorites();
  const countries = getUniqueCountries();

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
            {/* Filters and Actions Bar */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4 mb-6`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-1 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                    >
                      <option value="date">Recently Added</option>
                      <option value="name">Name</option>
                      <option value="cost">Cost (Low to High)</option>
                    </select>
                  </div>

                  {/* Country Filter */}
                  {countries.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <label htmlFor="country" className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                        Country:
                      </label>
                      <select
                        id="country"
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className={`px-3 py-1 ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.font.size.sm}`}
                      >
                        <option value="all">All Countries</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
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
            </div>

            {/* Favorites Grid */}
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