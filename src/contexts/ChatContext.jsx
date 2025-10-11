import { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatState } from '../hooks/useChatState';
import * as dataService from '../services/chatDataService';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const navigate = useNavigate();
  const chatState = useChatState();
  const { user, setFriends, setGroupChats, setMessages, setActiveThread, setChatType, 
    setActiveTown, setActiveGroupChat, setActiveFriend, setUnreadCounts } = chatState;

  // Data loaders with error handling
  const loadFriends = useCallback(async (userId) => {
    try {
      const data = await dataService.loadFriends(userId);
      setFriends(data);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  }, [setFriends]);

  const loadGroupChats = useCallback(async (userId) => {
    try {
      const data = await dataService.loadGroupChats(userId);
      setGroupChats(data);
      if (data.length > 0) {
        const counts = await dataService.loadUnreadCounts(data);
        setUnreadCounts(prev => ({ ...prev, ...counts }));
      }
    } catch (err) {
      console.error("Error loading group chats:", err);
    }
  }, [setGroupChats, setUnreadCounts]);

  const loadMessages = useCallback(async (threadId) => {
    try {
      const data = await dataService.loadMessages(threadId);
      setMessages(data);
      if (user) await dataService.markThreadAsRead(threadId, user.id);
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load messages");
    }
  }, [setMessages, user]);

  // Navigation actions
  const switchToTownChat = useCallback(async (town) => {
    setActiveTown(town);
    setChatType('town');
    navigate(`/chat/${town.id}`);
  }, [setActiveTown, setChatType, navigate]);

  const switchToGroupChat = useCallback(async (group) => {
    setActiveGroupChat(group);
    setChatType('group');
    setActiveThread(group);
    await loadMessages(group.id);
  }, [setActiveGroupChat, setChatType, setActiveThread, loadMessages]);

  const switchToFriendChat = useCallback(async (friend) => {
    setActiveFriend(friend);
    setChatType('friends');
    // Find or create friend thread...
  }, [setActiveFriend, setChatType]);

  const value = {
    ...chatState,
    loadFriends,
    loadGroupChats,
    loadMessages,
    switchToTownChat,
    switchToGroupChat,
    switchToFriendChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
}
