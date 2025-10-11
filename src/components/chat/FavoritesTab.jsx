import { Search, User, Users, Home, MapPin } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

/**
 * FavoritesTab - Displays user's favorited chats
 * Extracted from Chat.jsx
 */
export default function FavoritesTab({
  favoritesSearchTerm,
  setFavoritesSearchTerm,
  chatFavorites,
  friends,
  groupChats,
  allTowns,
  onSwitchToFriendChat,
  onSwitchToGroupChat,
  onSwitchToTownChat,
  onToggleFavoriteChat,
  setSelectedCountry
}) {
  const filteredFavorites = chatFavorites.filter(fav =>
    fav.reference_name?.toLowerCase().includes(favoritesSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
          <input
            type="search"
            placeholder="Search favorites..."
            value={favoritesSearchTerm}
            onChange={(e) => setFavoritesSearchTerm(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
          />
        </div>
      </div>

      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Favorites</h2>
          <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
            Your favorited chats
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredFavorites.length === 0 ? (
            <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
              <p>No favorites yet.</p>
              <p className={`${uiConfig.font.size.xs} mt-2`}>Tap ⭐ on any chat to add it here!</p>
            </div>
          ) : (
            filteredFavorites.map(fav => (
              <div
                key={fav.id}
                className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover}`}
              >
                <button
                  onClick={() => {
                    // Handle navigation based on chat type
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
                      setSelectedCountry(fav.reference_name);
                      toast.success(`Opening ${fav.reference_name} lounge`);
                    }
                  }}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${uiConfig.colors.badge} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                      {fav.chat_type === 'friend' && <User className="h-5 w-5" />}
                      {fav.chat_type === 'group' && <Users className="h-5 w-5" />}
                      {fav.chat_type === 'town_lounge' && <Home className="h-5 w-5" />}
                      {fav.chat_type === 'country_lounge' && <MapPin className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className={uiConfig.font.weight.medium}>{fav.reference_name}</div>
                      <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} capitalize`}>
                        {fav.chat_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onToggleFavoriteChat(fav.chat_type, fav.reference_id, fav.reference_name)}
                  className="p-2"
                  title="Unfavorite"
                >
                  ⭐
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
