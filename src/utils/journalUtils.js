// utils/journalUtils.js
import supabase from './supabaseClient';

// Save a manual journal entry
export const saveJournalEntry = async (userId, content, townId = null) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        content,
        town_id: townId,
        entry_type: 'journal',
        entry_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error("Error saving journal entry:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error saving journal entry:", error);
    return { success: false, error };
  }
};

// Log town activities
export const logTownActivity = async (userId, townId, activityType, townName, townCountry) => {
  try {
    let content = '';
    switch (activityType) {
      case 'liked':
        content = `Liked ${townName}, ${townCountry}`;
        break;
      case 'unliked':
        content = `Removed ${townName}, ${townCountry} from favorites`;
        break;
      case 'viewed':
        content = `Viewed details for ${townName}, ${townCountry}`;
        break;
      default:
        content = `Activity in ${townName}, ${townCountry}`;
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        town_id: townId,
        entry_type: `town_${activityType}`,
        content,
        metadata: { town_name: townName, town_country: townCountry },
        entry_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error(`Error logging town ${activityType}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error logging town ${activityType}:`, error);
    return { success: false, error };
  }
};

// Log social connections
export const logSocialActivity = async (userId, connectedUserId, connectedUserName) => {
  try {
    const content = `Connected with ${connectedUserName}`;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        related_user_id: connectedUserId,
        entry_type: 'connection_made',
        content,
        metadata: { connected_user_name: connectedUserName },
        entry_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error("Error logging social activity:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error logging social activity:", error);
    return { success: false, error };
  }
};

// Log task activities
export const logTaskActivity = async (userId, taskTitle, activityType, taskId = null) => {
  try {
    const content = activityType === 'completed' 
      ? `Completed task: ${taskTitle}`
      : `Added task: ${taskTitle}`;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        entry_type: `task_${activityType}`,
        content,
        metadata: { task_title: taskTitle, task_id: taskId },
        entry_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error(`Error logging task ${activityType}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error logging task ${activityType}:`, error);
    return { success: false, error };
  }
};

// Fetch journal entries with filtering
export const fetchJournalEntries = async (userId, filters = {}) => {
  try {
    const { entryType = 'all', dateRange = 30, limit = 50 } = filters;
    
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        towns:town_id(id, name, country),
        related_user:related_user_id(id, full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply entry type filter
    if (entryType !== 'all') {
      switch (entryType) {
        case 'journal':
          query = query.eq('entry_type', 'journal');
          break;
        case 'town':
          query = query.in('entry_type', ['town_liked', 'town_unliked', 'town_viewed']);
          break;
        case 'social':
          query = query.eq('entry_type', 'connection_made');
          break;
        case 'tasks':
          query = query.in('entry_type', ['task_added', 'task_completed']);
          break;
      }
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching journal entries:", error);
      return { success: false, error };
    }

    return { success: true, entries: data };
  } catch (error) {
    console.error("Unexpected error fetching journal entries:", error);
    return { success: false, error };
  }
};

// Delete journal entry (only for manual journal entries)
export const deleteJournalEntry = async (entryId, userId) => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)
      .eq('entry_type', 'journal'); // Only allow deletion of manual entries

    if (error) {
      console.error("Error deleting journal entry:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting journal entry:", error);
    return { success: false, error };
  }
};