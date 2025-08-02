import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Natural language search that understands retirement needs
export async function intelligentSearch(query) {
  const searchTerms = query.toLowerCase();
  
  // Parse intent from natural language
  const intents = {
    budget: {
      patterns: ['cheap', 'affordable', 'budget', 'low cost', 'under $', 'less than'],
      extract: (text) => {
        const match = text.match(/under \$?(\d+)|less than \$?(\d+)/);
        return match ? parseInt(match[1] || match[2]) : null;
      }
    },
    climate: {
      patterns: ['warm', 'tropical', 'mediterranean', 'dry', 'cool', 'temperate'],
      values: {
        'warm': ['Tropical', 'Desert', 'Mediterranean'],
        'tropical': ['Tropical'],
        'mediterranean': ['Mediterranean'],
        'dry': ['Desert', 'Mediterranean'],
        'cool': ['Temperate', 'Continental'],
        'temperate': ['Temperate', 'Oceanic']
      }
    },
    healthcare: {
      patterns: ['good healthcare', 'hospitals', 'medical', 'doctors', 'healthcare'],
      minScore: 7
    },
    beach: {
      patterns: ['beach', 'coastal', 'ocean', 'sea', 'waterfront'],
      geographic: 'Coastal'
    },
    safety: {
      patterns: ['safe', 'low crime', 'secure', 'peaceful'],
      minScore: 7
    },
    expats: {
      patterns: ['expats', 'english speaking', 'expat community', 'international'],
      sizes: ['medium', 'large']
    },
    retirement: {
      patterns: ['retirement community', 'retirees', 'senior', '55+'],
      presence: ['minimal', 'moderate', 'strong', 'very_strong']
    }
  };

  // Build query conditions
  let query = supabase.from('towns').select('*');
  const filters = [];

  // Check each intent
  Object.entries(intents).forEach(([key, config]) => {
    const hasIntent = config.patterns.some(pattern => searchTerms.includes(pattern));
    
    if (hasIntent) {
      switch(key) {
        case 'budget':
          const budget = config.extract(searchTerms);
          if (budget) {
            query = query.lte('typical_monthly_living_cost', budget);
            filters.push(`budget under $${budget}`);
          }
          break;
          
        case 'climate':
          const climateTypes = [];
          Object.entries(config.values).forEach(([term, types]) => {
            if (searchTerms.includes(term)) {
              climateTypes.push(...types);
            }
          });
          if (climateTypes.length > 0) {
            query = query.in('climate', climateTypes);
            filters.push(`${climateTypes.join('/')} climate`);
          }
          break;
          
        case 'healthcare':
          query = query.gte('healthcare_score', config.minScore);
          filters.push('good healthcare');
          break;
          
        case 'beach':
          query = query.contains('geographic_features', [config.geographic]);
          filters.push('coastal location');
          break;
          
        case 'safety':
          query = query.gte('safety_score', config.minScore);
          filters.push('high safety');
          break;
          
        case 'expats':
          query = query.in('expat_community_size', config.sizes);
          filters.push('expat community');
          break;
          
        case 'retirement':
          query = query.in('retirement_community_presence', config.presence);
          filters.push('retirement community');
          break;
      }
    }
  });

  // Country/region search
  const countryPatterns = {
    'europe': ['Portugal', 'Spain', 'France', 'Italy', 'Greece', 'Croatia'],
    'asia': ['Thailand', 'Malaysia', 'Vietnam', 'Philippines', 'Indonesia'],
    'latin america': ['Mexico', 'Costa Rica', 'Panama', 'Colombia', 'Ecuador'],
    'caribbean': ['Jamaica', 'Barbados', 'Trinidad and Tobago', 'Bahamas']
  };

  Object.entries(countryPatterns).forEach(([region, countries]) => {
    if (searchTerms.includes(region)) {
      query = query.in('country', countries);
      filters.push(`${region} region`);
    }
  });

  // Direct country search
  const { data: countries } = await supabase.from('towns').select('country').limit(1000);
  const uniqueCountries = [...new Set(countries?.map(c => c.country) || [])];
  const matchedCountry = uniqueCountries.find(c => searchTerms.includes(c.toLowerCase()));
  if (matchedCountry) {
    query = query.eq('country', matchedCountry);
    filters.push(matchedCountry);
  }

  // Execute search
  const { data: results, error } = await query
    .order('safety_score', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Search error:', error);
    return { results: [], filters: [], error };
  }

  // If no specific filters matched, do a fuzzy search on name/country
  if (filters.length === 0) {
    const { data: fuzzyResults } = await supabase
      .from('towns')
      .select('*')
      .or(`name.ilike.%${searchTerms}%,country.ilike.%${searchTerms}%`)
      .limit(20);
      
    return {
      results: fuzzyResults || [],
      filters: [`"${query}" in names/countries`],
      error: null
    };
  }

  return {
    results: results || [],
    filters,
    error: null
  };
}

// Get search suggestions based on partial input
export async function getSearchSuggestions(partial) {
  if (partial.length < 2) return [];
  
  const suggestions = [];
  
  // Common searches for retirees
  const commonSearches = [
    'warm beach towns under $2000',
    'safe cities with good healthcare',
    'european towns with expat communities',
    'affordable places with english speaking doctors',
    'tropical islands with retirement communities',
    'mediterranean climate low taxes'
  ];
  
  // Add matching common searches
  commonSearches.forEach(search => {
    if (search.includes(partial.toLowerCase())) {
      suggestions.push({ type: 'popular', value: search });
    }
  });
  
  // Add country suggestions
  const { data: countries } = await supabase
    .from('towns')
    .select('country')
    .ilike('country', `${partial}%`)
    .limit(5);
    
  const uniqueCountries = [...new Set(countries?.map(c => c.country) || [])];
  uniqueCountries.forEach(country => {
    suggestions.push({ type: 'country', value: country });
  });
  
  // Add town suggestions
  const { data: towns } = await supabase
    .from('towns')
    .select('name, country')
    .ilike('name', `${partial}%`)
    .limit(5);
    
  towns?.forEach(town => {
    suggestions.push({ 
      type: 'town', 
      value: `${town.name}, ${town.country}` 
    });
  });
  
  return suggestions;
}