import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { IMAGE_CONFIG, getImageColumns } from '../config/imageConfig';
import OptimizedImage from './OptimizedImage';

/**
 * TownCardImageCarousel
 *
 * Displays town images with manual navigation
 * - Shows primary photo by default
 * - Arrow buttons appear on hover
 * - Dots indicator shows current position
 * - Fetches images from town_images table
 * - NO HARDCODED field names
 */
export default function TownCardImageCarousel({
  townId,
  townName,
  fallbackImageUrl,
  className = '',
  height = 'h-48'
}) {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch images from database
  useEffect(() => {
    if (!townId) return;

    async function loadImages() {
      try {
        const { data, error } = await supabase
          .from(IMAGE_CONFIG.TABLE_NAME)
          .select(getImageColumns('minimal'))
          .eq(IMAGE_CONFIG.COLUMNS.TOWN_ID, townId)
          .order(IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER, { ascending: true });

        if (error) {
          console.error('Failed to load town images:', error);
          // Fallback to legacy image_url_1
          if (fallbackImageUrl) {
            setImages([{ [IMAGE_CONFIG.COLUMNS.IMAGE_URL]: fallbackImageUrl }]);
          }
        } else if (data && data.length > 0) {
          setImages(data);
        } else if (fallbackImageUrl) {
          // No images in town_images table, use fallback
          setImages([{ [IMAGE_CONFIG.COLUMNS.IMAGE_URL]: fallbackImageUrl }]);
        }
      } catch (err) {
        console.error('Error loading images:', err);
        if (fallbackImageUrl) {
          setImages([{ [IMAGE_CONFIG.COLUMNS.IMAGE_URL]: fallbackImageUrl }]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [townId, fallbackImageUrl]);

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  if (loading) {
    return (
      <div className={`${height} bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    );
  }

  return (
    <div
      className={`relative ${height} group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Current Image */}
      <OptimizedImage
        src={currentImage?.[IMAGE_CONFIG.COLUMNS.IMAGE_URL] || fallbackImageUrl}
        alt={`${townName} - Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        fallbackIconSize={24}
      />

      {/* Navigation Arrows (only show if multiple images) */}
      {hasMultipleImages && isHovered && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator (only show if multiple images) */}
      {hasMultipleImages && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleDotClick(e, index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Photo Count Badge (only show if multiple images and hovered) */}
      {hasMultipleImages && isHovered && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
