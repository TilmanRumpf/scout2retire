import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { sanitizeChatMessage } from '../utils/sanitizeUtils';
import toast from 'react-hot-toast';

/**
 * useChatActions - Handles chat navigation and message sending
 * Extracted from Chat.jsx
 */
export function useChatActions({
  user,
  threads,
  setThreads,
  setActiveTown,
  setChatType,
  setMessages,
  setActiveThread,
  setActiveGroupChat,
  setActiveFriend,
  setShowChatList,
  messageInput,
  setMessageInput,
  activeThread,
  chatType,
  isTyping,
  setIsTyping,
  isMobile,
  loadMessages,
  markThreadAsRead,
  getAIResponse
}) {
  const navigate = useNavigate();

  // Switch to town chat
  const switchToTownChat = async (town) => {
    try {
      setActiveTown(town);
      setChatType('town');
      setMessages([]);

      if (isMobile) {
        setShowChatList(false);
      }

      let townThread = threads.find(thread => thread.town_id === town.id);

      if (!townThread) {
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: town.id,
            topic: town.town_name,
            created_by: user.id
          }])
          .select();

        if (createError) {
          console.error("Create thread error:", createError);
          toast.error("Failed to create town chat");
          return;
        }

        townThread = newThread[0];
        setThreads(prev => [townThread, ...prev]);
      }

      setActiveThread(townThread);
      navigate(`/chat/${town.id}`, { replace: true });
      await loadMessages(townThread.id);
    } catch (err) {
      console.error("Error switching to town chat:", err);
      toast.error("Failed to load town chat");
    }
  };

  // Switch to lounge chat
  const switchToLoungeChat = async () => {
    try {
      setActiveTown(null);
      setChatType('lounge');
      setMessages([]);

      if (isMobile) {
        setShowChatList(false);
      }

      let loungeThread = threads.find(thread => thread.town_id === null && thread.topic === 'Lounge');

      if (!loungeThread) {
        const { data: newThread, error: createError} = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: 'Lounge',
            created_by: user.id
          }])
          .select();

        if (createError) {
          console.error("Create lounge error:", createError);
          toast.error("Failed to create lounge chat");
          return;
        }

        loungeThread = newThread[0];
        setThreads(prev => [loungeThread, ...prev]);
      }

      setActiveThread(loungeThread);
      navigate('/chat', { replace: true });
      await loadMessages(loungeThread.id);
    } catch (err) {
      console.error("Error switching to lounge chat:", err);
      toast.error("Failed to load lounge chat");
    }
  };

  // Switch to country lounge chat
  const switchToCountryLoungeChat = async (countryName) => {
    console.log('🌍 switchToCountryLoungeChat called with:', countryName);
    try {
      setActiveTown(null);
      setChatType('lounge');
      setMessages([]);

      if (isMobile) {
        setShowChatList(false);
      }

      // Find or create thread for this specific country
      let countryThread = threads.find(thread => thread.town_id === null && thread.topic === countryName);

      if (!countryThread) {
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: countryName,
            created_by: user.id
          }])
          .select();

        if (createError) {
          console.error("Create country lounge error:", createError);
          toast.error(`Failed to create ${countryName} lounge chat`);
          return;
        }

        countryThread = newThread[0];
        setThreads(prev => [countryThread, ...prev]);
      }

      setActiveThread(countryThread);
      console.log('✅ Set active thread:', { id: countryThread.id, topic: countryThread.topic });
      navigate('/chat', { replace: true });
      await loadMessages(countryThread.id);
      toast.success(`Opened ${countryName} lounge`);
    } catch (err) {
      console.error("Error switching to country lounge chat:", err);
      toast.error(`Failed to load ${countryName} lounge chat`);
    }
  };

  // Switch to group chat
  const switchToGroupChat = async (group) => {
    try {
      setActiveGroupChat(group);
      setChatType('group');
      setMessages([]);
      setActiveThread(group);

      if (isMobile) {
        setShowChatList(false);
      }

      navigate(`/chat/group/${group.id}`, { replace: true });
      await loadMessages(group.id);
    } catch (err) {
      console.error("Error switching to group chat:", err);
      toast.error("Failed to load group chat");
    }
  };

  // Switch to friend chat
  const switchToFriendChat = async (friend) => {
    try {
      setActiveFriend(friend);
      setChatType('friends');
      setActiveTown(null);
      setMessages([]);

      if (isMobile) {
        setShowChatList(false);
      }

      const sortedTopic = `friend-${[user.id, friend.friend_id].sort().join('-')}`;
      let friendThread = threads.find(thread => thread.topic === sortedTopic);

      if (!friendThread) {
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: sortedTopic,
            created_by: user.id
          }])
          .select();

        if (createError) {
          console.error("Create friend thread error:", createError);
          toast.error("Failed to create friend chat");
          return;
        }

        friendThread = newThread[0];
        setThreads(prev => [friendThread, ...prev]);
      }

      setActiveThread(friendThread);
      navigate(`/chat?friend=${friend.friend_id}`, { replace: true });
      await loadMessages(friendThread.id);
    } catch (err) {
      console.error("Error switching to friend chat:", err);
      toast.error("Failed to load friend chat");
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const validation = sanitizeChatMessage(messageInput);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const messageText = validation.sanitized;
    setMessageInput('');

    if (chatType === 'scout') {
      const userMessage = {
        id: `user-${Date.now()}`,
        message: messageText,
        user_id: user.id,
        user_name: user.username || 'You',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse = getAIResponse(messageText);

        const loungeResponse = {
          id: `lounge-${Date.now()}`,
          message: aiResponse,
          user_id: 'community',
          user_name: 'Community Assistant',
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, loungeResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);

      return;
    }

    if (!activeThread) {
      toast.error("No active chat selected");
      return;
    }

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      thread_id: activeThread.id,
      user_id: user.id,
      message: messageText,
      created_at: new Date().toISOString(),
      user_name: user.username || 'You'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          thread_id: activeThread.id,
          user_id: user.id,
          message: messageText
        }])
        .select();

      if (error) {
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        toast.error("Failed to send message");
        console.error("Send message error:", error);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  return {
    switchToTownChat,
    switchToLoungeChat,
    switchToCountryLoungeChat,
    switchToGroupChat,
    switchToFriendChat,
    handleSendMessage
  };
}
