// src/pages/admin/TownsManager-backup.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import SmartFieldEditor from '../../components/SmartFieldEditor';

// Admin email check
const ADMIN_EMAIL = 'tilman.rumpf@gmail.com';

// Column mappings by category
const COLUMN_CATEGORIES = {
  Region: {
    used: ['country', 'region', 'regions', 'geo_region', 'geographic_features_actual', 'vegetation_type_actual'],
    unused: ['latitude', 'longitude', 'elevation_meters', 'distance_to_ocean_km']
  },
  Climate: {
    used: ['avg_temp_summer', 'avg_temp_winter', 'summer_climate_actual', 'winter_climate_actual', 
            'humidity_level_actual', 'sunshine_level_actual', 'sunshine_hours', 'precipitation_level_actual', 
            'annual_rainfall', 'climate_description', 'climate'],
    unused: ['avg_temp_spring', 'avg_temp_fall', 'snow_days', 'storm_frequency', 'uv_index']
  },
  Culture: {
    used: ['language', 'languages_spoken', 'english_proficiency', 'expat_rating'],
    unused: ['cultural_events', 'local_cuisine', 'religious_diversity', 'arts_scene', 'music_scene']
  },
  Hobbies: {
    used: [],
    unused: ['golf_courses', 'hiking_trails', 'beaches_nearby', 'ski_resorts_nearby', 'cultural_attractions']
  },
  Admin: {
    used: ['healthcare_score', 'safety_score', 'walkability', 'air_quality_index', 
           'english_speaking_doctors', 'airport_distance'],
    unused: ['visa_requirements', 'political_stability_score', 'government_efficiency_score', 
             'tax_treaty', 'emergency_response_time']
  },
  Costs: {
    used: ['cost_of_living_usd', 'typical_monthly_living_cost', 'rent_1bed'],
    unused: ['rent_2bed', 'home_price_sqm', 'utilities_cost', 'groceries_index', 'restaurant_price_index']
  }
};

// Columns not in categories
const OTHER_COLUMNS = {
  used: ['id', 'name', 'image_url_1', 'description', 'appealStatement', 'matchScore'],
  unused: ['created_at', 'updated_at', 'last_ai_update', 'data_source']
};

const TownsManager = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [towns, setTowns] = useState([]);
  const [filteredTowns, setFilteredTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Region');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    hasPhoto: 'all',
    completionLevel: 'all',
    worstOffenders: false,
    country: 'all',
    geo_region: 'all',
    regions: 'all',
    townSearch: ''
  });
  
  // Search suggestions state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      // TODO: Replace with actual auth check
      const currentUserEmail = 'Tilman.Rumpf@gmail.com';
      console.log('Auth check - current email:', currentUserEmail);
      console.log('Auth check - admin email:', ADMIN_EMAIL);
      if (currentUserEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        console.log('Auth failed, redirecting to home');
        navigate('/');
        return;
      }
      console.log('Auth passed');
      setIsLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Load towns data
  useEffect(() => {
    const loadTowns = async () => {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading towns:', error);
        return;
      }
      
      // Calculate completion and detect errors for each town
      const townsWithMetrics = data.map(town => {
        const errors = detectErrors(town);
        const completion = calculateCompletion(town);
        return { ...town, _errors: errors, _completion: completion };
      });
      
      setTowns(townsWithMetrics);
      // Don't set filtered towns here - let the filter effect handle it
    };
    
    if (!isLoading) {
      loadTowns();
    }
  }, [isLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...towns];
    
    // Photo filter
    if (filters.hasPhoto === 'yes') {
      filtered = filtered.filter(t => t.image_url_1 && t.image_url_1 !== 'NULL');
    } else if (filters.hasPhoto === 'no') {
      filtered = filtered.filter(t => !t.image_url_1 || t.image_url_1 === 'NULL');
    }
    
    // Completion filter
    if (filters.completionLevel === 'low') {
      filtered = filtered.filter(t => t._completion < 30);
    } else if (filters.completionLevel === 'medium') {
      filtered = filtered.filter(t => t._completion >= 30 && t._completion < 70);
    } else if (filters.completionLevel === 'high') {
      filtered = filtered.filter(t => t._completion >= 70);
    }
    
    // Worst offenders filter
    if (filters.worstOffenders) {
      filtered = filtered.filter(t => t._errors.length > 0);
      filtered.sort((a, b) => b._errors.length - a._errors.length);
    }
    
    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(t => t.country === filters.country);
    }
    
    // Geo_region filter
    if (filters.geo_region !== 'all') {
      filtered = filtered.filter(t => t.geo_region === filters.geo_region);
    }
    
    // Regions filter (plural - the regions array column)
    if (filters.regions !== 'all') {
      filtered = filtered.filter(t => 
        t.regions && Array.isArray(t.regions) && t.regions.includes(filters.regions)
      );
    }
    
    // Town name search filter
    if (filters.townSearch) {
      filtered = filtered.filter(t => 
        t.name && t.name.toLowerCase().startsWith(filters.townSearch.toLowerCase())
      );
    }
    
    setFilteredTowns(filtered);
  }, [filters, towns]);

  // Error detection
  const detectErrors = (town) => {
    const errors = [];
    
    // Check for wrong country/city combinations
    const cityCountryErrors = {
      'Kathmandu': 'Nepal',
      'Bangkok': 'Thailand',
      'Kyoto': 'Japan',
      // Add more known city-country pairs
    };
    
    if (cityCountryErrors[town.name] && town.country !== cityCountryErrors[town.name]) {
      errors.push(`${town.name} should be in ${cityCountryErrors[town.name]}, not ${town.country}`);
    }
    
    // Check for impossible temperatures
    if (town.avg_temp_summer && (town.avg_temp_summer < -50 || town.avg_temp_summer > 60)) {
      errors.push(`Summer temperature ${town.avg_temp_summer}°C is impossible`);
    }
    if (town.avg_temp_winter && (town.avg_temp_winter < -60 || town.avg_temp_winter > 50)) {
      errors.push(`Winter temperature ${town.avg_temp_winter}°C is impossible`);
    }
    
    // Check if winter is warmer than summer
    if (town.avg_temp_summer && town.avg_temp_winter && town.avg_temp_winter > town.avg_temp_summer) {
      errors.push(`Winter (${town.avg_temp_winter}°C) warmer than summer (${town.avg_temp_summer}°C)`);
    }
    
    // Check for invalid scores
    const scoreFields = ['healthcare_score', 'safety_score', 'walkability'];
    scoreFields.forEach(field => {
      if (town[field] && (town[field] < 0 || town[field] > 10)) {
        errors.push(`${field} value ${town[field]} is out of range (0-10)`);
      }
    });
    
    return errors;
  };

  // Calculate completion percentage
  const calculateCompletion = (town) => {
    const allUsedColumns = [
      ...COLUMN_CATEGORIES.Region.used,
      ...COLUMN_CATEGORIES.Climate.used,
      ...COLUMN_CATEGORIES.Culture.used,
      ...COLUMN_CATEGORIES.Hobbies.used,
      ...COLUMN_CATEGORIES.Admin.used,
      ...COLUMN_CATEGORIES.Costs.used,
      ...OTHER_COLUMNS.used
    ];
    
    const filledColumns = allUsedColumns.filter(col => 
      town[col] !== null && 
      town[col] !== undefined && 
      town[col] !== '' && 
      town[col] !== 'NULL'
    ).length;
    
    return Math.round((filledColumns / allUsedColumns.length) * 100);
  };

  // Get unique countries for filter
  const getUniqueCountries = () => {
    const countries = [...new Set(towns.map(t => t.country))].filter(Boolean);
    return countries.sort();
  };
  
  // Handle town search input
  const handleTownSearch = (value) => {
    setFilters({...filters, townSearch: value});
    
    if (value.length > 0) {
      // Generate suggestions
      const suggestions = towns
        .filter(t => t.name && t.name.toLowerCase().startsWith(value.toLowerCase()))
        .map(t => t.name)
        .slice(0, 10); // Limit to 10 suggestions
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (townName) => {
    setFilters({...filters, townSearch: townName});
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };
  
  // Get unique values for geo_region column
  const getUniqueGeoRegion = () => {
    const geoRegionValues = [...new Set(towns.map(t => t.geo_region))].filter(Boolean);
    return geoRegionValues.sort();
  };
  
  // Get unique values for regions column (plural array)
  const getUniqueRegions = () => {
    const regionsSet = new Set();
    towns.forEach(t => {
      if (t.regions && Array.isArray(t.regions)) {
        t.regions.forEach(r => regionsSet.add(r));
      }
    });
    return [...regionsSet].filter(Boolean).sort();
  };

  // Handle inline editing
  const startEdit = (townId, column, value) => {
    setEditingCell({ townId, column });
    // Convert objects to JSON string for editing
    const editableValue = typeof value === 'object' && value !== null 
      ? JSON.stringify(value, null, 2)
      : (value || '');
    setEditValue(editableValue);
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    const { townId, column } = editingCell;
    
    // Parse JSON strings back to objects for object columns
    let valueToSave = editValue;
    if (editValue && typeof editValue === 'string' && editValue.startsWith('{')) {
      try {
        valueToSave = JSON.parse(editValue);
      } catch (e) {
        // Not valid JSON, save as string
      }
    }
    
    const { data, error } = await supabase
      .from('towns')
      .update({ [column]: valueToSave })
      .eq('id', townId)
      .select();
    
    if (error) {
      console.error('Error updating:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      alert(`Error saving changes: ${error.message || 'Unknown error'}`);
      return;
    }
    
    // Update local state
    const updatedTowns = towns.map(t => {
      if (t.id === townId) {
        const updatedTown = { ...t, [column]: valueToSave };
        // Recalculate errors and completion for the updated town
        updatedTown._errors = detectErrors(updatedTown);
        updatedTown._completion = calculateCompletion(updatedTown);
        return updatedTown;
      }
      return t;
    });
    setTowns(updatedTowns);
    
    // Also update selectedTown if it's the one being edited
    if (selectedTown && selectedTown.id === townId) {
      const updatedSelectedTown = updatedTowns.find(t => t.id === townId);
      setSelectedTown(updatedSelectedTown);
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Checking access...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Towns Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {towns.length} towns | Showing: {filteredTowns.length}
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-4 flex-wrap items-center">
          {/* Town Search */}
          <div className="relative">
            <input
              type="text"
              value={filters.townSearch}
              onChange={(e) => handleTownSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search town..."
              className="border rounded px-3 py-1 w-48"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <select 
            value={filters.hasPhoto} 
            onChange={(e) => setFilters({...filters, hasPhoto: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Photos</option>
            <option value="yes">Has Photo</option>
            <option value="no">No Photo</option>
          </select>
          
          <select 
            value={filters.completionLevel} 
            onChange={(e) => setFilters({...filters, completionLevel: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Completion</option>
            <option value="low">Low (&lt;30%)</option>
            <option value="medium">Medium (30-70%)</option>
            <option value="high">High (&gt;70%)</option>
          </select>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={filters.worstOffenders}
              onChange={(e) => setFilters({...filters, worstOffenders: e.target.checked})}
            />
            Worst Offenders
          </label>
          
          <select 
            value={filters.country} 
            onChange={(e) => setFilters({...filters, country: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Countries</option>
            {getUniqueCountries().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          
          <select 
            value={filters.geo_region} 
            onChange={(e) => setFilters({...filters, geo_region: e.target.value})}
            className="border rounded px-3 py-1"
            title="Filter by geo_region column"
          >
            <option value="all">Geo Region (All)</option>
            {getUniqueGeoRegion().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          
          <select 
            value={filters.regions} 
            onChange={(e) => setFilters({...filters, regions: e.target.value})}
            className="border rounded px-3 py-1"
            title="Filter by regions array (geographic areas)"
          >
            <option value="all">Regions (Geographic)</option>
            {getUniqueRegions().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Town List */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow max-h-[800px] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-4 py-2">
                <h2 className="font-semibold">Towns</h2>
              </div>
              <div className="divide-y">
                {filteredTowns.map((town) => (
                  <div 
                    key={town.id}
                    onClick={() => setSelectedTown(town)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      selectedTown?.id === town.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{town.name}</div>
                    <div className="text-sm text-gray-600">{town.country}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        town._completion < 30 ? 'bg-red-100 text-red-700' :
                        town._completion < 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {town._completion}%
                      </span>
                      {town._errors.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                          {town._errors.length} errors
                        </span>
                      )}
                      {!town.image_url_1 && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          No photo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Town Details */}
          <div className="col-span-9">
            {selectedTown ? (
              <div className="bg-white rounded-lg shadow">
                {/* Town Header */}
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-bold">{selectedTown.name}, {selectedTown.country}</h2>
                  {selectedTown._errors.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
                      <h3 className="font-semibold text-red-800 mb-1">Detected Errors:</h3>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {selectedTown._errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="border-b">
                  <div className="flex">
                    {Object.keys(COLUMN_CATEGORIES).map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-3 font-medium transition-colors ${
                          activeCategory === category
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  {/* Used Columns */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-800 mb-3">Towns Data for Matching</h3>
                    <div className="space-y-2">
                      {COLUMN_CATEGORIES[activeCategory].used.map((column) => (
                        <div key={column} className="flex items-center">
                          <div className="w-64 text-sm font-medium text-gray-600">{column}:</div>
                          {editingCell?.townId === selectedTown.id && editingCell?.column === column ? (
                            <SmartFieldEditor
                              fieldName={column}
                              currentValue={selectedTown[column]}
                              onSave={async (newValue) => {
                                const { data, error } = await supabase
                                  .from('towns')
                                  .update({ [column]: newValue })
                                  .eq('id', selectedTown.id)
                                  .select();
                                
                                if (error) {
                                  console.error('Error updating:', error);
                                  alert(`Error saving changes: ${error.message || 'Unknown error'}`);
                                  return;
                                }
                                
                                // Update local state
                                const updatedTowns = towns.map(t => {
                                  if (t.id === selectedTown.id) {
                                    const updatedTown = { ...t, [column]: newValue };
                                    updatedTown._errors = detectErrors(updatedTown);
                                    updatedTown._completion = calculateCompletion(updatedTown);
                                    return updatedTown;
                                  }
                                  return t;
                                });
                                setTowns(updatedTowns);
                                
                                const updatedSelectedTown = updatedTowns.find(t => t.id === selectedTown.id);
                                setSelectedTown(updatedSelectedTown);
                                
                                setEditingCell(null);
                                setEditValue('');
                              }}
                              onCancel={cancelEdit}
                            />
                          ) : (
                            <div 
                              onClick={() => startEdit(selectedTown.id, column, selectedTown[column])}
                              className="flex-1 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                            >
                              <span className={selectedTown[column] ? 'text-gray-800' : 'text-gray-400'}>
                                {typeof selectedTown[column] === 'object' && selectedTown[column] !== null
                                  ? JSON.stringify(selectedTown[column])
                                  : (selectedTown[column] || '(empty)')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unused Columns */}
                  {COLUMN_CATEGORIES[activeCategory].unused.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Towns Data for Context</h3>
                      <div className="space-y-2 opacity-60">
                        {COLUMN_CATEGORIES[activeCategory].unused.map((column) => (
                          <div key={column} className="flex items-center">
                            <div className="w-64 text-sm font-medium text-gray-600">{column}:</div>
                            {editingCell?.townId === selectedTown.id && editingCell?.column === column ? (
                              <SmartFieldEditor
                                fieldName={column}
                                currentValue={selectedTown[column]}
                                onSave={async (newValue) => {
                                  const { data, error } = await supabase
                                    .from('towns')
                                    .update({ [column]: newValue })
                                    .eq('id', selectedTown.id)
                                    .select();
                                  
                                  if (error) {
                                    console.error('Error updating:', error);
                                    alert(`Error saving changes: ${error.message || 'Unknown error'}`);
                                    return;
                                  }
                                  
                                  // Update local state
                                  const updatedTowns = towns.map(t => {
                                    if (t.id === selectedTown.id) {
                                      const updatedTown = { ...t, [column]: newValue };
                                      updatedTown._errors = detectErrors(updatedTown);
                                      updatedTown._completion = calculateCompletion(updatedTown);
                                      return updatedTown;
                                    }
                                    return t;
                                  });
                                  setTowns(updatedTowns);
                                  
                                  const updatedSelectedTown = updatedTowns.find(t => t.id === selectedTown.id);
                                  setSelectedTown(updatedSelectedTown);
                                  
                                  setEditingCell(null);
                                  setEditValue('');
                                }}
                                onCancel={cancelEdit}
                              />
                            ) : (
                              <div 
                                onClick={() => startEdit(selectedTown.id, column, selectedTown[column])}
                                className="flex-1 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                              >
                                <span className={selectedTown[column] ? 'text-gray-800' : 'text-gray-400'}>
                                  {typeof selectedTown[column] === 'object' && selectedTown[column] !== null
                                    ? JSON.stringify(selectedTown[column])
                                    : (selectedTown[column] || '(empty)')}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                Select a town to view and edit its data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownsManager;