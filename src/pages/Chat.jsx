import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites } from '../utils/townUtils';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';

export default function Chat() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [chatType, setChatType] = useState('town'); // 'town', 'lounge', 'scout'
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { townId } = useParams();
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { user: currentUser, profile: userProfile } = await getCurrentUser();
        if (!currentUser) {
          navigate('/welcome');
          return;
        }
        
        setUser({ ...currentUser, profile: userProfile });
        
        // Fetch user's favorites
        const { success: favSuccess, favorites: userFavorites } = await fetchFavorites(currentUser.id);
        if (favSuccess) {
          setFavorites(userFavorites);
        }
        
        // Fetch chat threads
        const { data: threadData, error: threadError } = await supabase
          .from('chat_threads')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (threadError) {
          throw new Error(threadError.message);
        }
        
        setThreads(threadData || []);
        
        // If townId is provided, load that town and its thread
        if (townId) {
          // Get town data
          const { success, towns } = await fetchTowns({ townIds: [townId] });
          
          if (success && towns.length > 0) {
            setActiveTown(towns[0]);
            setChatType('town');
            
            // Find or create thread for this town
            let townThread = threadData.find(thread => thread.town_id === townId);
            
            if (!townThread) {
              // Create new thread for this town
              const { data: newThread, error: createError } = await supabase
                .from('chat_threads')
                .insert([{
                  town_id: townId,
                  topic: towns[0].name,
                  created_by: currentUser.id
                }])
                .select();
                
              if (createError) {
                throw new Error(createError.message);
              }
              
              townThread = newThread[0];
              setThreads(prev => [townThread, ...prev]);
            }
            
            setActiveThread(townThread);
            
            // Fetch messages for this thread
            await loadMessages(townThread.id);
          }
        } else {
          // Default to lounge chat if no town specified
          setChatType('lounge');
          
          // Find or create lounge thread
          let loungeThread = threadData.find(thread => thread.town_id === null && thread.topic === 'Lounge');
          
          if (!loungeThread) {
            // Create lounge thread
            const { data: newThread, error: createError } = await supabase
              .from('chat_threads')
              .insert([{
                town_id: null,
                topic: 'Lounge',
                created_by: currentUser.id
              }])
              .select();
              
            if (createError) {
              throw new Error(createError.message);
            }
            
            loungeThread = newThread[0];
            setThreads(prev => [loungeThread, ...prev]);
          }
          
          setActiveThread(loungeThread);
          
          // Fetch messages for lounge
          await loadMessages(loungeThread.id);
        }
      } catch (err) {
        console.error("Error loading chat data:", err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, townId]);
  
  // Load messages for a thread
  const loadMessages = async (threadId) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:user_id (
            id,
            email,
            users (
              full_name
            )
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        throw new Error(messagesError.message);
      }
      
      // Format messages for display
      const formattedMessages = messagesData.map(msg => ({
        ...msg,
        user_name: msg.user?.users?.full_name || msg.user?.email?.split('@')[0] || 'Anonymous'
      }));
      
      setMessages(formattedMessages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load messages");
    }
  };
  
  // Subscribe to new messages
  useEffect(() => {
    if (!activeThread) return;
    
    // Subscribe to new messages in this thread
    const subscription = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`
        },
        (payload) => {
          // Fetch full message data with user info
          const fetchMessageData = async () => {
            try {
              const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                  *,
                  user:user_id (
                    id,
                    email,
                    users (
                      full_name
                    )
                  )
                `)
                .eq('id', payload.new.id)
                .single();
                
              if (error) throw error;
              
              // Format and add to messages
              const formattedMessage = {
                ...data,
                user_name: data.user?.users?.full_name || data.user?.email?.split('@')[0] || 'Anonymous'
              };
              
              setMessages(prev => [...prev, formattedMessage]);
            } catch (err) {
              console.error("Error fetching new message:", err);
            }
          };
          
          fetchMessageData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeThread]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Switch to town chat
  const switchToTownChat = async (town) => {
    try {
      setActiveTown(town);
      setChatType('town');
      
      // Find or create thread for this town
      let townThread = threads.find(thread => thread.town_id === town.id);
      
      if (!townThread) {
        // Create new thread for this town
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: town.id,
            topic: town.name,
            created_by: user.id
          }])
          .select();
          
        if (createError) {
          throw new Error(createError.message);
        }
        
        townThread = newThread[0];
        setThreads(prev => [townThread, ...prev]);
      }
      
      setActiveThread(townThread);
      
      // Update URL
      navigate(`/chat/${town.id}`, { replace: true });
      
      // Fetch messages for this thread
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
      
      // Find or create lounge thread
      let loungeThread = threads.find(thread => thread.town_id === null && thread.topic === 'Lounge');
      
      if (!loungeThread) {
        // Create lounge thread
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: 'Lounge',
            created_by: user.id
          }])
          .select();
          
        if (createError) {
          throw new Error(createError.message);
        }
        
        loungeThread = newThread[0];
        setThreads(prev => [loungeThread, ...prev]);
      }
      
      setActiveThread(loungeThread);
      
      // Update URL
      navigate('/chat', { replace: true });
      
      // Fetch messages for lounge
      await loadMessages(loungeThread.id);
    } catch (err) {
      console.error("Error switching to lounge chat:", err);
      toast.error("Failed to load lounge chat");
    }
  };
  
  // Switch to scout chat (AI assistant)
  const switchToScoutChat = () => {
    setActiveTown(null);
    setActiveThread(null);
    setMessages([
      {
        id: 'welcome',
        message: "Hi there! I'm Scotti, your retirement town scout. I can help answer questions about retirement locations, visa requirements, cost of living, and more. What would you like to know?",
        user_id: 'scout',
        user_name: 'Scotti (AI)',
        created_at: new Date().toISOString()
      }
    ]);
    setChatType('scout');
    
    // Update URL
    navigate('/chat?scout=true', { replace: true });
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    if (chatType === 'scout') {
      // Handle scout AI chat
      const userMessage = {
        id: `user-${Date.now()}`,
        message: messageInput,
        user_id: user.id,
        user_name: user.profile?.full_name || user.email.split('@')[0],
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessageInput('');
      
      // Simulate AI response (in a real app, this would call an AI API)
      setTimeout(() => {
        let aiResponse = "I'm sorry, I'm still learning about that. Would you like me to suggest some popular retirement towns based on your preferences?";
        
        // Simple keyword-based responses
        if (messageInput.toLowerCase().includes('cost') || messageInput.toLowerCase().includes('expensive') || messageInput.toLowerCase().includes('budget')) {
          aiResponse = "The cost of living varies greatly depending on location. Portugal, Spain, and Mexico are known for offering good value. Within the EU, eastern countries like Romania and Bulgaria are more affordable than western Europe. Southeast Asia (Thailand, Malaysia) offers very low costs but may have visa restrictions. Would you like more specific information about a particular country?";
        } else if (messageInput.toLowerCase().includes('visa') || messageInput.toLowerCase().includes('permit') || messageInput.toLowerCase().includes('residency')) {
          aiResponse = "Many countries offer retirement visas with different requirements. Portugal's D7 visa requires passive income around €8,400/year. Spain's Non-Lucrative visa needs about €27,000/year. Panama's Pensionado requires $1,000/month pension. Mexico offers a Temporary Resident visa with income requirements around $1,500/month. Would you like details about a specific country's requirements?";
        } else if (messageInput.toLowerCase().includes('healthcare') || messageInput.toLowerCase().includes('medical') || messageInput.toLowerCase().includes('hospital')) {
          aiResponse = "Healthcare quality and access varies by country. France, Spain, and Portugal offer excellent public healthcare systems accessible to residents. Mexico has quality private care at lower costs than the US. Thailand and Malaysia have become medical tourism destinations with excellent private hospitals. Insurance requirements also vary by country's visa program. Would you like me to explain more about healthcare in a specific country?";
        } else if (messageInput.toLowerCase().includes('weather') || messageInput.toLowerCase().includes('climate')) {
          aiResponse = "Climate preferences are very personal! Mediterranean climates (Southern Spain, Portugal, Italy, Greece) offer mild winters and warm, dry summers. Latin America varies by altitude - coastal areas are tropical while mountain towns like Cuenca (Ecuador) or San Miguel de Allende (Mexico) have eternal spring-like weather. Southeast Asia is mostly tropical but mountain regions in Thailand and Malaysia can be cooler. What climate are you looking for?";
        }
        
        const scoutResponse = {
          id: `scout-${Date.now()}`,
          message: aiResponse,
          user_id: 'scout',
          user_name: 'Scotti (AI)',
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, scoutResponse]);
      }, 1500);
      
      return;
    }
    
    if (!activeThread) {
      toast.error("No active chat selected");
      return;
    }
    
    try {
      // Add message to database
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          thread_id: activeThread.id,
          user_id: user.id,
          message: messageInput
        }]);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Clear input
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };
  
  // Format date for display
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {chatType === 'town' && activeTown ? `Chat: ${activeTown.name}` : 
               chatType === 'lounge' ? 'Retirement Lounge' : 
               'Chat with Scotti'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {/* Chat navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white">Chat Options</h2>
              </div>
              
              <div className="p-2 space-y-1">
                <button
                  onClick={switchToLoungeChat}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    chatType === 'lounge' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span className="font-medium">Retirement Lounge</span>
                  </div>
                </button>
                
                <button
                  onClick={switchToScoutChat}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    chatType === 'scout' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-medium">Chat with Scotti</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Favorite towns */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white">Your Favorite Towns</h2>
              </div>
              
              {favorites.length === 0 ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                  <p>No favorite towns yet.</p>
                  <a href="/discover" className="text-green-600 dark:text-green-400 hover:underline mt-2 inline-block">
                    Discover towns
                  </a>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {favorites.map(favorite => (
                    <button
                      key={favorite.town_id}
                      onClick={() => switchToTownChat(favorite.towns)}
                      className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        chatType === 'town' && activeTown?.id === favorite.town_id
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white text-sm">
                            {favorite.towns.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {favorite.towns.country}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        message.user_id === user?.id
                          ? 'bg-green-600 text-white'
                          : message.user_id === 'scout'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center text-xs mb-1">
                        <span className={`font-medium ${
                          message.user_id === user?.id
                            ? 'text-green-100'
                            : message.user_id === 'scout'
                            ? 'text-blue-100'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {message.user_id === user?.id ? 'You' : message.user_name}
                        </span>
                        <span className={`ml-2 ${
                          message.user_id === user?.id
                            ? 'text-green-200'
                            : message.user_id === 'scout'
                            ? 'text-blue-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatMessageDate(message.created_at)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.message}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${
                    chatType === 'town' && activeTown 
                      ? activeTown.name + ' chat' 
                      : chatType === 'lounge' 
                      ? 'the retirement lounge' 
                      : 'Scotti'
                  }...`}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
    </div>
  );
}