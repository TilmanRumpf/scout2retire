/**
 * Lean query functions for efficient hobby matching
 * Leverages the fact that all towns now have 20+ common hobbies
 */

import supabase from './supabaseClient.js';

/**
 * Get the 20 common hobbies that ALL towns have
 * These can be cached as they're universal
 */
export async function getCommonHobbies() {
  // Cache for 24 hours since these rarely change
  const cacheKey = 'common_hobbies';
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 86400000) { // 24 hours
      return data;
    }
  }
  
  try {
    // Get the first 20 universal hobbies (all towns have these)
    const { data, error } = await supabase
      .from('hobbies')
      .select('id, name, category')
      .eq('is_universal', true)
      .order('name')
      .limit(20);
    
    if (error) throw error;
    
    // Cache the result
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Error fetching common hobbies:', error);
    return [];
  }
}

/**
 * LEAN query to match user hobbies with towns
 * Optimized for performance with minimal database calls
 */
export async function leanHobbyMatch(userActivities = [], userInterests = []) {
  try {
    // 1. Combine user selections
    const userHobbyNames = [...userActivities, ...userInterests];
    
    // No hobbies = all towns are equal
    if (userHobbyNames.length === 0) {
      return {
        matchType: 'flexible',
        message: 'All towns suitable - user has no specific hobby preferences',
        townScores: null
      };
    }
    
    // 2. Get hobby IDs for user selections (single query)
    const { data: userHobbyData, error: hobbyError } = await supabase
      .from('hobbies')
      .select('id, name, is_universal')
      .in('name', userHobbyNames);
    
    if (hobbyError) throw hobbyError;
    
    const universalHobbyIds = [];
    const specificHobbyIds = [];
    
    userHobbyData.forEach(h => {
      if (h.is_universal) {
        universalHobbyIds.push(h.id);
      } else {
        specificHobbyIds.push(h.id);
      }
    });
    
    // 3. Build efficient query based on hobby types
    if (specificHobbyIds.length === 0) {
      // User only wants universal hobbies - ALL towns are perfect matches
      return {
        matchType: 'universal_only',
        message: `All ${universalHobbyIds.length} hobbies are available everywhere`,
        score: 100,
        townScores: null // No need to score individual towns
      };
    }
    
    // 4. LEAN query - only get towns with specific hobbies
    // Use PostgreSQL's array operations for efficiency
    const { data: townMatches, error: matchError } = await supabase
      .rpc('get_towns_with_hobbies', {
        hobby_ids: specificHobbyIds,
        min_matches: Math.floor(specificHobbyIds.length * 0.5) // At least 50% match
      });
    
    if (matchError) {
      // Fallback to standard query if RPC doesn't exist
      console.log('Using fallback query...');
      
      const { data: townHobbies, error: fallbackError } = await supabase
        .from('town_hobbies')
        .select('town_id, hobby_id')
        .in('hobby_id', specificHobbyIds);
      
      if (fallbackError) throw fallbackError;
      
      // Group by town and count matches
      const townCounts = {};
      townHobbies.forEach(th => {
        townCounts[th.town_id] = (townCounts[th.town_id] || 0) + 1;
      });
      
      // Get town details for top matches
      const topTownIds = Object.entries(townCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([townId]) => townId);
      
      const { data: towns } = await supabase
        .from('towns')
        .select('id, name, country')
        .in('id', topTownIds);
      
      // Calculate scores
      const results = towns.map(town => ({
        ...town,
        hobby_matches: townCounts[town.id] || 0,
        hobby_score: Math.round(
          ((townCounts[town.id] || 0) + universalHobbyIds.length) / 
          userHobbyNames.length * 100
        )
      }));
      
      return {
        matchType: 'calculated',
        townScores: results.sort((a, b) => b.hobby_score - a.hobby_score)
      };
    }
    
    return {
      matchType: 'efficient',
      townScores: townMatches
    };
    
  } catch (error) {
    console.error('Lean hobby match error:', error);
    return {
      matchType: 'error',
      error: error.message
    };
  }
}

/**
 * Create the RPC function in Supabase for optimal performance
 * Run this SQL in Supabase SQL editor:
 */
export const CREATE_RPC_SQL = `
-- Efficient function to find towns with specific hobbies
CREATE OR REPLACE FUNCTION get_towns_with_hobbies(
  hobby_ids UUID[],
  min_matches INT DEFAULT 1
)
RETURNS TABLE (
  town_id UUID,
  town_name TEXT,
  town_country TEXT,
  hobby_matches BIGINT,
  hobby_score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as town_id,
    t.name as town_name,
    t.country as town_country,
    COUNT(th.hobby_id) as hobby_matches,
    ROUND((COUNT(th.hobby_id)::NUMERIC / array_length(hobby_ids, 1)) * 100)::INT as hobby_score
  FROM towns t
  JOIN town_hobbies th ON t.id = th.town_id
  WHERE 
    th.hobby_id = ANY(hobby_ids)
    AND t.image_url_1 IS NOT NULL
  GROUP BY t.id, t.name, t.country
  HAVING COUNT(th.hobby_id) >= min_matches
  ORDER BY hobby_matches DESC, t.name
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_town_hobbies_hobby_id ON town_hobbies(hobby_id);
CREATE INDEX IF NOT EXISTS idx_town_hobbies_town_id ON town_hobbies(town_id);
`;

/**
 * Quick check if a town has specific hobbies (for detail pages)
 */
export async function townHasHobbies(townId, hobbyNames) {
  try {
    const { data, error } = await supabase
      .from('town_hobbies')
      .select('hobby:hobbies(name)')
      .eq('town_id', townId);
    
    if (error) throw error;
    
    const townHobbyNames = data.map(d => d.hobby.name);
    const matches = hobbyNames.filter(h => townHobbyNames.includes(h));
    
    return {
      hasAll: matches.length === hobbyNames.length,
      matches,
      missing: hobbyNames.filter(h => !townHobbyNames.includes(h)),
      totalHobbies: townHobbyNames.length
    };
    
  } catch (error) {
    console.error('Error checking town hobbies:', error);
    return {
      hasAll: false,
      matches: [],
      missing: hobbyNames,
      totalHobbies: 0
    };
  }
}