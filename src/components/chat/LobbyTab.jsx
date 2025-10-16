import { MessageCircle, User, Users, Home, MapPin, Globe } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

/**
 * LobbyTab - Main hub showing quick access to popular lounges and recent activity
 * Extracted from Chat.jsx
 */
export default function LobbyTab({
  friends,
  groupChats,
  allTowns,
  onSwitchToFriendChat,
  onSwitchToGroupChat,
  onSwitchToTownChat,
  onSwitchToCountryLoungeChat,
  chatType,
  activeThread
}) {
  // Popular countries for quick access
  const popularCountries = ['United States', 'Canada', 'Mexico', 'Portugal', 'Spain', 'Costa Rica', 'Italy', 'France'];

  return (
    <div className="space-y-4">
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
            onClick={() => {
              // Switch to general retirement lounge
              const loungeThread = { id: null, topic: 'Lounge', town_id: null };
              // This would need to be wired up properly
              toast.success('Opening Retirement Lounge');
            }}
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
              {allTowns.length}
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
