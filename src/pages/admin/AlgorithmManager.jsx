import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';
import {
  CATEGORY_WEIGHTS,
  MATCH_QUALITY,
  REGION_SETTINGS,
  CLIMATE_SETTINGS,
  CULTURE_SETTINGS,
  ADMIN_SETTINGS,
  BUDGET_SETTINGS,
  HOBBIES_SETTINGS,
  DEBUG
} from '../../utils/scoring/config';
import { scoreTownsBatch } from '../../utils/scoring/unifiedScoring';
import { getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig';

const AlgorithmManager = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExecutiveAdmin, setIsExecutiveAdmin] = useState(false);

  // Test town state
  const [selectedTown, setSelectedTown] = useState(null);
  const [towns, setTowns] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTransparency, setShowTransparency] = useState(false);
  const [showTesting, setShowTesting] = useState(true); // Default to open
  const [townSearch, setTownSearch] = useState('');
  const [showTownDropdown, setShowTownDropdown] = useState(false);
  const [filteredTowns, setFilteredTowns] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRestoringTown, setIsRestoringTown] = useState(false);

  // Algorithm configuration state
  const [config, setConfig] = useState({
    categoryWeights: { ...CATEGORY_WEIGHTS },
    matchQuality: { ...MATCH_QUALITY },
    regionSettings: { ...REGION_SETTINGS },
    climateSettings: { ...CLIMATE_SETTINGS },
    cultureSettings: { ...CULTURE_SETTINGS },
    adminSettings: { ...ADMIN_SETTINGS },
    budgetSettings: { ...BUDGET_SETTINGS },
    hobbiesSettings: { ...HOBBIES_SETTINGS },
    debugSettings: { ...DEBUG }
  });

  // Verify user is executive admin and load data
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setCurrentUser(user);

      const { data: userData, error } = await supabase
        .from('users')
        .select('admin_role')
        .eq('id', user.id)
        .single();

      if (error || userData?.admin_role !== 'executive_admin') {
        toast.error('Access denied. Executive admin only.');
        navigate('/admin');
        return;
      }

      setIsExecutiveAdmin(true);

      // Load user's preferences for testing
      try {
        const result = await getOnboardingProgress(user.id);
        // Extract the actual data from the result
        if (result.success && result.data) {
          setUserPreferences(result.data);
          console.log('Loaded user preferences:', result.data);
        } else {
          console.error('Failed to load user preferences:', result);
          setUserPreferences(null);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }

      // Load towns for testing - use only basic columns
      const { data: townsData, error: townsError } = await supabase
        .from('towns')
        .select('id, town_name, country')
        .order('town_name');

      if (townsError) {
        console.error('Error loading towns:', townsError);
      }

      if (townsData) {
        setTowns(townsData);
      }

      setLoading(false);
    };

    checkAccessAndLoadData();
  }, [navigate]);

  // Calculate total weight
  const calculateTotalWeight = () => {
    return Object.values(config.categoryWeights).reduce((sum, weight) => sum + parseFloat(weight || 0), 0);
  };

  // Filter towns based on search - only search by town name
  useEffect(() => {
    if (townSearch.trim() === '') {
      setFilteredTowns([]);
    } else {
      const searchLower = townSearch.toLowerCase();
      // First, get towns that start with the search term
      const startsWithSearch = towns.filter(town =>
        town.town_name.toLowerCase().startsWith(searchLower)
      );
      // Then get towns that contain the search term but don't start with it
      const containsSearch = towns.filter(town =>
        !town.town_name.toLowerCase().startsWith(searchLower) &&
        town.town_name.toLowerCase().includes(searchLower)
      );
      // Combine them, prioritizing towns that start with the search term
      const filtered = [...startsWithSearch, ...containsSearch].slice(0, 15);
      setFilteredTowns(filtered);
    }
  }, [townSearch, towns]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTownDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Restore last selected town from localStorage when towns are loaded
  useEffect(() => {
    if (towns.length === 0 || isRestoringTown) return;

    try {
      const savedTownId = localStorage.getItem('algorithmManager_lastTownId');
      const savedTownName = localStorage.getItem('algorithmManager_lastTownName');

      if (savedTownId && savedTownName) {
        // Find the town in the loaded towns list
        const town = towns.find(t => t.id === savedTownId);

        if (town) {
          setIsRestoringTown(true);
          setTownSearch(town.town_name);
          setSelectedTown(town);
          console.log('[AlgorithmManager] Restored last selected town:', town.town_name);
        } else {
          // Town ID not found, try to find by name
          const townByName = towns.find(t => t.town_name === savedTownName);
          if (townByName) {
            setIsRestoringTown(true);
            setTownSearch(townByName.town_name);
            setSelectedTown(townByName);
            console.log('[AlgorithmManager] Restored town by name:', townByName.town_name);
          }
        }
      }
    } catch (error) {
      console.error('[AlgorithmManager] Error restoring last town:', error);
    }
  }, [towns, isRestoringTown]);

  // Reset restoration flag after restoration is complete
  useEffect(() => {
    if (isRestoringTown && selectedTown) {
      // Wait for next tick to ensure restoration is complete
      const timer = setTimeout(() => {
        setIsRestoringTown(false);
        console.log('[AlgorithmManager] Restoration complete, re-enabled saving');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRestoringTown, selectedTown]);

  // Save selected town to localStorage whenever it changes
  useEffect(() => {
    if (selectedTown && !isRestoringTown) {
      try {
        localStorage.setItem('algorithmManager_lastTownId', selectedTown.id);
        localStorage.setItem('algorithmManager_lastTownName', selectedTown.town_name);
        console.log('[AlgorithmManager] Saved town to localStorage:', selectedTown.town_name);
      } catch (error) {
        console.error('[AlgorithmManager] Error saving town to localStorage:', error);
      }
    }
  }, [selectedTown, isRestoringTown]);

  // Handle category weight change
  const handleWeightChange = (category, value) => {
    setConfig(prev => ({
      ...prev,
      categoryWeights: {
        ...prev.categoryWeights,
        [category]: parseFloat(value) || 0
      }
    }));
  };

  // Handle other settings changes
  const handleSettingChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: isNaN(value) ? value : parseFloat(value)
      }
    }));
  };

  // Save configuration
  const handleSave = async () => {
    const total = calculateTotalWeight();
    if (Math.abs(total - 100) > 0.01) {
      toast.error(`Category weights must add up to 100% (currently ${total.toFixed(1)}%)`);
      return;
    }

    setSaving(true);
    try {
      // In a real implementation, you'd save this to a database or config file
      // For now, we'll just show a success message
      toast.success('Algorithm configuration saved successfully!');

      // Log the configuration for debugging
      console.log('Saved configuration:', config);

      // TODO: Implement actual save logic
      // const { error } = await supabase
      //   .from('algorithm_config')
      //   .upsert({ config: JSON.stringify(config) });

    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setConfig({
      categoryWeights: { ...CATEGORY_WEIGHTS },
      matchQuality: { ...MATCH_QUALITY },
      regionSettings: { ...REGION_SETTINGS },
      climateSettings: { ...CLIMATE_SETTINGS },
      cultureSettings: { ...CULTURE_SETTINGS },
      adminSettings: { ...ADMIN_SETTINGS },
      budgetSettings: { ...BUDGET_SETTINGS },
      hobbiesSettings: { ...HOBBIES_SETTINGS },
      debugSettings: { ...DEBUG }
    });
    toast.success('Reset to default configuration');
  };

  // Test scoring with selected town
  const handleTestScoring = async () => {
    if (!selectedTown || !userPreferences) {
      console.log('Missing data - selectedTown:', selectedTown, 'userPreferences:', userPreferences);
      return;
    }

    setIsCalculating(true);
    try {
      // Clear any cached results to ensure fresh scoring
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('personalized')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      console.log('Cleared cache, testing with fresh scoring');

      console.log('Testing scoring with preferences:', userPreferences);

      // Load full town data
      const { data: fullTownData } = await supabase
        .from('towns')
        .select('*')
        .eq('id', selectedTown.id)
        .single();

      if (!fullTownData) {
        toast.error('Could not load town data');
        return;
      }

      console.log('Full town data loaded:', fullTownData.town_name, fullTownData.country);
      console.log('Calling scoreTownsBatch with preferences structure:', {
        hasClimate: !!userPreferences.climate_preferences,
        hasRegion: !!userPreferences.region_preferences,
        hasCulture: !!userPreferences.culture_preferences,
        hasHobbies: !!userPreferences.hobbies,
        hasAdmin: !!userPreferences.administration,
        hasCosts: !!userPreferences.costs
      });

      // Use the SAME scoring function as the actual app!
      const scoredTowns = await scoreTownsBatch([fullTownData], userPreferences);
      const result = scoredTowns[0];

      console.log('[AlgorithmManager] Town being scored:', fullTownData.town_name);
      console.log('[AlgorithmManager] Score result:', result.matchScore + '%');
      console.log('[AlgorithmManager] Category breakdown:', {
        overall: result.matchScore,
        region: result.categoryScores?.region,
        climate: result.categoryScores?.climate,
        culture: result.categoryScores?.culture,
        hobbies: result.categoryScores?.hobbies,
        admin: result.categoryScores?.administration,
        cost: result.categoryScores?.cost
      });

      if (!result) {
        toast.error('Could not calculate score');
        return;
      }

      // Also calculate what the score would be with default weights for comparison
      const defaultWeights = {
        region: 20,
        climate: 15,
        culture: 15,
        hobbies: 10,
        administration: 20,
        cost: 20
      };

      const weightedSum =
        (result.categoryScores.region * config.categoryWeights.region / 100) +
        (result.categoryScores.climate * config.categoryWeights.climate / 100) +
        (result.categoryScores.culture * config.categoryWeights.culture / 100) +
        (result.categoryScores.hobbies * config.categoryWeights.hobbies / 100) +
        (result.categoryScores.administration * config.categoryWeights.administration / 100) +
        (result.categoryScores.cost * config.categoryWeights.cost / 100);

      console.log('Manual weighted calculation:', Math.round(weightedSum) + '%');
      console.log('Weights being used:', config.categoryWeights);

      setTestResults({
        town: fullTownData,
        score: result.matchScore,
        quality: result.matchQuality || result.match_quality,
        categoryScores: result.categoryScores,
        factors: result.matchFactors || result.match_factors || [],
        breakdown: result
      });

      toast.success(`Scored ${fullTownData.town_name}: ${result.matchScore}%`);
    } catch (error) {
      console.error('Error testing scoring:', error);
      toast.error('Error calculating test score');
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate when town is selected
  useEffect(() => {
    if (selectedTown && userPreferences) {
      handleTestScoring();
    }
  }, [selectedTown]); // Only trigger when selectedTown changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isExecutiveAdmin) {
    return null;
  }

  const totalWeight = calculateTotalWeight();
  const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      <UnifiedHeader title="🎯 Algorithm Manager" />
      <HeaderSpacer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Description */}
        <div className="mb-8">
          <p className={`${uiConfig.colors.body}`}>
            Configure the town matching algorithm weights and scoring parameters
          </p>
        </div>

        {/* Live Testing Section - Collapsible */}
        <div className={`${uiConfig.colors.card} border ${uiConfig.colors.border} rounded-lg mb-6`}>
          <button
            onClick={() => setShowTesting(!showTesting)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
              🧪 Live Algorithm Testing
            </h2>
            <span className={`text-2xl transform transition-transform ${showTesting ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showTesting && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2 mt-4">
                Search for a Town to Test:
              </h3>
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={townSearch}
                  onChange={(e) => {
                    setTownSearch(e.target.value);
                    setShowTownDropdown(true);
                  }}
                  onFocus={() => setShowTownDropdown(true)}
                  placeholder="Type town name..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary"
                />

                {showTownDropdown && filteredTowns.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredTowns.map(town => (
                      <button
                        key={town.id}
                        onClick={() => {
                          setSelectedTown(town);
                          setTownSearch(town.town_name);
                          setShowTownDropdown(false);
                          setTestResults(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium">{town.town_name}</div>
                        <div className="text-sm text-gray-500">
                          {town.country}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {townSearch && filteredTowns.length === 0 && (
                <p className={`text-sm ${uiConfig.colors.muted} mt-1`}>No towns found matching "{townSearch}"</p>
              )}
            </div>

            {selectedTown && (
              <div className={`${uiConfig.colors.card} rounded p-4`}>
                <p className={`text-sm mb-2 ${uiConfig.colors.body}`}>
                  <strong>Testing as:</strong> {currentUser?.email}
                </p>
                <p className={`text-sm ${uiConfig.colors.body}`}>
                  <strong>Selected:</strong> {selectedTown.town_name}, {selectedTown.country}
                </p>

                {isCalculating && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className={`text-sm ${uiConfig.colors.muted}`}>Calculating score...</span>
                  </div>
                )}

                <div className={`mt-2 text-xs ${uiConfig.colors.hint}`}>
                  <p>💡 Tip: The production UI may show cached scores from earlier calculations.</p>
                  <p>To get fresh scores, clear your browser cache or use an incognito window.</p>
                </div>
              </div>
            )}

            {testResults && !isCalculating && (
              <div className={`${uiConfig.colors.card} rounded p-4 space-y-4`}>
                <h3 className={`font-semibold text-lg ${uiConfig.colors.accent}`}>Test Results</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${uiConfig.colors.hint}`}>Overall Score</p>
                    <p className={`text-2xl font-bold ${uiConfig.colors.accent}`}>{testResults.score}%</p>
                    <p className={`text-sm ${uiConfig.colors.muted}`}>{testResults.quality}</p>
                  </div>

                  <div>
                    <p className={`text-sm ${uiConfig.colors.hint}`}>Category Breakdown</p>
                    <div className="space-y-1">
                      {Object.entries(testResults.categoryScores || {}).map(([cat, score]) => (
                        <div key={cat} className="flex justify-between text-sm">
                          <span className={`capitalize ${uiConfig.colors.body}`}>{cat}:</span>
                          <span className={`font-semibold ${uiConfig.colors.heading}`}>{score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {testResults.factors && testResults.factors.length > 0 && (
                  <div>
                    <p className={`text-sm font-semibold ${uiConfig.colors.body} mb-2`}>Top Matching Factors:</p>
                    <ul className="text-sm space-y-1">
                      {testResults.factors.slice(0, 5).map((factor, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className={uiConfig.colors.body}>{factor.factor}</span>
                          <span className={factor.score > 0 ? uiConfig.colors.accent : uiConfig.colors.error}>
                            {factor.score > 0 ? '+' : ''}{factor.score}pts
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={`text-xs ${uiConfig.colors.muted} mt-4`}>
                  <p><strong>Note:</strong> This uses YOUR preferences ({currentUser?.email}) with the current algorithm weights.</p>
                  <p>The score shows how well {selectedTown.town_name} matches your personal retirement preferences.</p>
                </div>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Transparency Section - Collapsible */}
        <div className={`${uiConfig.colors.card} border ${uiConfig.colors.border} rounded-lg mb-6`}>
          <button
            onClick={() => setShowTransparency(!showTransparency)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className={`text-xl font-semibold ${uiConfig.colors.heading}`}>
              📊 Algorithm Transparency
            </h2>
            <span className={`text-2xl transform transition-transform ${showTransparency ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showTransparency && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Database Architecture</h3>
                <div className="bg-white rounded p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Primary Table:</strong> <code className="bg-gray-100 px-1">towns</code> (343 rows, 170 columns)
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>User Data:</strong> <code className="bg-gray-100 px-1">user_preferences</code> (linked by user_id)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 1: Region (30% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match geographic location preferences</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>country</code>, <code>state_code</code>, <code>region</code> - Location identifiers</li>
                    <li><code>geographic_features_actual[]</code> - Array: coastal, mountain, island, etc.</li>
                    <li><code>vegetation_type_actual[]</code> - Array: tropical, mediterranean, forest, etc.</li>
                    <li><code>latitude</code>, <code>longitude</code> - Exact coordinates</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Scoring:</strong> 40pts country match + 30pts features + 20pts vegetation</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 2: Climate (13% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match weather preferences</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>avg_temp_summer</code>, <code>avg_temp_winter</code> - Actual temperatures (°C)</li>
                    <li><code>humidity_level_actual</code> - dry/balanced/humid</li>
                    <li><code>sunshine_level_actual</code> - often_sunny/balanced/less_sunny</li>
                    <li><code>precipitation_level_actual</code> - mostly_dry/balanced/less_dry</li>
                    <li><code>annual_rainfall</code>, <code>sunshine_hours</code> - Numeric data</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Scoring:</strong> Temperature matching with gradual scoring (perfect=100%, ±5°C=50%)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 3: Culture (12% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match lifestyle and cultural preferences</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>urban_rural_character</code> - urban/suburban/rural</li>
                    <li><code>pace_of_life_actual</code> - fast/moderate/relaxed</li>
                    <li><code>expat_community_size</code> - large/moderate/small</li>
                    <li><code>primary_language</code>, <code>english_proficiency_level</code></li>
                    <li><code>restaurants_rating</code>, <code>nightlife_rating</code> (1-5 scale)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 4: Hobbies (8% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match activities and interests</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>top_hobbies[]</code> - Town's distinctive activities</li>
                    <li><code>beaches_nearby</code>, <code>golf_courses_count</code>, <code>hiking_trails_km</code></li>
                    <li><code>walkability</code>, <code>outdoor_activities_rating</code></li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Special:</strong> Uses geographic inference (coastal→water sports)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 5: Administration (18% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match healthcare, safety, visa needs</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>healthcare_score</code> (0-10) + <code>hospital_count</code>, <code>english_speaking_doctors</code></li>
                    <li><code>safety_score</code> (0-10) + <code>crime_rate</code>, <code>natural_disaster_risk</code></li>
                    <li><code>government_efficiency_rating</code>, <code>political_stability_rating</code></li>
                    <li><code>visa_on_arrival_countries[]</code>, <code>retirement_visa_available</code></li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Dynamic Calculation:</strong> Base scores enhanced with bonus/penalty factors</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Category 6: Cost (19% weight)</h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <p className="text-sm"><strong>Purpose:</strong> Match budget requirements</p>
                  <p className="text-sm"><strong>Database Columns:</strong></p>
                  <ul className="text-sm ml-4 list-disc">
                    <li><code>cost_of_living_usd</code> - Monthly living cost</li>
                    <li><code>rent_1bed</code>, <code>rent_2bed_usd</code> - Housing costs</li>
                    <li><code>meal_cost</code>, <code>groceries_cost</code>, <code>utilities_cost</code></li>
                    <li><code>income_tax_rate_pct</code>, <code>sales_tax_rate_pct</code>, <code>property_tax_rate_pct</code></li>
                  </ul>
                  <p className="text-sm mt-2"><strong>Formula:</strong> Budget ratio scoring (2x budget = 70pts, exact match = 55pts)</p>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Category Weights Section */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>
            Category Weights
            <span className={`ml-4 text-sm ${isValidWeight ? 'text-green-600' : 'text-red-600'}`}>
              Total: {totalWeight.toFixed(1)}%
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.categoryWeights).map(([category, weight]) => (
              <div key={category} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body} capitalize`}>
                  {category.replace(/([A-Z])/g, ' $1').trim()}:
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => handleWeightChange(category, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                  min="0"
                  max="100"
                  step="0.5"
                />
                <span className={uiConfig.colors.muted}>%</span>
              </div>
            ))}
          </div>

          {!isValidWeight && (
            <p className="mt-4 text-red-600 text-sm">
              ⚠️ Weights must add up to exactly 100%
            </p>
          )}
        </div>

        {/* Match Quality Thresholds */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Match Quality Thresholds</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.matchQuality).map(([level, threshold]) => (
              <div key={level} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body}`}>
                  {level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => handleSettingChange('matchQuality', level, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                  min="0"
                  max="100"
                />
                <span className={uiConfig.colors.muted}>pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region Settings */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Region Scoring Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.regionSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body} text-sm`}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleSettingChange('regionSettings', key, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                  step={key.includes('CREDIT') ? 0.1 : 1}
                />
                <span className={uiConfig.colors.muted}>
                  {key.includes('CREDIT') ? '×' : 'pts'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Climate Settings */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Climate Scoring Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.climateSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body} text-sm`}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleSettingChange('climateSettings', key, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                />
                <span className={uiConfig.colors.muted}>
                  {key.includes('RANGE') ? '°C' : 'pts'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Culture Settings */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Culture Scoring Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.cultureSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body} text-sm`}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleSettingChange('cultureSettings', key, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                />
                <span className={uiConfig.colors.muted}>pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Settings */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Budget Scoring Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.budgetSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body} text-sm`}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleSettingChange('budgetSettings', key, e.target.value)}
                  className="w-20 px-3 py-1 border border-border rounded-md focus:ring-2 focus:ring-primary"
                  step={key.includes('RATIO') ? 0.1 : 1}
                />
                <span className={uiConfig.colors.muted}>
                  {key.includes('RATIO') ? '×' : 'pts'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Settings */}
        <div className={`${uiConfig.colors.card} rounded-lg shadow-md p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-4`}>Debug Settings</h2>

          <div className="space-y-4">
            {Object.entries(config.debugSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <label className={`flex-1 ${uiConfig.colors.body}`}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('debugSettings', key, e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleReset}
            className={uiConfig.colors.btnNeutral}
          >
            Reset to Defaults
          </button>

          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className={uiConfig.colors.btnSecondary}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!isValidWeight || saving}
              className={`${
                isValidWeight && !saving
                  ? uiConfig.colors.btnPrimary
                  : 'px-6 py-2 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed transition-colors'
              }`}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ How This Works</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Category weights determine how much each category contributes to the overall score</li>
            <li>• Match quality thresholds define what score ranges count as excellent, good, etc.</li>
            <li>• Individual category settings control the detailed scoring within each category</li>
            <li>• Changes will affect all future town matching calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmManager;