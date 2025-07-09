import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, Trash2, User } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

const DICEBEAR_STYLES = [
  'initials',
  'avataaars',
  'bottts',
  'identicon',
  'shapes'
];

export default function AvatarUpload({ userId, currentAvatarUrl, fullName, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('initials');
  const fileInputRef = useRef(null);
  
  // Generate DiceBear avatar URL
  const generateAvatarUrl = (style = avatarStyle) => {
    const seed = fullName || userId || 'user';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=8fbc8f,a8d5a8,c3e9c3&size=200`;
  };
  
  // Get display avatar URL
  const getAvatarUrl = () => {
    if (currentAvatarUrl?.startsWith('http')) {
      return currentAvatarUrl;
    }
    return generateAvatarUrl();
  };
  
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
  
  // Use random avatar
  const handleRandomAvatar = async () => {
    try {
      setUploading(true);
      
      // Cycle through avatar styles
      const currentIndex = DICEBEAR_STYLES.indexOf(avatarStyle);
      const nextIndex = (currentIndex + 1) % DICEBEAR_STYLES.length;
      const nextStyle = DICEBEAR_STYLES[nextIndex];
      setAvatarStyle(nextStyle);
      
      const newAvatarUrl = generateAvatarUrl(nextStyle);
      
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);
      
      if (error) throw error;
      
      onAvatarUpdate(newAvatarUrl);
      toast.success('Avatar style updated!');
      
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };
  
  // Remove avatar
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
      
      // Update to use generated avatar
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);
      
      if (error) throw error;
      
      onAvatarUpdate(null);
      toast.success('Profile picture removed');
      
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className={`w-32 h-32 rounded-full overflow-hidden ${uiConfig.colors.card} border-4 border-gray-200 dark:border-gray-700 transition-all group-hover:border-scout-accent`}>
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = generateAvatarUrl();
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <User size={48} className="text-gray-400 dark:text-gray-500" />
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
        
        {/* Random Avatar Button */}
        <button
          onClick={handleRandomAvatar}
          disabled={uploading}
          className={`p-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-scout-accent transition-colors ${uploading ? 'opacity-50' : ''}`}
          title="Generate random avatar"
        >
          <RefreshCw size={20} className={`text-gray-600 dark:text-gray-400 ${uploading ? 'animate-spin' : ''}`} />
        </button>
        
        {/* Remove Button */}
        {currentAvatarUrl && (
          <button
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className={`p-2 rounded-lg ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} hover:border-red-500 transition-colors`}
            title="Remove avatar"
          >
            <Trash2 size={20} className="text-gray-600 dark:text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
      
      <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-center`}>
        Click avatar to upload • Max 5MB
      </p>
    </div>
  );
}