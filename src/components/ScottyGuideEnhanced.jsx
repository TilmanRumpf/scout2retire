/**
 * Enhanced Scotty Guide Component with Database Integration
 *
 * This is an improved version that:
 * 1. Saves all conversations to the database
 * 2. Loads conversation history from database
 * 3. Properly integrates with paywall limits
 * 4. Tracks topics and mentioned towns for analytics
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { askConsultant } from '../../anthropic-api/anthropic-client.js';
import { getUserContext, formatContextForPrompt } from '../utils/scottyContext';
import { enhanceScottyWithGeographicKnowledge } from '../utils/scottyGeographicKnowledge';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites } from '../utils/townUtils.jsx';
import UnifiedHeader from './UnifiedHeader';
import HeaderSpacer from './HeaderSpacer';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { UpgradeModal, useUpgradeModal } from './UpgradeModal';
import { getFeatureLimit } from '../utils/paywallUtils';
import {
  getOrCreateConversation,
  saveMessage,
  getUserConversations,
  loadConversationMessages,
  updateConversationTitle,
  detectTopics,
  extractMentionedTowns,
  getTopicCategory
} from '../utils/scottyDatabase';

export default function ScottyGuideEnhanced() {
  // State management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Conversation management
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const [availableTowns, setAvailableTowns] = useState([]);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);

  // Paywall
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(null);
  const { upgradeModalProps, showUpgradeModal, hideUpgradeModal } = useUpgradeModal();

  // Refs
  const messagesEndRef = useRef(null);
  const historyDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user?.id) {
        navigate('/login');
        return;
      }

      // Load user context
      const context = await getUserContext(user.id);
      setUserContext(context);

      // Load favorites
      const { favorites: userFavorites } = await fetchFavorites(user.id);
      setFavorites(userFavorites || []);

      // Load available towns for mention detection
      const { data: towns } = await supabase
        .from('towns')
        .select('id, name, country')
        .order('name');

      if (towns) {
        setAvailableTowns(towns);
      }

      // Load recent conversations from database
      const recentConversations = await getUserConversations(10);
      setConversations(recentConversations);

      // Load paywall limits
      const limit = await getFeatureLimit('scotty_chats');
      setMonthlyLimit(limit);

      // Get current month usage
      const { data: usage } = await supabase.rpc('get_scotty_chat_count_current_month');
      setMonthlyUsage(usage || 0);

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Unable to load Scotty. Please refresh the page.');
    } finally {
      setContextLoading(false);
    }
  };

  // Start new conversation
  const startNewConversation = async (townContext = null) => {
    try {
      setMessages([]);
      setActiveConversationId(null);
      setActiveTown(townContext);

      if (townContext) {
        // Generate town-specific welcome message
        const synopsis = generateTownSynopsis(townContext);
        const welcomeMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: synopsis
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Load existing conversation
  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);

      // Load messages from database
      const dbMessages = await loadConversationMessages(conversationId);

      // Transform to component format
      const formattedMessages = dbMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at
      }));

      setMessages(formattedMessages);
      setActiveConversationId(conversationId);

      // Find and set town context if exists
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation?.town_id) {
        setActiveTown({
          id: conversation.town_id,
          name: conversation.town_name,
          country: conversation.town_country
        });
      }

      setHistoryDropdownOpen(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Unable to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    // Check paywall limits
    if (monthlyLimit !== null && monthlyUsage >= monthlyLimit) {
      showUpgradeModal({
        featureName: 'Scotty AI Conversations',
        currentLimit: monthlyLimit,
        currentUsage: monthlyUsage,
        suggestedTier: monthlyLimit < 50 ? 'premium' : 'enterprise'
      });
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      // Create or get conversation
      let conversationId = activeConversationId;

      if (!conversationId) {
        const topicCategory = getTopicCategory(userMessage, activeTown);

        conversationId = await getOrCreateConversation({
          title: generateSmartTitle(userMessage, activeTown),
          townId: activeTown?.id,
          townName: activeTown?.name,
          townCountry: activeTown?.country,
          topicCategory
        });

        setActiveConversationId(conversationId);

        // Record usage for paywall
        await supabase.rpc('record_scotty_chat', {
          p_metadata: {
            conversation_id: conversationId,
            topic: topicCategory,
            town_id: activeTown?.id,
            town_name: activeTown?.name
          }
        });

        // Update usage count
        setMonthlyUsage(prev => prev + 1);
      }

      // Add user message to UI
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);

      // Detect topics and mentioned towns
      const topics = detectTopics(userMessage);
      const mentionedTownIds = extractMentionedTowns(userMessage, availableTowns);

      // Save user message to database
      await saveMessage({
        conversationId,
        role: 'user',
        content: userMessage,
        mentionedTownIds,
        detectedTopics: topics
      });

      // Generate Scotty's response
      const scottyPersona = buildScottyPersona();
      const fullMessage = `As Scotty the retirement guide, help with this question: ${userMessage}`;
      const claudeResponse = await askConsultant(fullMessage, scottyPersona);

      // Add Scotty's response to UI
      const scottyMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: claudeResponse
      };

      const finalMessages = [...newMessages, scottyMsg];
      setMessages(finalMessages);

      // Save Scotty's response to database
      const scottyTopics = detectTopics(claudeResponse);
      const scottyMentionedTowns = extractMentionedTowns(claudeResponse, availableTowns);

      await saveMessage({
        conversationId,
        role: 'assistant',
        content: claudeResponse,
        mentionedTownIds: scottyMentionedTowns,
        detectedTopics: scottyTopics
      });

      // Update conversation title if it was the first message
      if (messages.length === 0 || (messages.length === 1 && activeTown)) {
        const smartTitle = generateSmartTitle(userMessage, activeTown);
        await updateConversationTitle(conversationId, smartTitle);
      }

      // Reload conversations list
      const updatedConversations = await getUserConversations(10);
      setConversations(updatedConversations);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build Scotty's persona with user context
  const buildScottyPersona = () => {
    const contextPrompt = userContext ? formatContextForPrompt(userContext) : '';
    const geographicKnowledge = enhanceScottyWithGeographicKnowledge();

    return `You are Scotty, a friendly and knowledgeable AI retirement planning assistant for Scout2Retire.

    ${contextPrompt}

    ${geographicKnowledge}

    IMPORTANT RESPONSE GUIDELINES:
    1. Be conversational and friendly
    2. Keep initial responses concise (2-3 paragraphs max)
    3. When listing items, use no more than 3-4 bullet points
    4. Focus on the specific question asked
    5. Reference the user's context when relevant
    6. Offer to provide more details if they want to dive deeper

    Remember: You're chatting on a mobile-friendly interface - be helpful but concise!`;
  };

  // Generate smart title from conversation
  const generateSmartTitle = (firstMessage, town) => {
    if (town) {
      const text = firstMessage.toLowerCase();
      if (text.includes('visa') || text.includes('residency')) {
        return `${town.name} visa info`;
      }
      if (text.includes('cost') || text.includes('budget')) {
        return `${town.name} costs`;
      }
      if (text.includes('health')) {
        return `${town.name} healthcare`;
      }
      return `${town.name} exploration`;
    }

    // General conversation titles
    const text = firstMessage.toLowerCase();
    if (text.includes('recommend')) return 'Town recommendations';
    if (text.includes('visa')) return 'Visa questions';
    if (text.includes('budget') || text.includes('cost')) return 'Budget planning';
    if (text.includes('health')) return 'Healthcare info';

    // Use first few words
    return firstMessage.split(' ').slice(0, 4).join(' ') + '...';
  };

  // Generate town synopsis
  const generateTownSynopsis = (town) => {
    const name = town.name || town.town_name;
    const country = town.country || town.town_country;

    if (!name || !country) {
      return "I'd be happy to help you learn more about this location!";
    }

    let synopsis = `Welcome! Let's explore **${name}, ${country}** together.\n\n`;

    // Add citizenship-specific info
    if (userContext?.citizenship?.is_eu_citizen &&
        ['Portugal', 'Spain', 'Italy', 'France', 'Germany'].includes(country)) {
      synopsis += `As an EU citizen, you'll enjoy full residency rights here. `;
    } else if (userContext?.citizenship?.primary === 'us' &&
               ['Mexico', 'Panama', 'Costa Rica'].includes(country)) {
      synopsis += `Many US retirees love ${name} for its proximity to home. `;
    }

    synopsis += `\n\nWhat would you like to know about ${name}? I can help with:`;
    synopsis += `\n• Cost of living and budget planning`;
    synopsis += `\n• Healthcare and medical facilities`;
    synopsis += `\n• Visa requirements and residency`;
    synopsis += `\n• Climate and lifestyle`;

    return synopsis;
  };

  // UI Render
  if (contextLoading) {
    return (
      <>
        <UnifiedHeader />
        <HeaderSpacer />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <UnifiedHeader />
      <HeaderSpacer />

      <div className={`${uiConfig.layout.container} ${uiConfig.layout.spacing.lg} max-w-4xl mx-auto`}>
        {/* Header with usage indicator */}
        <div className="flex justify-between items-center mb-4">
          <h1 className={`${uiConfig.typography.h1}`}>Scotty AI Assistant</h1>

          {monthlyLimit && (
            <div className="text-sm text-gray-500">
              {monthlyUsage}/{monthlyLimit} chats this month
            </div>
          )}
        </div>

        {/* Conversation history dropdown */}
        {conversations.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
              className={`${uiConfig.button.secondary} w-full text-left`}
            >
              Recent Conversations ▼
            </button>

            {historyDropdownOpen && (
              <div className={`mt-2 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-2`}>
                <button
                  onClick={() => startNewConversation()}
                  className={`block w-full text-left p-2 hover:bg-gray-100 rounded`}
                >
                  + New Conversation
                </button>

                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`block w-full text-left p-2 hover:bg-gray-100 rounded ${
                      activeConversationId === conv.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="font-medium">{conv.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages area */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-4 h-96 overflow-y-auto mb-4`}>
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-2">👋 Hi, I'm Scotty!</p>
              <p>Your AI retirement planning assistant</p>
              <p className="mt-4">Ask me anything about:</p>
              <ul className="mt-2">
                <li>• Finding the perfect retirement destination</li>
                <li>• Visa requirements and residency</li>
                <li>• Cost of living and budgeting</li>
                <li>• Healthcare and lifestyle</li>
              </ul>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-3xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      msg.content.replace(/\n/g, '<br />')
                    )
                  }}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center">
              <div className="inline-block animate-pulse">Scotty is thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Scotty anything..."
            disabled={loading}
            className={`flex-1 ${uiConfig.input.default}`}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className={`${uiConfig.button.primary} px-6`}
          >
            Send
          </button>
        </div>
      </div>

      {/* Upgrade modal */}
      <UpgradeModal {...upgradeModalProps} onClose={hideUpgradeModal} />
    </>
  );
}