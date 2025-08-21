import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Activity, ShoppingBag, Sparkles, Lightbulb, Search, X, Snowflake, Plus } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { isIOS } from '../../utils/platformDetection';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

// Physical Activities Modal Component - Moved outside to prevent recreation
const PhysicalActivityModal = ({ 
  showModal, 
  setShowModal, 
  physicalSearch, 
  setPhysicalSearch, 
  formData, 
  handleCustomPhysicalToggle,
  hobbyCategories,
  uiConfig,
  onSave,
  onCancel
}) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Get only physical activity categories
  const physicalCategories = {
    'Walking & Cycling Related': hobbyCategories['Walking & Cycling Related'],
    'Golf & Tennis Related': hobbyCategories['Golf & Tennis Related'],
    'Water Sports Related': hobbyCategories['Water Sports Related'],
    'Water Crafts Related': hobbyCategories['Water Crafts Related'],
    'Winter Sports Related': hobbyCategories['Winter Sports Related'],
    'Other Sports & Fitness': hobbyCategories['Other Sports & Fitness'],
    'Adventure & Outdoor': hobbyCategories['Adventure & Outdoor']
  };
  
  // Filter categories based on search
  const getFilteredCategories = () => {
    if (!physicalSearch) return physicalCategories;
    
    const filtered = {};
    Object.entries(physicalCategories).forEach(([category, activities]) => {
      const matchingActivities = activities.filter(activity =>
        activity.toLowerCase().includes(physicalSearch.toLowerCase())
      );
      if (matchingActivities.length > 0) {
        filtered[category] = matchingActivities;
      }
    });
    return filtered;
  };
  
  const filteredCategories = getFilteredCategories();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Add More Physical Activities
            </h3>
            <button
              onClick={() => setShowModal(false)}
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
              value={physicalSearch}
              onChange={(e) => setPhysicalSearch(e.target.value)}
              placeholder="Search physical activities..."
              className={`${uiConfig.components.input} pl-10`}
            />
          </div>
        </div>
        
        {/* Scrollable Activity List */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          onScroll={(e) => e.stopPropagation()}>
          {Object.keys(filteredCategories).length === 0 ? (
            <p className={`text-center ${uiConfig.colors.hint} py-8`}>
              No activities match your search
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredCategories).map(([category, activities]) => (
                <div key={category}>
                  <h4 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2 ${uiConfig.font.size.sm} text-gray-600`}>
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activities.map((activity) => (
                      <button
                        key={activity}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCustomPhysicalToggle(activity);
                        }}
                        className={`p-2 ${uiConfig.layout.radius.md} border ${uiConfig.animation.transition} text-left ${
                          formData.custom_physical.includes(activity)
                            ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-300'
                        } ${uiConfig.font.size.sm}`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
              {formData.custom_physical.length} selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  setShowModal(false);
                }}
                className={uiConfig.components.buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onSave();
                  setShowModal(false);
                }}
                className={uiConfig.components.buttonPrimary}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hobbies & Interests Modal Component - Moved outside to prevent recreation
const HobbiesModal = ({
  showModal,
  setShowModal,
  hobbiesSearch,
  setHobbiesSearch,
  formData,
  handleCustomHobbiesToggle,
  hobbyCategories,
  uiConfig,
  onSave,
  onCancel
}) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Get only hobbies & interests categories
  const hobbiesCategories = {
    'Gardening & Pets Related': hobbyCategories['Gardening & Pets Related'],
    'Arts & Crafts Related': hobbyCategories['Arts & Crafts Related'],
    'Music & Theater Related': hobbyCategories['Music & Theater Related'],
    'Cooking & Wine Related': hobbyCategories['Cooking & Wine Related'],
    'Museums & History Related': hobbyCategories['Museums & History Related'],
    'Social & Community': hobbyCategories['Social & Community'],
    'Games & Mental Activities': hobbyCategories['Games & Mental Activities'],
    'Collecting & Hobbies': hobbyCategories['Collecting & Hobbies'],
    'Learning & Culture': hobbyCategories['Learning & Culture']
  };
  
  // Filter categories based on search
  const getFilteredCategories = () => {
    if (!hobbiesSearch) return hobbiesCategories;
    
    const filtered = {};
    Object.entries(hobbiesCategories).forEach(([category, hobbies]) => {
      if (hobbies) {
        const matchingHobbies = hobbies.filter(hobby =>
          hobby.toLowerCase().includes(hobbiesSearch.toLowerCase())
        );
        if (matchingHobbies.length > 0) {
          filtered[category] = matchingHobbies;
        }
      }
    });
    return filtered;
  };
  
  const filteredCategories = getFilteredCategories();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Add More Hobbies & Interests
            </h3>
            <button
              onClick={() => setShowModal(false)}
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
              value={hobbiesSearch}
              onChange={(e) => setHobbiesSearch(e.target.value)}
              placeholder="Search hobbies & interests..."
              className={`${uiConfig.components.input} pl-10`}
            />
          </div>
        </div>
        
        {/* Scrollable Hobby List */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          onScroll={(e) => e.stopPropagation()}>
          {Object.keys(filteredCategories).length === 0 ? (
            <p className={`text-center ${uiConfig.colors.hint} py-8`}>
              No hobbies match your search
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredCategories).map(([category, hobbies]) => (
                <div key={category}>
                  <h4 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2 ${uiConfig.font.size.sm} text-gray-600`}>
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {hobbies.map((hobby) => (
                      <button
                        key={hobby}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCustomHobbiesToggle(hobby);
                        }}
                        className={`p-2 ${uiConfig.layout.radius.md} border ${uiConfig.animation.transition} text-left ${
                          formData.custom_hobbies.includes(hobby)
                            ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-300'
                        } ${uiConfig.font.size.sm}`}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
              {formData.custom_hobbies.length} selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  setShowModal(false);
                }}
                className={uiConfig.components.buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onSave();
                  setShowModal(false);
                }}
                className={uiConfig.components.buttonPrimary}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    custom_physical: [],
    custom_hobbies: [],
    travel_frequency: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPhysicalModal, setShowPhysicalModal] = useState(false);
  const [showHobbiesModal, setShowHobbiesModal] = useState(false);
  const [physicalSearch, setPhysicalSearch] = useState('');
  const [hobbiesSearch, setHobbiesSearch] = useState('');
  
  // Temporary state for modal changes (for cancel functionality)
  const [tempPhysicalSelections, setTempPhysicalSelections] = useState([]);
  const [tempHobbiesSelections, setTempHobbiesSelections] = useState([]);
  
  const navigate = useNavigate();
  
  // Auto-hide navigation on scroll
  const { isVisible: isNavVisible } = useHideOnScroll();
  
  // Enable auto-save for this page
  // TEMPORARILY DISABLED to fix scroll issue
  // const autoSave = useOnboardingAutoSave(formData, 'hobbies');
  const autoSave = async () => {
    // Manual save function without the problematic hook
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) return false;
      
      const { success } = await saveOnboardingStep(
        userResult.user.id,
        formData,
        'hobbies'
      );
      
      return success;
    } catch (err) {
      console.error('Save error:', err);
      return false;
    }
  };

  // Activity options with descriptions and Winter Sports added
  const activityOptions = [
    { id: 'walking_cycling', title: 'Walking & Cycling', description: 'trails • parks • paths' },
    { id: 'golf_tennis', title: 'Golf & Tennis', description: 'courses • courts • clubs' },
    { id: 'water_sports', title: 'Water Sports', description: 'swimming • pools • beaches' },
    { id: 'water_crafts', title: 'Water Crafts', description: 'kayaking • sailing • boating' },
    { id: 'winter_sports', title: 'Winter Sports', description: 'ski • snowboard • skate' }
  ];

  // Interest options with descriptions
  const interestOptions = [
    { id: 'gardening', title: 'Gardening & Pets', description: 'vegetables • flowers • pets' },
    { id: 'arts', title: 'Arts & Crafts', description: 'painting • pottery • crafts' },
    { id: 'music_theater', title: 'Music & Theater', description: 'concerts • plays • opera' },
    { id: 'cooking_wine', title: 'Cooking & Wine', description: 'cuisines • tasting • baking' },
    { id: 'history', title: 'Museums & History', description: 'exhibits • tours • lectures' }
  ];

  // Organized hobbies matching main page button groupings
  const hobbyCategories = {
    // Physical activities grouped by type matching the main buttons
    'Walking & Cycling Related': [
      'Geocaching', 'Hiking', 'Jogging', 'Mountain biking', 'Orienteering', 'Walking groups'
    ].sort(),
    
    'Golf & Tennis Related': [
      'Badminton', 'Bocce ball', 'Petanque', 'Pickleball', 'Ping pong', 'Shuffleboard', 'Tennis'
    ].sort(),
    
    'Water Sports Related': [
      'Snorkeling', 'Swimming laps', 'Water aerobics', 'Water polo'
    ].sort(),
    
    'Water Crafts Related': [
      'Boating', 'Canoeing', 'Deep sea fishing', 'Fishing', 'Kayaking', 'Sailing', 'Scuba diving', 
      'Stand-up paddleboarding', 'Surfing', 'Windsurfing', 'Yacht racing'
    ].sort(),
    
    'Winter Sports Related': [
      'Cross-country skiing', 'Curling', 'Downhill skiing', 'Ice fishing', 
      'Ice hockey', 'Ice skating', 'Sledding', 'Snowboarding', 'Snowmobiling', 'Snowshoeing'
    ].sort(),
    
    'Other Sports & Fitness': [
      'Archery', 'Basketball', 'Bowling', 'Fencing', 'Fitness classes', 
      'Martial arts', 'Pilates', 'Spa & wellness', 'Tai chi', 'Yoga', 'Zumba'
    ].sort(),
    
    'Adventure & Outdoor': [
      'Camping', 'Flying', 'Horseback riding', 'Hot air ballooning', 
      'Motorcycling', 'Paragliding', 'Racing', 'Rock climbing'
    ].sort(),
    
    // Hobbies & Interests categories matching main buttons
    'Gardening & Pets Related': [
      'Aquarium keeping', 'Beekeeping', 'Birdwatching', 'Dog training', 'Dog walking', 
      'Flower arranging', 'Greenhouse gardening', 'Herb gardening', 'Nature walks', 
      'Orchid growing', 'Vegetable gardening'
    ].sort(),
    
    'Arts & Crafts Related': [
      'Calligraphy', 'Crochet', 'Drawing', 'Embroidery', 'Glass blowing', 
      'Jewelry making', 'Knitting', 'Leather crafting', 'Needlepoint', 
      'Painting', 'Pottery', 'Quilting', 'Scrapbooking', 'Sculpting', 
      'Sewing', 'Sketching', 'Stained glass', 'Watercolor painting', 
      'Wildlife photography', 'Woodworking'
    ].sort(),
    
    'Music & Theater Related': [
      'Ballet', 'Ballroom dancing', 'Choir singing', 'Community theater', 
      'Film appreciation', 'Instruments', 'Jazz appreciation', 
      'Line dancing', 'Opera', 'Salsa dancing', 'Singing', 'Square dancing', 'Tango'
    ].sort(),
    
    'Cooking & Wine Related': [
      'Baking', 'Cheese making', 'Coffee culture', 'Cooking classes', 'Farmers markets', 
      'Food tours', 'Home brewing', 'Organic groceries', 'Vineyards', 'Wine tasting'
    ].sort(),
    
    'Museums & History Related': [
      'Antique collecting', 'Astronomy', 'Genealogy', 'Historical sites', 'Museums'
    ].sort(),
    
    'Social & Community': [
      'Art fairs', 'Bible study', 'Book clubs', 'Cultural festivals', 'Flea markets', 
      'Grandchildren activities', 'Outdoor concerts', 'Street festivals', 'Volunteering'
    ].sort(),
    
    'Games & Mental Activities': [
      'Board games', 'Bridge', 'Card games', 'Chess', 'Crossword puzzles', 
      'Darts', 'Jigsaw puzzles', 'Mahjong', 'Poker', 'Sudoku', 
      'Trivia nights', 'Video gaming'
    ].sort(),
    
    'Collecting & Hobbies': [
      'Collecting coins', 'Collecting stamps', 'Metal detecting', 
      'Model building', 'Radio amateur', 'Stargazing'
    ].sort(),
    
    'Learning & Culture': [
      'Blogging', 'Creative writing', 'Digital photography', 'Journaling', 
      'Language learning', 'Meditation', 'Poetry', 'RV traveling', 
      'Travel planning', 'Writing memoirs'
    ].sort()
  };

  // Flatten all hobbies for search functionality
  const allHobbies = Object.values(hobbyCategories).flat().sort();

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
            custom_physical: progressResult.data.hobbies.custom_physical || [],
            custom_hobbies: progressResult.data.hobbies.custom_hobbies || [],
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

  const handleCustomPhysicalToggle = (activity) => {
    setFormData(prev => ({
      ...prev,
      custom_physical: prev.custom_physical.includes(activity)
        ? prev.custom_physical.filter(item => item !== activity)
        : [...prev.custom_physical, activity]
    }));
  };

  const handleCustomHobbiesToggle = (hobby) => {
    setFormData(prev => ({
      ...prev,
      custom_hobbies: prev.custom_hobbies.includes(hobby)
        ? prev.custom_hobbies.filter(item => item !== hobby)
        : [...prev.custom_hobbies, hobby]
    }));
  };

  // Open physical activities modal - save current state for cancel
  const openPhysicalModal = () => {
    setTempPhysicalSelections([...formData.custom_physical]);
    setShowPhysicalModal(true);
  };

  // Open hobbies modal - save current state for cancel
  const openHobbiesModal = () => {
    setTempHobbiesSelections([...formData.custom_hobbies]);
    setShowHobbiesModal(true);
  };

  // Save physical activities and close modal
  const savePhysicalActivities = async () => {
    // Save to database immediately
    await autoSave();
    // Clear temp state
    setTempPhysicalSelections([]);
  };

  // Cancel physical activities changes
  const cancelPhysicalActivities = () => {
    // Revert to original state
    setFormData(prev => ({
      ...prev,
      custom_physical: tempPhysicalSelections
    }));
    setTempPhysicalSelections([]);
  };

  // Save hobbies and close modal
  const saveHobbies = async () => {
    // Save to database immediately
    await autoSave();
    // Clear temp state
    setTempHobbiesSelections([]);
  };

  // Cancel hobbies changes
  const cancelHobbies = () => {
    // Revert to original state
    setFormData(prev => ({
      ...prev,
      custom_hobbies: tempHobbiesSelections
    }));
    setTempHobbiesSelections([]);
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
        custom_physical: formData.custom_physical,
        custom_hobbies: formData.custom_hobbies,
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

  return (
    <>
      {showPhysicalModal && (
        <PhysicalActivityModal 
          showModal={showPhysicalModal}
          setShowModal={setShowPhysicalModal}
          physicalSearch={physicalSearch}
          setPhysicalSearch={setPhysicalSearch}
          formData={formData}
          handleCustomPhysicalToggle={handleCustomPhysicalToggle}
          hobbyCategories={hobbyCategories}
          uiConfig={uiConfig}
          onSave={savePhysicalActivities}
          onCancel={cancelPhysicalActivities}
        />
      )}
      {showHobbiesModal && (
        <HobbiesModal
          showModal={showHobbiesModal}
          setShowModal={setShowHobbiesModal}
          hobbiesSearch={hobbiesSearch}
          setHobbiesSearch={setHobbiesSearch}
          formData={formData}
          handleCustomHobbiesToggle={handleCustomHobbiesToggle}
          hobbyCategories={hobbyCategories}
          uiConfig={uiConfig}
          onSave={saveHobbies}
          onCancel={cancelHobbies}
        />
      )}
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
              {/* Add More Physical Activities Button */}
              <SelectionCard
                title="Add More"
                description={formData.custom_physical.length > 0 
                  ? formData.custom_physical.slice(0, 2).join(', ') + (formData.custom_physical.length > 2 ? '...' : '')
                  : 'More activities'
                }
                isSelected={formData.custom_physical.length > 0}
                onClick={openPhysicalModal}
              />
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
              {/* Add More Hobbies Button */}
              <SelectionCard
                title="Add More"
                description={formData.custom_hobbies.length > 0 
                  ? formData.custom_hobbies.slice(0, 2).join(', ') + (formData.custom_hobbies.length > 2 ? '...' : '')
                  : 'More hobbies'
                }
                icon={Plus}
                isSelected={formData.custom_hobbies.length > 0}
                onClick={openHobbiesModal}
              />
            </SelectionGrid>
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
            formData.custom_physical.length > 0 ||
            formData.custom_hobbies.length > 0) && (
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
                {formData.custom_physical.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>More Activities:</span> {formData.custom_physical.join(', ')}</div>
                )}
                {formData.interests.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Interests:</span> {formData.interests.map(id => 
                    interestOptions.find(i => i.id === id)?.title
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.custom_hobbies.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>More Hobbies:</span> {formData.custom_hobbies.join(', ')}</div>
                )}
                {formData.travel_frequency && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Travel:</span> {travelOptions.find(t => t.id === formData.travel_frequency)?.title || formData.travel_frequency}</div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Bottom Navigation - Using centralized config */}
        <div className={uiConfig.bottomNavigation.container.getContainerClasses(isIOS(), isNavVisible)}>
          <div className={uiConfig.bottomNavigation.container.innerContainer}>
            <div className={uiConfig.bottomNavigation.container.buttonLayout}>
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
