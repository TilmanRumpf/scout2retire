/**
 * Scotty Database Integration
 * Handles saving and loading conversations from the database
 */

import supabase from './supabaseClient';

/**
 * Get or create a Scotty conversation
 * @param {Object} params - Conversation parameters
 * @returns {Promise<string>} Conversation ID
 */
export async function getOrCreateConversation({
  title = null,
  townId = null,
  townName = null,
  townCountry = null,
  topicCategory = null
}) {
  try {
    const { data, error } = await supabase.rpc('get_or_create_scotty_conversation', {
      p_title: title,
      p_town_id: townId,
      p_town_name: townName,
      p_town_country: townCountry,
      p_topic_category: topicCategory
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
}

/**
 * Save a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @param {Array} mentionedTownIds - Town IDs mentioned (optional)
 * @param {Array} detectedTopics - Topics detected (optional)
 * @returns {Promise<string>} Message ID
 */
export async function saveMessage({
  conversationId,
  role,
  content,
  mentionedTownIds = null,
  detectedTopics = null
}) {
  try {
    const { data, error } = await supabase.rpc('save_scotty_message', {
      p_conversation_id: conversationId,
      p_role: role,
      p_content: content,
      p_mentioned_town_ids: mentionedTownIds,
      p_detected_topics: detectedTopics
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

/**
 * Get user's recent conversations
 * @param {number} limit - Number of conversations to fetch
 * @returns {Promise<Array>} Array of conversations
 */
export async function getUserConversations(limit = 10) {
  try {
    const { data, error } = await supabase.rpc('get_user_scotty_conversations', {
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Load messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of messages
 */
export async function loadConversationMessages(conversationId) {
  try {
    const { data, error } = await supabase
      .from('scotty_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

/**
 * Mark a conversation as inactive
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} Success status
 */
export async function archiveConversation(conversationId) {
  try {
    const { error } = await supabase
      .from('scotty_conversations')
      .update({ is_active: false })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    return false;
  }
}

/**
 * Update conversation title
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 * @returns {Promise<boolean>} Success status
 */
export async function updateConversationTitle(conversationId, title) {
  try {
    const { error } = await supabase
      .from('scotty_conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating title:', error);
    return false;
  }
}

/**
 * Detect topics in message content
 * @param {string} content - Message content
 * @returns {Array} Detected topics
 */
export function detectTopics(content) {
  const topics = [];
  const lowerContent = content.toLowerCase();

  // Topic detection patterns
  const topicPatterns = {
    visa: ['visa', 'residency', 'immigration', 'permit', 'citizen'],
    healthcare: ['health', 'medical', 'doctor', 'hospital', 'insurance'],
    costs: ['cost', 'price', 'budget', 'expense', 'afford', 'rent', 'buy'],
    climate: ['weather', 'climate', 'temperature', 'rain', 'sun', 'season'],
    culture: ['culture', 'language', 'people', 'community', 'social', 'expat'],
    safety: ['safe', 'crime', 'security', 'dangerous', 'peaceful'],
    transport: ['transport', 'driving', 'flight', 'airport', 'public transport'],
    lifestyle: ['lifestyle', 'pace', 'urban', 'rural', 'quiet', 'busy'],
    activities: ['activities', 'hobbies', 'beach', 'mountain', 'golf', 'tennis'],
    food: ['food', 'restaurant', 'cuisine', 'market', 'grocery']
  };

  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : null;
}

/**
 * Extract mentioned town IDs from message
 * @param {string} content - Message content
 * @param {Array} availableTowns - Array of town objects with id, name
 * @returns {Array} Town IDs mentioned
 */
export function extractMentionedTowns(content, availableTowns = []) {
  const mentionedIds = [];
  const lowerContent = content.toLowerCase();

  for (const town of availableTowns) {
    if (town.town_name && lowerContent.includes(town.town_name.toLowerCase())) {
      mentionedIds.push(town.id);
    }
  }

  return mentionedIds.length > 0 ? mentionedIds : null;
}

/**
 * Get conversation topic category from initial message
 * @param {string} content - Initial message content
 * @param {Object} townContext - Town context if any
 * @returns {string} Topic category
 */
export function getTopicCategory(content, townContext = null) {
  const lowerContent = content.toLowerCase();

  if (townContext) {
    // Town-specific conversation
    if (lowerContent.includes('visa') || lowerContent.includes('move')) {
      return 'town_visa';
    }
    if (lowerContent.includes('cost') || lowerContent.includes('price')) {
      return 'town_costs';
    }
    if (lowerContent.includes('health') || lowerContent.includes('medical')) {
      return 'town_healthcare';
    }
    return 'town_general';
  }

  // General conversation topics
  if (lowerContent.includes('visa') || lowerContent.includes('residency')) {
    return 'visa';
  }
  if (lowerContent.includes('budget') || lowerContent.includes('cost')) {
    return 'costs';
  }
  if (lowerContent.includes('health') || lowerContent.includes('medical')) {
    return 'healthcare';
  }
  if (lowerContent.includes('where') || lowerContent.includes('recommend')) {
    return 'recommendations';
  }

  return 'general';
}