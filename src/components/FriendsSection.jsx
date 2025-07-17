import { uiConfig } from '../styles/uiConfig';

export default function FriendsSection({
  friendsTabActive,
  setFriendsTabActive,
  friends,
  pendingInvitations,
  acceptInvitation,
  declineInvitation,
  switchToFriendChat,
  chatType,
  activeFriend,
  setShowInviteModal,
  setInviteMessage,
  defaultInviteMessage,
  setShowCompanionsModal
}) {
  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
      {/* Header with tabs */}
      <div className={`border-b ${uiConfig.colors.borderLight}`}>
        <div className="flex">
          <button
            onClick={() => setFriendsTabActive('friends')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              friendsTabActive === 'friends'
                ? 'border-scout-accent-500 text-scout-accent-500' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Friends</span>
              {friends.length > 0 && (
                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {friends.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setFriendsTabActive('requests')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              friendsTabActive === 'requests'
                ? 'border-scout-accent-500 text-scout-accent-500' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Requests</span>
              {pendingInvitations?.received && pendingInvitations.received.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {pendingInvitations.received.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-h-96 overflow-y-auto">
        {friendsTabActive === 'requests' ? (
          // Friend Requests Tab
          <div>
            {pendingInvitations?.received && pendingInvitations.received.length > 0 ? (
              <div className="p-4">
                {pendingInvitations.received.map(invite => (
                  <div 
                    key={invite.id} 
                    id={`invitation-${invite.id}`} 
                    className="mb-4 p-3 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg border border-scout-accent-200 dark:border-scout-accent-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 bg-scout-accent-200 dark:bg-scout-accent-800 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                        <span className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium} text-scout-accent-700 dark:text-scout-accent-300`}>
                          {invite.user?.full_name?.charAt(0) || invite.user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                          {invite.user?.full_name || invite.user?.email?.split('@')[0] || 'Someone'} wants to connect
                        </h4>
                        {invite.message && (
                          <p className={`mt-1 text-sm ${uiConfig.colors.body} italic`}>
                            "{invite.message}"
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => acceptInvitation(invite.id)}
                            className="px-4 py-1.5 bg-scout-accent-500 text-white text-sm rounded-md hover:bg-scout-accent-600 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineInvitation(invite.id)}
                            className="px-4 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className={`${uiConfig.font.size.sm} mb-4`}>No pending friend requests</p>
                <button 
                  onClick={() => {
                    console.log("Find Companions button clicked (no requests)");
                    setShowCompanionsModal(true);
                  }}
                  className={`${uiConfig.colors.btnPrimary} py-2 px-6 rounded-md text-sm font-medium`}
                >
                  Find Companions
                </button>
              </div>
            )}
          </div>
        ) : (
          // Friends Tab
          <div>
            {friends.length > 0 ? (
              <div>
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      setInviteMessage(defaultInviteMessage);
                    }}
                    className={`w-full ${uiConfig.colors.btnPrimary} py-2 rounded-md text-sm font-medium`}
                  >
                    Invite a Friend
                  </button>
                  <button
                    onClick={() => {
                      console.log("Find Companions button clicked (with friends)");
                      setShowCompanionsModal(true);
                    }}
                    className={`w-full ${uiConfig.colors.btnSecondary} py-2 rounded-md text-sm font-medium`}
                  >
                    Find Companions
                  </button>
                </div>
                {friends.map(friend => (
                  <button
                    key={friend.friend_id}
                    onClick={() => switchToFriendChat(friend)}
                    className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                      chatType === 'friends' && activeFriend?.friend_id === friend.friend_id
                        ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20'
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
                          Click to chat
                        </div>
                      </div>
                      {chatType === 'friends' && activeFriend?.friend_id === friend.friend_id && (
                        <div className="w-2 h-2 bg-scout-accent-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className={`${uiConfig.font.size.sm} mb-4`}>No friends yet</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      setInviteMessage(defaultInviteMessage);
                    }}
                    className={`block w-full ${uiConfig.colors.btnPrimary} py-2 rounded-md text-sm font-medium`}
                  >
                    Invite a Friend
                  </button>
                  <button 
                    onClick={() => {
                      console.log("Find Companions button clicked (no friends)");
                      setShowCompanionsModal(true);
                    }}
                    className={`block w-full ${uiConfig.colors.btnSecondary} py-2 rounded-md text-sm font-medium`}
                  >
                    Find Companions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}