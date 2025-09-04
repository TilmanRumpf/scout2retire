import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Activity, ShoppingBag, Sparkles, Lightbulb, Search, X, Snowflake, Plus } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { saveUserPreferences } from '../../utils/userpreferences/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { isIOS } from '../../utils/platformDetection';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';
import { getCompoundMappings, getReverseMapping, getHobbiesForButtons, reconstructCompoundButtons, getHardcodedMappings } from '../../utils/hobbies/compoundButtonMappings';

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
              Explore More Physical Activities
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
                    {activities.map((activity) => {
                      const normalizedActivity = activity.toLowerCase().replace(/\s+/g, '_');
                      // Check BOTH arrays - activities (from quick selections) AND custom_physical (from modal)
                      const isSelected = formData.activities.includes(normalizedActivity) || 
                                       formData.custom_physical.includes(normalizedActivity);
                      return (
                        <button
                          key={activity}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCustomPhysicalToggle(activity);
                          }}
                          className={`p-2 ${uiConfig.layout.radius.md} border ${uiConfig.animation.transition} text-left ${
                            isSelected
                              ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-300'
                          } ${uiConfig.font.size.sm}`}
                        >
                          {activity}
                        </button>
                      );
                    })}
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
              Explore More Hobbies & Interests
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
                    {hobbies.map((hobby) => {
                      const normalizedHobby = hobby.toLowerCase().replace(/\s+/g, '_');
                      // Check BOTH arrays - interests (from quick selections) AND custom_hobbies (from modal)
                      const isSelected = formData.interests.includes(normalizedHobby) || 
                                       formData.custom_hobbies.includes(normalizedHobby);
                      return (
                        <button
                          key={hobby}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCustomHobbiesToggle(hobby);
                          }}
                          className={`p-2 ${uiConfig.layout.radius.md} border ${uiConfig.animation.transition} text-left ${
                            isSelected
                              ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-600 dark:text-scout-accent-400'
                              : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-300'
                          } ${uiConfig.font.size.sm}`}
                        >
                          {hobby}
                        </button>
                      );
                    })}
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Temporary state for modal changes (for cancel functionality)
  const [tempPhysicalSelections, setTempPhysicalSelections] = useState([]);
  const [tempHobbiesSelections, setTempHobbiesSelections] = useState([]);
  
  const navigate = useNavigate();
  const autoSaveTimeoutRef = useRef(null);
  
  // Auto-hide navigation on scroll
  const { isVisible: isNavVisible } = useHideOnScroll();
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  // Manual save function - called explicitly when needed
  const autoSave = async (dataOverride = null) => {
    try {
      setIsSaving(true);
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        setIsSaving(false);
        return false;
      }
      
      // Use passed data or fall back to current formData
      const dataToUse = dataOverride || formData;
      
      // DEBUG: Museums & History saving
      console.log('🔍 AUTO-SAVE DEBUG:');
      console.log('Using data source:', dataOverride ? 'passed data' : 'formData state');
      console.log('formData.activities:', dataToUse.activities);
      console.log('formData.interests:', dataToUse.interests);
      console.log('Has history?:', dataToUse.interests.includes('history'));
      
      // Expand compound buttons to ALL hobbies for matching  
      const expandedActivities = await getHobbiesForButtons(dataToUse.activities);
      const expandedInterests = await getHobbiesForButtons(dataToUse.interests);
      
      // CLEVER APPROACH: Use existing fields intelligently!
      const dataToSave = {
        // Save EXPANDED hobbies for matching algorithm
        activities: [...new Set([...expandedActivities, ...dataToUse.custom_physical])],
        interests: [...new Set([...expandedInterests, ...dataToUse.custom_hobbies])],
        // Save ALL compound button IDs (both activity and interest) for UI reconstruction
        custom_activities: [...dataToUse.activities, ...dataToUse.interests.map(i => `interest_${i}`)],
        // Keep modal selections for display
        custom_physical: dataToUse.custom_physical,
        custom_hobbies: dataToUse.custom_hobbies,
        travel_frequency: dataToUse.travel_frequency
      };
      
      // DEBUG: What are we saving?
      console.log('custom_activities being saved:', dataToSave.custom_activities);
      console.log('Has interest_history?:', dataToSave.custom_activities.includes('interest_history'));
      
      const { success } = await saveOnboardingStep(
        userResult.user.id,
        dataToSave,
        'hobbies'
      );
      
      // Also save to user_preferences table (this is what the app actually uses!)
      let prefSuccess = false;
      try {
        const { success: prefSaveSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'hobbies',
          dataToSave
        );
        prefSuccess = prefSaveSuccess;
        if (!prefSuccess) {
          console.error('❌ Failed to save to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Failed to save to user_preferences:', err);
      }
      
      if (success && prefSuccess) {
        console.log('✅ Hobbies saved to both tables successfully');
      } else if (success && !prefSuccess) {
        console.error('⚠️ CRITICAL: Saved to onboarding_responses but NOT to user_preferences - UI will not persist!');
      }
      
      setIsSaving(false);
      return success;
    } catch (err) {
      console.error('Save error:', err);
      setIsSaving(false);
      return false;
    }
  };
  
  // REMOVED auto-save on formData changes - was causing infinite loops
  // Instead, we save explicitly when user makes selections

  // Activity options with descriptions - defined early for use in data loading
  const activityOptions = [
    { id: 'walking_cycling', title: 'Walking & Cycling', description: 'and related activities...' },
    { id: 'golf_tennis', title: 'Golf & Tennis', description: 'and related activities...' },
    { id: 'water_sports', title: 'Water Sports', description: 'and related activities...' },
    { id: 'water_crafts', title: 'Water Crafts', description: 'and related activities...' },
    { id: 'winter_sports', title: 'Winter Sports', description: 'and related activities...' }
  ];

  // Interest options with descriptions - defined early for use in data loading
  const interestOptions = [
    { id: 'gardening', title: 'Gardening & Pets', description: 'and related activities...' },
    { id: 'arts', title: 'Arts & Crafts', description: 'and related activities...' },
    { id: 'music_theater', title: 'Music & Theater', description: 'and related activities...' },
    { id: 'cooking_wine', title: 'Cooking & Wine', description: 'and related activities...' },
    { id: 'history', title: 'Museums & History', description: 'and related activities...' }
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
      'Archery', 'Basketball', 'Bowling', 'Fencing', 
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
        
        // DEBUG: Add logging to trace the issue
        console.log('🔍 DEBUG: Loading user data');
        console.log('User ID:', userResult.user?.id);
        console.log('Progress result:', progressResult);
        console.log('Hobbies data:', progressResult.data?.hobbies);
        console.log('custom_activities:', progressResult.data?.hobbies?.custom_activities);
        
        if (!progressResult.success) {
          console.error("Error loading existing data:", progressResult.error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
        // If hobbies data exists, load it
        if (progressResult.data && progressResult.data.hobbies) {
          // Fetch compound mappings from database groups
          let compoundMappings;
          let reverseMapping;
          
          try {
            // Try to get mappings from database
            compoundMappings = await getCompoundMappings();
            reverseMapping = await getReverseMapping();
          } catch (error) {
            console.error('Failed to load mappings from database, using fallback:', error);
            // Fall back to hard-coded mappings if database fails
            compoundMappings = getHardcodedMappings();
            // Create reverse mapping from fallback
            reverseMapping = {};
            Object.entries(compoundMappings).forEach(([compound, items]) => {
              items.forEach(item => {
                if (!reverseMapping[item]) reverseMapping[item] = [];
                reverseMapping[item].push(compound);
              });
            });
          }
          
          // Load raw data from database
          // NEW: custom_activities now stores compound button IDs
          const loadedCompoundButtons = progressResult.data.hobbies.custom_activities || [];
          const loadedActivities = progressResult.data.hobbies.activities || [];
          const loadedInterests = progressResult.data.hobbies.interests || [];
          const loadedCustomPhysical = progressResult.data.hobbies.custom_physical || [];
          const loadedCustomHobbies = progressResult.data.hobbies.custom_hobbies || [];
          
          // Reconstruct UI state from database data
          // NEW: custom_activities stores both activity and interest compound button IDs
          console.log('🔍 LOADING DEBUG for Museums & History:');
          console.log('loadedCompoundButtons:', loadedCompoundButtons);
          console.log('Has interest_history?:', loadedCompoundButtons.includes('interest_history'));
          
          const reconstructedActivities = loadedCompoundButtons.filter(id => !id.startsWith('interest_'));
          const reconstructedInterests = loadedCompoundButtons
            .filter(id => id.startsWith('interest_'))
            .map(id => id.replace('interest_', ''));
          
          console.log('reconstructedInterests:', reconstructedInterests);
          console.log('Has history after reconstruction?:', reconstructedInterests.includes('history'));
          
          // Keep custom selections as loaded
          const customPhysical = [...loadedCustomPhysical];
          const customHobbies = [...loadedCustomHobbies];
          
          // For backward compatibility: if no compound buttons saved but activities exist,
          // try to reconstruct from individual activities (old data format)
          if (reconstructedActivities.length === 0 && loadedActivities.length > 0) {
            console.log('Using backward compatibility mode to reconstruct buttons');
            console.log('Loaded activities from DB:', loadedActivities);
            
            loadedActivities.forEach(activity => {
              // Check if this is a compound button ID (like 'water_sports', 'golf_tennis')
              const isCompoundButton = ['walking_cycling', 'golf_tennis', 'water_sports', 'water_crafts', 'winter_sports'].includes(activity);
              
              if (isCompoundButton) {
                // It's already a compound button ID - just add it
                if (!reconstructedActivities.includes(activity)) {
                  reconstructedActivities.push(activity);
                  console.log(`Added compound button: ${activity}`);
                }
              }
              // Don't try to map individual hobbies back to buttons - that was causing the issue
            });
          }
          
          // Process interests similarly
          if (reconstructedInterests.length === 0 && loadedInterests.length > 0) {
            loadedInterests.forEach(interest => {
              // Check if this is a compound button ID
              const isCompoundButton = ['gardening', 'arts', 'music_theater', 'cooking_wine', 'history'].includes(interest);
              
              if (isCompoundButton) {
                // It's already a compound button ID - just add it
                if (!reconstructedInterests.includes(interest)) {
                  reconstructedInterests.push(interest);
                }
              }
              // Don't try to map individual hobbies back to buttons
            });
          }
          
          console.log('Reconstructed state from DB:', {
            activities: reconstructedActivities,
            interests: reconstructedInterests,
            custom_physical: customPhysical,
            custom_hobbies: customHobbies
          });
          
          console.log('🎯 FINAL CHECK - Setting formData with:');
          console.log('  Activities:', reconstructedActivities);
          console.log('  Interests:', reconstructedInterests);
          console.log('  Has history in interests?:', reconstructedInterests.includes('history'));
          
          // CRITICAL FIX: Ensure we're setting the right data
          const newFormData = {
            activities: reconstructedActivities,
            interests: reconstructedInterests,
            custom_physical: customPhysical,
            custom_hobbies: customHobbies,
            travel_frequency: progressResult.data.hobbies.travel_frequency || ''
          };
          
          console.log('🔧 FIX: Setting formData to:', newFormData);
          setFormData(newFormData);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  // Helper function to split compound hobbies/activities
  const splitCompoundItem = (itemId) => {
    // Split items like 'cooking_wine' into ['cooking', 'wine']
    // Also handle items with '&' like from the title
    const activityOption = activityOptions.find(a => a.id === itemId);
    const interestOption = interestOptions.find(i => i.id === itemId);
    const option = activityOption || interestOption;
    
    if (option && option.title && option.title.includes('&')) {
      // Split by '&' and clean up each part
      return option.title.toLowerCase()
        .split('&')
        .map(part => part.trim().replace(/\s+/g, '_'))
        .filter(part => part.length > 0);
    }
    
    // Handle specific IDs that should be split
    // Based on underscore compounds - save actual activities not the compound ID
    if (itemId === 'cooking_wine') return ['cooking', 'wine'];
    if (itemId === 'music_theater') return ['music', 'theater'];
    if (itemId === 'walking_cycling') return ['walking', 'cycling'];
    if (itemId === 'golf_tennis') return ['golf', 'tennis'];
    if (itemId === 'water_sports') return ['swimming']; // Main water activity
    if (itemId === 'water_crafts') return ['boating']; // Main water craft
    if (itemId === 'winter_sports') return ['skiing']; // Main winter sport
    
    // Based on titles with '&'
    if (itemId === 'gardening') return ['gardening']; // Just gardening
    if (itemId === 'arts') return ['arts', 'crafts']; // "Arts & Crafts"
    if (itemId === 'history') return ['museums', 'history']; // "Museums & History"
    
    return [itemId];
  };

  const handleActivityToggle = async (itemId) => {
    // DON'T split compound IDs - keep them as-is for proper persistence
    // The expansion happens during save, not in UI state
    
    console.log(`Activity toggle clicked: ${itemId}`);
    
    setFormData(prev => {
      let newActivities = [...prev.activities];
      
      // Simple toggle - add or remove the compound button ID
      if (newActivities.includes(itemId)) {
        // Remove the compound button ID
        newActivities = newActivities.filter(item => item !== itemId);
        console.log(`Removed ${itemId} from activities:`, newActivities);
      } else {
        // Add the compound button ID
        newActivities.push(itemId);
        console.log(`Added ${itemId} to activities:`, newActivities);
      }
      
      const updatedFormData = {
        ...prev,
        activities: newActivities
      };
      
      // Schedule auto-save with the UPDATED data
      // Clear any pending save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Schedule new save with updated state
      autoSaveTimeoutRef.current = setTimeout(async () => {
        console.log('⏰ Auto-save triggered for activities with updated data');
        await autoSave(updatedFormData);
      }, 1500); // 1.5 seconds delay for debouncing
      
      return updatedFormData;
    });
  };

  const handleInterestToggle = async (itemId) => {
    // DON'T split compound IDs - keep them as-is for proper persistence
    // The expansion happens during save, not in UI state
    
    console.log(`Interest toggle clicked: ${itemId}`);
    
    setFormData(prev => {
      let newInterests = [...prev.interests];
      
      // Simple toggle - add or remove the compound button ID
      if (newInterests.includes(itemId)) {
        // Remove the compound button ID
        newInterests = newInterests.filter(item => item !== itemId);
        console.log(`Removed ${itemId} from interests:`, newInterests);
      } else {
        // Add the compound button ID
        newInterests.push(itemId);
        console.log(`Added ${itemId} to interests:`, newInterests);
      }
      
      const updatedFormData = {
        ...prev,
        interests: newInterests
      };
      
      // Schedule auto-save with the UPDATED data
      // Clear any pending save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Schedule new save with updated state
      autoSaveTimeoutRef.current = setTimeout(async () => {
        console.log('⏰ Auto-save triggered for interests with updated data');
        await autoSave(updatedFormData);
      }, 1500); // 1.5 seconds delay for debouncing
      
      return updatedFormData;
    });
  };

  const handleCustomPhysicalToggle = (activity) => {
    // Normalize to lowercase to prevent duplicates
    const normalizedActivity = activity.toLowerCase().replace(/\s+/g, '_');
    
    setFormData(prev => ({
      ...prev,
      custom_physical: prev.custom_physical.includes(normalizedActivity)
        ? prev.custom_physical.filter(item => item !== normalizedActivity)
        : [...prev.custom_physical, normalizedActivity]
    }));
  };

  const handleCustomHobbiesToggle = (hobby) => {
    // Normalize to lowercase to prevent duplicates
    const normalizedHobby = hobby.toLowerCase().replace(/\s+/g, '_');
    
    setFormData(prev => ({
      ...prev,
      custom_hobbies: prev.custom_hobbies.includes(normalizedHobby)
        ? prev.custom_hobbies.filter(item => item !== normalizedHobby)
        : [...prev.custom_hobbies, normalizedHobby]
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
      
      // Expand compound buttons to ALL hobbies for matching
      const expandedActivities = await getHobbiesForButtons(formData.activities);
      const expandedInterests = await getHobbiesForButtons(formData.interests);
      
      // CLEVER APPROACH: Use existing fields intelligently!
      const dataToSave = {
        // Save EXPANDED hobbies for matching algorithm
        activities: [...new Set([...expandedActivities, ...formData.custom_physical])],
        interests: [...new Set([...expandedInterests, ...formData.custom_hobbies])],
        // Save ALL compound button IDs (both activity and interest) for UI reconstruction
        custom_activities: [...formData.activities, ...formData.interests.map(i => `interest_${i}`)],
        // Keep modal selections for display
        custom_physical: formData.custom_physical,
        custom_hobbies: formData.custom_hobbies,
        travel_frequency: formData.travel_frequency
      };
      
      console.log('💾 Saving expanded hobbies:', {
        'Compound buttons selected': [...formData.activities, ...formData.interests],
        'Expanded to hobbies': [...expandedActivities, ...expandedInterests],
        'Total activities': dataToSave.activities.length,
        'Total interests': dataToSave.interests.length
      });
      
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
      console.log('📝 Attempting to save to user_preferences with data:', dataToSave);
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'hobbies',
          dataToSave
        );
        if (prefSuccess) {
          console.log('✅ Successfully saved hobbies to user_preferences');
        } else {
          console.error('❌ Failed to save hobbies to user_preferences:', prefError);
          toast.error('Failed to update preferences - please try again');
        }
      } catch (err) {
        console.error('Error saving hobbies to user_preferences:', err);
        toast.error('Error updating preferences');
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
              {isSaving && <span className="ml-2 text-green-600 font-medium">(Saving...)</span>}
            </p>
          </div>
          
          {/* Physical Activities */}
          <SelectionSection icon={Activity} title="Physical Activities">
            <SelectionGrid>
              {activityOptions.map((activity) => {
                // Check if the compound button ID is selected
                const isSelected = formData.activities.includes(activity.id);
                
                return (
                  <SelectionCard
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    icon={activity.icon}
                    isSelected={isSelected}
                    onClick={() => handleActivityToggle(activity.id)}
                  />
                );
              })}
              {/* Explore More Physical Activities Button */}
              <SelectionCard
                title="Explore More..."
                description={formData.custom_physical.length > 0 
                  ? formData.custom_physical.slice(0, 2).map(item => 
                      // Convert from normalized format (e.g., "mountain_biking") to display format ("Mountain biking")
                      item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ') + (formData.custom_physical.length > 2 ? '...' : '')
                  : 'More activities'
                }
                icon={Plus}
                isSelected={formData.custom_physical.length > 0}
                onClick={openPhysicalModal}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Hobbies & Interests */}
          <SelectionSection icon={Heart} title="Hobbies & Interests">
            <SelectionGrid>
              {interestOptions.map((interest) => {
                // Check if the compound button ID is selected
                const isSelected = formData.interests.includes(interest.id);
                
                return (
                  <SelectionCard
                    key={interest.id}
                    title={interest.title}
                    description={interest.description}
                    isSelected={isSelected}
                    onClick={() => handleInterestToggle(interest.id)}
                  />
                );
              })}
              {/* Explore More Hobbies Button */}
              <SelectionCard
                title="Explore More..."
                description={formData.custom_hobbies.length > 0 
                  ? formData.custom_hobbies.slice(0, 2).map(item => 
                      // Convert from normalized format (e.g., "needle_point") to display format ("Needle Point")
                      item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ') + (formData.custom_hobbies.length > 2 ? '...' : '')
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
                  onClick={() => {
                    setFormData(prev => ({ ...prev, travel_frequency: option.id }));
                    // Auto-save after selection
                    if (autoSaveTimeoutRef.current) {
                      clearTimeout(autoSaveTimeoutRef.current);
                    }
                    autoSaveTimeoutRef.current = setTimeout(async () => {
                      await autoSave();
                    }, 1000);
                  }}
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
                {(formData.activities.length > 0 || formData.custom_physical.length > 0) && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Activities:</span> {
                    (() => {
                      // Only show items that are actually selected - match the button selection logic
                      const selectedActivities = [];
                      
                      // Check each activity option to see if it's selected (using same logic as buttons)
                      activityOptions.forEach(option => {
                        // Check if the compound button ID is selected
                        const isSelected = formData.activities.includes(option.id);
                        if (isSelected) {
                          selectedActivities.push(option.title);
                        }
                      });
                      
                      // Add custom physical activities
                      formData.custom_physical.forEach(activity => {
                        selectedActivities.push(activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                      });
                      
                      return selectedActivities.join(', ');
                    })()
                  }</div>
                )}
                {(formData.interests.length > 0 || formData.custom_hobbies.length > 0) && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Interests:</span> {
                    (() => {
                      // Only show items that are actually selected - match the button selection logic
                      const selectedInterests = [];
                      
                      // Check each interest option to see if it's selected (using same logic as buttons)
                      interestOptions.forEach(option => {
                        // Check if the compound button ID is selected
                        const isSelected = formData.interests.includes(option.id);
                        if (isSelected) {
                          selectedInterests.push(option.title);
                        }
                      });
                      
                      // Add custom hobbies
                      formData.custom_hobbies.forEach(hobby => {
                        selectedInterests.push(hobby.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                      });
                      
                      return selectedInterests.join(', ');
                    })()
                  }</div>
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
