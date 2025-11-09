import { useEffect } from 'react';
import { getCurrentUser } from '../utils/authUtils';
import { fetchTowns, fetchFavorites } from '../utils/townUtils.jsx';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

/**
 * useChatDataLoader - Handles initial data loading for Chat page
 * Extracted from Chat.jsx to reduce file size
 */
export function useChatDataLoader(props) {
  const {
    user, setUser, setLoading, setThreads, setFavorites, setUserHomeTown,
    setActiveTownChats, setFriendsTabActive, setActiveGroupChat, setChatType,
    setActiveThread, setActiveTown, navigate, townId, groupId, tabParam,
    loadFriends, loadGroupChats, loadPendingInvitations, loadBlockedUsers,
    loadSuggestedCompanions, loadAllCountries, loadAllTowns, loadLikedMembers,
    loadChatFavorites, loadCountryLikes, loadUserCountries, loadUnreadCounts,
    loadMessages
  } = props;

  useEffect(() => {
    const loadData = async () => {
      try {
        const perfStart = performance.now();
        console.log('🚀 [PERF] Chat load started');
        setLoading(true);

        // Get current user
        const t1 = performance.now();
        const { user: currentUser, profile: userProfile } = await getCurrentUser();
        console.log(`⏱️ [PERF] getCurrentUser: ${(performance.now() - t1).toFixed(0)}ms`);
        if (!currentUser) {
          navigate('/welcome');
          return;
        }
        
        setUser({ ...currentUser, ...userProfile });

        // CRITICAL PATH ONLY: Load threads immediately to show UI
        const t2 = performance.now();
        const { data: threadData, error: threadError } = await supabase
          .from('chat_threads')
          .select('*')
          .order('created_at', { ascending: false });

        if (threadError) {
          console.error("Thread fetch error:", threadError);
          toast.error("Failed to load chat threads");
        }

        setThreads(threadData || []);
        console.log(`⏱️ [PERF] Load threads: ${(performance.now() - t2).toFixed(0)}ms`);

        // Show UI NOW - don't wait for anything else
        setLoading(false);
        console.log(`🎯 [PERF] UI VISIBLE: ${(performance.now() - perfStart).toFixed(0)}ms`);

        // Load everything else in parallel (doesn't block rendering)
        const t3 = performance.now();
        const [
          favResult,
          _friends,
          _groups,
          _invites,
          _blocked,
          _companions,
          _hometown,
          _countries,
          _towns,
          _likes,
          _favorites
        ] = await Promise.all([
          fetchFavorites(currentUser.id),
          loadFriends(currentUser.id),
          loadGroupChats(currentUser.id),
          loadPendingInvitations(currentUser.id),
          loadBlockedUsers(),
          loadSuggestedCompanions(currentUser.id),
          userProfile?.hometown ? (async () => {
            const cityName = userProfile.hometown.split(',')[0].trim();
            const { data } = await supabase
              .from('towns')
              .select('id, town_name, country, region')
              .ilike('town_name', cityName)
              .limit(1);
            if (data?.[0]) setUserHomeTown(data[0]);
          })() : Promise.resolve(),
          loadAllCountries(),
          loadAllTowns(),
          loadLikedMembers(currentUser.id),
          loadChatFavorites(currentUser.id),
          loadCountryLikes(currentUser.id)
        ]);

        const { success: favSuccess, favorites: userFavorites } = favResult;
        if (favSuccess) {
          setFavorites(userFavorites);
          // Load user's countries from favorited towns
          await loadUserCountries(userFavorites);
        }
        console.log(`⏱️ [PERF] Parallel loads: ${(performance.now() - t3).toFixed(0)}ms`);

        // Town activity & unread counts (nice-to-have, loads in background)
        const t4 = performance.now();
        const townThreads = (threadData || []).filter(t => t.town_id !== null);
        let townIdsWithActivity = [];

        if (townThreads.length > 0) {
          const threadIds = townThreads.map(t => t.id);
          const { data: activeThreads } = await supabase.rpc('get_threads_with_recent_activity', {
            p_thread_ids: threadIds,
            p_days_ago: 30
          });

          if (activeThreads) {
            const activeThreadIdSet = new Set(activeThreads.map(t => t.thread_id));
            townIdsWithActivity = townThreads
              .filter(t => activeThreadIdSet.has(t.id))
              .map(t => t.town_id);
          }
        }

        const allActiveTownIds = [...new Set([
          ...(userFavorites || []).map(f => f.town_id),
          ...townIdsWithActivity
        ])];

        if (allActiveTownIds.length > 0) {
          const { success: townSuccess, towns: activeTowns } = await fetchTowns({
            townIds: allActiveTownIds
          });

          if (townSuccess) {
            const activeTownChatsData = activeTowns.map(town => {
              const thread = townThreads.find(t => t.town_id === town.id);
              return {
                town_id: town.id,
                thread_id: thread?.id,
                towns: town,
                is_favorited: (userFavorites || []).some(f => f.town_id === town.id)
              };
            });

            activeTownChatsData.sort((a, b) => {
              if (a.is_favorited && !b.is_favorited) return -1;
              if (!a.is_favorited && b.is_favorited) return 1;
              return a.towns.town_name.localeCompare(b.towns.town_name);
            });

            setActiveTownChats(activeTownChatsData);
          }
        }

        // Unread counts load last (slowest, least important)
        if (townThreads.length > 0) {
          await loadUnreadCounts(townThreads);
        }
        console.log(`⏱️ [PERF] Towns+badges: ${(performance.now() - t4).toFixed(0)}ms`);
        console.log(`🏁 [PERF] TOTAL: ${(performance.now() - perfStart).toFixed(0)}ms`);

        // Tab switching
        if (tabParam === 'requests') {
          setFriendsTabActive('requests');
        }

        // If groupId is provided, load that group chat
        if (groupId) {
          const { data: groupData, error: groupError } = await supabase
            .from('chat_threads')
            .select('id, topic, is_group, is_public, category, geo_region, geo_country, geo_province, created_by, created_at')
            .eq('id', groupId)
            .single();

          if (groupError || !groupData) {
            console.error("Group chat not found:", groupId, groupError);
            toast.error("Group chat not found");
            navigate('/chat', { replace: true });
          } else {
            const { data: memberCheck } = await supabase
              .from('group_chat_members')
              .select('role')
              .eq('thread_id', groupId)
              .eq('user_id', currentUser.id)
              .single();

            if (!memberCheck) {
              toast.error("You are not a member of this group");
              navigate('/chat', { replace: true });
            } else {
              setActiveGroupChat(groupData);
              setChatType('group');
              setActiveThread(groupData);
              await loadMessages(groupData.id);
            }
          }
        } else if (townId) {
          const { success, towns } = await fetchTowns({ townIds: [townId] });

          if (success && towns.length > 0) {
            setActiveTown(towns[0]);
            setChatType('town');

            let townThread = threadData?.find(thread => thread.town_id === townId);

            if (!townThread) {
              const { data: newThread, error: createError } = await supabase
                .from('chat_threads')
                .insert([{
                  town_id: townId,
                  topic: towns[0].town_name,
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
          setChatType('lounge');
          
          let loungeThread = threadData?.find(thread => thread.town_id === null && thread.topic === 'Lounge');
          
          if (!loungeThread) {
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
  }, [navigate, townId, groupId]); // eslint-disable-line react-hooks/exhaustive-deps
}
