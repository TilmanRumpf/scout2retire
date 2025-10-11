import { Search, User } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

/**
 * FriendsTab - Displays user's friends and liked members
 * Extracted from Chat.jsx
 */
export default function FriendsTab({
  friendsSearchTerm,
  setFriendsSearchTerm,
  likedMembers,
  friends,
  chatType,
  activeFriend,
  unreadByFriend,
  setShowInviteModal,
  onSwitchToFriendChat,
  onToggleLikeMember
}) {
  const filteredLikedMembers = likedMembers.filter(m =>
    m.username?.toLowerCase().includes(friendsSearchTerm.toLowerCase())
  );

  const filteredFriends = friends.filter(f =>
    f.friend?.username?.toLowerCase().includes(friendsSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
          <input
            type="search"
            placeholder="Search friends..."
            value={friendsSearchTerm}
            onChange={(e) => setFriendsSearchTerm(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
          />
        </div>
      </div>

      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex items-center justify-between">
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Friends</h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className={`${uiConfig.colors.btnSecondary} px-3 py-1 text-xs ${uiConfig.layout.radius.md}`}
            >
              Invite Friend
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Liked Members */}
          {filteredLikedMembers.length > 0 && (
            <>
              <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                Liked Members
              </div>
              {filteredLikedMembers
                .sort((a, b) => (a.username || '').localeCompare(b.username || ''))
                .map(member => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover}`}
                  >
                    <button
                      onClick={() => {
                        const friendData = friends.find(f => f.friend.id === member.id);
                        if (friendData) {
                          onSwitchToFriendChat(friendData);
                        } else {
                          toast.error("Not yet friends with this member");
                        }
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className={uiConfig.font.weight.medium}>{member.username || 'Member'}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => onToggleLikeMember(member.id)}
                      className="p-2"
                      title="Unlike"
                    >
                      ❤️
                    </button>
                  </div>
                ))}
              <hr className="my-2" />
            </>
          )}

          {/* Friends */}
          {filteredFriends.length > 0 && (
            <>
              <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                Friends
              </div>
              {filteredFriends
                .filter(f => !likedMembers.some(lm => lm.id === f.friend.id))
                .sort((a, b) => (a.friend.username || '').localeCompare(b.friend.username || ''))
                .map(friend => (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${
                      chatType === 'friends' && activeFriend?.id === friend.id ? uiConfig.colors.badge : ''
                    }`}
                  >
                    <button
                      onClick={() => onSwitchToFriendChat(friend)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={uiConfig.font.weight.medium}>{friend.friend.username || 'Friend'}</div>
                            {unreadByFriend[friend.friend_id] > 0 && (
                              <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                {unreadByFriend[friend.friend_id]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => onToggleLikeMember(friend.friend.id)}
                      className="p-2"
                      title="Like this member"
                    >
                      🤍
                    </button>
                  </div>
                ))}
            </>
          )}

          {friends.length === 0 && likedMembers.length === 0 && (
            <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
              <p>No friends yet.</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className={`mt-3 ${uiConfig.colors.btnPrimary} px-4 py-2 ${uiConfig.layout.radius.md}`}
              >
                Invite a Friend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
