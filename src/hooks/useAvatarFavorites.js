import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function useAvatarFavorites(userId) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from user profile
  useEffect(() => {
    if (!userId) return;
    
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('avatar_favorites')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setFavorites(data.avatar_favorites || []);
    } catch (error) {
      console.error('Error loading avatar favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (avatarData) => {
    try {
      // Check if already favorited
      if (favorites.some(fav => fav.dataUrl === avatarData.dataUrl)) {
        toast.error('Already in favorites');
        return false;
      }

      // Add timestamp
      const newFavorite = {
        ...avatarData,
        addedAt: new Date().toISOString()
      };

      const updatedFavorites = [...favorites, newFavorite].slice(-20); // Keep last 20

      const { error } = await supabase
        .from('users')
        .update({ avatar_favorites: updatedFavorites })
        .eq('id', userId);

      if (error) throw error;

      setFavorites(updatedFavorites);
      toast.success('Added to favorites');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add favorite');
      return false;
    }
  };

  const removeFavorite = async (dataUrl) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.dataUrl !== dataUrl);

      const { error } = await supabase
        .from('users')
        .update({ avatar_favorites: updatedFavorites })
        .eq('id', userId);

      if (error) throw error;

      setFavorites(updatedFavorites);
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
      return false;
    }
  };

  const isFavorite = (dataUrl) => {
    return favorites.some(fav => fav.dataUrl === dataUrl);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}