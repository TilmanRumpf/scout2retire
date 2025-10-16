import { MessageCircle, User, Users, Home, MapPin, Globe, Star } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

/**
 * LobbyTab - Main hub showing quick access to popular lounges, favorites, and recent activity
 * Extracted from Chat.jsx
 */
export default function LobbyTab({
  friends,
  groupChats,
  allTowns,
  chatFavorites,
  onSwitchToFriendChat,
  onSwitchToGroupChat,
  onSwitchToTownChat,
  onSwitchToLoungeChat,
  onSwitchToCountryLoungeChat,
  onToggleFavoriteChat,
  chatType,
  activeThread
}) {
  // Popular countries for quick access
  const popularCountries = ['United States', 'Canada', 'Mexico', 'Portugal', 'Spain', 'Costa Rica', 'Italy', 'France'];

  const handleFavoriteClick = (fav) => {
    if (fav.chat_type === 'friend') {
      const friendData = friends.find(f => f.friend.id === fav.reference_id);
      if (friendData) onSwitchToFriendChat(friendData);
    } else if (fav.chat_type === 'group') {
      const groupData = groupChats.find(g => g.id === fav.reference_id);
      if (groupData) onSwitchToGroupChat(groupData);
    } else if (fav.chat_type === 'town_lounge') {
      const townData = allTowns.find(t => t.id === fav.reference_id);
      if (townData) onSwitchToTownChat(townData);
    } else if (fav.chat_type === 'country_lounge') {
      onSwitchToCountryLoungeChat(fav.reference_name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Favorites Section - MOST IMPORTANT */}
      {chatFavorites && chatFavorites.length > 0 && (
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
          <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} flex items-center gap-2`}>
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Your Favorites
            </h2>
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
              Quick access to your starred chats
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {chatFavorites.map(fav => (
              <div
                key={fav.id}
                className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} last:border-0`}
              >
                <button
                  onClick={() => handleFavoriteClick(fav)}
                  className={`flex-1 text-left flex items-center gap-3 ${uiConfig.states.hover} ${uiConfig.layout.radius.lg} p-2 -m-2 transition-all`}
                >
                  <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                    {fav.chat_type === 'friend' && <User className="h-5 w-5" />}
                    {fav.chat_type === 'group' && <Users className="h-5 w-5" />}
                    {fav.chat_type === 'town_lounge' && <Home className="h-5 w-5" />}
                    {fav.chat_type === 'country_lounge' && <MapPin className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} truncate`}>
                      {fav.reference_name}
                    </div>
                    <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} capitalize`}>
                      {fav.chat_type.replace('_', ' ')}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onToggleFavoriteChat(fav.chat_type, fav.reference_id, fav.reference_name)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Unfavorite"
                >
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access - Retirement Lounge */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Quick Access</h2>
          <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
            Jump into popular lounges
          </p>
        </div>

        <div className="p-3 space-y-2">
          {/* Retirement Lounge */}
          <button
            onClick={onSwitchToLoungeChat}
            className={`w-full flex items-center gap-3 p-3 ${uiConfig.layout.radius.lg} ${
              chatType === 'lounge' && activeThread?.topic === 'Lounge'
                ? uiConfig.colors.badge
                : uiConfig.states.hover
            } transition-all`}
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-scout-accent-400 to-scout-accent-600 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className={uiConfig.font.weight.medium}>Retirement Lounge</div>
              <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                General community chat
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Popular Country Lounges */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Popular Country Lounges</h2>
          <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
            Join country-specific discussions
          </p>
        </div>

        <div className="p-3 grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          {popularCountries.map(country => {
            const isActive = chatType === 'lounge' && activeThread?.topic === country;
            return (
              <button
                key={country}
                onClick={() => onSwitchToCountryLoungeChat(country)}
                className={`flex items-center gap-3 p-3 ${uiConfig.layout.radius.lg} ${
                  isActive ? uiConfig.colors.badge : uiConfig.states.hover
                } transition-all`}
              >
                <div className={`w-10 h-10 ${isActive ? 'bg-scout-accent-500' : 'bg-blue-100 dark:bg-blue-900/30'} ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={uiConfig.font.weight.medium}>{country}</div>
                  <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                    Country lounge
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4`}>
        <h3 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-3`}>Your Community</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {friends.length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Friends</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {groupChats.length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Groups</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {allTowns.filter(t => t.photos && t.photos.length > 0).length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Towns</div>
          </div>
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-4`}>
        <h3 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>💡 Quick Tip</h3>
        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
          Star your favorite chats for quick access. Explore country lounges to connect with others interested in specific destinations!
        </p>
      </div>
    </div>
  );
}
