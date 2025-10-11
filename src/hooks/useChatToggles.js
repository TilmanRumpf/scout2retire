import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * useChatToggles - Toggle functions for likes, favorites, etc.
 * Extracted from Chat.jsx
 */
export function useChatToggles({ user, loadCountryLikes, loadChatFavorites }) {
  // Toggle country like
  const toggleCountryLike = async (countryName) => {
    try {
      if (!user) return;

      const { data: existing, error: checkError } = await supabase
        .from('country_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('country_name', countryName)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking country like:", checkError);
        return;
      }

      if (existing) {
        const { error: deleteError } = await supabase
          .from('country_likes')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          console.error("Error removing country like:", deleteError);
          toast.error("Failed to remove country like");
          return;
        }

        toast.success(`Removed ${countryName} from favorites`);
      } else {
        const { error: insertError } = await supabase
          .from('country_likes')
          .insert({
            user_id: user.id,
            country_name: countryName
          });

        if (insertError) {
          console.error("Error adding country like:", insertError);
          toast.error("Failed to add country like");
          return;
        }

        toast.success(`Added ${countryName} to favorites`);
      }

      await loadCountryLikes(user.id);
    } catch (err) {
      console.error("Error toggling country like:", err);
      toast.error("An error occurred");
    }
  };

  // Toggle favorite chat
  const toggleFavoriteChat = async (chatType, referenceId, referenceName) => {
    try {
      if (!user) return;

      const { data: existing, error: checkError } = await supabase
        .from('chat_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('chat_type', chatType)
        .eq('reference_id', referenceId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking favorite:", checkError);
        return;
      }

      if (existing) {
        const { error: deleteError } = await supabase
          .from('chat_favorites')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          console.error("Error removing favorite:", deleteError);
          toast.error("Failed to remove favorite");
          return;
        }

        toast.success(`Removed from favorites`);
      } else {
        const { error: insertError } = await supabase
          .from('chat_favorites')
          .insert({
            user_id: user.id,
            chat_type: chatType,
            reference_id: referenceId,
            reference_name: referenceName
          });

        if (insertError) {
          console.error("Error adding favorite:", insertError);
          toast.error("Failed to add favorite");
          return;
        }

        toast.success(`Added to favorites`);
      }

      await loadChatFavorites(user.id);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("An error occurred");
    }
  };

  // Handle group chat creation
  const handleCreateGroup = async (groupData, setGroupChats, loadGroupChats) => {
    try {
      const { data: newThread, error: threadError } = await supabase
        .from('chat_threads')
        .insert([{
          topic: groupData.topic,
          is_group: true,
          is_public: groupData.is_public,
          category: groupData.category,
          geo_region: groupData.geo_region,
          geo_country: groupData.geo_country,
          geo_province: groupData.geo_province,
          created_by: user.id
        }])
        .select()
        .single();

      if (threadError) {
        console.error('Error creating group thread:', threadError);
        toast.error('Failed to create group chat');
        return;
      }

      const members = [
        { thread_id: newThread.id, user_id: user.id, role: 'admin' },
        ...groupData.members.map(friendId => ({
          thread_id: newThread.id,
          user_id: friendId,
          role: 'member'
        }))
      ];

      const { error: membersError } = await supabase
        .from('group_chat_members')
        .insert(members);

      if (membersError) {
        console.error('Error adding group members:', membersError);
        await supabase.from('chat_threads').delete().eq('id', newThread.id);
        toast.error('Failed to add members to group');
        return;
      }

      toast.success('Group chat created!');

      const updatedGroups = await loadGroupChats(user.id);
      return newThread;
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error('Failed to create group');
    }
  };

  return {
    toggleCountryLike,
    toggleFavoriteChat,
    handleCreateGroup
  };
}
