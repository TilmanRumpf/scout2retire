import { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Palette } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import InitialsAvatar from './InitialsAvatar';
import IconAvatarSelector from './IconAvatarSelector';

export default function AvatarUpload({ userId, currentAvatarUrl, fullName, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const fileInputRef = useRef(null);
  
  // Check avatar type
  const isUsingPhoto = currentAvatarUrl?.includes('supabase') || (currentAvatarUrl?.includes('http') && !currentAvatarUrl?.includes('data:'));
  const isUsingIcon = currentAvatarUrl?.includes('data:image/svg');
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      onAvatarUpdate(publicUrl);
      toast.success('Profile picture updated!');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = handleFileUpload;
    input.click();
  };
  
  // Remove avatar (go back to initials)
  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      
      // If using uploaded image, delete from storage
      if (currentAvatarUrl?.includes('supabase')) {
        const fileName = `${userId}/avatar`;
        await supabase.storage
          .from('avatars')
          .remove([fileName]);
      }
      
      // Update to use color index for initials
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: `initials:${colorIndex}` })
        .eq('id', userId);
      
      if (error) throw error;
      
      onAvatarUpdate(`initials:${colorIndex}`);
      toast.success('Using initials avatar');
      
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  // Get next color for initials
  const handleNextColor = async () => {
    const nextIndex = (colorIndex + 1) % 10;
    setColorIndex(nextIndex);
    
    if (!isUsingPhoto && !isUsingIcon) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: `initials:${nextIndex}` })
          .eq('id', userId);
        
        if (error) throw error;
        onAvatarUpdate(`initials:${nextIndex}`);
      } catch (error) {
        console.error('Error updating color:', error);
      }
    }
  };

  // Handle icon selection
  const handleIconSelect = async (iconDataUrl) => {
    try {
      setUploading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: iconDataUrl })
        .eq('id', userId);
      
      if (error) throw error;
      
      onAvatarUpdate(iconDataUrl);
      toast.success('Icon avatar selected!');
    } catch (error) {
      console.error('Error updating icon:', error);
      toast.error('Failed to update icon');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className={`w-32 h-32 rounded-full overflow-hidden ${uiConfig.colors.card} border-4 border-gray-200 dark:border-gray-700 transition-all group-hover:border-scout-accent`}>
          {isUsingPhoto || isUsingIcon ? (
            <img
              src={currentAvatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full">
              <InitialsAvatar 
                fullName={fullName} 
                size={128} 
                colorIndex={currentAvatarUrl?.includes('initials:') 
                  ? parseInt(currentAvatarUrl.split(':')[1]) || colorIndex 
                  : colorIndex
                } 
              />
            </div>
          )}
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload size={32} className="text-white" />
        </div>
        
        {/* Click area */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full cursor-pointer"
          aria-label="Upload profile picture"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Camera Button */}
        <button
          onClick={handleCameraCapture}
          disabled={uploading}
          className={`p-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-scout-accent transition-colors`}
          title="Take photo"
        >
          <Camera size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Icon Button */}
        <button
          onClick={() => setShowIconSelector(true)}
          disabled={uploading}
          className={`p-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-scout-accent transition-colors`}
          title="Choose icon avatar"
        >
          <Palette size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Color Button (for initials) */}
        {!isUsingPhoto && !isUsingIcon && (
          <button
            onClick={handleNextColor}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-scout-accent transition-colors text-sm font-medium`}
            title="Change color"
          >
            Change Color
          </button>
        )}
        
        {/* Remove Button (only if using photo or icon) */}
        {(isUsingPhoto || isUsingIcon) && (
          <button
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className={`p-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-red-500 transition-colors`}
            title="Use initials instead"
          >
            <Trash2 size={20} className="text-gray-600 dark:text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
      
      <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-center`}>
        {isUsingPhoto ? 'Click avatar to change photo' : isUsingIcon ? 'Using retirement icon' : 'Upload photo, choose icon, or change color'}
      </p>
      
      {/* Icon Selector Modal */}
      <IconAvatarSelector
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelect={handleIconSelect}
      />
    </div>
  );
}