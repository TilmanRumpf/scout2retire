import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchFavorites } from '../utils/townUtils';
import QuickNav from '../components/QuickNav';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function Chat() {
  const [activeChat, setActiveChat] = useState('lounge'); // 'lounge', 'scotti', or townId, or userId
  const [favorites, setFavorites] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const { townId } = useParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        setUserId(user.id);

        // Get favorites
        const { success, favorites: userFavorites } = await fetchFavorites(user.id);
        if (success) {
          setFavorites(userFavorites);
        }

        // Get companions/friends (mock data for now)
        // In a real implementation, this would fetch from a friends/connections table
        setCompanions([
          { id: 'user1', name: 'Sarah Mitchell', status: 'online', lastMessage: 'Great tips about Valencia!' },
          { id: 'user2', name: 'James Chen', status: 'offline', lastMessage: 'Let me know if you visit Porto' },
          { id: 'user3', name: 'Maria Rodriguez', status: 'online', lastMessage: 'The healthcare system is excellent' },
        ]);

        // Set active chat based on URL parameter
        if (townId) {
          setActiveChat(townId);
        }

        // Load messages for active chat
        await loadMessages(activeChat);
      } catch (err) {
        console.error("Error loading chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [townId]);

  const loadMessages = async (chatId) => {
    // Load messages based on chat type
    // This would fetch from your messages table
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Send message logic here
      toast.success('Message sent!');
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const getChatTitle = () => {
    if (activeChat === 'lounge') return 'Retirement Lounge';
    if (activeChat === 'scotti') return 'Chat with Scotti';
    
    // Check if it's a companion chat
    const companion = companions.find(c => c.id === activeChat);
    if (companion) return companion.name;
    
    // Check if it's a town chat
    const favorite = favorites.find(f => f.town_id === activeChat);
    if (favorite) return `${favorite.towns?.name} Discussion`;
    
    return 'Chat';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            {getChatTitle()}
          </h1>

          {/* Chat Options */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Chat Options
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveChat('lounge')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeChat === 'lounge'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Retirement Lounge</span>
              </button>
              <button
                onClick={() => setActiveChat('scotti')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeChat === 'scotti'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Chat with Scotti</span>
              </button>
            </div>
          </div>

          {/* Companions & Friends */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Companions & Friends
            </h2>
            <div className="space-y-2">
              {companions.map((companion) => (
                <button
                  key={companion.id}
                  onClick={() => setActiveChat(companion.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeChat === companion.id
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                      {companion.name.charAt(0)}
                    </div>
                    {companion.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{companion.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {companion.lastMessage}
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Add Friend Button */}
              <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm">Find Companions</span>
              </button>
            </div>
          </div>

          {/* Your Favorite Towns */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Your Favorite Towns
            </h2>
            <div className="space-y-2">
              {favorites.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-3">
                  No favorite towns yet
                </p>
              ) : (
                favorites.map((favorite) => (
                  <button
                    key={favorite.town_id}
                    onClick={() => setActiveChat(favorite.town_id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeChat === favorite.town_id
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{favorite.towns?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {favorite.towns?.country}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Messages would be rendered here */}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message the ${getChatTitle().toLowerCase()}...`}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span>Send</span>
            </button>
          </div>
        </div>
      </main>

      {/* Quick Navigation */}
      <QuickNav />
    </div>
  );
}