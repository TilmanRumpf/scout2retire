import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { askConsultant } from '../../anthropic-api/anthropic-client.js';
import { getUserContext, formatContextForPrompt } from '../utils/scottyContext';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites } from '../utils/townUtils';
import UnifiedHeader from './UnifiedHeader';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

function ScottyGuide() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return 'You';
    return fullName.split(' ')[0];
  };

  // Generate customized town synopsis based on user context
  const generateTownSynopsis = (town, context) => {
    // Use the correct field names from the towns table (handle both direct and nested access)
    const name = town.name || town.town_name;
    const country = town.country || town.town_country;
    const rentCost = town['rent_cost_$'] || town.rent_cost || town.cost_of_living;
    
    // Handle missing data gracefully
    if (!name || !country) {
      return `I'd be happy to help you learn more about this location! What specific aspects interest you?`;
    }
    
    // Get other fields with fallbacks
    const latitude = town.latitude;
    const population = town.population;
    
    // Determine climate zone (only if latitude is available)
    const isNorthern = latitude && latitude > 40;
    const isTropical = latitude && Math.abs(latitude) < 23.5;
    const isMediterranean = latitude && latitude > 30 && latitude < 45 && (country === 'Portugal' || country === 'Spain' || country === 'Italy' || country === 'France');
    
    // Build personalized opening based on user's citizenship advantages
    let citizenshipAdvantage = '';
    if (context?.citizenship?.is_eu_citizen && ['Portugal', 'Spain', 'Italy', 'France', 'Germany'].includes(country)) {
      citizenshipAdvantage = `As an EU citizen, you'll enjoy full residency rights here. `;
    } else if (context?.citizenship?.primary === 'us' && ['Mexico', 'Panama', 'Costa Rica'].includes(country)) {
      citizenshipAdvantage = `Many US retirees love ${name} for its proximity to home. `;
    }
    
    // Build cost context (only if rent data available)
    const rentContext = rentCost ? (
      rentCost < 800 ? 'very affordable' : 
      rentCost < 1200 ? 'reasonably priced' : 
      rentCost < 2000 ? 'moderately expensive' : 'premium'
    ) : 'competitive';
    
    // Population context (only if population data available)
    const sizeContext = population ? (
      population < 50000 ? 'charming small town' :
      population < 200000 ? 'mid-sized city' :
      population < 1000000 ? 'vibrant city' : 'major metropolitan area'
    ) : 'beautiful location';
    
    // Build the synopsis
    const synopsis = `${name} is a ${sizeContext} in ${country} with ${rentContext} living costs${rentCost ? ` (around $${rentCost}/month for a comfortable apartment)` : ''}. ${citizenshipAdvantage}${
      isMediterranean ? 'The Mediterranean climate offers mild winters and warm, dry summers. ' :
      isTropical ? 'The tropical climate means warm weather year-round. ' :
      isNorthern ? 'The temperate climate brings distinct seasons. ' : ''
    }

Based on your profile as a ${context?.timeline?.status === 'retiring_soon' ? 'soon-to-be retiree' : 'retiree'} with ${
      context?.family?.situation === 'couple' ? 'your partner' : 'plans to enjoy retirement'
    }, I can help you explore specific aspects like ${
      context?.citizenship?.primary === 'us' ? 'US tax implications, ' : ''
    }healthcare quality, expat communities, or daily life details.

What would you like to know about ${name}?`;
    
    return synopsis;
  };

  // Generate smart title from conversation content
  const generateSmartTitle = (messages, town) => {
    if (!messages || messages.length === 0) return 'New conversation';
    
    // If it's about a specific town, use that
    if (town) {
      // Look at the conversation to see what aspect of the town was discussed
      const firstUserMessage = messages.find(msg => msg.type === 'user');
      if (firstUserMessage) {
        const text = firstUserMessage.text.toLowerCase();
        if (text.includes('visa') || text.includes('move') || text.includes('immigrat')) {
          return `${town.name} immigration`;
        } else if (text.includes('cost') || text.includes('budget')) {
          return `${town.name} costs`;
        } else if (text.includes('healthcare')) {
          return `${town.name} healthcare`;
        }
      }
      return `${town.name} exploration`;
    }
    
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.type === 'user');
    if (!firstUserMessage) return 'New conversation';
    
    const text = firstUserMessage.text.toLowerCase();
    
    // Look for country/location mentions
    const countries = {
      'portugal': 'Portugal',
      'spain': 'Spain', 
      'france': 'France',
      'italy': 'Italy',
      'mexico': 'Mexico',
      'costa rica': 'Costa Rica',
      'panama': 'Panama',
      'ecuador': 'Ecuador',
      'malaysia': 'Malaysia',
      'thailand': 'Thailand',
      'germany': 'Germany',
      'canada': 'Canada'
    };
    
    let foundCountry = null;
    for (const [key, value] of Object.entries(countries)) {
      if (text.includes(key)) {
        foundCountry = value;
        break;
      }
    }
    
    // Determine the main topic
    if (foundCountry) {
      // Country-specific queries
      if (text.includes('move') || text.includes('immigrat') || text.includes('relocat') || text.includes('passport')) {
        return `${foundCountry} immigration`;
      } else if (text.includes('visa') || text.includes('residency') || text.includes('resident')) {
        return `${foundCountry} visa`;
      } else if (text.includes('cost') || text.includes('expensive') || text.includes('cheap') || text.includes('budget')) {
        return `${foundCountry} costs`;
      } else if (text.includes('healthcare') || text.includes('medical') || text.includes('hospital')) {
        return `${foundCountry} healthcare`;
      } else if (text.includes('tax') || text.includes('taxes')) {
        return `${foundCountry} taxes`;
      } else if (text.includes('friendly') || text.includes('welcoming') || text.includes('expat')) {
        return `${foundCountry} expat life`;
      } else if (text.includes('climate') || text.includes('weather')) {
        return `${foundCountry} climate`;
      } else if (text.includes('safety') || text.includes('crime')) {
        return `${foundCountry} safety`;
      }
      // Default country mention
      return `${foundCountry} overview`;
    }
    
    // Generic topics (no country mentioned)
    if (text.includes('budget') || text.includes('afford')) return 'Budget planning';
    if (text.includes('healthcare') || text.includes('medical')) return 'Healthcare abroad';
    if (text.includes('visa') || text.includes('residency')) return 'Visa requirements';
    if (text.includes('climate') || text.includes('weather')) return 'Climate preferences';
    if (text.includes('tax')) return 'Tax planning';
    if (text.includes('passport') || text.includes('citizenship')) return 'Citizenship benefits';
    if (text.includes('insurance')) return 'Insurance options';
    if (text.includes('language')) return 'Language considerations';
    
    // Fallback: Create a meaningful summary from key words
    const importantWords = ['move', 'live', 'retire', 'visa', 'cost', 'healthcare', 'tax', 'climate', 'safety'];
    const foundWords = importantWords.filter(word => text.includes(word));
    
    if (foundWords.length > 0) {
      return foundWords.slice(0, 2).join(' ').replace(/(\w+)/g, (match) => 
        match.charAt(0).toUpperCase() + match.slice(1)
      );
    }
    
    // Last resort: general retirement topic
    return 'Retirement planning';
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user context and favorites on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getCurrentUser();
        console.log('Current user:', user);
        if (user?.id) {
          // Load user context
          const context = await getUserContext(user.id);
          console.log('User context loaded:', context);
          console.log('Family data:', context?.family);
          console.log('Partner citizenship:', context?.family?.partner_citizenship);
          setUserContext(context);
          
          // Load favorites
          const { favorites: userFavorites } = await fetchFavorites(user.id);
          setFavorites(userFavorites || []);
          
          // Load recent conversations from database
          const { data: dbConversations, error: convError } = await supabase
            .from('scotty_conversations')
            .select(`
              *,
              scotty_messages!scotty_messages_conversation_id_fkey(*)
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(10);

          if (convError) {
            console.error('Error loading conversations:', convError);
            // Fallback to localStorage if database fails
            const savedConversations = localStorage.getItem(`scotty_conversations_${user.id}`);
            if (savedConversations) {
              const parsedConversations = JSON.parse(savedConversations);
              setConversations(parsedConversations.slice(0, 5));
            }
          } else if (dbConversations) {
            // Transform database format to component format
            const formattedConversations = dbConversations.map(conv => ({
              id: conv.id,
              title: conv.title,
              town: conv.town_id ? { id: conv.town_id, name: conv.town_name, country: conv.town_country } : null,
              createdAt: conv.created_at,
              messages: conv.scotty_messages?.sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
              ).map(msg => ({
                id: msg.id,
                type: msg.message_type,
                text: msg.content
              })) || []
            }));
            setConversations(formattedConversations);
          }
          
          // Store user ID for later use
          window.scottyUserId = user.id;
          
          // Show success if we have context
          if (context) {
            console.log('Context includes favorites:', context.favorites);
          }
        } else {
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Unable to load your preferences');
      } finally {
        setContextLoading(false);
      }
    };
    
    loadData();
  }, []);

  const startNewChat = (topic = null, townContext = null) => {
    const newConversation = {
      id: `temp_${Date.now()}`, // Temporary ID until saved to database
      title: topic || 'New conversation',
      town: townContext,
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    setActiveConversation(newConversation);
    setActiveTown(townContext);
    setMessages([]);
    
    // If it's a town chat, add an initial message with town-specific synopsis
    if (townContext) {
      const townSynopsis = generateTownSynopsis(townContext, userContext);
      const initialMessage = {
        id: Date.now().toString(),
        type: 'scotty',
        text: townSynopsis
      };
      setMessages([initialMessage]);
    }
  };

  const saveConversation = async (conversation, newMessages) => {
    if (!userContext) return;
    
    // Generate smart title if this is the first save or if title is generic
    let title = conversation.title;
    if (title === 'New conversation' || !title || newMessages.length <= 2) {
      title = generateSmartTitle(newMessages, conversation.town);
    }
    
    try {
      // Check if conversation exists in database
      const isNewConversation = !conversation.id || conversation.id.includes('temp_');
      
      if (isNewConversation) {
        // Create new conversation in database
        const { data: newConv, error: convError } = await supabase
          .from('scotty_conversations')
          .insert({
            user_id: window.scottyUserId,
            title: title,
            town_id: activeTown?.id || null,
            town_name: activeTown?.name || null,
            town_country: activeTown?.country || null,
            user_citizenship: userContext?.citizenship?.primary,
            conversation_topic: activeTown ? 'town_research' : 'general_retirement'
          })
          .select()
          .single();

        if (convError) throw convError;

        // Insert all messages
        if (newMessages.length > 0) {
          const messagesToInsert = newMessages.map(msg => ({
            conversation_id: newConv.id,
            message_type: msg.type,
            content: msg.text,
            contains_town_request: activeTown ? true : msg.text.toLowerCase().includes('town'),
            mentioned_towns: activeTown ? [activeTown.name] : extractMentionedTowns(msg.text),
            topics: extractTopics(msg.text)
          }));

          const { error: msgError } = await supabase
            .from('scotty_messages')
            .insert(messagesToInsert);

          if (msgError) throw msgError;
        }

        // Update local state with database ID
        conversation.id = newConv.id;
      } else {
        // Update existing conversation
        const { error: updateError } = await supabase
          .from('scotty_conversations')
          .update({ 
            title: title,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id);

        if (updateError) throw updateError;

        // Get existing message IDs to avoid duplicates
        const { data: existingMessages } = await supabase
          .from('scotty_messages')
          .select('id')
          .eq('conversation_id', conversation.id);

        const existingIds = new Set(existingMessages?.map(m => m.id) || []);

        // Insert only new messages
        const newMessagesToInsert = newMessages
          .filter(msg => !existingIds.has(msg.id))
          .map(msg => ({
            conversation_id: conversation.id,
            message_type: msg.type,
            content: msg.text,
            contains_town_request: activeTown ? true : msg.text.toLowerCase().includes('town'),
            mentioned_towns: activeTown ? [activeTown.name] : extractMentionedTowns(msg.text),
            topics: extractTopics(msg.text)
          }));

        if (newMessagesToInsert.length > 0) {
          const { error: msgError } = await supabase
            .from('scotty_messages')
            .insert(newMessagesToInsert);

          if (msgError) throw msgError;
        }
      }

      // Update local state
      const updatedConversation = {
        ...conversation,
        title: title,
        messages: newMessages,
        town: activeTown,
        lastMessageAt: new Date().toISOString()
      };
      
      const updatedConversations = [
        updatedConversation,
        ...conversations.filter(c => c.id !== conversation.id)
      ].slice(0, 10);
      
      setConversations(updatedConversations);

    } catch (error) {
      console.error('Error saving conversation to database:', error);
      // Fallback to localStorage on error
      const updatedConversation = {
        ...conversation,
        title: title,
        messages: newMessages,
        town: activeTown,
        lastMessageAt: new Date().toISOString()
      };
      
      const updatedConversations = [
        updatedConversation,
        ...conversations.filter(c => c.id !== conversation.id)
      ].slice(0, 5);
      
      setConversations(updatedConversations);
      
      localStorage.setItem(
        `scotty_conversations_${window.scottyUserId}`,
        JSON.stringify(updatedConversations)
      );
    }
  };

  // Helper functions for extracting analytics data
  const extractMentionedTowns = (text) => {
    const townPatterns = [
      /\b(porto|lisbon|madrid|barcelona|paris|rome|mexico city|playa del carmen|cuenca|medellin|penang|bangkok|dubai)\b/gi
    ];
    const mentions = [];
    townPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) mentions.push(...matches.map(m => m.toLowerCase()));
    });
    return [...new Set(mentions)];
  };

  const extractTopics = (text) => {
    const topics = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('visa') || lowerText.includes('residency')) topics.push('visa');
    if (lowerText.includes('healthcare') || lowerText.includes('medical')) topics.push('healthcare');
    if (lowerText.includes('cost') || lowerText.includes('budget') || lowerText.includes('expensive')) topics.push('costs');
    if (lowerText.includes('tax')) topics.push('taxes');
    if (lowerText.includes('climate') || lowerText.includes('weather')) topics.push('climate');
    if (lowerText.includes('culture') || lowerText.includes('language')) topics.push('culture');
    if (lowerText.includes('safety') || lowerText.includes('crime')) topics.push('safety');
    if (lowerText.includes('expat') || lowerText.includes('community')) topics.push('expat_community');
    
    return topics;
  };

  const loadConversation = (conversation) => {
    setActiveConversation(conversation);
    setMessages(conversation.messages || []);
    setActiveTown(conversation.town || null);
  };

  const deleteConversation = async (conversationId) => {
    try {
      // Delete from database if it's not a temporary ID
      if (!conversationId.includes('temp_')) {
        const { error } = await supabase
          .from('scotty_conversations')
          .update({ is_active: false }) // Soft delete
          .eq('id', conversationId);

        if (error) throw error;
      }

      // Update local state
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConversations);
      
      // If we're deleting the active conversation, clear it
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        setActiveTown(null);
      }
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Unable to delete conversation');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: message
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setLoading(true);
    
    // Build personalized Scotty persona with user context
    const userInfo = userContext ? formatContextForPrompt(userContext) : '';
    console.log('Sending context to Scotty:', userInfo);
    
    // Add town context if discussing a specific town
    const townContext = activeTown ? `\n\nCURRENT TOPIC: The user is asking about ${activeTown.name}, ${activeTown.country}. IMPORTANT: Keep the conversation focused on ${activeTown.name} unless the user explicitly asks about a different location.` : '';
    
    // Add conversation history context for continuity
    let recentContext = '';
    if (messages.length > 0) {
      const lastMessages = messages.slice(-4); // Get last 2 exchanges
      const summary = lastMessages.map(msg => 
        msg.type === 'user' ? `User asked: "${msg.text.substring(0, 100)}..."` : 
        `You responded about: ${msg.text.substring(0, 100)}...`
      ).join('\n');
      
      recentContext = `\n\nCONVERSATION HISTORY:\n${summary}\n` +
        (activeTown ? `\nREMEMBER: This entire conversation is about ${activeTown.name}, ${activeTown.country}. Stay focused on this location unless the user explicitly asks about somewhere else.` : '');
    }
    
    const scottyPersona = `You are Scotty, a friendly and knowledgeable retirement guide (not a professional advisor). 
    You help people explore retirement options in a conversational, approachable way.
    
    ${userInfo ? `USER CONTEXT:\n${userInfo}\n\nALWAYS consider the above user information when providing advice. Make your responses highly personalized based on their citizenship, budget, preferences, and situation.\n` : ''}
    ${townContext}
    ${recentContext}
    
    Behind the scenes, you consult with these specialists:
    - Retirement Lifestyle Consultant
    - Tax & Financial Guide
    - Healthcare Information Specialist
    - Property Market Observer
    - Education Resources Guide
    - Visa & Immigration Information
    - Climate Data Analyst
    - Cultural Integration Helper
    - Business Opportunities Scout
    - Leisure & Recreation Enthusiast
    
    CRITICAL RESPONSE RULES FOR MOBILE-FIRST:
    1. Keep initial response BRIEF - maximum 3-4 short paragraphs
    2. Start with a clear, conditional answer like "Good news! In most cases..." or "Generally speaking..." or "Typically..."
    3. Use cautious language: "usually", "often", "in many cases", "typically", "generally"
    4. Give the core answer in 2-3 sentences first
    5. Then briefly mention 1-2 key considerations
    6. End with: "Would you like me to dig deeper into [specific aspect]?" or similar
    7. NO long lists or detailed explanations in the first response
    8. Use simple formatting - just **bold** for emphasis, minimal bullet points
    9. Save detailed information for follow-up questions
    10. When relevant, reference the user's specific situation (e.g., "As a ${userContext?.citizenship?.primary || 'retiree'} citizen..." or "With your budget of $${userContext?.budget?.total_monthly || 'X'}...")
    11. If the user has favorited towns, consider mentioning them when relevant (e.g., "I see you've favorited ${userContext?.favorites?.[0]?.town_name || 'some towns'}...")
    
    Remember: You're chatting on a phone screen - be helpful but concise!`;
    
    try {
      const fullMessage = `As Scotty the retirement guide, help with this question: ${message}`;
      const claudeResponse = await askConsultant(fullMessage, scottyPersona);
      
      // Add Scotty's response
      const scottyMessage = {
        id: (Date.now() + 1).toString(),
        type: 'scotty',
        text: claudeResponse
      };
      
      const finalMessages = [...newMessages, scottyMessage];
      setMessages(finalMessages);
      
      // Save conversation
      if (activeConversation) {
        saveConversation(activeConversation, finalMessages);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Unable to get response from Scotty');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to convert text formatting
  const formatResponse = (text) => {
    // Convert **text** to bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to <br> tags
    formatted = formatted.split('\n').join('<br />');
    
    return formatted;
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader 
        title="Scotty - Your AI Guide"
        maxWidth="max-w-6xl"
      />
      
      <main className={`${uiConfig.layout.width.containerWide} px-4 py-6`}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {/* Scotty Chat Section */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Scotty Chat</h2>
              </div>
              
              <div className="p-2">
                {/* New Chat Button */}
                <button
                  onClick={() => startNewChat()}
                  className={`w-full bg-scout-accent-300 hover:bg-scout-accent-600 text-white py-2 px-4 ${uiConfig.layout.radius.md} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition} mb-2`}
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                  </div>
                </button>
                
                {/* Recent Conversations */}
                {conversations.length > 0 && (
                  <div className="space-y-1">
                    {conversations.map(conv => {
                      return (
                        <div
                          key={conv.id}
                          className={`flex items-center p-2 ${uiConfig.layout.radius.md} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                            activeConversation?.id === conv.id ? 'bg-scout-light dark:bg-scout-sage' : ''
                          }`}
                        >
                          <button
                            onClick={() => loadConversation(conv)}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className={`${uiConfig.font.weight.medium} ${uiConfig.font.size.sm} truncate text-gray-900 dark:text-gray-100`}>
                              {conv.title}
                            </div>
                            <div className={`${uiConfig.font.size.xs} text-gray-600 dark:text-gray-400`}>
                              {new Date(conv.createdAt).toLocaleDateString()}
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete conversation"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Town Info - Favorites */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Town Info</h2>
              </div>
              
              {favorites.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No favorite towns yet.</p>
                  <a href="/discover" className="text-scout-accent hover:underline mt-2 inline-block text-sm">
                    Discover towns
                  </a>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {favorites.map(favorite => (
                    <button
                      key={favorite.town_id}
                      onClick={() => startNewChat(`Research on ${favorite.towns.name}`, favorite.towns)}
                      className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-scout-light dark:bg-scout-sage rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-scout-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`${uiConfig.font.weight.medium} ${uiConfig.font.size.sm} truncate text-gray-900 dark:text-gray-100`}>
                            {favorite.towns.name}
                          </div>
                          <div className={`${uiConfig.font.size.xs} text-gray-600 dark:text-gray-400`}>
                            {favorite.towns.country}
                          </div>
                        </div>
                        <div className={`${uiConfig.font.size.xs} text-gray-600 dark:text-gray-400 text-right`}>
                          ${favorite.towns.rent_cost_$}/mo
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className={`flex-1 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex flex-col`}>
            {/* Chat Header */}
            {activeConversation && (
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  {activeConversation.title}
                </h2>
              </div>
            )}
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
              {!activeConversation || (activeConversation && messages.length === 0) ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    {contextLoading ? (
                      <p className={`${uiConfig.font.size.lg} text-gray-600 dark:text-gray-400`}>
                        Loading your preferences...
                      </p>
                    ) : (
                      <>
                        <div className="max-w-2xl mx-auto text-center">
                          <div className="mb-8">
                            <div className="w-20 h-20 bg-scout-light dark:bg-scout-sage rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-3xl font-bold text-scout-accent">S</span>
                            </div>
                            <p className={`${uiConfig.font.size.xl} ${uiConfig.font.weight.medium} text-gray-900 dark:text-white mb-2`}>
                              Hi{userContext?.personal?.name ? ` ${getFirstName(userContext.personal.name)}` : ''}! I'm Scotty
                            </p>
                            <p className={`${uiConfig.font.size.lg} text-gray-700 dark:text-gray-300`}>
                              Your AI retirement companion
                            </p>
                          </div>
                          
                          <div className={`${uiConfig.font.size.md} text-gray-600 dark:text-gray-400 space-y-4`}>
                            {userContext?.citizenship?.primary ? (
                              <p>
                                I see you're a {userContext.citizenship.has_dual ? 'dual ' : ''}{userContext.citizenship.primary === 'us' ? 'US' : userContext.citizenship.primary.toUpperCase()}{userContext.citizenship.has_dual && userContext.citizenship.secondary ? `/${userContext.citizenship.secondary === 'us' ? 'US' : userContext.citizenship.secondary.toUpperCase()}` : ''} citizen
                                {userContext?.family?.situation === 'couple' ? (
                                  userContext?.family?.partner_citizenship?.primary ? 
                                    ` with a ${userContext.family.partner_citizenship.has_dual ? 'dual ' : ''}${userContext.family.partner_citizenship.primary === 'us' ? 'US' : userContext.family.partner_citizenship.primary.toUpperCase()}${userContext.family.partner_citizenship.has_dual && userContext.family.partner_citizenship.secondary ? `/${userContext.family.partner_citizenship.secondary === 'us' ? 'US' : userContext.family.partner_citizenship.secondary.toUpperCase()}` : ''} citizen partner` :
                                    ' with a partner'
                                ) : ''}
                                {userContext?.timeline?.status === 'planning' ? ', planning for retirement' : 
                                 userContext?.timeline?.status === 'already_retired' ? ', enjoying retirement' : 
                                 ', preparing for retirement soon'}. I'm here to help explore your options!
                              </p>
                            ) : null}
                            
                            {userContext?.family?.situation === 'couple' && userContext?.family?.partner_citizenship && (
                              <p className="text-base">
                                Having {userContext.family.partner_citizenship.has_dual ? 'multiple citizenships' : 'different citizenships'} as a couple opens unique opportunities for visa-free travel and residency options. I'll consider both of your citizenship advantages when suggesting destinations!
                              </p>
                            )}
                            
                            <p className="text-base">
                              Ask me anything about retirement destinations, visa requirements, healthcare, 
                              costs of living, or life abroad. I'll share insights based on your preferences 
                              and what other retirees have experienced.
                            </p>
                            
                            {userContext?.favorites?.length > 0 && (
                              <p className="italic">
                                I noticed you've favorited some towns - click any of them in the sidebar 
                                to dive deeper into what makes them special!
                              </p>
                            )}
                            
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                <span className="inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Friendly reminder
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                I'm an AI assistant sharing general information and insights. For specific legal, 
                                tax, medical, or financial decisions, it's always best to consult with qualified 
                                professionals who can review your unique situation.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div key={msg.id} className={`mb-6 ${msg.type === 'user' ? 'text-right' : ''}`}>
                      {msg.type === 'user' ? (
                        <div className="inline-block max-w-[80%] text-left">
                          <div className={`bg-gray-100 dark:bg-gray-700 p-4 ${uiConfig.layout.radius.lg}`}>
                            <div className={`${uiConfig.font.weight.medium} text-scout-accent dark:text-scout-accent mb-1`}>
                              {getFirstName(userContext?.personal?.name)}
                            </div>
                            <div className="text-gray-800 dark:text-gray-200">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className={`max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm}`}>
                            <div className={`${uiConfig.font.weight.medium} text-scout-accent dark:text-scout-accent mb-1`}>
                              Scotty
                            </div>
                            <div 
                              className={`text-gray-800 dark:text-gray-200 leading-relaxed`}
                              dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start mb-6">
                      <div className={`max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm}`}>
                        <div className={`${uiConfig.font.weight.medium} text-scout-accent dark:text-scout-accent mb-1`}>
                          Scotty
                        </div>
                        <div className={`text-gray-600 dark:text-gray-400 italic`}>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Input Area */}
            {activeConversation && (
              <div className={`p-4 border-t ${uiConfig.colors.borderLight}`}>
                <div className="flex gap-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Scotty about retirement..."
                    className={`flex-1 ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} py-2 px-4 ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent resize-none`}
                    rows={1}
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className={`px-6 py-2 ${
                      loading || !message.trim() 
                        ? `bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed` 
                        : `bg-scout-accent-300 hover:bg-scout-accent-600 text-white`
                    } ${uiConfig.layout.radius.md} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition}`}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScottyGuide;