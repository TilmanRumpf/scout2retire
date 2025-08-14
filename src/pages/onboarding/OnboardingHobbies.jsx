import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Activity, ShoppingBag, Sparkles, Lightbulb, Search, X, Snowflake } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    custom_activities: [],
    travel_frequency: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSearch, setCustomSearch] = useState('');
  
  const navigate = useNavigate();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'hobbies');

  // Activity options with descriptions and Winter Sports added
  const activityOptions = [
    { id: 'walking', title: 'Walking', description: 'trails • beaches • parks' },
    { id: 'swimming', title: 'Swimming', description: 'pools • ocean • lakes' },
    { id: 'cycling', title: 'Cycling', description: 'road • mountain • trails' },
    { id: 'golf', title: 'Golf', description: 'courses • driving range' },
    { id: 'tennis', title: 'Tennis', description: 'courts • clubs • leagues' },
    { id: 'water_sports', title: 'Water Sports', description: 'kayak • sail • paddle' },
    { id: 'winter_sports', title: 'Winter Sports', description: 'ski • snowboard • ice skate', icon: Snowflake },
    { id: 'fishing', title: 'Fishing', description: 'ocean • lake • river' },
    { id: 'gardening', title: 'Gardening', description: 'vegetables • flowers • herbs' }
  ];

  // Interest options with descriptions
  const interestOptions = [
    { id: 'arts', title: 'Arts & Crafts', description: 'painting • pottery • crafts' },
    { id: 'music', title: 'Music', description: 'concerts • instruments • choir' },
    { id: 'theater', title: 'Theater', description: 'plays • musicals • opera' },
    { id: 'reading', title: 'Reading', description: 'book clubs • libraries' },
    { id: 'cooking', title: 'Cooking', description: 'classes • cuisines • baking' },
    { id: 'wine', title: 'Wine', description: 'tasting • tours • collecting' },
    { id: 'history', title: 'History', description: 'museums • tours • lectures' },
    { id: 'photography', title: 'Photography', description: 'nature • travel • portraits' },
    { id: 'volunteering', title: 'Volunteering', description: 'community • charity • causes' }
  ];

  // Comprehensive list of hobbies for custom selector (114+ options)
  const allHobbies = [
    'Antique collecting', 'Aquarium keeping', 'Archery', 'Astronomy', 'Baking', 'Ballet',
    'Ballroom dancing', 'Basketball', 'Beekeeping', 'Bird watching', 'Blogging', 'Board games',
    'Boating', 'Book clubs', 'Bowling', 'Bridge', 'Calligraphy', 'Camping', 'Canoeing',
    'Card games', 'Chess', 'Choir singing', 'Collecting coins', 'Collecting stamps', 'Community theater',
    'Cooking classes', 'Creative writing', 'Crochet', 'Cross-country skiing', 'Crossword puzzles',
    'Dancing', 'Darts', 'Digital photography', 'Dog training', 'Drawing', 'Embroidery',
    'Fencing', 'Film appreciation', 'Fitness classes', 'Flower arranging', 'Flying', 'Genealogy',
    'Geocaching', 'Glass blowing', 'Golfing', 'Grandchildren activities', 'Greenhouse gardening',
    'Hiking', 'Home brewing', 'Horseback riding', 'Hot air ballooning', 'Ice skating', 'Jazz appreciation',
    'Jewelry making', 'Jigsaw puzzles', 'Jogging', 'Journaling', 'Kayaking', 'Knitting',
    'Language learning', 'Leather crafting', 'Line dancing', 'Mahjong', 'Martial arts', 'Meditation',
    'Metal detecting', 'Model building', 'Motorcycling', 'Mountain biking', 'Museums', 'Nature walks',
    'Needlepoint', 'Opera', 'Orchid growing', 'Orienteering', 'Painting', 'Paragliding',
    'Petanque', 'Pickleball', 'Pilates', 'Ping pong', 'Poetry', 'Poker', 'Pottery',
    'Quilting', 'Racing', 'Radio amateur', 'RV traveling', 'Sailing', 'Salsa dancing',
    'Scrapbooking', 'Scuba diving', 'Sculpting', 'Sewing', 'Shuffleboard', 'Singing',
    'Sketching', 'Snorkeling', 'Snowshoeing', 'Square dancing', 'Stained glass', 'Stand-up paddleboarding',
    'Stargazing', 'Sudoku', 'Surfing', 'Swimming laps', 'Tai chi', 'Tango', 'Tennis',
    'Train spotting', 'Travel planning', 'Trivia nights', 'Ukulele', 'Video gaming', 'Walking clubs',
    'Water aerobics', 'Watercolor painting', 'Wildlife photography', 'Wine tasting', 'Wood carving',
    'Woodworking', 'Writing memoirs', 'Yacht racing', 'Yoga', 'Zumba'
  ].sort();

  // Travel frequency options
  const travelOptions = [
    { id: 'rare', title: 'Rare', description: '< 2 trips/year' },
    { id: 'occasional', title: 'Occasional', description: '3-5 trips/year' },
    { id: 'frequent', title: 'Frequent', description: '6+ trips/year' }
  ];


  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.user) {
          navigate('/welcome');
          return;
        }
        
        const progressResult = await getOnboardingProgress(userResult.user.id);
        if (!progressResult.success) {
          console.error("Error loading existing data:", progressResult.error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
        // If hobbies data exists, load it
        if (progressResult.data && progressResult.data.hobbies) {
          setFormData(prev => ({
            ...prev,
            activities: progressResult.data.hobbies.activities || [],
            interests: progressResult.data.hobbies.interests || [],
            custom_activities: progressResult.data.hobbies.custom_activities || [],
            travel_frequency: progressResult.data.hobbies.travel_frequency || ''
          }));
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleActivityToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(itemId)
        ? prev.activities.filter(item => item !== itemId)
        : [...prev.activities, itemId]
    }));
  };

  const handleInterestToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(itemId)
        ? prev.interests.filter(item => item !== itemId)
        : [...prev.interests, itemId]
    }));
  };

  const handleCustomActivityToggle = (activity) => {
    setFormData(prev => ({
      ...prev,
      custom_activities: prev.custom_activities.includes(activity)
        ? prev.custom_activities.filter(item => item !== activity)
        : [...prev.custom_activities, activity]
    }));
  };

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/administration');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      // Save only the fields that belong to the hobbies step
      const dataToSave = {
        activities: formData.activities,
        interests: formData.interests,
        custom_activities: formData.custom_activities,
        travel_frequency: formData.travel_frequency
      };
      
      const { success, error } = await saveOnboardingStep(
        userResult.user.id,
        dataToSave,
        'hobbies'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Hobbies, health & interests saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'hobbies',
          dataToSave
        );
        if (prefSuccess) {
          console.log('✅ Saved hobbies to user_preferences table');
        } else {
          console.error('❌ Failed to save hobbies to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving hobbies to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/administration');
      }, 100);
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  // Custom Activities Modal Component
  const CustomActivityModal = () => {
    const filteredHobbies = allHobbies.filter(hobby =>
      hobby.toLowerCase().includes(customSearch.toLowerCase())
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                Select Custom Activities
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className={uiConfig.colors.body} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Search activities..."
                className={`${uiConfig.components.input} pl-10`}
                autoFocus
              />
            </div>
          </div>
          
          {/* Scrollable Activity List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredHobbies.map((hobby) => (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => handleCustomActivityToggle(hobby)}
                  className={`p-2 ${uiConfig.layout.radius.md} border ${uiConfig.animation.transition} text-left ${
                    formData.custom_activities.includes(hobby)
                      ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-300'
                  } ${uiConfig.font.size.sm}`}
                >
                  {hobby}
                </button>
              ))}
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                {formData.custom_activities.length} selected
              </span>
              <button
                onClick={() => setShowCustomModal(false)}
                className={uiConfig.components.buttonPrimary}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showCustomModal && <CustomActivityModal />}
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your hobbies help us identify locations with active communities and facilities that match your interests.
            </p>
          </div>
          
          {/* Physical Activities */}
          <SelectionSection icon={Activity} title="Physical Activities">
            <SelectionGrid>
              {activityOptions.map((activity) => (
                <SelectionCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  icon={activity.icon}
                  isSelected={formData.activities.includes(activity.id)}
                  onClick={() => handleActivityToggle(activity.id)}
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Hobbies & Interests */}
          <SelectionSection icon={Heart} title="Hobbies & Interests">
            <SelectionGrid>
              {interestOptions.map((interest) => (
                <SelectionCard
                  key={interest.id}
                  title={interest.title}
                  description={interest.description}
                  isSelected={formData.interests.includes(interest.id)}
                  onClick={() => handleInterestToggle(interest.id)}
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Custom Activities */}
          <SelectionSection icon={Sparkles} title="Custom Activities">
            <SelectionCard
              title="Add Custom Activities"
              description={formData.custom_activities.length > 0 
                ? `${formData.custom_activities.length} selected: ${formData.custom_activities.slice(0, 3).join(', ')}${formData.custom_activities.length > 3 ? '...' : ''}`
                : 'Choose from 100+ activities'
              }
              isSelected={formData.custom_activities.length > 0}
              onClick={() => setShowCustomModal(true)}
              icon={Search}
            />
          </SelectionSection>

          {/* Travel Frequency */}
          <SelectionSection icon={Plane} title="Travel Frequency">
            <SelectionGrid>
              {travelOptions.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={formData.travel_frequency === option.id}
                  onClick={() => setFormData(prev => ({ ...prev, travel_frequency: option.id }))}
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Summary Section */}
          {(formData.activities.length > 0 || 
            formData.interests.length > 0 ||
            formData.custom_activities.length > 0) && (
            <div className={`mb-3 p-2.5 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Activities & Preferences:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.activities.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Activities:</span> {formData.activities.map(id => 
                    activityOptions.find(a => a.id === id)?.title
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.interests.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Interests:</span> {formData.interests.map(id => 
                    interestOptions.find(i => i.id === id)?.title
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.custom_activities.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Custom:</span> {formData.custom_activities.join(', ')}</div>
                )}
                {formData.travel_frequency && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Travel:</span> {travelOptions.find(t => t.id === formData.travel_frequency)?.title || formData.travel_frequency}</div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/onboarding/culture');
                }}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={uiConfig.components.buttonPrimary}
              >
                {loading ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
