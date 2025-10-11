import { Search } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';

/**
 * GroupsTab - Displays user's group chats
 * Extracted from Chat.jsx
 */
export default function GroupsTab({
  user,
  groupsSearchTerm,
  setGroupsSearchTerm,
  groupChats,
  chatType,
  activeGroupChat,
  unreadCounts,
  setShowGroupChatModal,
  onSwitchToGroupChat
}) {
  const filteredGroups = groupChats.filter(g =>
    g.topic?.toLowerCase().includes(groupsSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.sm} p-3`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
          <input
            type="search"
            placeholder="Search groups..."
            value={groupsSearchTerm}
            onChange={(e) => setGroupsSearchTerm(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
          />
        </div>
      </div>

      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
        <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
          <div className="flex items-center justify-between">
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Groups</h2>
            <button
              onClick={() => setShowGroupChatModal(true)}
              className={`${uiConfig.colors.btnSecondary} px-3 py-1 text-xs ${uiConfig.layout.radius.md}`}
            >
              Create Group
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* My Groups */}
          {filteredGroups.filter(g => g.created_by === user?.id || g.members?.includes(user?.id)).length > 0 && (
            <>
              <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                My Groups
              </div>
              {filteredGroups
                .filter(g => g.created_by === user?.id || g.members?.includes(user?.id))
                .sort((a, b) => (a.topic || '').localeCompare(b.topic || ''))
                .map(group => (
                  <button
                    key={group.id}
                    onClick={() => onSwitchToGroupChat(group)}
                    className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition} ${
                      chatType === 'group' && activeGroupChat?.id === group.id ? uiConfig.colors.badge : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${group.is_public ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'} ${uiConfig.layout.radius.full} flex items-center justify-center`}>
                        <span>{group.is_public ? '🌐' : '🔒'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={uiConfig.font.weight.medium}>{group.topic || 'Untitled Group'}</div>
                          {unreadCounts[group.id] > 0 && (
                            <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              {unreadCounts[group.id]}
                            </div>
                          )}
                        </div>
                        <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                          {group.category || 'General'} {group.role === 'admin' && '• Admin'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              <hr className="my-2" />
            </>
          )}

          {/* Other Groups */}
          {filteredGroups.filter(g => g.is_public && g.created_by !== user?.id && !g.members?.includes(user?.id)).length > 0 && (
            <>
              <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                Other Groups
              </div>
              {filteredGroups
                .filter(g => g.is_public && g.created_by !== user?.id && !g.members?.includes(user?.id))
                .sort((a, b) => (a.topic || '').localeCompare(b.topic || ''))
                .map(group => (
                  <button
                    key={group.id}
                    onClick={() => onSwitchToGroupChat(group)}
                    className={`w-full text-left p-3 border-b ${uiConfig.colors.borderLight} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span>🌐</span>
                      </div>
                      <div className="flex-1">
                        <div className={uiConfig.font.weight.medium}>{group.topic || 'Untitled Group'}</div>
                        <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                          {group.category || 'General'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </>
          )}

          {groupChats.length === 0 && (
            <div className={`p-8 text-center ${uiConfig.colors.hint}`}>
              <p>No groups yet.</p>
              <button
                onClick={() => setShowGroupChatModal(true)}
                className={`mt-3 ${uiConfig.colors.btnPrimary} px-4 py-2 ${uiConfig.layout.radius.md}`}
              >
                Create First Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
