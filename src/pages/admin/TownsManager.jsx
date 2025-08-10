// src/pages/admin/TownsManager.jsx - Reorganized with onboarding subcategories
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import SmartFieldEditor from '../../components/SmartFieldEditor';
import QuickNav from '../../components/QuickNav';

// Admin email check
const ADMIN_EMAIL = 'tilman.rumpf@gmail.com';

// Column mappings organized by category and subcategory to match onboarding structure
const COLUMN_CATEGORIES = {
  Region: {
    subcategories: {
      'Countries & Regions': {
        used: ['country', 'region', 'regions', 'geo_region'],
        unused: []
      },
      'Geographic Features': {
        used: ['geographic_features_actual'],
        unused: ['latitude', 'longitude', 'elevation_meters', 'distance_to_ocean_km']
      },
      'Vegetation Types': {
        used: ['vegetation_type_actual'],
        unused: []
      }
    }
  },
  Climate: {
    subcategories: {
      'Summer Climate': {
        used: ['avg_temp_summer', 'summer_climate_actual'],
        unused: ['avg_temp_spring']
      },
      'Winter Climate': {
        used: ['avg_temp_winter', 'winter_climate_actual'],
        unused: ['avg_temp_fall', 'snow_days']
      },
      'Humidity': {
        used: ['humidity_level_actual'],
        unused: []
      },
      'Sunshine': {
        used: ['sunshine_level_actual', 'sunshine_hours'],
        unused: ['uv_index']
      },
      'Precipitation': {
        used: ['precipitation_level_actual', 'annual_rainfall'],
        unused: ['storm_frequency']
      },
      'General Climate': {
        used: ['climate_description', 'climate'],
        unused: []
      }
    }
  },
  Culture: {
    subcategories: {
      'Language': {
        used: ['language', 'languages_spoken', 'english_proficiency'],
        unused: []
      },
      'Expat Community': {
        used: ['expat_rating', 'expat_friendly'],
        unused: []
      },
      'Local Culture': {
        used: [],
        unused: ['cultural_events', 'local_cuisine', 'religious_diversity', 'arts_scene', 'music_scene']
      }
    }
  },
  Hobbies: {
    subcategories: {
      'Outdoor Activities': {
        used: ['outdoor_activities', 'hiking_trails', 'beaches_nearby'],
        unused: []
      },
      'Sports & Recreation': {
        used: ['golf_courses'],
        unused: ['ski_resorts_nearby']
      },
      'Cultural Attractions': {
        used: ['cultural_attractions'],
        unused: []
      }
    }
  },
  Admin: {
    subcategories: {
      'Healthcare': {
        used: ['healthcare_score', 'english_speaking_doctors'],
        unused: ['emergency_response_time']
      },
      'Safety': {
        used: ['safety_score'],
        unused: ['political_stability_score']
      },
      'Infrastructure': {
        used: ['walkability', 'air_quality_index', 'airport_distance'],
        unused: []
      },
      'Legal & Admin': {
        used: ['visa_requirements'],
        unused: ['government_efficiency_score', 'tax_treaty']
      }
    }
  },
  Costs: {
    subcategories: {
      'Living Costs': {
        used: ['cost_of_living_usd', 'typical_monthly_living_cost'],
        unused: []
      },
      'Housing': {
        used: ['rent_1bed'],
        unused: ['rent_2bed', 'home_price_sqm']
      },
      'Daily Expenses': {
        used: [],
        unused: ['utilities_cost', 'groceries_index', 'restaurant_price_index']
      }
    }
  }
};

// Columns not in categories (metadata)
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
    hasPhoto: 'yes',  // Default to "Has Photo"
    completionLevel: 'all',
    worstOffenders: false,
    country: 'all',
    geo_region: 'all',
    townSearch: '',
    sortBy: 'abc', // 'abc', 'completion-high', 'completion-low'
    sortDirection: 'asc' // 'asc', 'desc'
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
    if (filters.completionLevel === '0-20') {
      filtered = filtered.filter(t => t._completion >= 0 && t._completion <= 20);
    } else if (filters.completionLevel === '21-40') {
      filtered = filtered.filter(t => t._completion >= 21 && t._completion <= 40);
    } else if (filters.completionLevel === '41-60') {
      filtered = filtered.filter(t => t._completion >= 41 && t._completion <= 60);
    } else if (filters.completionLevel === '61-80') {
      filtered = filtered.filter(t => t._completion >= 61 && t._completion <= 80);
    } else if (filters.completionLevel === '81-100') {
      filtered = filtered.filter(t => t._completion >= 81 && t._completion <= 100);
    } else if (filters.completionLevel === 'top50') {
      // Sort by completion and take top 50
      filtered = [...filtered].sort((a, b) => b._completion - a._completion).slice(0, 50);
    } else if (filters.completionLevel === 'worst50') {
      // Sort by completion and take worst 50
      filtered = [...filtered].sort((a, b) => a._completion - b._completion).slice(0, 50);
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
    
    // Town name search filter
    if (filters.townSearch) {
      filtered = filtered.filter(t => 
        t.name && t.name.toLowerCase().startsWith(filters.townSearch.toLowerCase())
      );
    }
    
    // Apply sorting
    if (filters.sortBy === 'abc') {
      filtered.sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return filters.sortDirection === 'asc' ? result : -result;
      });
    } else if (filters.sortBy === 'completion-high') {
      filtered.sort((a, b) => b._completion - a._completion);
    } else if (filters.sortBy === 'completion-low') {
      filtered.sort((a, b) => a._completion - b._completion);
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
    const allUsedColumns = [];
    
    // Collect all "used" columns from all categories
    Object.values(COLUMN_CATEGORIES).forEach(category => {
      Object.values(category.subcategories).forEach(subcategory => {
        allUsedColumns.push(...subcategory.used);
      });
    });
    
    // Add metadata columns
    allUsedColumns.push(...OTHER_COLUMNS.used);
    
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
      const suggestions = towns
        .filter(t => t.name && t.name.toLowerCase().startsWith(value.toLowerCase()))
        .map(t => t.name)
        .slice(0, 10);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (townName) => {
    // Reset all filters to defaults to ensure searched town is visible
    setFilters({
      hasPhoto: 'all',  // Reset to 'all' so town is visible regardless of photo status
      completionLevel: 'all',
      worstOffenders: false,
      country: 'all',
      geo_region: 'all',
      townSearch: townName,
      sortBy: 'abc',
      sortDirection: 'asc'
    });
    setShowSuggestions(false);
    setSearchSuggestions([]);
    
    // Find and auto-select the searched town
    const foundTown = towns.find(t => t.name === townName);
    if (foundTown) {
      setSelectedTown(foundTown);
    }
  };
  
  // Get unique values for geo_region column
  const getUniqueGeoRegion = () => {
    const geoRegionValues = [...new Set(towns.map(t => t.geo_region))].filter(Boolean);
    return geoRegionValues.sort();
  };
  

  // Handle inline editing
  const startEdit = (townId, column, value) => {
    setEditingCell({ townId, column });
    const editableValue = typeof value === 'object' && value !== null 
      ? JSON.stringify(value, null, 2)
      : (value || '');
    setEditValue(editableValue);
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    const { townId, column } = editingCell;
    
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
      alert(`Error saving changes: ${error.message || 'Unknown error'}`);
      return;
    }
    
    // Update local state
    const updatedTowns = towns.map(t => {
      if (t.id === townId) {
        const updatedTown = { ...t, [column]: valueToSave };
        updatedTown._errors = detectErrors(updatedTown);
        updatedTown._completion = calculateCompletion(updatedTown);
        return updatedTown;
      }
      return t;
    });
    setTowns(updatedTowns);
    
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

  // Render field row helper
  const renderFieldRow = (column, town) => (
    <div key={column} className="flex items-center py-1">
      <div className="w-64 text-sm font-medium text-gray-600">{column}:</div>
      {editingCell?.townId === town.id && editingCell?.column === column ? (
        <SmartFieldEditor
          fieldName={column}
          currentValue={town[column]}
          onSave={async (newValue) => {
            const { data, error } = await supabase
              .from('towns')
              .update({ [column]: newValue })
              .eq('id', town.id)
              .select();
            
            if (error) {
              console.error('Error updating:', error);
              alert(`Error saving changes: ${error.message || 'Unknown error'}`);
              return;
            }
            
            const updatedTowns = towns.map(t => {
              if (t.id === town.id) {
                const updatedTown = { ...t, [column]: newValue };
                updatedTown._errors = detectErrors(updatedTown);
                updatedTown._completion = calculateCompletion(updatedTown);
                return updatedTown;
              }
              return t;
            });
            setTowns(updatedTowns);
            
            const updatedSelectedTown = updatedTowns.find(t => t.id === town.id);
            setSelectedTown(updatedSelectedTown);
            
            setEditingCell(null);
            setEditValue('');
          }}
          onCancel={cancelEdit}
        />
      ) : (
        <div 
          onClick={() => startEdit(town.id, column, town[column])}
          className="flex-1 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
        >
          <span className={town[column] ? 'text-gray-800' : 'text-gray-400'}>
            {typeof town[column] === 'object' && town[column] !== null
              ? JSON.stringify(town[column])
              : (town[column] || '(empty)')}
          </span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Checking access...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* QuickNav hamburger menu */}
      <QuickNav />
      
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
            <option value="all">Completion</option>
            <option value="top50">Top 50</option>
            <option value="81-100">81-100%</option>
            <option value="61-80">61-80%</option>
            <option value="41-60">41-60%</option>
            <option value="21-40">21-40%</option>
            <option value="0-20">0-20%</option>
            <option value="worst50">Worst 50</option>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Town List */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow max-h-[800px] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b">
                <div className="px-4 py-2">
                  <h2 className="font-semibold">Towns</h2>
                </div>
                {/* Sorting controls - more functional and left-aligned */}
                <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-2">
                  <button
                    onClick={() => setFilters({...filters, 
                      sortBy: 'abc', 
                      sortDirection: filters.sortBy === 'abc' && filters.sortDirection === 'asc' ? 'desc' : 'asc'
                    })}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      filters.sortBy === 'abc' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border hover:bg-gray-100'
                    }`}
                    title="Sort alphabetically"
                  >
                    <span>A-Z</span>
                    {filters.sortBy === 'abc' && (
                      <span className="text-xs">
                        {filters.sortDirection === 'asc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setFilters({...filters, 
                      sortBy: filters.sortBy === 'completion-high' ? 'completion-low' : 'completion-high'
                    })}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                      filters.sortBy.startsWith('completion') 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border hover:bg-gray-100'
                    }`}
                    title="Sort by completion percentage"
                  >
                    <span>%</span>
                    {filters.sortBy.startsWith('completion') && (
                      <span className="text-xs">
                        {filters.sortBy === 'completion-high' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                  
                  <span className="text-xs text-gray-500 ml-2">
                    {filteredTowns.length} towns
                  </span>
                </div>
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
                        {town._completion}% Completion
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

                {/* Category Content with Subcategories */}
                <div className="p-6">
                  {Object.entries(COLUMN_CATEGORIES[activeCategory].subcategories).map(([subcategoryName, subcategory]) => {
                    const hasUsedFields = subcategory.used.length > 0;
                    const hasUnusedFields = subcategory.unused.length > 0;
                    
                    if (!hasUsedFields && !hasUnusedFields) return null;
                    
                    return (
                      <div key={subcategoryName} className="mb-8">
                        {/* Subcategory Title */}
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
                          {subcategoryName}
                        </h3>
                        
                        {/* Used Fields (Towns Data for Matching) */}
                        {hasUsedFields && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Towns Data for Matching</h4>
                            <div className="space-y-1 pl-4">
                              {subcategory.used.map(column => renderFieldRow(column, selectedTown))}
                            </div>
                          </div>
                        )}
                        
                        {/* Unused Fields (Towns Data for Context) */}
                        {hasUnusedFields && (
                          <div className="opacity-60">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Towns Data for Context</h4>
                            <div className="space-y-1 pl-4">
                              {subcategory.unused.map(column => renderFieldRow(column, selectedTown))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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