// src/pages/admin/TownsManager.jsx - Reorganized with onboarding subcategories
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import SmartFieldEditor from '../../components/SmartFieldEditor';
import QuickNav from '../../components/QuickNav';
import FieldDefinitionEditor from '../../components/FieldDefinitionEditor';
import GoogleSearchPanel from '../../components/GoogleSearchPanel';
import HobbiesDisplay from '../../components/admin/HobbiesDisplay';
import { getFieldOptions, isMultiSelectField } from '../../utils/townDataOptions';
import { useFieldDefinitions } from '../../hooks/useFieldDefinitions';

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
        unused: ['latitude', 'longitude', 'elevation_meters', 'distance_to_ocean_km', 'water_bodies']
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
      'Enhanced Hobbies Data': {
        used: [],  // We'll render a custom component instead
        unused: [],
        customComponent: true  // Flag to use custom component
      },
      'Legacy Data (for reference)': {
        used: [],
        unused: ['outdoor_activities', 'hiking_trails', 'beaches_nearby', 'golf_courses', 'ski_resorts_nearby', 'cultural_attractions']
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
  
  // Audit state - tracks which fields have been audited
  const [auditedFields, setAuditedFields] = useState({});
  const [showAuditDialog, setShowAuditDialog] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    hasPhoto: 'yes',  // Default to "Has Photo"
    completionLevel: 'all',
    dataQuality: 'all',  // New data quality filter
    country: 'all',
    geo_region: 'all',
    townSearch: '',
    sortBy: 'abc', // 'abc', 'completion-high', 'completion-low'
    sortDirection: 'asc' // 'asc', 'desc'
  });
  
  // Search suggestions state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Smart verification popup state
  const [verificationPopup, setVerificationPopup] = useState({
    isOpen: false,
    town: null,
    fieldName: null
  });
  
  // Field definition editor state
  const [fieldDefEditor, setFieldDefEditor] = useState({
    isOpen: false,
    fieldName: ''
  });
  
  // Google search panel state
  const [googleSearchPanel, setGoogleSearchPanel] = useState({ 
    isOpen: false, 
    searchQuery: '', 
    fieldName: null 
  });
  
  // Get field definitions for audit questions
  const { getAuditQuestion, getSearchQuery, getFieldDefinition } = useFieldDefinitions();

  // Auth check - FIXED to use actual Supabase authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Auth error:', error);
        alert('Authentication error. Please log in again.');
        navigate('/welcome');
        return;
      }
      
      if (!user) {
        console.error('❌ No user logged in');
        alert('You must be logged in to access the admin panel.');
        navigate('/welcome');
        return;
      }
      
      console.log('✅ User authenticated:', user.email);
      console.log('User metadata:', user.user_metadata);
      
      // Check if user is admin
      if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        console.error('❌ Not authorized - user is not admin');
        alert('You are not authorized to access the admin panel.');
        navigate('/');
        return;
      }
      
      // Try to get avatar from different sources
      let avatarUrl = null;
      
      // Check user_metadata first
      if (user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
      } 
      // Check if there's a picture field
      else if (user.user_metadata?.picture) {
        avatarUrl = user.user_metadata.picture;
      }
      // Check raw_user_meta_data
      else if (user.raw_user_meta_data?.avatar_url) {
        avatarUrl = user.raw_user_meta_data.avatar_url;
      }
      
      // Also check the users table for profile data
      if (!avatarUrl) {
        const { data: profile } = await supabase
          .from('users')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.avatar_url) {
          avatarUrl = profile.avatar_url;
          // Update user object with profile data
          user.user_metadata = {
            ...user.user_metadata,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name || user.user_metadata?.full_name
          };
        }
      }
      
      console.log('✅ Admin access granted');
      console.log('Avatar URL:', avatarUrl);
      setCurrentUser(user); // Store the current user with updated metadata
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
      
      // Load audit data from towns
      const auditFields = {};
      data.forEach(town => {
        if (town.audit_data && Object.keys(town.audit_data).length > 0) {
          Object.entries(town.audit_data).forEach(([fieldName, auditInfo]) => {
            const key = `${town.id}-${fieldName}`;
            auditFields[key] = auditInfo;
          });
        }
      });
      setAuditedFields(auditFields);
    };
    
    // Load towns when we have a current user
    if (currentUser) {
      loadTowns();
    }
  }, [currentUser]);

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
    
    // Data quality filter
    if (filters.dataQuality === 'has_errors') {
      filtered = filtered.filter(t => t._errors.length > 0);
      filtered.sort((a, b) => b._errors.length - a._errors.length);
    } else if (filters.dataQuality === 'missing_photos') {
      filtered = filtered.filter(t => !t.image_url_1 || t.image_url_1 === 'NULL');
    } else if (filters.dataQuality === 'low_completion') {
      filtered = filtered.filter(t => t._completion < 50);
    } else if (filters.dataQuality === 'needs_review') {
      // Towns not updated in 6+ months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(t => {
        const lastUpdate = t.updated_at ? new Date(t.updated_at) : new Date(t.created_at);
        return lastUpdate < sixMonthsAgo;
      });
    } else if (filters.dataQuality === 'missing_match_data') {
      // Towns missing critical match fields
      const criticalFields = getCriticalMatchFields();
      filtered = filtered.filter(t => {
        const missingCount = criticalFields.filter(field => 
          !t[field] || t[field] === '' || t[field] === 'NULL' || t[field] === null
        ).length;
        return missingCount > (criticalFields.length * 0.3);
      });
    }
    
    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(t => t.country === filters.country);
    }
    
    // Geo_region filter (handles arrays)
    if (filters.geo_region !== 'all') {
      filtered = filtered.filter(t => {
        if (!t.geo_region) return false;
        
        // Handle array values
        if (Array.isArray(t.geo_region)) {
          return t.geo_region.includes(filters.geo_region);
        }
        // Handle PostgreSQL array strings
        else if (typeof t.geo_region === 'string' && t.geo_region.startsWith('{')) {
          const parsed = t.geo_region.slice(1, -1).split(',').map(r => r.replace(/"/g, '').trim());
          return parsed.includes(filters.geo_region);
        }
        // Handle single string values (legacy)
        else {
          return t.geo_region === filters.geo_region;
        }
      });
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
      dataQuality: 'all',
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
  
  // Get unique values for geo_region column (handles both arrays and single values)
  const getUniqueGeoRegion = () => {
    const allRegions = new Set();
    
    towns.forEach(town => {
      if (town.geo_region) {
        // Handle array values
        if (Array.isArray(town.geo_region)) {
          town.geo_region.forEach(region => allRegions.add(region));
        } 
        // Handle PostgreSQL array strings like {"Mediterranean","Southern Europe"}
        else if (typeof town.geo_region === 'string' && town.geo_region.startsWith('{')) {
          const parsed = town.geo_region.slice(1, -1).split(',').map(r => r.replace(/"/g, '').trim());
          parsed.forEach(region => allRegions.add(region));
        }
        // Handle single string values (legacy data)
        else if (typeof town.geo_region === 'string') {
          allRegions.add(town.geo_region);
        }
      }
    });
    
    return Array.from(allRegions).sort();
  };
  
  // Get all critical match fields
  const getCriticalMatchFields = () => {
    const criticalFields = [];
    
    // Collect all "used" columns from all categories
    Object.values(COLUMN_CATEGORIES).forEach(category => {
      Object.values(category.subcategories).forEach(subcategory => {
        criticalFields.push(...subcategory.used);
      });
    });
    
    // Add metadata columns
    criticalFields.push(...OTHER_COLUMNS.used);
    
    return criticalFields;
  };
  
  // Helper to check if a field has actual data (not empty)
  const fieldHasData = (value) => {
    if (!value || value === 'NULL' || value === null) return false;
    
    // Check for array fields (could be actual array or string representation)
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    // Check for PostgreSQL array strings like ["value1","value2"] or {}
    if (typeof value === 'string') {
      // Empty PostgreSQL arrays
      if (value === '{}' || value === '[]') return false;
      // Check if it looks like a non-empty array string
      if (value.startsWith('[') && value.endsWith(']')) {
        return value.length > 2; // More than just "[]"
      }
      if (value.startsWith('{') && value.endsWith('}')) {
        return value.length > 2; // More than just "{}"
      }
    }
    
    // For regular values, check if not empty
    return value !== '';
  };
  
  // Handle audit approval
  const handleAudit = (townId, fieldName) => {
    setShowAuditDialog({ townId, fieldName });
  };
  
  const confirmAudit = async () => {
    if (showAuditDialog) {
      // Refresh user data to get latest avatar
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try to get latest avatar from users table
      let avatarUrl = user?.user_metadata?.avatar_url;
      let fullName = user?.user_metadata?.full_name;
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          avatarUrl = profile.avatar_url || avatarUrl;
          fullName = profile.full_name || fullName;
        }
      }
      
      const { townId, fieldName } = showAuditDialog;
      const key = `${townId}-${fieldName}`;
      
      // Create audit data object
      const auditData = {
        approved: true,
        approvedBy: user?.email || currentUser?.email,
        approvedByName: fullName || user?.email?.split('@')[0] || 'Admin',
        approvedByAvatar: avatarUrl,
        approvedAt: new Date().toISOString()
      };
      
      // Get existing town data to preserve audit_data
      const { data: townData, error: fetchError } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', townId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching town data:', fetchError);
        alert('Error fetching town data. Please try again.');
        return;
      }
      
      // Merge with existing audit data
      const existingAuditData = townData?.audit_data || {};
      const updatedAuditData = {
        ...existingAuditData,
        [fieldName]: auditData
      };
      
      // Save to Supabase
      const { data: updateResult, error: updateError } = await supabase
        .from('towns')
        .update({ audit_data: updatedAuditData })
        .eq('id', townId)
        .select();
      
      if (updateError) {
        console.error('Error saving audit data:', updateError);
        alert(`Error saving audit approval: ${updateError.message}\n\nThis might be an RLS issue.`);
        return;
      }
      
      // Verify the update actually worked
      const { data: verifyData, error: verifyError } = await supabase
        .from('towns')
        .select('audit_data')
        .eq('id', townId)
        .single();
      
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      }
      
      // Update local state only after successful save
      setAuditedFields(prev => ({
        ...prev,
        [key]: auditData
      }));
      setShowAuditDialog(null);
    }
  };
  
  const isFieldAudited = (townId, fieldName) => {
    const key = `${townId}-${fieldName}`;
    return auditedFields[key]?.approved;
  };
  
  // Format field name to human readable text
  const formatFieldName = (fieldName) => {
    const fieldMappings = {
      'distance_to_ocean_km': 'distance to ocean',
      'avg_temp_summer': 'average summer temperature',
      'avg_temp_winter': 'average winter temperature',
      'sunshine_hours': 'annual sunshine hours',
      'annual_rainfall': 'annual rainfall',
      'humidity_level_actual': 'humidity level',
      'summer_climate_actual': 'summer climate',
      'winter_climate_actual': 'winter climate',
      'precipitation_level_actual': 'precipitation level',
      'sunshine_level_actual': 'sunshine level',
      'vegetation_type_actual': 'vegetation type',
      'geographic_features_actual': 'geographic features',
      'healthcare_score': 'healthcare quality score',
      'safety_score': 'safety score',
      'walkability': 'walkability score',
      'air_quality_index': 'air quality index',
      'airport_distance': 'distance to nearest airport',
      'cost_of_living_usd': 'cost of living in USD',
      'typical_monthly_living_cost': 'typical monthly living cost',
      'rent_1bed': 'one bedroom apartment rent',
      'english_proficiency': 'English proficiency level',
      'expat_rating': 'expat community rating',
      'expat_friendly': 'expat friendliness',
      'outdoor_activities': 'outdoor activities',
      'hiking_trails': 'hiking trails',
      'beaches_nearby': 'beaches nearby',
      'golf_courses': 'golf courses',
      'cultural_attractions': 'cultural attractions',
      'english_speaking_doctors': 'English speaking doctors',
      'visa_requirements': 'visa requirements',
      'geo_region': 'geographic region',
      'elevation_meters': 'elevation',
      'latitude': 'latitude coordinates',
      'longitude': 'longitude coordinates',
      'water_bodies': 'nearest body of water',
      'population': 'population',
      'climate_description': 'climate description',
      'appealStatement': 'appeal statement',
      'matchScore': 'match score'
    };
    
    return fieldMappings[fieldName] || fieldName.replace(/_/g, ' ').toLowerCase();
  };
  
  // Generate smart Google search query
  const generateSearchQuery = (town, fieldName, isVerification = false) => {
    const formattedField = formatFieldName(fieldName);
    // CRITICAL: Don't use stored country when searching for country field itself!
    const location = fieldName === 'country' 
      ? town.name  // Just town name for country searches
      : `${town.name}, ${town.country}`;  // Include country for other fields
    
    // Check if this field has dropdown options
    const fieldOptions = getFieldOptions(fieldName);
    const isMultiSelect = isMultiSelectField(fieldName);
    const hasOptions = fieldOptions && Array.isArray(fieldOptions) && fieldOptions.length > 0;
    
    // If this is a verification query, create a different format
    if (isVerification) {
      const currentValue = town[fieldName];
      // For country field verification, don't include the stored country in the search!
      const verifyLocation = fieldName === 'country' ? town.name : location;
      
      // Handle fields with dropdown options
      if (hasOptions && fieldHasData(currentValue)) {
        if (isMultiSelect || Array.isArray(currentValue)) {
          const values = Array.isArray(currentValue) ? currentValue.join(', ') : currentValue;
          // Special case for country field
          if (fieldName === 'country') {
            return `Is ${town.name} really in ${currentValue}? Which country is ${town.name} located in?`;
          }
          return `Is ${verifyLocation} ${formattedField} really "${values}"? Are there other options that apply?`;
        } else {
          // Special case for country field
          if (fieldName === 'country') {
            return `Is ${town.name} really in ${currentValue}? Which country is ${town.name} located in?`;
          }
          return `Is ${verifyLocation} ${formattedField} really "${currentValue}"? Check if this is the best match`;
        }
      }
      
      // Handle different field types for verification
      if (fieldName === 'water_bodies' && Array.isArray(currentValue)) {
        const bodies = currentValue.join(', ');
        return `Are the ${verifyLocation} water bodies really ${bodies}? Am I missing something critical?`;
      } else if (fieldName.includes('distance')) {
        return `Is ${verifyLocation} really ${currentValue}km ${formattedField}? Verify distance`;
      } else if (fieldName.includes('temp')) {
        return `Is ${verifyLocation} ${formattedField} really ${currentValue}°C? Climate verification`;
      } else if (fieldName.includes('cost') || fieldName.includes('rent')) {
        return `Is ${verifyLocation} ${formattedField} really $${currentValue}? ${new Date().getFullYear()} prices accurate?`;
      } else if (typeof currentValue === 'boolean') {
        return `Is it true that ${verifyLocation} ${formattedField} is ${currentValue ? 'yes' : 'no'}? Verify`;
      } else {
        // Generic verification format
        return `Verify: ${verifyLocation} ${formattedField} is "${currentValue}" - is this accurate and complete?`;
      }
    }
    
    // Regular search query (for empty fields)
    
    // For fields with dropdown options, ask which options match best
    if (hasOptions) {
      if (isMultiSelect) {
        // For multiselect, ask which options apply
        const sampleOptions = fieldOptions.slice(0, 5).join(', ');
        // Don't include country in search when searching for the country field itself!
        const searchLocation = fieldName === 'country' ? town.name : location;
        return `What ${formattedField} best describe ${searchLocation}? Options include: ${sampleOptions}... Which apply?`;
      } else {
        // For single select, ask for the best match
        const sampleOptions = fieldOptions.slice(0, 5).join(', ');
        // Don't include country in search when searching for the country field itself!
        const searchLocation = fieldName === 'country' ? town.name : location;
        return `What is the best ${formattedField} for ${searchLocation}? Options: ${sampleOptions}...`;
      }
    }
    
    // Special handling for certain field types
    if (fieldName.includes('visa')) {
      return `${town.country} retirement visa requirements for US citizens`;
    } else if (fieldName.includes('cost') || fieldName.includes('rent')) {
      return `${location} ${formattedField} ${new Date().getFullYear()}`;
    } else if (fieldName.includes('english_speaking')) {
      return `${location} English speaking doctors hospitals`;
    } else if (fieldName.includes('expat')) {
      return `${location} expat community retirees`;
    } else if (fieldName.includes('climate') || fieldName.includes('temp')) {
      return `${location} ${formattedField} weather`;
    } else if (fieldName.includes('activities') || fieldName.includes('attractions')) {
      return `${location} ${formattedField} things to do`;
    }
    
    // Default format
    return `${location} ${formattedField}`;
  };
  
  // Calculate data quality counts
  const getDataQualityCounts = () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const criticalFields = getCriticalMatchFields();
    
    return {
      has_errors: towns.filter(t => t._errors && t._errors.length > 0).length,
      missing_photos: towns.filter(t => !t.image_url_1 || t.image_url_1 === 'NULL').length,
      low_completion: towns.filter(t => t._completion < 50).length,
      needs_review: towns.filter(t => {
        const lastUpdate = t.updated_at ? new Date(t.updated_at) : new Date(t.created_at);
        return lastUpdate < sixMonthsAgo;
      }).length,
      missing_match_data: towns.filter(t => {
        // Count missing critical fields
        const missingCount = criticalFields.filter(field => 
          !t[field] || t[field] === '' || t[field] === 'NULL' || t[field] === null
        ).length;
        // Flag if missing more than 30% of critical fields
        return missingCount > (criticalFields.length * 0.3);
      }).length
    };
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
  const renderFieldRow = (column, town) => {
    const auditQuestion = getAuditQuestion(column, town);
    const fieldSearchQuery = getSearchQuery(column, town);
    
    return (
    <div key={column} className="flex items-center py-1 group">
      <div className="w-64 text-sm font-medium text-gray-600 flex items-center gap-1">
        {column}:
        <button
          onClick={() => {
            // Open the field definition editor to edit the TEMPLATE
            setFieldDefEditor({
              isOpen: true,
              fieldName: column
            });
          }}
          className="text-blue-500 text-sm font-bold cursor-pointer hover:text-blue-700 ml-1"
          title="Edit field definition template (affects ALL towns)"
        >
          ⓘ
        </button>
      </div>
      {editingCell?.townId === town.id && editingCell?.column === column ? (
        <SmartFieldEditor
          fieldName={column}
          currentValue={town[column]}
          townData={town}
          onSave={async (newValue) => {
            console.log(`Updating ${column} for town ${town.id} to:`, newValue);
            
            const { data, error } = await supabase
              .from('towns')
              .update({ [column]: newValue })
              .eq('id', town.id)
              .select();
            
            if (error) {
              console.error('❌ Supabase update error:', error);
              alert(`Error saving changes: ${error.message || 'Unknown error'}\n\nThis is likely a permission issue. Check:\n1. Are you logged in as admin?\n2. Does the towns table have Row Level Security policies?\n3. Check browser console for details.`);
              return;
            }
            
            if (!data || data.length === 0) {
              console.error('❌ No data returned from update - possible RLS issue');
              alert('Update may have failed - no data returned. Check Row Level Security policies.');
              return;
            }
            
            console.log('✅ Successfully updated in Supabase:', data);
            
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
        <>
          <div 
            onClick={() => startEdit(town.id, column, town[column])}
            className="flex-1 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
          >
            <span className={town[column] ? 'text-gray-800' : 'text-gray-400'}>
              {(column === 'water_bodies' || column === 'geo_region' || column === 'regions') && Array.isArray(town[column])
                ? town[column].length > 0 
                  ? town[column].join(', ')
                  : '(empty)'
                : (column === 'geo_region' || column === 'regions') && typeof town[column] === 'string' && town[column].startsWith('{')
                ? town[column].slice(1, -1).replace(/"/g, '').replace(/,/g, ', ')
                : typeof town[column] === 'object' && town[column] !== null
                ? JSON.stringify(town[column])
                : (town[column] || '(empty)')}
            </span>
          </div>
          {/* Google Search Button - Vibrant for missing data, subtle for existing data */}
          <button
            onClick={() => {
              // Open Google search in side panel
              const searchQuery = getSearchQuery(column, town);
              setGoogleSearchPanel({ 
                isOpen: true, 
                searchQuery: searchQuery,
                fieldName: formatFieldName(column)
              });
            }}
            className={`ml-2 p-1.5 rounded hover:bg-gray-100 transition-all ${
              !fieldHasData(town[column])
                ? 'opacity-100 hover:scale-110' 
                : 'opacity-30 group-hover:opacity-60 hover:opacity-100'
            }`}
            title={`Search Google for ${formatFieldName(column)}`}
          >
            {/* Google Logo SVG - Always vibrant colors */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          
          {/* Verification Button - Only shows when field has data */}
          {fieldHasData(town[column]) && (
            <button
              onClick={() => {
                // Open smart verification popup
                setVerificationPopup({ 
                  isOpen: true, 
                  town: town,
                  fieldName: column
                });
              }}
              className="ml-1 p-1.5 rounded hover:bg-green-50 transition-all opacity-60 group-hover:opacity-100 hover:scale-110"
              title={`Verify ${formatFieldName(column)} data`}
            >
              {/* Checkmark Shield Icon - Green verification badge */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V12C4 16.5 6.84 20.74 11 21.94C15.16 20.74 20 16.5 20 12V7L12 2Z" fill="#4CAF50" fillOpacity="0.9"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          {/* Audit Button - Shows for all fields */}
          <button
            onClick={() => handleAudit(town.id, column)}
            className={`ml-1 p-1.5 rounded hover:bg-blue-50 transition-all ${
              isFieldAudited(town.id, column)
                ? 'opacity-100'
                : 'opacity-60 group-hover:opacity-100'
            } hover:scale-110`}
            title={isFieldAudited(town.id, column) ? 'Field audited ✓' : `Audit ${formatFieldName(column)}`}
          >
            {/* Audit Badge - Blue circle with "AUDIT" text */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#2196F3" fillOpacity="0.9"/>
              {isFieldAudited(town.id, column) ? (
                // Checkmark for audited fields
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                // "A" for audit
                <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">A</text>
              )}
            </svg>
          </button>
          
          {/* Show auditor avatar if field is audited - Clickable to re-audit */}
          {isFieldAudited(town.id, column) && (
            <button
              onClick={() => handleAudit(town.id, column)}
              className="ml-1 inline-flex items-center hover:scale-110 transition-transform cursor-pointer"
              title={`Audited by ${auditedFields[`${town.id}-${column}`].approvedByName || 'Admin'} - Click to re-audit`}
            >
              {auditedFields[`${town.id}-${column}`]?.approvedByAvatar ? (
                <img 
                  src={auditedFields[`${town.id}-${column}`].approvedByAvatar}
                  alt={auditedFields[`${town.id}-${column}`].approvedByName}
                  className="w-5 h-5 rounded-full border-2 border-green-500 hover:border-blue-500 transition-colors"
                />
              ) : (
                <div 
                  className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold hover:bg-blue-500 transition-colors"
                >
                  {(auditedFields[`${town.id}-${column}`]?.approvedByName || 'A')[0].toUpperCase()}
                </div>
              )}
            </button>
          )}
        </>
      )}
    </div>
    );
  };

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
          {/* Town Search - First */}
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
          
          {/* Has Photos - Second */}
          <select 
            value={filters.hasPhoto} 
            onChange={(e) => setFilters({...filters, hasPhoto: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="all">Has Photo</option>
            <option value="yes">Has Photo</option>
            <option value="no">No Photo</option>
          </select>
          
          {/* Completion - Third */}
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
          
          {/* Geo Regions - Fourth */}
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
          
          {/* All Countries - Fifth */}
          <select 
            value={filters.country} 
            onChange={(e) => setFilters({...filters, country: e.target.value})}
            className="border rounded px-3 py-1"
          >
            <option value="all">Countries (All)</option>
            {getUniqueCountries().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          
          {/* Data Quality - Last */}
          <select 
            value={filters.dataQuality} 
            onChange={(e) => {
              const newQuality = e.target.value;
              const updatedFilters = {...filters, dataQuality: newQuality};
              
              // Smart filter reset: Clear conflicting filters when selecting data quality options
              if (newQuality === 'missing_photos') {
                // Reset hasPhoto to 'all' to show towns without photos
                updatedFilters.hasPhoto = 'all';
              } else if (newQuality === 'low_completion') {
                // Reset completionLevel to 'all' to show all completion levels
                updatedFilters.completionLevel = 'all';
              }
              
              setFilters(updatedFilters);
            }}
            className="border rounded px-3 py-1"
          >
            <option value="all">Data Quality</option>
            <option value="has_errors">Has data errors ({getDataQualityCounts().has_errors})</option>
            <option value="missing_photos">Missing photos ({getDataQualityCounts().missing_photos})</option>
            <option value="missing_match_data">Missing match data ({getDataQualityCounts().missing_match_data})</option>
            <option value="low_completion">Low completion &lt; 50% ({getDataQualityCounts().low_completion})</option>
            <option value="needs_review">Needs review 6+ months ({getDataQualityCounts().needs_review})</option>
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
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">{selectedTown.name}, {selectedTown.country}</h2>
                  </div>
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
                  {activeCategory === 'Hobbies' ? (
                    // Special handling for Hobbies tab with enhanced display
                    <div>
                      <HobbiesDisplay 
                        townId={selectedTown.id} 
                        townName={selectedTown.name}
                      />
                      
                      {/* Show legacy fields for reference */}
                      <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
                          Legacy Data (for reference)
                        </h3>
                        <div className="opacity-60">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Old JSON format (being phased out)</h4>
                          <div className="space-y-1 pl-4">
                            {['outdoor_activities', 'hiking_trails', 'beaches_nearby', 'golf_courses', 'ski_resorts_nearby', 'cultural_attractions'].map(column => 
                              renderFieldRow(column, selectedTown)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Default rendering for other categories
                    Object.entries(COLUMN_CATEGORIES[activeCategory].subcategories).map(([subcategoryName, subcategory]) => {
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
                    })
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
      
      
      {/* Field Definition Editor */}
      {fieldDefEditor.isOpen && (
        <FieldDefinitionEditor
          fieldName={fieldDefEditor.fieldName}
          onClose={() => {
            setFieldDefEditor({ isOpen: false, fieldName: '' });
            // Reload field definitions after editing
            window.location.reload();
          }}
        />
      )}
      
      {/* Google Search Panel - 1/4 width side panel */}
      <GoogleSearchPanel
        isOpen={googleSearchPanel.isOpen}
        onClose={() => setGoogleSearchPanel({ isOpen: false, searchQuery: '', fieldName: null })}
        searchQuery={googleSearchPanel.searchQuery}
        fieldName={googleSearchPanel.fieldName}
      />
      
      {/* Audit Confirmation Dialog */}
      {showAuditDialog && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowAuditDialog(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#2196F3"/>
                <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">A</text>
              </svg>
              <h3 className="text-lg font-semibold">Audit Field Data</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">
                {isFieldAudited(showAuditDialog.townId, showAuditDialog.fieldName) 
                  ? 'Re-audit this field to update the approval status.'
                  : 'Do you approve the data in this field as accurate and complete?'}
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700">
                  Field: {formatFieldName(showAuditDialog.fieldName)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Town: {towns.find(t => t.id === showAuditDialog.townId)?.name}
                </p>
                {isFieldAudited(showAuditDialog.townId, showAuditDialog.fieldName) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Previously audited by {auditedFields[`${showAuditDialog.townId}-${showAuditDialog.fieldName}`]?.approvedByName} 
                    {auditedFields[`${showAuditDialog.townId}-${showAuditDialog.fieldName}`]?.approvedAt && 
                      ` on ${new Date(auditedFields[`${showAuditDialog.townId}-${showAuditDialog.fieldName}`].approvedAt).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAuditDialog(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAudit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Approve Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TownsManager;