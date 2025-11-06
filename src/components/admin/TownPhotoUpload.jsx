import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import {
  optimizeImageForTown,
  validateImageFile,
  generateTownImageFilename
} from '../../utils/imageOptimization';

/**
 * TownPhotoUpload Component
 *
 * Handles uploading and managing photos for a town
 * Supports up to 3 photos (image_url_1, image_url_2, image_url_3)
 * Features:
 * - Drag and drop upload
 * - AI smart crop with auto-resize to 800x600px
 * - Auto-compression to 100-200KB
 * - Automatic Supabase storage upload
 * - Automatic database URL population
 */
export default function TownPhotoUpload({ town, onPhotoUpdate }) {
  const [uploading, setUploading] = useState({
    slot1: false,
    slot2: false,
    slot3: false
  });
  const [dragOver, setDragOver] = useState({
    slot1: false,
    slot2: false,
    slot3: false
  });

  const fileInputRefs = {
    slot1: useRef(null),
    slot2: useRef(null),
    slot3: useRef(null)
  };

  // Get current photo URLs
  const photoUrls = {
    slot1: town.image_url_1,
    slot2: town.image_url_2,
    slot3: town.image_url_3
  };

  /**
   * Handle file upload for a specific slot
   */
  const handleFileUpload = async (file, slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const urlField = `image_url_${slotNumber}`;

    try {
      setUploading(prev => ({ ...prev, [slotKey]: true }));

      // Step 1: Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      // Step 2: Optimize image (resize, crop, compress)
      toast.loading('Optimizing image...', { id: 'optimize' });
      const optimizedFile = await optimizeImageForTown(file, {
        useSmartCrop: true
      });
      toast.dismiss('optimize');

      // Step 3: Generate filename
      const fileName = generateTownImageFilename(town, slotNumber);

      // Step 4: Upload to Supabase storage with metadata for RLS
      toast.loading('Uploading to storage...', { id: 'upload' });
      const { error: uploadError } = await supabase.storage
        .from('town-images')
        .upload(fileName, optimizedFile, {
          upsert: true,
          metadata: {
            town_id: town.id  // For RLS policy per-town access control
          }
        });

      if (uploadError) throw uploadError;
      toast.dismiss('upload');

      // Step 5: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('town-images')
        .getPublicUrl(fileName);

      // Step 6: Update database
      toast.loading('Updating database...', { id: 'db' });
      const { error: updateError } = await supabase
        .from('towns')
        .update({ [urlField]: publicUrl })
        .eq('id', town.id);

      if (updateError) throw updateError;
      toast.dismiss('db');

      // Step 7: Notify parent component
      if (onPhotoUpdate) {
        onPhotoUpdate({
          ...town,
          [urlField]: publicUrl
        });
      }

      const sizeKB = (optimizedFile.size / 1024).toFixed(1);
      toast.success(`Photo ${slotNumber} uploaded! (${sizeKB}KB)`);

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(`Failed to upload photo: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [slotKey]: false }));
      toast.dismiss('optimize');
      toast.dismiss('upload');
      toast.dismiss('db');
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (event, slotNumber) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    handleFileUpload(event.target.files[0], slotNumber);
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e, slotNumber) => {
    e.preventDefault();
    e.stopPropagation();
    const slotKey = `slot${slotNumber}`;
    setDragOver(prev => ({ ...prev, [slotKey]: true }));
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e, slotNumber) => {
    e.preventDefault();
    e.stopPropagation();
    const slotKey = `slot${slotNumber}`;
    setDragOver(prev => ({ ...prev, [slotKey]: false }));
  };

  /**
   * Handle drop
   */
  const handleDrop = (e, slotNumber) => {
    e.preventDefault();
    e.stopPropagation();
    const slotKey = `slot${slotNumber}`;
    setDragOver(prev => ({ ...prev, [slotKey]: false }));

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], slotNumber);
    }
  };

  /**
   * Remove photo from a slot
   */
  const handleRemovePhoto = async (slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const urlField = `image_url_${slotNumber}`;

    try {
      setUploading(prev => ({ ...prev, [slotKey]: true }));

      // Update database to null
      const { error } = await supabase
        .from('towns')
        .update({ [urlField]: null })
        .eq('id', town.id);

      if (error) throw error;

      // Notify parent component
      if (onPhotoUpdate) {
        onPhotoUpdate({
          ...town,
          [urlField]: null
        });
      }

      toast.success(`Photo ${slotNumber} removed`);

    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    } finally {
      setUploading(prev => ({ ...prev, [slotKey]: false }));
    }
  };

  /**
   * Render a single photo slot
   */
  const renderPhotoSlot = (slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const photoUrl = photoUrls[slotKey];
    const isUploading = uploading[slotKey];
    const isDragging = dragOver[slotKey];

    return (
      <div key={slotKey} className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Photo {slotNumber} {slotNumber === 1 && '(Primary)'}
        </label>

        <div
          onDragOver={(e) => handleDragOver(e, slotNumber)}
          onDragLeave={(e) => handleDragLeave(e, slotNumber)}
          onDrop={(e) => handleDrop(e, slotNumber)}
          className={`
            relative group
            w-full aspect-[4/3] rounded-lg overflow-hidden
            border-2 border-dashed transition-all
            ${isDragging
              ? 'border-scout-accent bg-scout-accent/10'
              : photoUrl
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent'
            }
            ${uiConfig.colors.card}
          `}
        >
          {photoUrl ? (
            // Photo preview
            <>
              <img
                src={photoUrl}
                alt={`${town.town_name} - Photo ${slotNumber}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => fileInputRefs[slotKey].current?.click()}
                  disabled={isUploading}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Replace photo"
                >
                  <Upload size={24} className="text-white" />
                </button>
                <button
                  onClick={() => handleRemovePhoto(slotNumber)}
                  disabled={isUploading}
                  className="p-3 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 size={24} className="text-white" />
                </button>
              </div>
            </>
          ) : (
            // Upload prompt
            <button
              onClick={() => fileInputRefs[slotKey].current?.click()}
              disabled={isUploading}
              className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 size={32} className="text-scout-accent animate-spin" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Auto-resizes to 800x600px
                  </span>
                </>
              )}
            </button>
          )}

          {/* Loading overlay */}
          {isUploading && photoUrl && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={40} className="text-white animate-spin mx-auto mb-2" />
                <span className="text-sm text-white">Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRefs[slotKey]}
          type="file"
          accept="image/*"
          onChange={(e) => handleInputChange(e, slotNumber)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Town Photos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload up to 3 photos. Images will be auto-optimized to 800x600px and compressed to ~200KB.
          </p>
        </div>
      </div>

      {/* Photo slots grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderPhotoSlot(1)}
        {renderPhotoSlot(2)}
        {renderPhotoSlot(3)}
      </div>

      {/* Guidelines */}
      <div className={`p-4 rounded-lg ${uiConfig.colors.cardSecondary} border ${uiConfig.colors.borderLight}`}>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Photo Guidelines
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Format:</strong> JPEG, PNG, or WebP (max 10MB)</li>
          <li>• <strong>Output:</strong> Automatically resized to 800x600px</li>
          <li>• <strong>Cropping:</strong> AI smart crop focuses on main subject</li>
          <li>• <strong>Quality:</strong> Compressed to 80-85% quality (~100-200KB)</li>
          <li>• <strong>Primary photo</strong> (slot 1) is displayed in search results</li>
        </ul>
      </div>
    </div>
  );
}
