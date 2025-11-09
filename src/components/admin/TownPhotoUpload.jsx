import { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader2, Edit2, GripVertical } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import {
  optimizeImageForTown,
  validateImageFile,
  generateTownImageFilename
} from '../../utils/imageOptimization';
import {
  IMAGE_CONFIG,
  IMAGE_SOURCES,
  IMAGE_LICENSES,
  IMAGE_SOURCE_LABELS,
  IMAGE_LICENSE_LABELS,
  DISPLAY_ORDER,
  getImageColumns,
  ERROR_MESSAGES
} from '../../config/imageConfig';

/**
 * TownPhotoUpload Component - REFACTORED
 *
 * Uses town_images table (not image_url_1/2/3)
 * Supports unlimited photos with metadata
 * Features drag-and-drop reordering
 * NO HARDCODED FIELD NAMES
 */
export default function TownPhotoUpload({ town, onPhotoUpdate }) {
  // Database-backed state (fetched from town_images table)
  const [images, setImages] = useState([]);

  // UI state (ephemeral, NOT persisted to localStorage)
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingImageId, setEditingImageId] = useState(null);
  const [draggedImageId, setDraggedImageId] = useState(null);
  const [dragOverImageId, setDragOverImageId] = useState(null);

  // Metadata form state (for modal)
  const [formSource, setFormSource] = useState('');
  const [formPhotographer, setFormPhotographer] = useState('');
  const [formLicense, setFormLicense] = useState('');

  const fileInputRef = useRef(null);

  // Fetch images from database when town changes
  useEffect(() => {
    if (town?.id) {
      loadImages();
    }
  }, [town?.id]);

  // Populate form when editing starts
  useEffect(() => {
    if (editingImageId) {
      const image = images.find(img => img[IMAGE_CONFIG.COLUMNS.ID] === editingImageId);
      if (image) {
        setFormSource(image[IMAGE_CONFIG.COLUMNS.SOURCE] || '');
        setFormPhotographer(image[IMAGE_CONFIG.COLUMNS.PHOTOGRAPHER] || '');
        setFormLicense(image[IMAGE_CONFIG.COLUMNS.LICENSE] || '');
      }
    }
  }, [editingImageId, images]);

  /**
   * Load all images for this town from database
   */
  async function loadImages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(IMAGE_CONFIG.TABLE_NAME)
        .select(getImageColumns('admin'))
        .eq(IMAGE_CONFIG.COLUMNS.TOWN_ID, town.id)
        .order(IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER, { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Upload new image file
   */
  async function handleFileUpload(file) {
    if (!file) return;

    try {
      setUploading(true);

      // Step 1: Validate
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      // Step 2: Optimize
      toast.loading('Optimizing image...', { id: 'optimize' });
      const optimizedFile = await optimizeImageForTown(file, {
        useSmartCrop: true
      });
      toast.dismiss('optimize');

      // Step 3: Determine next display_order
      const nextOrder = images.length > 0
        ? Math.max(...images.map(img => img[IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER])) + 1
        : DISPLAY_ORDER.PRIMARY;

      // Step 4: Generate filename
      const fileName = generateTownImageFilename(town, nextOrder);

      // Step 5: Upload to Supabase storage
      toast.loading('Uploading to storage...', { id: 'upload' });
      const { error: uploadError } = await supabase.storage
        .from('town-images')
        .upload(fileName, optimizedFile, {
          upsert: true,
          metadata: { town_id: town.id }
        });

      if (uploadError) throw uploadError;
      toast.dismiss('upload');

      // Step 6: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('town-images')
        .getPublicUrl(fileName);

      // Step 7: Insert to town_images table
      toast.loading('Saving to database...', { id: 'db' });
      const { error: insertError } = await supabase
        .from(IMAGE_CONFIG.TABLE_NAME)
        .insert({
          [IMAGE_CONFIG.COLUMNS.TOWN_ID]: town.id,
          [IMAGE_CONFIG.COLUMNS.IMAGE_URL]: publicUrl,
          [IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER]: nextOrder
        });

      if (insertError) throw insertError;
      toast.dismiss('db');

      // Step 8: Reload images from database
      await loadImages();

      // Step 9: Notify parent (trigger will sync towns.image_url_1)
      if (onPhotoUpdate) {
        onPhotoUpdate(town.id);
      }

      const sizeKB = (optimizedFile.size / 1024).toFixed(1);
      toast.success(`Photo uploaded! (${sizeKB}KB)`);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      toast.dismiss('optimize');
      toast.dismiss('upload');
      toast.dismiss('db');
    }
  }

  /**
   * Delete an image
   */
  async function handleDeleteImage(imageId) {
    if (!confirm('Delete this image? This cannot be undone.')) {
      return;
    }

    try {
      toast.loading('Deleting image...', { id: 'delete' });

      const { error } = await supabase
        .from(IMAGE_CONFIG.TABLE_NAME)
        .delete()
        .eq(IMAGE_CONFIG.COLUMNS.ID, imageId);

      if (error) throw error;

      // Reload images (trigger handles promotion)
      await loadImages();

      // Notify parent
      if (onPhotoUpdate) {
        onPhotoUpdate(town.id);
      }

      toast.success('Image deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
    } finally {
      toast.dismiss('delete');
    }
  }

  /**
   * Save metadata for an image
   */
  async function handleSaveMetadata(imageId, metadata) {
    try {
      toast.loading('Saving metadata...', { id: 'metadata' });

      const { error } = await supabase
        .from(IMAGE_CONFIG.TABLE_NAME)
        .update({
          [IMAGE_CONFIG.COLUMNS.SOURCE]: metadata.source || null,
          [IMAGE_CONFIG.COLUMNS.PHOTOGRAPHER]: metadata.photographer || null,
          [IMAGE_CONFIG.COLUMNS.LICENSE]: metadata.license || null
        })
        .eq(IMAGE_CONFIG.COLUMNS.ID, imageId);

      if (error) throw error;

      // Reload images
      await loadImages();

      setEditingImageId(null);
      toast.success('Metadata saved');
    } catch (error) {
      console.error('Save metadata failed:', error);
      toast.error('Failed to save metadata');
    } finally {
      toast.dismiss('metadata');
    }
  }

  /**
   * Drag and drop reordering
   */
  function handleDragStart(imageId) {
    setDraggedImageId(imageId);
  }

  function handleDragEnd() {
    setDraggedImageId(null);
    setDragOverImageId(null);
  }

  function handleDragOver(e, imageId) {
    e.preventDefault();
    setDragOverImageId(imageId);
  }

  async function handleDrop(e, targetImageId) {
    e.preventDefault();

    if (!draggedImageId || draggedImageId === targetImageId) {
      handleDragEnd();
      return;
    }

    try {
      // Find current positions
      const draggedImage = images.find(img => img[IMAGE_CONFIG.COLUMNS.ID] === draggedImageId);
      const targetImage = images.find(img => img[IMAGE_CONFIG.COLUMNS.ID] === targetImageId);

      if (!draggedImage || !targetImage) return;

      // Create new order array
      const newImages = [...images];
      const draggedIndex = newImages.findIndex(img => img[IMAGE_CONFIG.COLUMNS.ID] === draggedImageId);
      const targetIndex = newImages.findIndex(img => img[IMAGE_CONFIG.COLUMNS.ID] === targetImageId);

      // Swap positions
      newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedImage);

      // Update display_order for all affected images
      const updates = newImages.map((img, index) => ({
        id: img[IMAGE_CONFIG.COLUMNS.ID],
        displayOrder: index + 1
      }));

      // Optimistic UI update
      setImages(newImages.map((img, index) => ({
        ...img,
        [IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER]: index + 1
      })));

      // Save to database
      toast.loading('Reordering...', { id: 'reorder' });

      // Strategy: Add offset first to avoid UNIQUE constraint, then set final values
      const TEMP_OFFSET = 1000;

      // Step 1: Add offset to all (e.g., 1→1001, 2→1002, 3→1003)
      for (const update of updates) {
        const { error } = await supabase
          .from(IMAGE_CONFIG.TABLE_NAME)
          .update({ [IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER]: update.displayOrder + TEMP_OFFSET })
          .eq(IMAGE_CONFIG.COLUMNS.ID, update.id);

        if (error) throw error;
      }

      // Step 2: Set to final values (e.g., 1001→1, 1002→2, 1003→3)
      for (const update of updates) {
        const { error } = await supabase
          .from(IMAGE_CONFIG.TABLE_NAME)
          .update({ [IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER]: update.displayOrder })
          .eq(IMAGE_CONFIG.COLUMNS.ID, update.id);

        if (error) throw error;
      }

      // Reload to confirm
      await loadImages();

      // Notify parent (if primary changed)
      if (updates[0].id !== images[0][IMAGE_CONFIG.COLUMNS.ID] && onPhotoUpdate) {
        onPhotoUpdate(town.id);
      }

      toast.success('Photos reordered');
    } catch (error) {
      console.error('Reorder failed:', error);
      toast.error('Failed to reorder photos');
      // Reload to restore correct order
      await loadImages();
    } finally {
      toast.dismiss('reorder');
      handleDragEnd();
    }
  }

  /**
   * Render individual image card
   */
  function renderImageCard(image) {
    const imageId = image[IMAGE_CONFIG.COLUMNS.ID];
    const imageUrl = image[IMAGE_CONFIG.COLUMNS.IMAGE_URL];
    const displayOrder = image[IMAGE_CONFIG.COLUMNS.DISPLAY_ORDER];
    const source = image[IMAGE_CONFIG.COLUMNS.SOURCE];
    const photographer = image[IMAGE_CONFIG.COLUMNS.PHOTOGRAPHER];
    const license = image[IMAGE_CONFIG.COLUMNS.LICENSE];

    const isFirst = displayOrder === DISPLAY_ORDER.PRIMARY;
    const hasMetadata = source || photographer || license;
    const isDragging = draggedImageId === imageId;
    const isOver = dragOverImageId === imageId;

    return (
      <div
        key={imageId}
        draggable
        onDragStart={() => handleDragStart(imageId)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, imageId)}
        onDrop={(e) => handleDrop(e, imageId)}
        className={`
          relative group cursor-move
          border-2 rounded-lg overflow-hidden transition-all
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
          ${isOver ? 'border-scout-accent' : 'border-gray-300 dark:border-gray-600'}
        `}
      >
        {/* Display order badge */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <GripVertical size={12} />
            #{displayOrder}
            {isFirst && ' (Primary)'}
          </span>
        </div>

        {/* Metadata badge */}
        {hasMetadata && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
              ✓ Metadata
            </span>
          </div>
        )}

        {/* Image preview */}
        <img
          src={`${imageUrl}?t=${Date.now()}`}
          alt={`${town.town_name} - Photo ${displayOrder}`}
          className="w-full aspect-[4/3] object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
          }}
        />

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={() => setEditingImageId(imageId)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Edit metadata"
          >
            <Edit2 size={24} className="text-white" />
          </button>
          <button
            onClick={() => handleDeleteImage(imageId)}
            className="p-3 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
            title="Delete photo"
          >
            <Trash2 size={24} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render add new photo card
   */
  function renderAddPhotoCard() {
    return (
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files?.[0] && !uploading) {
            handleFileUpload(files[0]);
          }
        }}
        className={`
          aspect-[4/3] border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center
          cursor-pointer transition-all
          ${uploading
            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent hover:bg-scout-accent/5'
          }
        `}
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="text-scout-accent animate-spin" />
            <span className="text-sm text-gray-500 mt-2">Uploading...</span>
          </>
        ) : (
          <>
            <Upload size={32} className="text-gray-400" />
            <span className="text-sm text-gray-500 mt-2">Add Photo</span>
            <span className="text-xs text-gray-400">Click or drag to upload</span>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </div>
    );
  }

  /**
   * Render metadata editor modal
   */
  function renderMetadataModal() {
    if (!editingImageId) return null;

    const image = images.find(img => img[IMAGE_CONFIG.COLUMNS.ID] === editingImageId);
    if (!image) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingImageId(null)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Edit Image Metadata
          </h3>

          {/* Source */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <select
              value={formSource}
              onChange={(e) => setFormSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select source...</option>
              {Object.entries(IMAGE_SOURCES).map(([key, value]) => (
                <option key={key} value={value}>
                  {IMAGE_SOURCE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Photographer */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photographer (optional)
            </label>
            <input
              type="text"
              value={formPhotographer}
              onChange={(e) => setFormPhotographer(e.target.value)}
              placeholder="Photographer name or username"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* License */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License
            </label>
            <select
              value={formLicense}
              onChange={(e) => setFormLicense(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select license...</option>
              {Object.entries(IMAGE_LICENSES).map(([key, value]) => (
                <option key={key} value={value}>
                  {IMAGE_LICENSE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                handleSaveMetadata(editingImageId, {
                  source: formSource,
                  photographer: formPhotographer,
                  license: formLicense
                });
              }}
              className="flex-1 px-4 py-2 bg-scout-accent text-white rounded-lg hover:bg-scout-accent/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingImageId(null)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-scout-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Town Photos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload unlimited photos. Drag to reorder. Primary photo (first) displays in search results.
          </p>
        </div>
        {/* CC Images Search Button */}
        <button
          onClick={() => {
            const geoRegion = town.geo_region && Array.isArray(town.geo_region) && town.geo_region.length > 0
              ? town.geo_region[0]
              : (town.region || '');
            const searchQuery = `${town.town_name} ${geoRegion} ${town.country}`;
            const googleImagesUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch&tbs=sur:cl`;
            window.open(googleImagesUrl, '_blank', 'width=1200,height=800');
          }}
          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          title="Search Google Images with Creative Commons license filter"
        >
          <ImageIcon size={16} />
          🖼️ CC Images
        </button>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map(image => renderImageCard(image))}
        {renderAddPhotoCard()}
      </div>

      {/* Guidelines */}
      <div className={`p-4 rounded-lg ${uiConfig.colors.cardSecondary} border ${uiConfig.colors.borderLight}`}>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Photo Guidelines
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Format:</strong> JPEG, PNG, or WebP (max 10MB)</li>
          <li>• <strong>Output:</strong> Automatically resized to 800x600px</li>
          <li>• <strong>Quality:</strong> Compressed to ~100-200KB</li>
          <li>• <strong>Primary photo</strong> (first position) displays in search results</li>
          <li>• <strong>Drag photos</strong> to reorder them</li>
          <li>• <strong>Add metadata</strong> for proper attribution</li>
        </ul>
      </div>

      {/* Metadata modal */}
      {renderMetadataModal()}
    </div>
  );
}
