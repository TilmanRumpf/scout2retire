import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonalizedTowns } from '../../utils/scoring';
import { getCurrentUser } from '../../utils/authUtils';
import { uiConfig } from '../../styles/uiConfig';
import TownRadarChart from '../../components/TownRadarChart';
import LikeButton from '../../components/LikeButton';
import toast from 'react-hot-toast';
import { Sparkles, Trophy, MapPin, DollarSign, Heart, Shield, Sun, Users, Compass } from 'lucide-react';

export default function OnboardingComplete() {
  const [loading, setLoading] = useState(true);
  const [topMatches, setTopMatches] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [celebrationOpacity, setCelebrationOpacity] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies intentionally omitted - loadTopMatches should only run once on mount

  // Celebration animation sequence
  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => {
      setCelebrationOpacity(1);
    }, 100);

    // Hold for 5 seconds, then fade out and navigate
    const fadeOutTimer = setTimeout(() => {
      setCelebrationOpacity(0);
    }, 5600); // 100ms delay + 500ms fade in + 5000ms hold

    const navigateTimer = setTimeout(() => {
      setShowCelebration(false);
      navigate('/daily');
    }, 6100); // 100ms + 500ms + 5000ms + 500ms fade out

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  // Function to skip celebration and go directly to /daily
  const handleSkipCelebration = () => {
    setCelebrationOpacity(0);
    setTimeout(() => {
      setShowCelebration(false);
      navigate('/daily');
    }, 500); // Wait for fade out
  };

  const loadTopMatches = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      // Get personalized recommendations (this preloads for /daily too)
      const result = await getPersonalizedTowns(user.id, { limit: 20 });

      if (result.success && result.towns) {

        // Lower thresholds temporarily to see matches
        const excellentMatches = result.towns.filter(town => town.matchScore >= 60);
        const goodMatches = result.towns.filter(town => town.matchScore >= 40 && town.matchScore < 60);
        const fairMatches = result.towns.filter(town => town.matchScore >= 20 && town.matchScore < 40);

        // Take top 10 matches regardless of score
        const topTowns = [...excellentMatches, ...goodMatches, ...fairMatches].slice(0, 10);


        setTopMatches(topTowns);
        setUserPreferences(result.userPreferences);

        // Don't show toast during celebration animation - it's distracting
        // The celebration screen itself communicates success
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // Only show error toast, not during celebration
      if (!showCelebration) {
        toast.error('Failed to load your matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPreferenceSummary = () => {
    if (!userPreferences) return [];
    
    const summary = [];
    
    if (userPreferences.costs?.total_monthly_cost) {
      summary.push({
        icon: DollarSign,
        label: 'Costs',
        value: `$${userPreferences.costs.total_monthly_cost}/month`
      });
    }
    
    if (userPreferences.climate_preferences?.seasonal_preference) {
      summary.push({
        icon: Sun,
        label: 'Climate',
        value: userPreferences.climate_preferences.seasonal_preference
      });
    }
    
    if (userPreferences.administration?.healthcare_quality?.[0]) {
      summary.push({
        icon: Heart,
        label: 'Healthcare',
        value: userPreferences.administration.healthcare_quality[0]
      });
    }
    
    if (userPreferences.region_preferences?.countries?.length > 0) {
      summary.push({
        icon: MapPin,
        label: 'Regions',
        value: `${userPreferences.region_preferences.countries.length} countries`
      });
    }
    
    if (userPreferences.culture_preferences?.lifestyle_preferences?.pace_of_life_preference?.[0]) {
      summary.push({
        icon: Users,
        label: 'Lifestyle',
        value: userPreferences.culture_preferences.lifestyle_preferences.pace_of_life_preference[0]
      });
    }
    
    return summary;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center`}>
        <div className="text-center">
          <Sparkles className={`w-16 h-16 mx-auto mb-4 ${uiConfig.colors.accent} ${uiConfig.animation.pulse}`} />
          <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>
            Finding Your Perfect Matches...
          </h2>
          <p className={`${uiConfig.colors.body}`}>
            Analyzing thousands of retirement destinations just for you
          </p>
        </div>
      </div>
    );
  }

  const currentMatch = topMatches[selectedMatch];

  // Show celebration overlay
  if (showCelebration) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 z-50"
        style={{
          opacity: celebrationOpacity,
          transition: 'opacity 500ms ease-in-out'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Congratulations! Your Journey Begins
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Based on your preferences, we've analyzed hundreds of retirement destinations
            and found your perfect matches. Your personalized retirement adventure starts here!
          </p>

          {/* Preference Summary */}
          {userPreferences && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {getPreferenceSummary().map((pref, index) => (
                <div key={index} className={`flex items-center gap-2 px-4 py-2 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.full}`}>
                  <pref.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{pref.label}: {pref.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skip Button */}
          <button
            onClick={handleSkipCelebration}
            className={`px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} text-lg font-medium ${uiConfig.animation.transition} hover:scale-105`}
          >
            Continue to Your Matches
          </button>

          {/* Auto-continue hint */}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Automatically continuing in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* Hero Section */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm}`}>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Trophy className={`w-16 h-16 mx-auto mb-4 text-yellow-500`} />
          <h1 className={`text-3xl md:text-4xl font-bold ${uiConfig.colors.heading} mb-4`}>
            Congratulations! Your Journey Begins
          </h1>
          <p className={`text-lg ${uiConfig.colors.body} mb-8 max-w-2xl mx-auto`}>
            Based on your preferences, we've analyzed hundreds of retirement destinations
            and found your perfect matches. Your personalized retirement adventure starts here!
          </p>

          {/* Preference Summary */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {getPreferenceSummary().map((pref, index) => (
              <div key={index} className={`flex items-center gap-2 px-4 py-2 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.full}`}>
                <pref.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{pref.label}: {pref.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Matches Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>
            Your Top {topMatches.length} Perfect Matches
          </h2>
          <p className={`${uiConfig.colors.body}`}>
            These destinations scored highest based on your unique preferences
          </p>
        </div>

        {topMatches.length > 0 ? (
          <>
            {/* Match Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {topMatches.map((town, index) => (
                <button
                  key={town.id}
                  onClick={() => setSelectedMatch(index)}
                  className={`px-4 py-2 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    selectedMatch === index 
                      ? uiConfig.colors.btnPrimary 
                      : `${uiConfig.colors.card} ${uiConfig.colors.borderDefault} border hover:${uiConfig.colors.borderActive}`
                  }`}
                >
                  <div className="font-medium">{town.town_name}</div>
                  <div className={`text-xs ${selectedMatch === index ? 'text-white/80' : uiConfig.colors.hint}`}>
                    {town.matchScore}% match
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Match Details */}
            {currentMatch && (
              <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} overflow-hidden`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Image and Basic Info */}
                  <div>
                    <div className="relative h-80">
                      {currentMatch.image_url_1 ? (
                        <img
                          src={currentMatch.image_url_1}
                          alt={currentMatch.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${uiConfig.colors.input} flex items-center justify-center`}>
                          <MapPin className={`w-16 h-16 ${uiConfig.colors.muted}`} />
                        </div>
                      )}
                      
                      {/* Overlays */}
                      <div className="absolute top-4 left-4 space-y-2">
                        <div className={`px-4 py-2 ${uiConfig.layout.radius.full} text-lg font-bold ${
                          currentMatch.matchScore >= 90 ? 'bg-green-500 text-white' :
                          currentMatch.matchScore >= 80 ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {currentMatch.matchScore}% Match
                        </div>
                        {currentMatch.valueRating && (
                          <div className={`px-4 py-2 ${uiConfig.layout.radius.full} ${uiConfig.colors.card} shadow-lg`}>
                            Value: {currentMatch.valueRating}
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        {userId && (
                          <LikeButton
                            townId={currentMatch.id}
                            userId={userId}
                            initialState={false}
                            size="lg"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>
                        {currentMatch.name}, {currentMatch.country}
                      </h3>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-3 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.md}`}>
                          <DollarSign className="w-5 h-5 mb-1" />
                          <div className="text-sm font-medium">Monthly Cost</div>
                          <div className="text-lg font-bold">${currentMatch.cost_index}</div>
                        </div>
                        <div className={`p-3 ${uiConfig.colors.statusInfo} ${uiConfig.layout.radius.md}`}>
                          <Heart className="w-5 h-5 mb-1" />
                          <div className="text-sm font-medium">Healthcare</div>
                          <div className="text-lg font-bold">{currentMatch.healthcare_score}/10</div>
                        </div>
                        <div className={`p-3 ${uiConfig.colors.badge} ${uiConfig.layout.radius.md}`}>
                          <Shield className="w-5 h-5 mb-1" />
                          <div className="text-sm font-medium">Safety</div>
                          <div className="text-lg font-bold">{currentMatch.safety_score}/10</div>
                        </div>
                        <div className={`p-3 ${uiConfig.colors.statusWarning} ${uiConfig.layout.radius.md}`}>
                          <Sun className="w-5 h-5 mb-1" />
                          <div className="text-sm font-medium">Climate</div>
                          <div className="text-lg font-bold">{currentMatch.climate || 'Varied'}</div>
                        </div>
                      </div>
                      
                      <p className={`${uiConfig.colors.body} mb-4`}>
                        {currentMatch.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Match Details */}
                  <div className="p-6">
                    {/* Premium Insights */}
                    {currentMatch.insights && currentMatch.insights.length > 0 && (
                      <div className={`mb-6 p-4 ${uiConfig.colors.statusSuccess} ${uiConfig.layout.radius.lg}`}>
                        <h4 className={`text-lg font-bold ${uiConfig.colors.heading} mb-3`}>
                          Why This Is Perfect For You
                        </h4>
                        <div className="space-y-2">
                          {currentMatch.insights.map((insight, index) => (
                            <div key={index} className={`text-sm ${uiConfig.colors.body}`}>
                              {typeof insight === 'string' ? insight : insight.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Match Reasons */}
                    {currentMatch.matchReasons && currentMatch.matchReasons.length > 0 && (
                      <div className="mb-6">
                        <h4 className={`text-lg font-bold ${uiConfig.colors.heading} mb-3`}>
                          Match Details
                        </h4>
                        <div className="space-y-2">
                          {currentMatch.matchReasons.map((reason, index) => (
                            <div key={index} className={`flex items-start text-sm ${uiConfig.colors.success}`}>
                              <Compass className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Radar Chart */}
                    {currentMatch.categoryScores && (
                      <div className="mb-6">
                        <h4 className={`text-lg font-bold ${uiConfig.colors.heading} mb-3`}>
                          Category Match Breakdown
                        </h4>
                        <div className="h-64">
                          <TownRadarChart townData={currentMatch} />
                        </div>
                      </div>
                    )}
                    
                    {/* Highlights */}
                    {currentMatch.highlights && currentMatch.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.highlights.map((highlight, index) => (
                          <span key={index} className={`px-3 py-1 ${uiConfig.colors.badge} text-sm ${uiConfig.layout.radius.full} font-medium`}>
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => navigate('/discover')}
                className={`px-8 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} text-lg font-medium`}
              >
                Explore All Matches
              </button>
              <button
                onClick={() => {
                  const townIds = topMatches.slice(0, 3).map(t => t.id).join(',');
                  navigate(`/compare?towns=${townIds}`);
                }}
                className={`px-8 py-3 ${uiConfig.colors.btnSecondary} ${uiConfig.layout.radius.md} text-lg font-medium`}
              >
                Compare Top 3 Matches
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className={`px-8 py-3 ${uiConfig.colors.card} ${uiConfig.colors.borderDefault} border ${uiConfig.layout.radius.md} text-lg font-medium hover:${uiConfig.colors.borderActive}`}
              >
                View Saved Favorites
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className={`${uiConfig.colors.body} mb-4`}>
              We're still processing your preferences. This should only take a moment...
            </p>
            <button
              onClick={loadTopMatches}
              className={`px-6 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md}`}
            >
              Refresh Matches
            </button>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm} mt-12`}>
        <div className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page}`}>
          <h3 className={`text-xl font-bold ${uiConfig.colors.heading} mb-4 text-center`}>
            What's Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 ${uiConfig.colors.accent} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className={`font-semibold ${uiConfig.colors.heading} mb-2`}>Explore & Save</h4>
              <p className={`text-sm ${uiConfig.colors.body}`}>
                Browse all your matches and save your favorites for easy comparison
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 ${uiConfig.colors.accent} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className={`font-semibold ${uiConfig.colors.heading} mb-2`}>Research & Plan</h4>
              <p className={`text-sm ${uiConfig.colors.body}`}>
                Use our tools to dive deeper into each location and plan visits
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 ${uiConfig.colors.accent} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className={`font-semibold ${uiConfig.colors.heading} mb-2`}>Connect & Visit</h4>
              <p className={`text-sm ${uiConfig.colors.body}`}>
                Join our community and schedule reconnaissance trips
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
