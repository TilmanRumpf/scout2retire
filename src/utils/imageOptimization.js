/**
 * Image Optimization Utilities for Town Photos
 *
 * Features:
 * - AI smart crop using smartcrop.js (focuses on main subject)
 * - Resize to 800x600px
 * - Compress to 80-85% quality, targeting 100-200KB
 * - Fallback to center crop if AI fails
 *
 * Target specs (from docs/IMAGE_STORAGE_GUIDELINES.md):
 * - Resolution: 800x600px
 * - Format: JPEG
 * - Quality: 80-85%
 * - Size: 100-200KB
 */

import smartcrop from 'smartcrop';
import imageCompression from 'browser-image-compression';

const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 600;
const TARGET_SIZE_KB = 200; // Maximum target size
const JPEG_QUALITY = 0.85; // 85% quality

/**
 * Apply smart crop to focus on the main subject
 * Falls back to center crop if AI detection fails
 */
async function applySmartCrop(imageElement, targetWidth, targetHeight) {
  try {
    // Use smartcrop.js to find the best crop area
    const result = await smartcrop.crop(imageElement, {
      width: targetWidth,
      height: targetHeight,
      minScale: 1.0
    });

    if (!result || !result.topCrop) {
      throw new Error('Smart crop failed to find suitable crop area');
    }

    const crop = result.topCrop;

    // Create a canvas with the cropped area
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Draw the cropped portion
    ctx.drawImage(
      imageElement,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return canvas;
  } catch (error) {
    console.warn('Smart crop failed, falling back to center crop:', error.message);
    return centerCrop(imageElement, targetWidth, targetHeight);
  }
}

/**
 * Fallback: Center crop the image
 */
function centerCrop(imageElement, targetWidth, targetHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  // Calculate aspect ratios
  const imgRatio = imageElement.width / imageElement.height;
  const targetRatio = targetWidth / targetHeight;

  let sourceWidth, sourceHeight, sourceX, sourceY;

  if (imgRatio > targetRatio) {
    // Image is wider - crop sides
    sourceHeight = imageElement.height;
    sourceWidth = sourceHeight * targetRatio;
    sourceX = (imageElement.width - sourceWidth) / 2;
    sourceY = 0;
  } else {
    // Image is taller - crop top/bottom
    sourceWidth = imageElement.width;
    sourceHeight = sourceWidth / targetRatio;
    sourceX = 0;
    sourceY = (imageElement.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    imageElement,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas;
}

/**
 * Convert canvas to blob with compression
 */
async function canvasToBlob(canvas, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Load image from file into an Image element
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Main optimization function
 *
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optional configuration
 * @returns {Promise<File>} - Optimized image file
 */
export async function optimizeImageForTown(file, options = {}) {
  const {
    width = TARGET_WIDTH,
    height = TARGET_HEIGHT,
    maxSizeKB = TARGET_SIZE_KB,
    quality = JPEG_QUALITY,
    useSmartCrop = true
  } = options;

  try {
    // Step 1: Load the image
    const img = await loadImage(file);

    // Step 2: Apply smart crop or center crop
    const canvas = useSmartCrop
      ? await applySmartCrop(img, width, height)
      : centerCrop(img, width, height);

    // Step 3: Convert to blob with initial quality
    let blob = await canvasToBlob(canvas, quality);
    let currentQuality = quality;

    // Step 4: Iteratively reduce quality if file is too large
    // Try up to 5 times to hit the target size
    let attempts = 0;
    const maxAttempts = 5;

    while (blob.size > maxSizeKB * 1024 && attempts < maxAttempts && currentQuality > 0.5) {
      // Reduce quality by 10% each iteration
      currentQuality -= 0.1;
      blob = await canvasToBlob(canvas, currentQuality);
      attempts++;
    }

    // Step 5: Create a new File object with the optimized blob
    const optimizedFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '.jpg'), // Force .jpg extension
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    );

    // Log results
    const originalSizeKB = (file.size / 1024).toFixed(1);
    const optimizedSizeKB = (optimizedFile.size / 1024).toFixed(1);
    const reduction = ((1 - optimizedFile.size / file.size) * 100).toFixed(1);

    console.log('Image optimization complete:', {
      original: `${originalSizeKB}KB`,
      optimized: `${optimizedSizeKB}KB`,
      reduction: `${reduction}%`,
      quality: `${(currentQuality * 100).toFixed(0)}%`,
      dimensions: `${width}x${height}px`,
      smartCrop: useSmartCrop
    });

    return optimizedFile;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file) {
  const errors = [];

  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }

  // Check file size (max 10MB input)
  const maxInputSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxInputSize) {
    errors.push(`File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  // Check if it's a supported format
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    errors.push('Unsupported format. Please use JPEG, PNG, or WebP');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate filename for town image
 * Format: {country-code}-{town-slug}-{slot}.jpg
 * Example: pt-porto-1.jpg
 */
export function generateTownImageFilename(town, slot = 1) {
  const countryCode = (town.country || 'unknown').toLowerCase().substring(0, 2);
  const townSlug = (town.name || 'unknown')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30); // Limit length

  return `${countryCode}-${townSlug}-${slot}.jpg`;
}
