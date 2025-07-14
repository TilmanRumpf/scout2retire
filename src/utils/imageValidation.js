// Universal image validation for towns
// This ensures NO town without a valid image is ever displayed

export function hasValidImage(town) {
  if (!town || !town.image_url_1) return false;
  
  const url = town.image_url_1;
  
  // Check for null/empty values
  if (url === null || url === undefined || url === '') return false;
  
  // Check for string representations of null
  const lowerUrl = url.toString().toLowerCase().trim();
  if (lowerUrl === 'null' || lowerUrl === 'undefined' || lowerUrl === '') return false;
  
  // Check for placeholder or invalid URLs
  if (lowerUrl.includes('placeholder') || lowerUrl.includes('null')) return false;
  
  // Check for malformed URLs
  if (url.includes('https://https://') || url.includes('http://http://')) {
    console.error(`Malformed URL detected (double protocol): ${url}`);
    return false;
  }
  
  // Check for missing colon after protocol
  if (url.includes('https//') || url.includes('http//')) {
    console.error(`Malformed URL detected (missing colon): ${url}`);
    return false;
  }
  
  // Check for double slashes in path (after protocol)
  const protocolEnd = url.indexOf('://') + 3;
  if (protocolEnd > 3 && url.indexOf('//', protocolEnd) !== -1) {
    console.error(`Malformed URL detected (double slash in path): ${url}`);
    return false;
  }
  
  // Must be a valid URL
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) return false;
  
  return true;
}

// Filter an array of towns to only include those with valid images
export function filterTownsWithImages(towns) {
  if (!Array.isArray(towns)) return [];
  return towns.filter(hasValidImage);
}

// Log warning when filtering out towns
export function filterTownsWithImagesDebug(towns, context = 'Unknown') {
  if (!Array.isArray(towns)) return [];
  
  const validTowns = towns.filter(hasValidImage);
  const removedCount = towns.length - validTowns.length;
  
  if (removedCount > 0) {
    console.warn(`[${context}] Filtered out ${removedCount} towns without valid images:`, 
      towns.filter(t => !hasValidImage(t)).map(t => t.name)
    );
  }
  
  return validTowns;
}