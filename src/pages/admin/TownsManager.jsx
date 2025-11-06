// src/pages/admin/TownsManager.jsx - Reorganized with onboarding subcategories
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import supabase from '../../utils/supabaseClient';
import SmartFieldEditor from '../../components/SmartFieldEditor';
import UnifiedHeader from '../../components/UnifiedHeader';
import HeaderSpacer from '../../components/HeaderSpacer';
import FieldDefinitionEditor from '../../components/FieldDefinitionEditor';
import GoogleSearchPanel from '../../components/GoogleSearchPanel';
import WikipediaPanel from '../../components/WikipediaPanel';
import DataQualityPanel from '../../components/DataQualityPanel';
import HobbiesDisplay from '../../components/admin/HobbiesDisplay';
import ScoreBreakdownPanel from '../../components/ScoreBreakdownPanel';
import OverviewPanel from '../../components/admin/OverviewPanel';
import RegionPanel from '../../components/admin/RegionPanel';
import ClimatePanel from '../../components/admin/ClimatePanel';
import CulturePanel from '../../components/admin/CulturePanel';
import HealthcarePanel from '../../components/admin/HealthcarePanel';
import SafetyPanel from '../../components/admin/SafetyPanel';
import CostsPanel from '../../components/admin/CostsPanel';
import InfrastructurePanel from '../../components/admin/InfrastructurePanel';
import ActivitiesPanel from '../../components/admin/ActivitiesPanel';
import LegacyFieldsSection from '../../components/admin/LegacyFieldsSection';
import AddTownModal from '../../components/admin/AddTownModal';
import { getFieldOptions, isMultiSelectField } from '../../utils/townDataOptions';
import { useFieldDefinitions } from '../../hooks/useFieldDefinitions';
import { uiConfig } from '../../styles/uiConfig';
import { formatTownDisplay } from '../../utils/townDisplayUtils';

// Column mappings organized by category and subcategory to match onboarding structure
const COLUMN_CATEGORIES = {
  Overview: {
    subcategories: {}  // Overview uses custom OverviewPanel component
  },
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
  Healthcare: {
    subcategories: {}  // Healthcare uses custom HealthcarePanel component
  },
  Safety: {
    subcategories: {}  // Safety uses custom SafetyPanel component
  },
  Infrastructure: {
    subcategories: {}  // Infrastructure uses custom InfrastructurePanel component
  },
  Activities: {
    subcategories: {}  // Activities uses custom ActivitiesPanel component
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
  used: ['id', 'town_name', 'image_url_1', 'description', 'appealStatement', 'matchScore'],
  unused: ['created_at', 'updated_at', 'last_ai_update', 'data_source']
};

const TownsManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [towns, setTowns] = useState([]);
  const [filteredTowns, setFilteredTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Overview');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Audit state - tracks which fields have been audited
  const [auditedFields, setAuditedFields] = useState({});
  const [showAuditDialog, setShowAuditDialog] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Town access control
  const [userTownAccess, setUserTownAccess] = useState({}); // Map of town_id -> access_level
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    hasPhoto: 'all',  // Show all by default
    completionLevel: 'all',
    dataQuality: 'all',  // New data quality filter
    country: 'all',
    geo_region: 'all',
    townSearch: '',
    myTowns: false,  // NEW: Show only user's accessible towns
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

  // Wikipedia panel state
  const [wikipediaOpen, setWikipediaOpen] = useState(false);
  
  // Data Quality panel state
  const [dataQualityPanel, setDataQualityPanel] = useState({
    isOpen: false,
    town: null
  });

  // Add Town modal state
  const [addTownModalOpen, setAddTownModalOpen] = useState(false);

  // Audit state - stores confidence level per field
  const [auditResults, setAuditResults] = useState({});
  const [auditLoading, setAuditLoading] = useState(false);

  // Global field search state
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [highlightedField, setHighlightedField] = useState(null);
  
  // Get field definitions for audit questions
  const { getAuditQuestion, getSearchQuery, getFieldDefinition, refreshDefinitions } = useFieldDefinitions();

  // Auth check - FIXED to use actual Supabase authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Auth error:', error);
        toast.error('Authentication error. Please log in again.');
        navigate('/welcome');
        return;
      }
      
      if (!user) {
        console.error('❌ No user logged in');
        toast.error('You must be logged in to access the admin panel.');
        navigate('/welcome');
        return;
      }

      // Check if user is admin using both old and new admin fields
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin, admin_role')
        .eq('id', user.id)
        .single();

      // Check both new admin_role and legacy is_admin field
      const hasAdminRole = userData?.admin_role === 'executive_admin' ||
                          userData?.admin_role === 'assistant_admin';
      const hasLegacyAdmin = userData?.is_admin === true;
      const isUserAdmin = hasAdminRole || hasLegacyAdmin;

      if (userError || !isUserAdmin) {
        console.error('❌ Not authorized - user is not admin', { userData, userError });
        toast.error('You are not authorized to access the admin panel.');
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

      setCurrentUser(user); // Store the current user with updated metadata

      // Load user's town access
      await loadUserTownAccess(user.id, userData);

      setIsLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Load user's town access permissions
  const loadUserTownAccess = async (userId, userData) => {
    try {
      // Check if user is executive or assistant admin
      const isAdminUser = userData?.admin_role === 'executive_admin' ||
                         userData?.admin_role === 'assistant_admin' ||
                         userData?.is_admin === true;

      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        // Admins have full access to all towns
        setUserTownAccess({});
        return;
      }

      // Load specific town access for non-admin users
      const { data: accessData, error } = await supabase
        .from('user_town_access')
        .select('town_id, access_level')
        .eq('user_id', userId)
        .eq('active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) {
        console.error('Error loading town access:', error);
        return;
      }

      // Convert to map for easy lookup
      const accessMap = {};
      accessData?.forEach(access => {
        accessMap[access.town_id] = access.access_level;
      });

      setUserTownAccess(accessMap);
    } catch (error) {
      console.error('Error in loadUserTownAccess:', error);
    }
  };

  // Load towns data - defined as useCallback so it can be called from modal callbacks
  const loadTowns = useCallback(async () => {
    const { data, error } = await supabase
      .from('towns')
      .select('*')
      .order('town_name');  // Database column is 'town_name', not 'name'

    if (error) {
      console.error('Error loading towns:', error);
      return [];
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

    // Return the enriched towns so callers can use them
    return townsWithMetrics;
  }, []);

  // Load towns when we have a current user
  useEffect(() => {
    if (currentUser) {
      loadTowns();
    }
  }, [currentUser, loadTowns]);

  // Auto-select town from URL parameter OR localStorage
  useEffect(() => {
    if (towns.length === 0) return; // Wait for towns to load

    const params = new URLSearchParams(location.search);
    const townIdFromUrl = params.get('town');
    const fieldFromUrl = params.get('field');

    // Priority 1: URL parameter
    if (townIdFromUrl && !selectedTown) {
      const town = towns.find(t => t.id === townIdFromUrl);
      if (town) {
        console.log('🔥 Auto-selecting town from URL:', town.name);
        setSelectedTown(town);

        // If field parameter exists, auto-select the correct category tab
        if (fieldFromUrl) {
          const category = getFieldCategory(fieldFromUrl);
          if (category) {
            console.log(`📂 Auto-selecting category "${category}" for field "${fieldFromUrl}"`);
            setActiveCategory(category);

            // Highlight the field after a delay to ensure tab has switched
            setTimeout(() => {
              setHighlightedField(fieldFromUrl);
              const fieldElement = document.querySelector(`[data-field="${fieldFromUrl}"]`);
              if (fieldElement) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fieldElement.classList.add('ring-2', 'ring-red-500', 'bg-red-50', 'dark:bg-red-900/20');
                setTimeout(() => {
                  fieldElement.classList.remove('ring-2', 'ring-red-500', 'bg-red-50', 'dark:bg-red-900/20');
                  setHighlightedField(null);
                }, 3000);
              }
            }, 300);
          }
        }
        return;
      } else {
        console.warn('⚠️ Town ID from URL not found:', townIdFromUrl);
      }
    }

    // Priority 2: localStorage (only if no URL param and no town selected)
    if (!townIdFromUrl && !selectedTown) {
      try {
        const savedTownId = localStorage.getItem('townsManager.selectedTownId');
        const savedCategory = localStorage.getItem('townsManager.activeCategory');

        if (savedTownId) {
          const town = towns.find(t => t.id === savedTownId);
          if (town) {
            console.log('📂 Restoring town from localStorage:', town.name);
            setSelectedTown(town);
          }
        }

        if (savedCategory) {
          setActiveCategory(savedCategory);
        }
      } catch (error) {
        console.error('Error restoring from localStorage:', error);
      }
    }
  }, [towns, location.search, selectedTown]);

  // Save selectedTown to localStorage whenever it changes
  useEffect(() => {
    if (selectedTown) {
      try {
        localStorage.setItem('townsManager.selectedTownId', selectedTown.id);
        console.log('💾 Saved town to localStorage:', selectedTown.name);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [selectedTown]);

  // Save activeCategory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('townsManager.activeCategory', activeCategory);
    } catch (error) {
      console.error('Error saving category to localStorage:', error);
    }
  }, [activeCategory]);

  // Apply filters
  useEffect(() => {
    let filtered = [...towns];

    // Town access control filter - applies FIRST for non-admins
    if (!isAdmin && Object.keys(userTownAccess).length > 0) {
      // Non-admin users can only see towns they have access to
      filtered = filtered.filter(t => userTownAccess[t.id]);
    }

    // "My Towns" filter - show only accessible towns
    if (filters.myTowns && !isAdmin) {
      filtered = filtered.filter(t => userTownAccess[t.id]);
    }

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
  }, [filters, towns, userTownAccess, isAdmin]);

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
        .map(t => ({
          town_name: t.name,
          subdivision_code: t.subdivision_code || t.region || '',
          country: t.country,
          id: t.id
        }))
        .slice(0, 10);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    // Reset all filters to defaults to ensure searched town is visible
    setFilters({
      hasPhoto: 'all',  // Reset to 'all' so town is visible regardless of photo status
      completionLevel: 'all',
      dataQuality: 'all',
      country: 'all',
      geo_region: 'all',
      townSearch: suggestion.name,
      sortBy: 'abc',
      sortDirection: 'asc'
    });
    setShowSuggestions(false);
    setSearchSuggestions([]);

    // Find and auto-select the searched town by ID
    const foundTown = towns.find(t => t.id === suggestion.id);
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
        toast.error('Error fetching town data. Please try again.');
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
        toast.error(`Error saving audit approval: ${updateError.message}`);
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

  // Handle town updates from inline editing panels
  const handleTownUpdate = (field, newValue) => {
    if (!selectedTown) return;

    // Update the selected town state with the new field value
    setSelectedTown(prev => ({
      ...prev,
      [field]: newValue
    }));

    // Also update the towns list to keep data in sync
    setTowns(prev => prev.map(town =>
      town.id === selectedTown.id
        ? { ...town, [field]: newValue }
        : town
    ));

    // Update filtered towns as well
    setFilteredTowns(prev => prev.map(town =>
      town.id === selectedTown.id
        ? { ...town, [field]: newValue }
        : town
    ));
  };

  // Load audit results from database when town is selected
  useEffect(() => {
    async function loadAuditData() {
      if (!selectedTown?.id) {
        setAuditResults({});
        return;
      }

      try {
        const { loadAuditResults } = await import('../../utils/auditTown');
        const results = await loadAuditResults(selectedTown.id, supabase);
        setAuditResults(results);
      } catch (error) {
        console.error('Error loading audit results:', error);
        setAuditResults({});
      }
    }

    loadAuditData();
  }, [selectedTown?.id]);

  // Handle audit request for the selected town
  const handleAuditTown = async () => {
    if (!selectedTown) {
      toast.error('No town selected');
      return;
    }

    // Check if API key is configured
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      toast.error('Anthropic API key not configured. Check .env file.');
      return;
    }

    setAuditLoading(true);
    toast('Starting audit... This may take 30-60 seconds', { icon: '🔍' });

    try {
      // Dynamically import the audit utility
      const { auditTownData } = await import('../../utils/auditTown');

      // Pass supabase client to save results to database
      const result = await auditTownData(selectedTown, supabase);

      if (!result.success) {
        throw new Error(result.error || 'Audit failed');
      }

      setAuditResults(result.fieldConfidence || {});

      toast.success(`Audit complete! Assessed ${result.totalFields} fields and saved to database`);
    } catch (error) {
      console.error('Audit error:', error);
      toast.error(`Audit failed: ${error.message}`);
    } finally {
      setAuditLoading(false);
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
      'english_proficiency': 'English proficiency score (0-100)',
      'english_proficiency_level': 'English proficiency level (native/high/moderate/low)',
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

  // Get category for a given field
  const getFieldCategory = (fieldName) => {
    // First check if field is in COLUMN_CATEGORIES
    for (const [category, config] of Object.entries(COLUMN_CATEGORIES)) {
      for (const subcategoryConfig of Object.values(config.subcategories || {})) {
        if (subcategoryConfig.used?.includes(fieldName) || subcategoryConfig.unused?.includes(fieldName)) {
          return category;
        }
      }
    }

    // Smart categorization for fields not explicitly in categories
    const fieldLower = fieldName.toLowerCase();

    // Activities/Hobbies related
    if (fieldLower.includes('farmers') || fieldLower.includes('market') ||
        fieldLower.includes('golf') || fieldLower.includes('tennis') ||
        fieldLower.includes('swimming') || fieldLower.includes('hiking') ||
        fieldLower.includes('ski') || fieldLower.includes('beach') ||
        fieldLower.includes('marina') || fieldLower.includes('coworking') ||
        fieldLower.includes('dog_park') || fieldLower.includes('vet') ||
        fieldLower.includes('international_school')) {
      return 'Activities';
    }

    // Culture related
    if (fieldLower.includes('cultural') || fieldLower.includes('museum') ||
        fieldLower.includes('arts') || fieldLower.includes('music')) {
      return 'Culture';
    }

    // Infrastructure related
    if (fieldLower.includes('transport') || fieldLower.includes('airport') ||
        fieldLower.includes('internet') || fieldLower.includes('infrastructure')) {
      return 'Infrastructure';
    }

    // Overview for basic fields
    if (fieldLower.includes('photo') || fieldLower.includes('image') ||
        fieldLower.includes('description') || fieldLower.includes('appeal') ||
        fieldLower.includes('town_name') || fieldLower.includes('population')) {
      return 'Overview';
    }

    // Default fallback
    return 'Overview';
  };

  // Get all searchable fields from selected town
  const getAllSearchableFields = () => {
    if (!selectedTown) return [];

    return Object.keys(selectedTown)
      .filter(key => !key.startsWith('_') && key !== 'id')
      .map(field => ({
        name: field,
        displayName: formatFieldName(field),
        category: getFieldCategory(field),
        value: selectedTown[field]
      }));
  };

  // Handle field selection from autocomplete
  const handleFieldSelect = (field) => {
    // Clear search
    setFieldSearchQuery('');
    setShowFieldDropdown(false);

    // Switch to the correct category
    setActiveCategory(field.category);

    // Highlight the field
    setHighlightedField(field.name);

    // Scroll to field after a brief delay to ensure tab has switched
    setTimeout(() => {
      const fieldElement = document.querySelector(`[data-field="${field.name}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldElement.classList.add('ring-2', 'ring-red-500', 'bg-red-50', 'dark:bg-red-900/20');
        setTimeout(() => {
          fieldElement.classList.remove('ring-2', 'ring-red-500', 'bg-red-50', 'dark:bg-red-900/20');
          setHighlightedField(null);
        }, 3000);
      }
    }, 300);

    toast.success(`Navigated to "${field.displayName}" in ${field.category} tab`);
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
      toast.error(`Error saving changes: ${error.message || 'Unknown error'}`);
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
    <div key={column} className="lg:flex lg:items-center py-2 lg:py-1 group border-b lg:border-0" data-field={column}>
      <div className={`lg:w-64 text-sm font-medium ${uiConfig.colors.body} flex items-center gap-1 mb-1 lg:mb-0`}>
        {column}:
        <button
          onClick={() => {
            // Open the field definition editor to edit the TEMPLATE
            setFieldDefEditor({
              isOpen: true,
              fieldName: column
            });
          }}
          className={`${uiConfig.colors.accent} text-sm font-bold cursor-pointer hover:${uiConfig.colors.accentHover} ml-1`}
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
              toast.error(`Error saving changes: ${error.message || 'Unknown error'}`);
              return;
            }
            
            if (!data || data.length === 0) {
              console.error('❌ No data returned from update - possible RLS issue');
              toast.error('Update may have failed - no data returned. Check Row Level Security policies.');
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
            className={`flex-1 px-2 py-1 hover:${uiConfig.colors.secondary} cursor-pointer rounded`}
          >
            <span className={town[column] ? uiConfig.colors.heading : uiConfig.colors.subtitle}>
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
              // First try to use the custom field definition from database
              let searchQuery = getSearchQuery(column, town);
              
              // If no custom definition exists, fall back to generateSearchQuery
              if (!searchQuery) {
                searchQuery = generateSearchQuery(town, column, false);
              }
              
              setGoogleSearchPanel({ 
                isOpen: true, 
                searchQuery: searchQuery,
                fieldName: formatFieldName(column)
              });
            }}
            className={`ml-2 p-1.5 rounded hover:${uiConfig.colors.secondary} transition-all ${
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
              className={`ml-1 p-1.5 rounded hover:${uiConfig.colors.statusSuccess} transition-all opacity-60 group-hover:opacity-100 hover:scale-110`}
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
            className={`ml-1 p-1.5 rounded hover:${uiConfig.colors.accentSecondary} transition-all ${
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
    return <div className={`flex items-center justify-center min-h-screen ${uiConfig.colors.page}`}><div className={uiConfig.colors.body}>Checking access...</div></div>;
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* UnifiedHeader for consistency */}
      <UnifiedHeader 
        title="Towns Manager"
        subtitle={`Total: ${towns.length} towns | Showing: ${filteredTowns.length}`}
        showFilters={false}
      />
      
      {/* Header spacer for proper content positioning */}
      <HeaderSpacer hasFilters={false} />

      {/* Filters */}
      <div className={`${uiConfig.colors.card} shadow-sm border-b`}>
        <div className={`${uiConfig.layout.width.containerXL} px-4 py-3`}>
          {/* Mobile: 2x2 grid, Desktop: single row */}
          <div className="grid grid-cols-2 sm:flex sm:gap-3 gap-2 sm:flex-wrap items-center">
            {/* Town Search - spans full width on mobile */}
            <div className="relative col-span-2 sm:col-span-1">
              <input
                type="text"
                value={filters.townSearch}
                onChange={(e) => handleTownSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search..."
                className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm w-full sm:w-40 ${uiConfig.colors.input}`}
              />
              {showSuggestions && (
                <div className={`absolute top-full left-0 mt-1 w-full ${uiConfig.colors.card} border ${uiConfig.colors.border} rounded shadow-lg z-10 max-h-60 overflow-y-auto`}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`px-3 py-2 hover:${uiConfig.colors.secondary} cursor-pointer`}
                    >
                      <div className={uiConfig.colors.heading}>
                        {suggestion.name}
                        {suggestion.subdivision_code && (
                          <span className={`ml-1 ${uiConfig.colors.subtitle} text-xs`}>
                            {suggestion.subdivision_code}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${uiConfig.colors.subtitle}`}>
                        {suggestion.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Towns Toggle - only show for non-admins with town access */}
            {!isAdmin && Object.keys(userTownAccess).length > 0 && (
              <button
                onClick={() => setFilters({...filters, myTowns: !filters.myTowns})}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filters.myTowns
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={`Show only your ${Object.keys(userTownAccess).length} assigned town${Object.keys(userTownAccess).length !== 1 ? 's' : ''}`}
              >
                📍 My Towns ({Object.keys(userTownAccess).length})
              </button>
            )}

            {/* Has Photos */}
            <select
              value={filters.hasPhoto} 
              onChange={(e) => setFilters({...filters, hasPhoto: e.target.value})}
              className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm w-full sm:w-auto sm:max-w-[110px] ${uiConfig.colors.input}`}
            >
              <option value="all">Photo</option>
              <option value="yes">Has Photo</option>
              <option value="no">No Photo</option>
            </select>
            
            {/* Completion */}
            <select 
              value={filters.completionLevel} 
              onChange={(e) => setFilters({...filters, completionLevel: e.target.value})}
              className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm w-full sm:w-auto sm:max-w-[140px] truncate ${uiConfig.colors.input}`}
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
            
            {/* Geo Regions - hidden on mobile */}
            <select 
              value={filters.geo_region} 
              onChange={(e) => setFilters({...filters, geo_region: e.target.value})}
              className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm max-w-[160px] truncate hidden sm:block ${uiConfig.colors.input}`}
              title="Filter by geo_region column"
            >
              <option value="all">Geo Region</option>
              {getUniqueGeoRegion().map(region => (
                <option key={region} value={region} className="truncate">{region}</option>
              ))}
            </select>
            
            {/* All Countries */}
            <select 
              value={filters.country} 
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm w-full sm:w-auto sm:max-w-[150px] truncate ${uiConfig.colors.input}`}
            >
              <option value="all">Countries</option>
              {getUniqueCountries().map(country => (
                <option key={country} value={country} className="truncate">{country.length > 20 ? country.substring(0, 20) + '...' : country}</option>
              ))}
            </select>
            
            {/* Data Quality */}
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
              className={`border ${uiConfig.colors.border} rounded px-3 py-1.5 text-sm w-full sm:w-auto sm:max-w-[150px] truncate ${uiConfig.colors.input}`}
            >
            <option value="all">Data Quality</option>
            <option value="has_errors">Has data errors ({getDataQualityCounts().has_errors})</option>
            <option value="missing_photos">Missing photos ({getDataQualityCounts().missing_photos})</option>
            <option value="missing_match_data">Missing match data ({getDataQualityCounts().missing_match_data})</option>
            <option value="low_completion">Low completion &lt; 50% ({getDataQualityCounts().low_completion})</option>
            <option value="needs_review">Needs review 6+ months ({getDataQualityCounts().needs_review})</option>
          </select>

          {/* Add Town Button */}
          <button
            onClick={() => setAddTownModalOpen(true)}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
          >
            + Add Town
          </button>
        </div>
      </div>
      </div>

      <div className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page}`}>
        {/* Town Details - Full width */}
        <div>
            {selectedTown ? (
              <div className={`${uiConfig.colors.card} rounded-lg shadow`}>
                {/* Town Header */}
                <div className="px-4 lg:px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className={`text-lg lg:text-xl font-bold ${uiConfig.colors.heading}`}>{formatTownDisplay(selectedTown)}</h2>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      {/* Global Field Search - PRIMARY INTERFACE */}
                      <div className="relative flex-1 lg:flex-initial lg:w-96">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="🔍 Search fields..."
                            value={fieldSearchQuery}
                            onChange={(e) => {
                              setFieldSearchQuery(e.target.value);
                              setShowFieldDropdown(e.target.value.length >= 2);
                            }}
                            onFocus={() => {
                              if (fieldSearchQuery.length >= 2) {
                                setShowFieldDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on dropdown items
                              setTimeout(() => setShowFieldDropdown(false), 200);
                            }}
                            className={`w-full px-3 py-2 pr-9 lg:px-4 lg:py-2.5 lg:pr-10 rounded-lg border-2 ${uiConfig.colors.border} ${uiConfig.colors.card} ${uiConfig.colors.body} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base shadow-md hover:shadow-lg transition-all`}
                          />
                          {/* Search icon */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showFieldDropdown && fieldSearchQuery.length >= 2 && (() => {
                          const allFields = getAllSearchableFields();
                          const searchLower = fieldSearchQuery.toLowerCase();
                          const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);

                          const matchingFields = allFields.filter(field => {
                            const displayLower = field.displayName.toLowerCase();
                            const nameLower = field.name.toLowerCase();

                            // Match if all search words appear
                            return searchWords.every(word =>
                              displayLower.includes(word) || nameLower.includes(word)
                            );
                          }).slice(0, 10); // Limit to 10 results

                          if (matchingFields.length === 0) return null;

                          return (
                            <div className={`absolute z-[9999] w-80 mt-2 ${uiConfig.colors.card} border-2 ${uiConfig.colors.border} rounded-lg shadow-lg max-h-96 overflow-auto`}
                                 style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                              {matchingFields.map(field => {
                                const isEmpty = field.value === null || field.value === undefined || field.value === '' ||
                                               (Array.isArray(field.value) && field.value.length === 0);

                                let displayValue = '';
                                if (!isEmpty) {
                                  if (typeof field.value === 'boolean') {
                                    displayValue = field.value ? 'Yes' : 'No';
                                  } else if (typeof field.value === 'number') {
                                    displayValue = field.value.toString();
                                  } else if (Array.isArray(field.value)) {
                                    displayValue = field.value.join(', ');
                                  } else if (typeof field.value === 'string') {
                                    displayValue = field.value.length > 40 ? field.value.substring(0, 40) + '...' : field.value;
                                  }
                                }

                                return (
                                  <button
                                    key={field.name}
                                    onClick={() => handleFieldSelect(field)}
                                    className={`w-full px-3 py-2 text-left hover:${uiConfig.colors.secondary} transition-colors border-b ${uiConfig.colors.border} last:border-b-0`}
                                  >
                                    <div className={`font-medium ${uiConfig.colors.heading} text-sm`}>
                                      {field.displayName}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className={`text-xs ${uiConfig.colors.subtitle}`}>
                                        {field.category} {isEmpty && '• Empty'}
                                      </span>
                                      {!isEmpty && (
                                        <span className={`text-xs ${uiConfig.colors.subtitle} truncate max-w-[200px]`}>
                                          {displayValue}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Audit Button - Verifies data confidence for this town */}
                      <button
                        onClick={handleAuditTown}
                        disabled={auditLoading}
                        className={`px-3 py-1 rounded-lg ${auditLoading ? 'bg-gray-400 cursor-not-allowed' : `${uiConfig.colors.secondary} hover:${uiConfig.colors.primary}`} transition-colors flex items-center justify-center text-sm font-medium`}
                        title="Audit town data - AI verifies confidence level for each field"
                      >
                        {auditLoading ? 'Auditing...' : 'Audit'}
                      </button>
                      {/* Wikipedia Button */}
                      <button
                        onClick={() => setWikipediaOpen(true)}
                        className={`p-2 rounded-lg ${uiConfig.colors.secondary} hover:${uiConfig.colors.primary} transition-colors flex items-center justify-center`}
                        title="View Wikipedia"
                      >
                        <img
                          src="https://en.wikipedia.org/static/favicon/wikipedia.ico"
                          alt="Wikipedia"
                          className="w-5 h-5"
                          onError={(e) => {
                            // Fallback to text if favicon fails to load
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="font-bold text-sm">W</span>';
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  {selectedTown._errors.length > 0 && (
                    <div className={`mt-2 p-3 ${uiConfig.colors.statusError} rounded border ${uiConfig.colors.border}`}>
                      <h3 className={`font-semibold ${uiConfig.colors.errorText} mb-1`}>Detected Errors:</h3>
                      <ul className={`text-sm ${uiConfig.colors.errorText} list-disc list-inside`}>
                        {selectedTown._errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Category Tabs - Scrollable on mobile */}
                <div className="border-b overflow-x-auto">
                  <div className="flex min-w-max">
                    {Object.keys(COLUMN_CATEGORIES).map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 lg:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                          activeCategory === category
                            ? `border-b-2 ${uiConfig.colors.accentBorder} ${uiConfig.colors.accent}`
                            : `${uiConfig.colors.body} hover:${uiConfig.colors.heading}`
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Content with Subcategories */}
                <div className="p-4 lg:p-6">
                  {activeCategory === 'Overview' ? (
                    // Special handling for Overview tab with photos and descriptions
                    <OverviewPanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Admin' ? (
                    // Special handling for Admin tab with score breakdown panel
                    <ScoreBreakdownPanel town={selectedTown} onTownUpdate={handleTownUpdate} />
                  ) : activeCategory === 'Region' ? (
                    // Special handling for Region tab with inline editing panel
                    <RegionPanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Climate' ? (
                    // Special handling for Climate tab with inline editing panel
                    <ClimatePanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Culture' ? (
                    // Special handling for Culture tab with inline editing panel
                    <CulturePanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Healthcare' ? (
                    // Special handling for Healthcare tab with inline editing panel
                    <HealthcarePanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Safety' ? (
                    // Special handling for Safety tab with inline editing panel
                    <SafetyPanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Infrastructure' ? (
                    // Special handling for Infrastructure tab with inline editing panel
                    <InfrastructurePanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Activities' ? (
                    // Special handling for Activities tab with inline editing panel
                    <ActivitiesPanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : activeCategory === 'Hobbies' ? (
                    // Special handling for Hobbies tab with enhanced display
                    <div>
                      <HobbiesDisplay
                        townId={selectedTown.id}
                        townName={selectedTown.name}
                      />

                      {/* Legacy Fields */}
                      <LegacyFieldsSection
                        fields={['outdoor_activities', 'hiking_trails', 'beaches_nearby', 'golf_courses', 'ski_resorts_nearby', 'cultural_attractions']}
                        town={selectedTown}
                        onTownUpdate={handleTownUpdate}
                      />
                    </div>
                  ) : activeCategory === 'Costs' ? (
                    // Special handling for Costs tab with inline editing panel
                    <CostsPanel town={selectedTown} onTownUpdate={handleTownUpdate} auditResults={auditResults} />
                  ) : (
                    // Default rendering for other categories
                    Object.entries(COLUMN_CATEGORIES[activeCategory].subcategories).map(([subcategoryName, subcategory]) => {
                      const hasUsedFields = subcategory.used.length > 0;
                      const hasUnusedFields = subcategory.unused.length > 0;
                      
                      if (!hasUsedFields && !hasUnusedFields) return null;
                      
                      return (
                        <div key={subcategoryName} className="mb-8">
                          {/* Subcategory Title */}
                          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3 border-b pb-1`}>
                            {subcategoryName}
                          </h3>
                          
                          {/* Used Fields (Towns Data for Matching) */}
                          {hasUsedFields && (
                            <div className="mb-4">
                              <h4 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>Towns Data for Matching</h4>
                              <div className="space-y-1 pl-4">
                                {subcategory.used.map(column => renderFieldRow(column, selectedTown))}
                              </div>
                            </div>
                          )}
                          
                          {/* Unused Fields (Towns Data for Context) */}
                          {hasUnusedFields && (
                            <div className="opacity-60">
                              <h4 className={`text-sm font-medium ${uiConfig.colors.body} mb-2`}>Towns Data for Context</h4>
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
              <div className={`${uiConfig.colors.card} rounded-lg shadow p-12 text-center ${uiConfig.colors.subtitle}`}>
                Select a town to view and edit its data
              </div>
            )}
          </div>
        </div>


      {/* Field Definition Editor */}
      {fieldDefEditor.isOpen && (
        <FieldDefinitionEditor
          fieldName={fieldDefEditor.fieldName}
          onClose={async () => {
            setFieldDefEditor({ isOpen: false, fieldName: '' });
            // Refresh field definitions without reloading the page
            await refreshDefinitions();
            toast.success('Field definition saved! The new search pattern will be used.');
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

      {/* Wikipedia Panel */}
      {selectedTown && (
        <WikipediaPanel
          townName={selectedTown.name}
          country={selectedTown.country}
          isOpen={wikipediaOpen}
          onClose={() => setWikipediaOpen(false)}
        />
      )}
      
      {/* Data Quality Panel */}
      <DataQualityPanel
        town={dataQualityPanel.town}
        isOpen={dataQualityPanel.isOpen}
        onClose={() => setDataQualityPanel({ isOpen: false, town: null })}
        onQuickAction={(action, field) => {
          // Handle quick actions
          if (action === 'scrollToField' && field) {
            // Close the panel
            setDataQualityPanel({ isOpen: false, town: null });
            // Select the town if it's not already selected
            if (selectedTown?.id !== dataQualityPanel.town?.id) {
              setSelectedTown(dataQualityPanel.town);
            }
            // Scroll to the field after a brief delay
            setTimeout(() => {
              const fieldElement = document.querySelector(`[data-field="${field}"]`);
              if (fieldElement) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fieldElement.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => {
                  fieldElement.classList.remove('ring-2', 'ring-blue-500');
                }, 2000);
              }
            }, 300);
          } else if (action === 'fillMissing') {
            // Close panel and select town
            setDataQualityPanel({ isOpen: false, town: null });
            if (selectedTown?.id !== dataQualityPanel.town?.id) {
              setSelectedTown(dataQualityPanel.town);
            }
            // Find first empty critical field
            const criticalFields = ['image_url_1', 'country', 'region', 'cost_of_living_usd',
                                   'healthcare_score', 'safety_score', 'climate', 'population'];
            const firstCritical = criticalFields.find(field => {
              const value = dataQualityPanel.town[field];
              return value === null || value === undefined || value === '';
            });
            if (firstCritical) {
              setTimeout(() => {
                const fieldElement = document.querySelector(`[data-field="${firstCritical}"]`);
                if (fieldElement) {
                  fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  fieldElement.classList.add('ring-2', 'ring-yellow-500', 'bg-yellow-50');
                  setTimeout(() => {
                    fieldElement.classList.remove('ring-2', 'ring-yellow-500', 'bg-yellow-50');
                  }, 3000);
                }
              }, 300);
              toast(`📝 Navigate to critical field: ${firstCritical.replace(/_/g, ' ')}`);
            }
          } else if (action === 'fixErrors') {
            // Close panel and find first error field
            setDataQualityPanel({ isOpen: false, town: null });
            if (selectedTown?.id !== dataQualityPanel.town?.id) {
              setSelectedTown(dataQualityPanel.town);
            }
            // Find first field mentioned in errors
            const errors = dataQualityPanel.town._errors || [];
            if (errors.length > 0) {
              // Extract field name from first error message
              const fieldMatch = errors[0].match(/Field: (\w+)/);
              const errorField = fieldMatch ? fieldMatch[1] : null;
              if (errorField) {
                setTimeout(() => {
                  const fieldElement = document.querySelector(`[data-field="${errorField}"]`);
                  if (fieldElement) {
                    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    fieldElement.classList.add('ring-2', 'ring-red-500', 'bg-red-50');
                    setTimeout(() => {
                      fieldElement.classList.remove('ring-2', 'ring-red-500', 'bg-red-50');
                    }, 3000);
                  }
                }, 300);
              }
              toast.error(`🔧 Navigate to error: ${errors[0]}`);
            }
          } else if (action === 'addPhoto') {
            // Close panel and scroll to photo field
            setDataQualityPanel({ isOpen: false, town: null });
            if (selectedTown?.id !== dataQualityPanel.town?.id) {
              setSelectedTown(dataQualityPanel.town);
            }
            setTimeout(() => {
              const photoField = document.querySelector('[data-field="image_url_1"]');
              if (photoField) {
                photoField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                photoField.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
                setTimeout(() => {
                  photoField.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                }, 3000);
              }
            }, 300);
            toast('📸 Navigate to photo URL field');
          } else if (action === 'runValidation') {
            // Re-calculate validation for this town
            const town = dataQualityPanel.town;
            const errors = [];
            
            // Check for data inconsistencies
            if (town.coastal && (!town.water_bodies || !town.water_bodies.includes('ocean'))) {
              errors.push('Coastal town without ocean in water bodies');
            }
            if (town.elevation_meters && town.elevation_meters > 3000 && !town.geographic_features_actual?.includes('mountain')) {
              errors.push('High elevation without mountain feature');
            }
            
            // Update the town's errors
            const updatedTown = { ...town, _errors: errors };
            setDataQualityPanel({ ...dataQualityPanel, town: updatedTown });
            
            toast.success(`✅ Validation complete: ${errors.length} issues found`);
          }
        }}
      />
      
      {/* Audit Confirmation Dialog */}
      {showAuditDialog && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowAuditDialog(null)} />
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${uiConfig.colors.card} rounded-lg shadow-xl z-50 p-6 max-w-md w-full`}>
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#2196F3"/>
                <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">A</text>
              </svg>
              <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Audit Field Data</h3>
            </div>
            
            <div className="mb-4">
              <p className={uiConfig.colors.body}>
                {isFieldAudited(showAuditDialog.townId, showAuditDialog.fieldName) 
                  ? 'Re-audit this field to update the approval status.'
                  : 'Do you approve the data in this field as accurate and complete?'}
              </p>
              <div className={`mt-2 p-3 ${uiConfig.colors.secondary} rounded`}>
                <p className={`text-sm font-medium ${uiConfig.colors.heading}`}>
                  Field: {formatFieldName(showAuditDialog.fieldName)}
                </p>
                <p className={`text-sm ${uiConfig.colors.body} mt-1`}>
                  Town: {formatTownDisplay(towns.find(t => t.id === showAuditDialog.townId))}
                </p>
                {isFieldAudited(showAuditDialog.townId, showAuditDialog.fieldName) && (
                  <p className={`text-xs ${uiConfig.colors.subtitle} mt-2`}>
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
                className={`px-4 py-2 ${uiConfig.colors.body} hover:${uiConfig.colors.secondary} rounded transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={confirmAudit}
                className={`px-4 py-2 ${uiConfig.colors.btnPrimary} rounded hover:${uiConfig.colors.btnPrimaryHover} transition-colors`}
              >
                Approve Data
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Town Modal */}
      <AddTownModal
        isOpen={addTownModalOpen}
        onClose={() => setAddTownModalOpen(false)}
        onTownAdded={async (newTown) => {
          // Refresh towns list and get the enriched towns array
          const enrichedTowns = await loadTowns();
          // Find the newly created town in the enriched array
          const enrichedNewTown = enrichedTowns.find(t => t.id === newTown.id);
          // Select it (will have _errors and _completion fields)
          setSelectedTown(enrichedNewTown || newTown);
        }}
      />
    </div>
  );
};

export default TownsManager;