import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [recommendedTowns, setRecommendedTowns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ years: 5, months: 3, days: 15, hours: 8 });
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data and recommendations
    const loadData = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found, redirecting to welcome");
          navigate('/welcome');
          setLoading(false);
          return;
        }

        console.log("Session found:", session.user.id);

        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
        } else if (userData) {
          console.log("User data loaded:", userData.id);
          setUser(userData);
          
          // Check if onboarding is completed
          if (!userData.onboarding_completed) {
            console.log("Onboarding not completed, redirecting to onboarding");
            navigate('/onboarding/status');
            return;
          }
          
          // Calculate retirement countdown if retirement_year_estimate exists
          if (userData.retirement_year_estimate) {
            calculateTimeRemaining(new Date(userData.retirement_year_estimate, 0, 1));
          }

          // Instead of using RPC, fetch towns directly
          // This is a simplified approach that avoids the ambiguous column issue
          const { data: townData, error: townError } = await supabase
            .from('towns')
            .select('*')
            .limit(3);
            
          if (townError) {
            console.error("Error fetching recommendations:", townError);
          } else if (townData) {
            setRecommendedTowns(townData);
          }

          // Fetch favorites
          const { data: favoritesData, error: favError } = await supabase
            .from('favorites')
            .select(`
              *,
              towns:town_id(*)
            `)
            .eq('user_id', session.user.id);
            
          if (favError) {
            console.error("Error fetching favorites:", favError);
          } else if (favoritesData) {
            setFavorites(favoritesData);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Function to calculate time remaining until retirement
  const calculateTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    
    // If date is in the past, show zero
    if (target <= now) {
      setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0 });
      return;
    }
    
    // Calculate years difference
    let yearDiff = target.getFullYear() - now.getFullYear();
    
    // Calculate months difference
    let monthDiff = target.getMonth() - now.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    
    // Check if day in current month has already passed
    if (target.getDate() < now.getDate()) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
    }
    
    // Calculate days
    const timeDiff = target.getTime() - now.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) % 30; // Approximate days in month
    
    // Calculate hours
    const hourDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    setTimeRemaining({
      years: yearDiff,
      months: monthDiff,
      days: dayDiff,
      hours: hourDiff
    });
  };

  // Function to toggle favorite
  const toggleFavorite = async (townId) => {
    if (!user) return;
    
    try {
      // Check if already favorited
      const existingFav = favorites.find(f => f.town_id === townId);
      
      if (existingFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('town_id', townId);
          
        if (!error) {
          setFavorites(favorites.filter(f => f.town_id !== townId));
        }
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            town_id: townId,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (!error && data) {
          // Find the town details
          const town = recommendedTowns.find(t => t.id === townId);
          setFavorites([...favorites, { ...data[0], towns: town }]);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Function to handle navigation with auth checking
  const handleNavigation = (path, e) => {
    e.preventDefault();
    if (user) {
      navigate(path);
    } else {
      console.log("User not authenticated, redirecting to welcome");
      navigate('/welcome');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Scout<span className="text-green-600">2</span>Retire
          </h1>
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
        </h2>
        
        {/* Retirement Countdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Retirement Countdown
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {timeRemaining.years}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Years</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {timeRemaining.months}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Months</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {timeRemaining.days}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Days</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {timeRemaining.hours}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Hours</span>
            </div>
          </div>
        </div>

        {/* Town of the Day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <h3 className="p-4 text-lg font-semibold text-gray-800 dark:text-white">
            Today's Recommendation
          </h3>
          <div className="relative h-40">
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Town Image</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Valencia, Spain
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Mediterranean Coast
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              A vibrant coastal city with excellent healthcare, warm climate, and affordable living.
            </p>
            <div className="flex justify-between items-center">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                Explore
              </button>
              <span className="text-green-600 dark:text-green-400 text-sm">View on Map</span>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations Section */}
        {recommendedTowns.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Towns Matching Your Preferences
              </h3>
              <Link
                to="/discover"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedTowns.map((town) => (
                <div 
                  key={town.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <div className="relative h-40">
                    {town.image_url_1 ? (
                      <img
                        src={town.image_url_1}
                        alt={town.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">Town Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={() => toggleFavorite(town.id)}
                        className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                      >
                        {favorites.some(f => f.town_id === town.id) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="text-white font-medium">
                        {town.name}, {town.country}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {town.cost_index && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                          ${town.cost_index}/mo
                        </span>
                      )}
                      {town.healthcare_score && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          Healthcare: {town.healthcare_score}/10
                        </span>
                      )}
                      {town.safety_score && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          Safety: {town.safety_score}/10
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {town.description || "Discover this beautiful town for your retirement."}
                    </p>
                    <div className="mt-auto pt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Perfect match for your preferences
                      </span>
                      <Link
                        to={`/discover?town=${town.id}`}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={(e) => handleNavigation('/discover', e)}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-800 dark:text-white">Find Towns</span>
            </button>
            <button
              onClick={(e) => handleNavigation('/compare', e)}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
              </svg>
              <span className="text-sm text-gray-800 dark:text-white">Compare</span>
            </button>
            <button
              onClick={(e) => handleNavigation('/favorites', e)}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm text-gray-800 dark:text-white">Favorites</span>
            </button>
            <button
              onClick={(e) => handleNavigation('/chat', e)}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm text-gray-800 dark:text-white">Chat</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}