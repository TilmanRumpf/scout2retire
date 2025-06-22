import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites } from '../utils/townUtils';
import { sanitizeChatMessage, MAX_LENGTHS } from '../utils/sanitizeUtils';
import { findUserByEmail } from '../utils/userSearchUtils';
import PageErrorBoundary from '../components/PageErrorBoundary';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

export default function Chat() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeTown, setActiveTown] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [chatType, setChatType] = useState('town'); // 'town', 'lounge', 'scout', 'friends'
  const [isTyping, setIsTyping] = useState(false);
  const [showCompanionsModal, setShowCompanionsModal] = useState(false);
  const [companions, setCompanions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const defaultInviteMessage = "Hi! I'm using Scout2Retire to plan my retirement. I've been exploring different retirement destinations and would love to connect with you to share ideas and experiences. Maybe we can help each other find the perfect place to enjoy our next chapter!\n\nLooking forward to chatting with you about our retirement plans.";
  const [pendingInvitations, setPendingInvitations] = useState({ sent: [], received: [] });
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { townId } = useParams();
  const [searchParams] = useSearchParams();
  
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
        
        setUser({ ...currentUser, ...userProfile });
        
        // Fetch user's favorites
        const { success: favSuccess, favorites: userFavorites } = await fetchFavorites(currentUser.id);
        if (favSuccess) {
          setFavorites(userFavorites);
        }
        
        // Fetch user's friends and pending invitations
        await loadFriends(currentUser.id);
        await loadPendingInvitations(currentUser.id);
        
        // Load suggested companions
        await loadSuggestedCompanions(currentUser.id);
        
        // Fetch chat threads
        const { data: threadData, error: threadError } = await supabase
          .from('chat_threads')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (threadError) {
          console.error("Thread fetch error:", threadError);
          toast.error("Failed to load chat threads");
        }
        
        setThreads(threadData || []);
        
        // Check if scout chat is requested via URL param
        if (searchParams.get('scout') === 'true') {
          switchToScoutChat();
        }
        // If townId is provided, load that town and its thread
        else if (townId) {
          // Get town data
          const { success, towns } = await fetchTowns({ townIds: [townId] });
          
          if (success && towns.length > 0) {
            setActiveTown(towns[0]);
            setChatType('town');
            
            // Find or create thread for this town
            let townThread = threadData?.find(thread => thread.town_id === townId);
            
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
                console.error("Create thread error:", createError);
                toast.error("Failed to create chat thread");
              } else {
                townThread = newThread[0];
                setThreads(prev => [townThread, ...prev]);
              }
            }
            
            if (townThread) {
              setActiveThread(townThread);
              await loadMessages(townThread.id);
            }
          }
        } else {
          // Default to lounge chat if no town specified
          setChatType('lounge');
          
          // Find or create lounge thread
          let loungeThread = threadData?.find(thread => thread.town_id === null && thread.topic === 'Lounge');
          
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
              console.error("Create lounge error:", createError);
              toast.error("Failed to create lounge chat");
            } else {
              loungeThread = newThread[0];
              setThreads(prev => [loungeThread, ...prev]);
            }
          }
          
          if (loungeThread) {
            setActiveThread(loungeThread);
            await loadMessages(loungeThread.id);
          }
        }
      } catch (err) {
        console.error("Error loading chat data:", err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, townId, searchParams]);
  
  // Load user's friends
  const loadFriends = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'accepted');
        
      if (error) {
        console.error("Error loading friends:", error);
        return;
      }
      
      // Fetch user details for friends
      const friendsWithDetails = await Promise.all(
        (data || []).map(async (connection) => {
          try {
            const { data: friendData, error } = await supabase.rpc('get_user_by_id', { user_id: connection.friend_id });
            if (error) {
              console.log("RPC function not available, friend will show without name");
              return connection;
            }
            return {
              ...connection,
              friend: friendData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching friend details:", err);
            return connection;
          }
        })
      );
      
      setFriends(friendsWithDetails);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  };
  
  // Load pending invitations
  const loadPendingInvitations = async (userId) => {
    try {
      // Load invitations sent by the user
      const { data: sentInvites, error: sentError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');
        
      // Load invitations received by the user
      const { data: receivedInvites, error: receivedError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');
        
      if (sentError || receivedError) {
        console.error("Error loading invitations:", sentError || receivedError);
        return;
      }
      
      // Fetch user details for sent invitations
      const sentWithDetails = await Promise.all(
        (sentInvites || []).map(async (invite) => {
          try {
            const { data: friendData, error } = await supabase.rpc('get_user_by_id', { user_id: invite.friend_id });
            if (error) {
              console.log("RPC function not available, invitation will show without name");
              return invite;
            }
            return {
              ...invite,
              friend: friendData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching friend details:", err);
            return invite;
          }
        })
      );
      
      // Fetch user details for received invitations
      const receivedWithDetails = await Promise.all(
        (receivedInvites || []).map(async (invite) => {
          try {
            const { data: userData, error } = await supabase.rpc('get_user_by_id', { user_id: invite.user_id });
            if (error) {
              console.log("RPC function not available, invitation will show without name");
              return invite;
            }
            return {
              ...invite,
              user: userData?.[0] || null
            };
          } catch (err) {
            console.log("Error fetching user details:", err);
            return invite;
          }
        })
      );
      
      setPendingInvitations({
        sent: sentWithDetails,
        received: receivedWithDetails
      });
    } catch (err) {
      console.error("Error loading pending invitations:", err);
    }
  };
  
  // Load suggested companions based on similarity
  const loadSuggestedCompanions = async (userId) => {
    try {
      // Get user's onboarding data for similarity matching
      const { data: userPrefs, error: prefError } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (prefError || !userPrefs) {
        console.error("Error loading user preferences:", prefError);
        return;
      }
      
      // Get other users with similar preferences (simplified similarity algorithm)
      const { data: similarUsers, error } = await supabase
        .from('users')
        .select(`
          *,
          onboarding_responses (*)
        `)
        .neq('id', userId)
        .limit(10);
        
      if (error) {
        console.error("Error loading similar users:", error);
        return;
      }
      
      // Calculate similarity scores (simplified - in production, this would be more sophisticated)
      const scoredUsers = similarUsers
        .filter(u => u.onboarding_responses && u.onboarding_responses.length > 0)
        .map(u => {
          const theirPrefs = u.onboarding_responses[0];
          let score = 0;
          
          // Compare regions
          if (userPrefs.region_preferences?.continents && theirPrefs.region_preferences?.continents) {
            const commonContinents = userPrefs.region_preferences.continents.filter(c => 
              theirPrefs.region_preferences.continents.includes(c)
            );
            score += commonContinents.length * 10;
          }
          
          // Compare budget (within 20%)
          if (userPrefs.budget?.monthly_budget && theirPrefs.budget?.monthly_budget) {
            const budgetDiff = Math.abs(userPrefs.budget.monthly_budget - theirPrefs.budget.monthly_budget);
            const avgBudget = (userPrefs.budget.monthly_budget + theirPrefs.budget.monthly_budget) / 2;
            if (budgetDiff / avgBudget < 0.2) {
              score += 15;
            }
          }
          
          // Compare climate preferences
          if (userPrefs.climate_preferences?.temperature_preference === theirPrefs.climate_preferences?.temperature_preference) {
            score += 10;
          }
          
          // Compare lifestyle
          if (userPrefs.culture_preferences?.pace_of_life === theirPrefs.culture_preferences?.pace_of_life) {
            score += 8;
          }
          
          return {
            ...u,
            similarity_score: score
          };
        })
        .filter(u => u.similarity_score > 20) // Only show users with meaningful similarity
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 5); // Top 5 matches
        
      setCompanions(scoredUsers);
    } catch (err) {
      console.error("Error loading companions:", err);
    }
  };
  
  // Load messages for a thread
  const loadMessages = async (threadId) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error("Messages fetch error:", messagesError);
        toast.error("Failed to load messages");
        return;
      }
      
      // Format messages for display
      const formattedMessages = messagesData.map(msg => ({
        ...msg,
        user_name: msg.users?.full_name || msg.users?.email?.split('@')[0] || 'Anonymous'
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
      .channel(`chat_messages:thread_id=eq.${activeThread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread.id}`
        },
        async (payload) => {
          // Don't add our own messages (they're added optimistically)
          if (payload.new.user_id === user?.id) return;
          
          // Fetch full message data with user info
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              users:user_id (
                id,
                email,
                full_name
              )
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }
          
          // Format and add to messages
          const formattedMessage = {
            ...data,
            user_name: data.users?.full_name || data.users?.email?.split('@')[0] || 'Anonymous'
          };
          
          setMessages(prev => [...prev, formattedMessage]);
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [activeThread, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Switch to town chat
  const switchToTownChat = async (town) => {
    try {
      setActiveTown(town);
      setChatType('town');
      setMessages([]);
      
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
          console.error("Create thread error:", createError);
          toast.error("Failed to create town chat");
          return;
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
      setMessages([]);
      
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
          console.error("Create lounge error:", createError);
          toast.error("Failed to create lounge chat");
          return;
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
        message: "Hi there! I'm Scotti, your retirement town scout. I can help answer questions about:\n\n• Retirement locations and recommendations\n• Visa requirements and residency permits\n• Cost of living comparisons\n• Healthcare systems by country\n• Climate and weather patterns\n• Tax implications for expats\n• And much more!\n\nWhat would you like to know?",
        user_id: 'scout',
        user_name: 'Scotti (AI Assistant)',
        created_at: new Date().toISOString()
      }
    ]);
    setChatType('scout');
    
    // Update URL
    navigate('/chat?scout=true', { replace: true });
  };
  
  // Enhanced AI responses for Scotti
  const getScottiResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Cost of living queries
    if (message.includes('cost') || message.includes('expensive') || message.includes('budget') || message.includes('afford')) {
      return "Great question about cost of living! Here's what I can tell you:\n\n**Most Affordable Regions:**\n• Southeast Asia: Thailand ($800-1500/mo), Vietnam ($700-1200/mo), Malaysia ($900-1500/mo)\n• Eastern Europe: Bulgaria ($700-1200/mo), Romania ($800-1400/mo)\n• Latin America: Mexico ($1000-1800/mo), Ecuador ($800-1500/mo), Colombia ($900-1600/mo)\n\n**Mid-Range Options:**\n• Portugal ($1500-2500/mo), Spain ($1800-3000/mo)\n• Greece ($1400-2400/mo), Croatia ($1200-2200/mo)\n\n**Higher Cost but High Quality:**\n• France ($2500-4000/mo), Italy ($2000-3500/mo)\n• Australia ($2500-4500/mo), Canada ($2000-3500/mo)\n\nWould you like specific breakdowns for any of these locations?";
    }
    
    // Visa and residency queries
    if (message.includes('visa') || message.includes('permit') || message.includes('residency') || message.includes('stay')) {
      return "I'd be happy to explain retirement visa options!\n\n**Popular Retirement Visas:**\n\n**Portugal D7 Visa**\n• Passive income: €705/month minimum\n• Path to EU residency in 5 years\n• Access to Schengen Area\n\n**Spain Non-Lucrative Visa**\n• Savings requirement: ~€27,000/year\n• Cannot work locally\n• Renewable annually\n\n**Panama Pensionado Program**\n• $1,000/month pension required\n• Many discounts for retirees\n• Fast track to permanent residency\n\n**Mexico Temporary Resident Visa**\n• Income: ~$1,500-2,000/month\n• Valid for up to 4 years\n• Can lead to permanent residency\n\n**Thailand Retirement Visa (O-A)**\n• Age 50+ required\n• 800,000 baht ($22,000) in bank\n• Annual renewal\n\nWhich country's requirements would you like more details about?";
    }
    
    // Healthcare queries
    if (message.includes('healthcare') || message.includes('medical') || message.includes('hospital') || message.includes('doctor') || message.includes('insurance')) {
      return "Healthcare is a crucial consideration for retirement abroad! Here's an overview:\n\n**Top Healthcare Systems for Expats:**\n\n**France** - Often ranked #1 globally\n• Universal coverage after 3 months residency\n• Small co-pays, excellent quality\n• Private insurance: €50-150/month\n\n**Spain & Portugal**\n• High-quality public systems\n• Private insurance: €50-100/month\n• English-speaking doctors in major cities\n\n**Thailand & Malaysia**\n• Medical tourism destinations\n• Modern private hospitals\n• Costs: 30-50% of US prices\n• Insurance: $100-200/month\n\n**Mexico**\n• IMSS public system available\n• Quality private care at low cost\n• Many US-trained doctors\n• Insurance: $50-150/month\n\n**Key Tips:**\n• Most countries require health insurance for visa\n• Pre-existing conditions often covered after waiting period\n• Consider medical evacuation insurance\n\nWould you like specific information about healthcare in a particular country?";
    }
    
    // Weather and climate queries
    if (message.includes('weather') || message.includes('climate') || message.includes('temperature') || message.includes('rain')) {
      return "Let me help you find the perfect climate for your retirement!\n\n**Year-Round Spring Climate:**\n• Canary Islands, Spain (18-24°C)\n• Madeira, Portugal (16-23°C)\n• Kunming, China (15-22°C)\n• Cuenca, Ecuador (14-21°C)\n\n**Mediterranean Climate:**\n• Costa del Sol, Spain\n• Algarve, Portugal\n• Crete, Greece\n• Malta\n\n**Tropical Paradise:**\n• Penang, Malaysia\n• Chiang Mai, Thailand (cooler)\n• Bali, Indonesia (highlands)\n• Costa Rica (Central Valley)\n\n**Four Distinct Seasons:**\n• Tuscany, Italy\n• Provence, France\n• Porto, Portugal\n• Ljubljana, Slovenia\n\n**Dry & Sunny:**\n• Arizona, USA (300+ sunny days)\n• Mendoza, Argentina\n• Perth, Australia\n\nWhat type of climate appeals to you most?";
    }
    
    // Tax queries
    if (message.includes('tax') || message.includes('taxes')) {
      return "Tax planning is essential for retirement abroad! Here's what you should know:\n\n**Tax-Friendly Countries for Retirees:**\n\n**No Tax on Foreign Income:**\n• Panama (territorial tax system)\n• Costa Rica (foreign income exempt)\n• Malaysia (MM2H program)\n• Thailand (foreign income not remitted)\n\n**Low Tax Countries:**\n• Portugal (NHR program - 10 years tax benefits)\n• Greece (7% flat tax option)\n• Italy (7% flat tax in southern regions)\n• Cyprus (various exemptions)\n\n**Important Considerations:**\n• US citizens taxed on worldwide income\n• Check tax treaties to avoid double taxation\n• Some countries tax pensions differently\n• Consider state taxes if keeping US ties\n\n**Recommended Steps:**\n1. Consult international tax advisor\n2. Understand reporting requirements (FBAR, etc.)\n3. Plan your tax residency carefully\n4. Consider timing of move\n\nWould you like specific information about any country's tax system?";
    }
    
    // General recommendations
    if (message.includes('recommend') || message.includes('suggest') || message.includes('best') || message.includes('where should')) {
      return `Based on what you've told me, I'd love to help you find the perfect retirement spot!\n\nTo give you the best recommendations, could you tell me more about:\n• Your monthly budget range?\n• Preferred climate (tropical, temperate, four seasons)?\n• Important factors (healthcare, expat community, culture)?\n• Any countries you're already considering?\n\nIn the meantime, here are some popular choices by budget:\n\n**Budget-Friendly:** Portugal, Mexico, Malaysia\n**Mid-Range:** Spain, Greece, Costa Rica\n**Premium:** France, Australia, Switzerland\n\nWhat matters most to you in your retirement destination?`;
    }
    
    // Default response
    return "That's an interesting question! While I'm continuously learning, I can help you with:\n\n• Cost of living comparisons\n• Visa and residency requirements\n• Healthcare systems overview\n• Climate and weather patterns\n• Tax considerations for expats\n• Specific country information\n\nWhat aspect of retirement abroad would you like to explore? Or feel free to ask about a specific country you're considering!";
  };
  
  // Switch to friend chat
  const switchToFriendChat = async (friend) => {
    try {
      setActiveFriend(friend);
      setChatType('friends');
      setActiveTown(null);
      setMessages([]);
      
      // Find or create thread for this friend chat
      let friendThread = threads.find(thread => 
        thread.topic === `friend-${friend.friend_id}` || thread.topic === `friend-${user.id}`
      );
      
      if (!friendThread) {
        // Create new thread for friend chat
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([{
            town_id: null,
            topic: `friend-${[user.id, friend.friend_id].sort().join('-')}`,
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
      
      // Update URL
      navigate(`/chat?friend=${friend.friend_id}`, { replace: true });
      
      // Fetch messages for this thread
      await loadMessages(friendThread.id);
    } catch (err) {
      console.error("Error switching to friend chat:", err);
      toast.error("Failed to load friend chat");
    }
  };
  
  // Send friend request
  const sendFriendRequest = async (targetUserId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending'
        }]);
        
      if (error) {
        console.error("Error sending friend request:", error);
        toast.error("Failed to send friend request");
        return;
      }
      
      toast.success("Friend request sent!");
      setShowCompanionsModal(false);
      
      // Reload companions to update UI
      await loadSuggestedCompanions(user.id);
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error("Failed to send friend request");
    }
  };
  
  // Send invitation by email
  const sendInviteByEmail = async (email) => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    console.log("Searching for user with email:", email);
    setInviteLoading(true);
    
    try {
      // Use RPC function to search for user by email
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_user_by_email', { 
          search_email: email.trim().toLowerCase() 
        });
      
      console.log("RPC search result:", { searchResult, searchError });
      
      if (searchError) {
        console.error("Search error:", searchError);
        
        // If the function doesn't exist yet, provide instructions
        if (searchError.code === '42883') {
          toast.error("Search function not set up yet. Please run the migration SQL in Supabase.");
        } else {
          toast.error("Error searching for user. Please try again.");
        }
        setInviteLoading(false);
        return;
      }
      
      if (!searchResult || searchResult.length === 0) {
        toast.error("No user found with this email address. Please check the email and ensure they've signed up.");
        setInviteLoading(false);
        return;
      }
      
      const existingUser = searchResult[0];
      console.log("Found user:", existingUser);
      
      // Check if already connected
      const { data: existingConnection } = await supabase
        .from('user_connections')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${existingUser.id}),and(user_id.eq.${existingUser.id},friend_id.eq.${user.id})`);
        
      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        if (connection.status === 'accepted') {
          toast.error("You're already connected with this user!");
        } else if (connection.status === 'pending') {
          toast.error("There's already a pending invitation with this user!");
        }
        setInviteLoading(false);
        return;
      }
      
      // Send the invitation with message
      const { error: inviteError } = await supabase
        .from('user_connections')
        .insert([{
          user_id: user.id,
          friend_id: existingUser.id,
          status: 'pending',
          message: inviteMessage.trim() || null
        }]);
        
      if (inviteError) {
        console.error("Error sending invitation:", inviteError);
        toast.error("Failed to send invitation");
        setInviteLoading(false);
        return;
      }
      
      toast.success(`Invitation sent to ${existingUser.full_name || email}!`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteMessage('');
      
      // Reload invitations
      await loadPendingInvitations(user.id);
      
    } catch (err) {
      console.error("Error sending invitation by email:", err);
      toast.error("An error occurred while sending the invitation");
    } finally {
      setInviteLoading(false);
    }
  };
  
  // Accept invitation
  const acceptInvitation = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (error) {
        console.error("Error accepting invitation:", error);
        toast.error("Failed to accept invitation");
        return;
      }
      
      toast.success("Invitation accepted!");
      
      // Reload friends and invitations
      await loadFriends(user.id);
      await loadPendingInvitations(user.id);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error("Failed to accept invitation");
    }
  };
  
  // Decline invitation
  const declineInvitation = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("Error declining invitation:", error);
        toast.error("Failed to decline invitation");
        return;
      }
      
      toast.success("Invitation declined");
      
      // Reload invitations
      await loadPendingInvitations(user.id);
    } catch (err) {
      console.error("Error declining invitation:", err);
      toast.error("Failed to decline invitation");
    }
  };
  
  // Cancel sent invitation
  const cancelSentInvitation = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("Error canceling invitation:", error);
        toast.error("Failed to cancel invitation");
        return;
      }
      
      toast.success("Invitation canceled");
      
      // Reload invitations
      await loadPendingInvitations(user.id);
    } catch (err) {
      console.error("Error canceling invitation:", err);
      toast.error("Failed to cancel invitation");
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    // Sanitize and validate the message
    const validation = sanitizeChatMessage(messageInput);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    const messageText = validation.sanitized;
    setMessageInput('');
    
    if (chatType === 'scout') {
      // Handle scout AI chat
      const userMessage = {
        id: `user-${Date.now()}`,
        message: messageText,
        user_id: user.id,
        user_name: user.full_name || user.email?.split('@')[0] || 'You',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate AI response with typing delay
      setTimeout(() => {
        const aiResponse = getScottiResponse(messageText);
        
        const scoutResponse = {
          id: `scout-${Date.now()}`,
          message: aiResponse,
          user_id: 'scout',
          user_name: 'Scotti (AI Assistant)',
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, scoutResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
      return;
    }
    
    if (!activeThread) {
      toast.error("No active chat selected");
      return;
    }
    
    // Optimistically add message to UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      thread_id: activeThread.id,
      user_id: user.id,
      message: messageText,
      created_at: new Date().toISOString(),
      user_name: user.full_name || user.email?.split('@')[0] || 'You',
      users: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      // Add message to database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          thread_id: activeThread.id,
          user_id: user.id,
          message: messageText
        }])
        .select();
        
      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        toast.error("Failed to send message");
        console.error("Send message error:", error);
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>Loading chat...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Header */}
      <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm} sticky top-0 z-10`}>
        <div className={`${uiConfig.layout.width.containerWide} px-4 py-4`}>
          <div className="flex justify-between items-center">
            <h1 className={`${uiConfig.font.size.xl} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {chatType === 'town' && activeTown ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {activeTown.name} Chat
                </span>
              ) : chatType === 'lounge' ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Retirement Lounge
                </span>
              ) : chatType === 'friends' && activeFriend ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Chat with {activeFriend.friend.full_name || activeFriend.friend.email.split('@')[0]}
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Chat with Scotti
                </span>
              )}
            </h1>
            <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
              {messages.length} messages
            </div>
          </div>
        </div>
      </header>

      <PageErrorBoundary 
        fallbackTitle="Chat Error"
        fallbackMessage="We're having trouble loading the chat. Please try refreshing the page."
        onReset={() => window.location.reload()}
      >
        <main className={`${uiConfig.layout.width.containerWide} px-4 py-6`}>
          <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            {/* Chat navigation */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Chat Options</h2>
              </div>
              
              <div className="p-2 space-y-1">
                <button
                  onClick={switchToLoungeChat}
                  className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    chatType === 'lounge' 
                      ? uiConfig.colors.badge
                      : `${uiConfig.states.hover} ${uiConfig.colors.body}`
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <div>
                      <div className={`${uiConfig.font.weight.medium}`}>Retirement Lounge</div>
                      <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>General discussion</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={switchToScoutChat}
                  className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                    chatType === 'scout' 
                      ? uiConfig.colors.badge
                      : `${uiConfig.states.hover} ${uiConfig.colors.body}`
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <div className={`${uiConfig.font.weight.medium}`}>Chat with Scotti</div>
                      <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>AI retirement advisor</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Companions */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Companions & Friends</h2>
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      setInviteMessage(defaultInviteMessage);
                    }}
                    className={`text-sm ${uiConfig.colors.btnPrimary} px-3 py-1 ${uiConfig.layout.radius.md}`}
                  >
                    Invite
                  </button>
                </div>
              </div>
              
              {/* Pending Invitations */}
              {pendingInvitations?.received && pendingInvitations.received.length > 0 && (
                <div className={`p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.colors.statusInfo}`}>
                  <p className={`text-sm font-medium mb-3`}>Pending Invitations:</p>
                  {pendingInvitations.received.map(invite => (
                    <div key={invite.id} className="mb-3 pb-3 border-b border-scout-accent-200 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {invite.user?.full_name || invite.user?.email?.split('@')[0] || `User ${invite.user_id?.slice(0, 8)}...`}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptInvitation(invite.id)}
                            className="text-xs px-2 py-1 bg-scout-accent-600 text-white rounded hover:bg-scout-accent-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineInvitation(invite.id)}
                            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                      {invite.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-1">
                          "{invite.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {friends.length === 0 && (!pendingInvitations?.sent || pendingInvitations.sent.length === 0) ? (
                <div className={`p-4 text-center ${uiConfig.colors.hint} ${uiConfig.font.size.sm}`}>
                  <p>No friends yet.</p>
                  <button 
                    onClick={() => setShowCompanionsModal(true)}
                    className={`${uiConfig.colors.accent} hover:underline mt-2 inline-block`}
                  >
                    Find companions
                  </button>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {friends.map(friend => (
                    <button
                      key={friend.friend_id}
                      onClick={() => switchToFriendChat(friend)}
                      className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                        chatType === 'friends' && activeFriend?.friend_id === friend.friend_id
                          ? uiConfig.colors.badge
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-purple-100 dark:bg-purple-900 ${uiConfig.layout.radius.full} flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3`}>
                          <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium}`}>
                            {friend.friend.full_name?.charAt(0) || friend.friend.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                            {friend.friend.full_name || friend.friend.email.split('@')[0]}
                          </div>
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            Connected
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Favorite towns */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
              <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
                <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Town Chats</h2>
              </div>
              
              {favorites.length === 0 ? (
                <div className={`p-4 text-center ${uiConfig.colors.hint} ${uiConfig.font.size.sm}`}>
                  <p>No favorite towns yet.</p>
                  <a href="/discover" className={`${uiConfig.colors.accent} hover:underline mt-2 inline-block`}>
                    Discover towns
                  </a>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {favorites.map(favorite => (
                    <button
                      key={favorite.town_id}
                      onClick={() => switchToTownChat(favorite.towns)}
                      className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                        chatType === 'town' && activeTown?.id === favorite.town_id
                          ? uiConfig.colors.badge
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.lg} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                            {favorite.towns.name}
                          </div>
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            {favorite.towns.country}
                          </div>
                        </div>
                        {favorite.towns.cost_index && (
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            ${favorite.towns.cost_index}/mo
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat area */}
          <div className={`flex-1 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden flex flex-col h-[600px]`}>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className={`text-center ${uiConfig.colors.hint}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'} ${
                        index > 0 && messages[index - 1].user_id === message.user_id ? 'mt-1' : 'mt-4'
                      }`}
                    >
                      <div 
                        className={`max-w-[75%] ${uiConfig.layout.radius.lg} px-4 py-2 ${
                          message.user_id === user?.id
                            ? 'bg-scout-accent-600 text-white'
                            : message.user_id === 'scout'
                            ? 'bg-blue-600 text-white'
                            : `${uiConfig.colors.input} ${uiConfig.colors.body}`
                        }`}
                      >
                        {(index === 0 || messages[index - 1].user_id !== message.user_id) && (
                          <div className="flex items-center text-xs mb-1">
                            <span className={`${uiConfig.font.weight.medium} ${
                              message.user_id === user?.id
                                ? 'text-scout-accent-100'
                                : message.user_id === 'scout'
                                ? 'text-blue-100'
                                : uiConfig.colors.hint
                            }`}>
                              {message.user_id === user?.id ? 'You' : message.user_name}
                            </span>
                            <span className={`ml-2 ${
                              message.user_id === user?.id
                                ? 'text-scout-accent-200'
                                : message.user_id === 'scout'
                                ? 'text-blue-200'
                                : uiConfig.colors.muted
                            }`}>
                              {formatMessageDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.message}</div>
                      </div>
                    </div>
                  ))}
                  {isTyping && chatType === 'scout' && (
                    <div className="flex justify-start">
                      <div className={`bg-blue-600 text-white ${uiConfig.layout.radius.lg} px-4 py-2`}>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                            <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                            <div className={`w-2 h-2 bg-white ${uiConfig.layout.radius.full} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className={`border-t ${uiConfig.colors.borderLight} p-4`}>
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    maxLength={MAX_LENGTHS.CHAT_MESSAGE}
                    placeholder={`Message ${
                      chatType === 'town' && activeTown 
                        ? activeTown.name + ' chat' 
                        : chatType === 'lounge' 
                        ? 'the retirement lounge' 
                        : chatType === 'friends' && activeFriend
                        ? activeFriend.friend.full_name || activeFriend.friend.email.split('@')[0]
                        : 'Scotti'
                    }...`}
                    className={`flex-1 ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} py-2 px-4 ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent`}
                  />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`bg-scout-accent-600 hover:bg-scout-accent-700 text-white p-2 ${uiConfig.layout.radius.lg} ${uiConfig.states.disabled} ${uiConfig.animation.transition}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
                </div>
                {messageInput.length > 0 && (
                  <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-right`}>
                    {messageInput.length} / {MAX_LENGTHS.CHAT_MESSAGE}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        </main>
      </PageErrorBoundary>
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
      
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full`}>
            <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
              <div className="flex justify-between items-center">
                <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  Invite a Friend
                </h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    // Keep the message for next time
                  }}
                  className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className={`${uiConfig.colors.body} mb-4`}>
                Connect with someone who shares your retirement dreams:
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                sendInviteByEmail(inviteEmail);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                      Friend's Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className={`w-full px-4 py-2 border ${uiConfig.colors.border} ${uiConfig.layout.radius.md} ${uiConfig.colors.input} ${uiConfig.colors.body} ${uiConfig.colors.focusRing} focus:border-transparent`}
                      required
                      disabled={inviteLoading}
                    />
                  </div>
                  
                  <div>
                    <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => {
                        setInviteMessage(e.target.value);
                      }}
                      placeholder="Add your personal message here..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-scout-accent-400 focus:border-transparent resize-none"
                      disabled={inviteLoading}
                    />
                    <div className={`mt-1 text-xs ${uiConfig.colors.hint} text-right`}>
                      {inviteMessage.length}/500
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      // Keep the message for next time
                    }}
                    className={`px-4 py-2 ${uiConfig.colors.btnNeutral} ${uiConfig.layout.radius.md}`}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${inviteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={inviteLoading || !inviteEmail}
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
              
              {pendingInvitations?.sent && pendingInvitations.sent.length > 0 && (
                <div className={`mt-6 pt-6 border-t ${uiConfig.colors.borderLight}`}>
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-3`}>
                    Pending invitations you've sent:
                  </p>
                  <div className="space-y-2">
                    {pendingInvitations.sent.map(invite => (
                      <div key={invite.id} className={`flex items-center justify-between ${uiConfig.colors.input} p-2 ${uiConfig.layout.radius.md}`}>
                        <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                          {invite.friend?.full_name || invite.friend?.email || `User ${invite.friend_id?.slice(0, 8)}...`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                            Pending
                          </span>
                          <button
                            onClick={() => cancelSentInvitation(invite.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Cancel invitation"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Companions Modal */}
      {showCompanionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${uiConfig.colors.modal} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.xl} max-w-md w-full max-h-[80vh] overflow-hidden`}>
            <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
              <div className="flex justify-between items-center">
                <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  People Like You
                </h2>
                <button
                  onClick={() => setShowCompanionsModal(false)}
                  className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {companions.length === 0 ? (
                <p className={`text-center ${uiConfig.colors.hint}`}>
                  No companions found yet. We're looking for people with similar retirement preferences.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-4`}>
                    Based on your preferences, here are people planning similar retirements:
                  </p>
                  {companions.map(companion => (
                    <div 
                      key={companion.id} 
                      className={`${uiConfig.colors.input} ${uiConfig.layout.radius.lg} p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center ${uiConfig.colors.accent} mr-3`}>
                            <span className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium}`}>
                              {companion.full_name?.charAt(0) || companion.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                              {companion.full_name || companion.email.split('@')[0]}
                            </h3>
                            <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                              {companion.similarity_score}% match
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(companion.id)}
                          className={`px-3 py-1 bg-scout-accent-600 hover:bg-scout-accent-700 text-white ${uiConfig.font.size.sm} ${uiConfig.layout.radius.md} ${uiConfig.animation.transition}`}
                        >
                          Connect
                        </button>
                      </div>
                      
                      {/* Show what they have in common */}
                      <div className={`mt-3 ${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>
                        <p className={`${uiConfig.font.weight.medium} mb-1`}>Common interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {companion.onboarding_responses?.[0]?.region_preferences?.continents?.slice(0, 2).map(continent => (
                            <span key={continent} className={`px-2 py-1 ${uiConfig.colors.input} ${uiConfig.layout.radius.full} ${uiConfig.font.size.xs}`}>
                              {continent.charAt(0).toUpperCase() + continent.slice(1).replace('_', ' ')}
                            </span>
                          ))}
                          {companion.onboarding_responses?.[0]?.budget?.monthly_budget && (
                            <span className={`px-2 py-1 ${uiConfig.colors.input} ${uiConfig.layout.radius.full} ${uiConfig.font.size.xs}`}>
                              ${companion.onboarding_responses[0].budget.monthly_budget}/mo budget
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}