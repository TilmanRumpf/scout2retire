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
  favorites,
  chatFavorites,
  countryLikes,
  onSwitchToFriendChat,
  onSwitchToGroupChat,
  onSwitchToTownChat,
  onSwitchToLoungeChat,
  onSwitchToCountryLoungeChat,
  onToggleFavoriteChat,
  onToggleCountryLike,
  onSwitchToTab,
  chatType,
  activeThread
}) {
  // Popular countries for quick access with flags
  const popularCountries = [
    { name: 'United States', flag: '🇺🇸' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Spain', flag: '🇪🇸' },
    { name: 'Costa Rica', flag: '🇨🇷' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'France', flag: '🇫🇷' }
  ];

  // Country to flag emoji mapping - COMPREHENSIVE
  const getCountryFlag = (countryName) => {
    const flagMap = {
      // North America
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'Mexico': '🇲🇽',
      'Belize': '🇧🇿',
      'Costa Rica': '🇨🇷',
      'El Salvador': '🇸🇻',
      'Guatemala': '🇬🇹',
      'Honduras': '🇭🇳',
      'Nicaragua': '🇳🇮',
      'Panama': '🇵🇦',

      // Caribbean
      'Bahamas': '🇧🇸',
      'Barbados': '🇧🇧',
      'Cuba': '🇨🇺',
      'Dominican Republic': '🇩🇴',
      'Haiti': '🇭🇹',
      'Jamaica': '🇯🇲',
      'Puerto Rico': '🇵🇷',
      'Trinidad and Tobago': '🇹🇹',

      // South America
      'Argentina': '🇦🇷',
      'Bolivia': '🇧🇴',
      'Brazil': '🇧🇷',
      'Chile': '🇨🇱',
      'Colombia': '🇨🇴',
      'Ecuador': '🇪🇨',
      'Guyana': '🇬🇾',
      'Paraguay': '🇵🇾',
      'Peru': '🇵🇪',
      'Suriname': '🇸🇷',
      'Uruguay': '🇺🇾',
      'Venezuela': '🇻🇪',

      // Western Europe
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Ireland': '🇮🇪',
      'Luxembourg': '🇱🇺',
      'Monaco': '🇲🇨',
      'Netherlands': '🇳🇱',
      'Switzerland': '🇨🇭',
      'United Kingdom': '🇬🇧',
      'UK': '🇬🇧',

      // Southern Europe
      'Albania': '🇦🇱',
      'Andorra': '🇦🇩',
      'Bosnia and Herzegovina': '🇧🇦',
      'Croatia': '🇭🇷',
      'Cyprus': '🇨🇾',
      'Greece': '🇬🇷',
      'Italy': '🇮🇹',
      'Kosovo': '🇽🇰',
      'Malta': '🇲🇹',
      'Montenegro': '🇲🇪',
      'North Macedonia': '🇲🇰',
      'Portugal': '🇵🇹',
      'San Marino': '🇸🇲',
      'Serbia': '🇷🇸',
      'Slovenia': '🇸🇮',
      'Spain': '🇪🇸',
      'Vatican City': '🇻🇦',

      // Eastern Europe
      'Belarus': '🇧🇾',
      'Bulgaria': '🇧🇬',
      'Czech Republic': '🇨🇿',
      'Czechia': '🇨🇿',
      'Estonia': '🇪🇪',
      'Hungary': '🇭🇺',
      'Latvia': '🇱🇻',
      'Lithuania': '🇱🇹',
      'Moldova': '🇲🇩',
      'Poland': '🇵🇱',
      'Romania': '🇷🇴',
      'Russia': '🇷🇺',
      'Slovakia': '🇸🇰',
      'Ukraine': '🇺🇦',

      // Northern Europe
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Iceland': '🇮🇸',
      'Norway': '🇳🇴',
      'Sweden': '🇸🇪',

      // Middle East
      'Bahrain': '🇧🇭',
      'Egypt': '🇪🇬',
      'Iran': '🇮🇷',
      'Iraq': '🇮🇶',
      'Israel': '🇮🇱',
      'Jordan': '🇯🇴',
      'Kuwait': '🇰🇼',
      'Lebanon': '🇱🇧',
      'Oman': '🇴🇲',
      'Palestine': '🇵🇸',
      'Qatar': '🇶🇦',
      'Saudi Arabia': '🇸🇦',
      'Syria': '🇸🇾',
      'Turkey': '🇹🇷',
      'United Arab Emirates': '🇦🇪',
      'UAE': '🇦🇪',
      'Yemen': '🇾🇪',

      // Africa
      'Algeria': '🇩🇿',
      'Angola': '🇦🇴',
      'Botswana': '🇧🇼',
      'Cameroon': '🇨🇲',
      'Ethiopia': '🇪🇹',
      'Ghana': '🇬🇭',
      'Kenya': '🇰🇪',
      'Morocco': '🇲🇦',
      'Mozambique': '🇲🇿',
      'Namibia': '🇳🇦',
      'Nigeria': '🇳🇬',
      'Rwanda': '🇷🇼',
      'Senegal': '🇸🇳',
      'South Africa': '🇿🇦',
      'Tanzania': '🇹🇿',
      'Tunisia': '🇹🇳',
      'Uganda': '🇺🇬',
      'Zambia': '🇿🇲',
      'Zimbabwe': '🇿🇼',

      // Asia
      'Afghanistan': '🇦🇫',
      'Bangladesh': '🇧🇩',
      'Bhutan': '🇧🇹',
      'Cambodia': '🇰🇭',
      'China': '🇨🇳',
      'Hong Kong': '🇭🇰',
      'India': '🇮🇳',
      'Indonesia': '🇮🇩',
      'Japan': '🇯🇵',
      'Kazakhstan': '🇰🇿',
      'Laos': '🇱🇦',
      'Macau': '🇲🇴',
      'Malaysia': '🇲🇾',
      'Maldives': '🇲🇻',
      'Mongolia': '🇲🇳',
      'Myanmar': '🇲🇲',
      'Nepal': '🇳🇵',
      'Pakistan': '🇵🇰',
      'Philippines': '🇵🇭',
      'Singapore': '🇸🇬',
      'South Korea': '🇰🇷',
      'Korea': '🇰🇷',
      'Sri Lanka': '🇱🇰',
      'Taiwan': '🇹🇼',
      'Thailand': '🇹🇭',
      'Uzbekistan': '🇺🇿',
      'Vietnam': '🇻🇳',

      // Oceania
      'Australia': '🇦🇺',
      'Fiji': '🇫🇯',
      'New Zealand': '🇳🇿',
      'Papua New Guinea': '🇵🇬',
      'Samoa': '🇼🇸'
    };
    return flagMap[countryName] || '🌍';
  };

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

  // Use favorites prop which contains user's favorited towns (already loaded from favorites table)
  const favoritedTowns = favorites || [];

  // Combine chat favorites and favorited towns
  const hasFavorites = (chatFavorites && chatFavorites.length > 0) || favoritedTowns.length > 0;

  return (
    <div className="space-y-4">
      {/* Your Community - FIRST - CLICKABLE */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4`}>
        <h3 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-3`}>Your Community</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onSwitchToTab('friends')}
            className={`text-center p-3 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} transition-all`}
          >
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {friends.length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Friends</div>
          </button>
          <button
            onClick={() => onSwitchToTab('groups')}
            className={`text-center p-3 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} transition-all`}
          >
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {groupChats.length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Groups</div>
          </button>
          <button
            onClick={() => onSwitchToTab('lounges')}
            className={`text-center p-3 ${uiConfig.layout.radius.lg} ${uiConfig.states.hover} transition-all`}
          >
            <div className={`text-2xl ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              {favoritedTowns.length}
            </div>
            <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Favorite Towns</div>
          </button>
        </div>
      </div>

      {/* Favorites Section */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} flex items-center gap-2`}>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Your Favorites
          </h2>
          <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
            Quick access to your starred chats and towns
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {!hasFavorites ? (
            <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No favorites yet</p>
              <p className={`${uiConfig.font.size.xs} mt-2`}>
                Star towns, chats, and groups to see them here
              </p>
            </div>
          ) : (
            <>
              {/* Chat Favorites */}
              {chatFavorites && chatFavorites.map(fav => (
                <div
                  key={`chat-${fav.id}`}
                  className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight}`}
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

              {/* Favorited Town Lounges */}
              {favoritedTowns.map(fav => {
                // favorites structure: { id, town_id, user_id, towns: { id, name, country, ... } }
                const town = fav.towns;
                if (!town) return null;

                return (
                  <div
                    key={`town-${fav.id}`}
                    className={`flex items-center justify-between p-3 border-b ${uiConfig.colors.borderLight} last:border-0`}
                  >
                    <button
                      onClick={() => onSwitchToTownChat(town)}
                      className={`flex-1 text-left flex items-center gap-3 ${uiConfig.states.hover} ${uiConfig.layout.radius.lg} p-2 -m-2 transition-all`}
                    >
                      <div className={`w-10 h-10 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0 text-2xl`}>
                        {getCountryFlag(town.country)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} truncate`}>
                          {town.name}
                        </div>
                        <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                          {town.country} • Town lounge
                        </div>
                      </div>
                    </button>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

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
            const isActive = chatType === 'lounge' && activeThread?.topic === country.name;
            const isLiked = countryLikes && countryLikes.some(c => c.country_name === country.name);
            return (
              <div
                key={country.name}
                className={`flex items-center justify-between p-3 ${uiConfig.layout.radius.lg} ${
                  isActive ? uiConfig.colors.badge : uiConfig.states.hover
                } transition-all`}
              >
                <button
                  onClick={() => onSwitchToCountryLoungeChat(country.name)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-10 h-10 ${uiConfig.layout.radius.full} flex items-center justify-center flex-shrink-0 text-2xl`}>
                    {country.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={uiConfig.font.weight.medium}>{country.name}</div>
                    <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                      Country lounge
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleCountryLike) {
                      onToggleCountryLike(country.name);
                    }
                  }}
                  className="p-1.5 ml-2 flex-shrink-0"
                  aria-label={isLiked ? "Unlike country" : "Like country"}
                >
                  {isLiked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
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
