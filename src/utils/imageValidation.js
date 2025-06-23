// Image validation and management system for Scout2Retire
// Prevents missing images, wrong images, and provides intelligent fallbacks

import supabase from './supabaseClient';

// Default fallback images by category (using Unsplash for reliability)
const FALLBACK_IMAGES = {
  // By region/country
  portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80', // Porto cityscape
  spain: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=800&q=80', // Valencia architecture
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // French Riviera
  italy: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', // Venice canals
  greece: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80', // Santorini
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', // Istanbul
  mexico: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80', // Mexican colonial
  costarica: 'https://images.unsplash.com/photo-1552983745-869bdeee0ae2?w=800&q=80', // Costa Rica beach
  panama: 'https://images.unsplash.com/photo-1558029062-a37889b87526?w=800&q=80', // Panama City skyline
  ecuador: 'https://images.unsplash.com/photo-1588861472016-06888ac7ec29?w=800&q=80', // Quito historic
  colombia: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80', // Cartagena
  thailand: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80', // Thai temple
  malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80', // KL skyline
  vietnam: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&q=80', // Ha Long Bay
  netherlands: 'https://images.unsplash.com/photo-1583295125721-766a0088cd3f?w=800&q=80', // Amsterdam canals
  latvia: 'https://images.unsplash.com/photo-1638266219817-b8dd83c63011?w=800&q=80', // Riga architecture
  slovenia: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80', // Ljubljana
  croatia: 'https://images.unsplash.com/photo-1559598370-aba08546c4d7?w=800&q=80', // Dubrovnik
  malta: 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?w=800&q=80', // Valletta harbor
  
  // By geographic feature
  coastal: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
  mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  island: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  lake: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
  river: 'https://images.unsplash.com/photo-1527004760902-2e38e43c5730?w=800&q=80',
  valley: 'https://images.unsplash.com/photo-1506125840744-167167210587?w=800&q=80',
  desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
  forest: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
  plains: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
  
  // By living environment
  urban: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  suburban: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  rural: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  
  // Ultimate fallback
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' // Travel planning
};

// Blocked/problematic image patterns
const BLOCKED_PATTERNS = [
  // Animals that shouldn't represent locations
  /rabbit/i,
  /bunny/i,
  /cat(?!hedral)/i, // Allow 'cathedral' but not 'cat'
  /dog/i,
  /pet/i,
  /animal/i,
  /zoo/i,
  
  // Generic stock photos
  /business.*meeting/i,
  /office.*worker/i,
  /stock.*photo/i,
  /placeholder/i,
  
  // Inappropriate content
  /error/i,
  /404/i,
  /not.*found/i,
  /broken/i,
  /missing/i
];

// Valid image patterns by location
const LOCATION_PATTERNS = {
  portugal: [/porto/i, /lisbon/i, /lisboa/i, /algarve/i, /douro/i, /azulejo/i, /tram/i],
  spain: [/barcelona/i, /madrid/i, /valencia/i, /seville/i, /malaga/i, /plaza/i, /tapas/i],
  france: [/paris/i, /nice/i, /provence/i, /riviera/i, /lyon/i, /marseille/i],
  italy: [/rome/i, /venice/i, /florence/i, /milan/i, /tuscany/i, /amalfi/i],
  greece: [/athens/i, /santorini/i, /mykonos/i, /crete/i, /acropolis/i, /aegean/i],
  turkey: [/istanbul/i, /ankara/i, /cappadocia/i, /antalya/i, /bodrum/i, /mosque/i],
  mexico: [/mexico.*city/i, /cancun/i, /playa/i, /colonial/i, /aztec/i, /beach/i],
  panama: [/panama.*city/i, /canal/i, /skyline/i, /casco.*viejo/i, /bocas/i, /boquete/i],
  costarica: [/san.*jose/i, /beach/i, /rainforest/i, /volcano/i, /wildlife/i, /tamarindo/i],
  thailand: [/bangkok/i, /chiang.*mai/i, /phuket/i, /temple/i, /buddha/i, /street.*food/i],
  malaysia: [/kuala.*lumpur/i, /penang/i, /langkawi/i, /petronas/i, /street.*art/i],
  vietnam: [/hanoi/i, /saigon/i, /ho.*chi.*minh/i, /ha.*long/i, /mekong/i, /pho/i],
  netherlands: [/amsterdam/i, /canal/i, /tulip/i, /windmill/i, /bike/i, /bicycle/i],
  malta: [/valletta/i, /mdina/i, /harbor/i, /harbour/i, /knights/i, /mediterranean/i]
};

/**
 * Validate if an image URL is appropriate for a location
 */
export const validateImageUrl = (imageUrl, location) => {
  if (!imageUrl) return { valid: false, reason: 'No image URL provided' };
  
  // Check if URL is accessible (basic check)
  try {
    new URL(imageUrl);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
  
  // Check against blocked patterns
  const urlLower = imageUrl.toLowerCase();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(urlLower)) {
      return { valid: false, reason: `Blocked pattern detected: ${pattern}` };
    }
  }
  
  // If we have location-specific patterns, check for relevance
  const country = location.country?.toLowerCase();
  if (country && LOCATION_PATTERNS[country]) {
    const hasRelevantPattern = LOCATION_PATTERNS[country].some(pattern => 
      pattern.test(urlLower)
    );
    // We don't reject if no pattern matches, but we flag it for review
    if (!hasRelevantPattern) {
      return { valid: true, warning: 'No location-specific pattern detected' };
    }
  }
  
  return { valid: true };
};

/**
 * Get appropriate fallback image for a location
 */
export const getFallbackImage = (location) => {
  // Try country-specific fallback first
  const country = location.country?.toLowerCase().replace(/\s+/g, '');
  if (country && FALLBACK_IMAGES[country]) {
    return FALLBACK_IMAGES[country];
  }
  
  // Try geographic feature fallback
  if (location.geographic_features) {
    const features = Array.isArray(location.geographic_features) 
      ? location.geographic_features 
      : [location.geographic_features];
    
    for (const feature of features) {
      const featureLower = feature.toLowerCase();
      if (FALLBACK_IMAGES[featureLower]) {
        return FALLBACK_IMAGES[featureLower];
      }
    }
  }
  
  // Try living environment fallback
  if (location.living_environments) {
    const environments = Array.isArray(location.living_environments)
      ? location.living_environments
      : [location.living_environments];
    
    for (const env of environments) {
      const envLower = env.toLowerCase();
      if (FALLBACK_IMAGES[envLower]) {
        return FALLBACK_IMAGES[envLower];
      }
    }
  }
  
  // Ultimate fallback
  return FALLBACK_IMAGES.default;
};

/**
 * Process and validate image for a location
 */
export const processLocationImage = async (location, imageUrl) => {
  // Validate the image
  const validation = validateImageUrl(imageUrl, location);
  
  if (!validation.valid) {
    console.warn(`Invalid image for ${location.name}, ${location.country}: ${validation.reason}`);
    return {
      url: getFallbackImage(location),
      isFallback: true,
      reason: validation.reason
    };
  }
  
  if (validation.warning) {
    console.warn(`Image warning for ${location.name}, ${location.country}: ${validation.warning}`);
  }
  
  // Try to load the image (with timeout)
  try {
    const imageLoadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = imageUrl;
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Image load timeout')), 5000)
    );
    
    await Promise.race([imageLoadPromise, timeoutPromise]);
    
    return {
      url: imageUrl,
      isFallback: false,
      validated: true
    };
  } catch (error) {
    console.warn(`Failed to load image for ${location.name}: ${error.message}`);
    return {
      url: getFallbackImage(location),
      isFallback: true,
      reason: error.message
    };
  }
};

/**
 * Batch validate all images in the database
 */
export const validateAllTownImages = async () => {
  try {
    // Fetch all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1, geographic_features, living_environments');
    
    if (error) throw error;
    
    const results = {
      total: towns.length,
      valid: 0,
      invalid: 0,
      fallback: 0,
      updates: []
    };
    
    // Process each town
    for (const town of towns) {
      const imageResult = await processLocationImage(town, town.image_url_1);
      
      if (imageResult.isFallback) {
        results.fallback++;
        results.updates.push({
          id: town.id,
          name: town.name,
          country: town.country,
          oldImage: town.image_url_1,
          newImage: imageResult.url,
          reason: imageResult.reason
        });
      } else if (imageResult.validated) {
        results.valid++;
      } else {
        results.invalid++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating town images:', error);
    throw error;
  }
};

/**
 * Update town with validated image
 */
export const updateTownImage = async (townId, newImageUrl, reason) => {
  try {
    const { error } = await supabase
      .from('towns')
      .update({ 
        image_url_1: newImageUrl,
        image_validation_note: reason,
        image_validated_at: new Date().toISOString()
      })
      .eq('id', townId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating town image:', error);
    return { success: false, error };
  }
};

/**
 * Get image with validation for display
 */
export const getValidatedImage = async (location) => {
  // If no image URL, return fallback immediately
  if (!location.image_url_1) {
    return getFallbackImage(location);
  }
  
  // Process and validate the image
  const result = await processLocationImage(location, location.image_url_1);
  return result.url;
};

// Export for use in components
export default {
  validateImageUrl,
  getFallbackImage,
  processLocationImage,
  validateAllTownImages,
  updateTownImage,
  getValidatedImage,
  FALLBACK_IMAGES
};