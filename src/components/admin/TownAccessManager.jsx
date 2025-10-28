/**
 * TOWN ACCESS MANAGER
 *
 * Manage town-level access control for users
 * Allows Executive Admins to grant specific users access to specific towns
 *
 * Created: 2025-10-18
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Eye, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../../utils/supabaseClient';
import { uiConfig } from '../../styles/uiConfig';

export default function TownAccessManager() {
  const [users, setUsers] = useState([]);
  const [towns, setTowns] = useState([]);
  const [accessRecords, setAccessRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔥 TownAccessManager: Starting data load...');

      // Check auth state
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔥 Auth state:', {
        userId: user?.id,
        email: user?.email,
        authError,
        hasAuth: !!user
      });

      if (!user) {
        console.error('❌ No authenticated user!');
        toast.error('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      // Load users
      console.log('🔥 Loading users from database...');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          category_id,
          admin_role,
          category:user_categories(category_code, display_name, color_hex)
        `)
        .order('email');

      console.log('🔥 Users query result:', { usersData, usersError });

      if (usersError) {
        console.error('❌ Users query failed:', usersError);
        throw usersError;
      }

      console.log(`✅ Loaded ${usersData?.length || 0} users`);
      if (usersData?.length > 0) {
        console.log('First user sample:', usersData[0]);
      }

      // Load towns
      console.log('🔥 Loading towns from database...');
      const { data: townsData, error: townsError } = await supabase
        .from('towns')
        .select('id, name, country, region')
        .order('name');

      console.log('🔥 Towns query result:', { count: townsData?.length, error: townsError });

      if (townsError) {
        console.error('❌ Towns query failed:', townsError);
        throw townsError;
      }

      console.log(`✅ Loaded ${townsData?.length || 0} towns`);

      // Load access records
      console.log('🔥 Loading access records from database...');
      const { data: accessData, error: accessError } = await supabase
        .from('user_town_access')
        .select(`
          *,
          towns(id, name, country),
          granted_by_user:users!user_town_access_granted_by_fkey(email)
        `)
        .eq('active', true)
        .order('granted_at', { ascending: false });

      console.log('🔥 Access records query result:', { count: accessData?.length, error: accessError });

      if (accessError) {
        console.error('❌ Access records query failed:', accessError);
        throw accessError;
      }

      console.log(`✅ Loaded ${accessData?.length || 0} access records`);

      setUsers(usersData || []);
      setTowns(townsData || []);
      setAccessRecords(accessData || []);

      console.log('✅ All data loaded successfully!');
    } catch (error) {
      console.error('💥 FATAL ERROR loading data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = filterTier === 'all' || user.category?.category_code === filterTier;

    return matchesSearch && matchesTier;
  });

  // Get access records for a user
  const getUserAccessRecords = (userId) => {
    return accessRecords.filter(r => r.user_id === userId);
  };

  // Toggle user expansion
  const toggleUser = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Revoke access
  const revokeAccess = async (accessId) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;

    try {
      const { error } = await supabase
        .from('user_town_access')
        .update({ active: false })
        .eq('id', accessId);

      if (error) throw error;

      toast.success('Access revoked');
      loadData();
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
    }
  };

  // Access level badge
  const AccessLevelBadge = ({ level }) => {
    const config = {
      view: { icon: Eye, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      edit: { icon: Edit2, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      full: { icon: Lock, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
    };

    const { icon: Icon, color } = config[level] || config.view;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500 dark:text-gray-400">Loading town access data...</div>
      </div>
    );
  }

  return (
    <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${uiConfig.colors.heading}`}>Town Access Control</h2>
            <p className={`text-sm ${uiConfig.colors.body} mt-1`}>
              Grant specific users access to edit specific towns
            </p>
          </div>
          <button
            onClick={() => setShowGrantModal(true)}
            className={`flex items-center gap-2 px-4 py-2 ${uiConfig.colors.btnPrimary} rounded-lg hover:${uiConfig.colors.btnPrimaryHover} transition-colors`}
          >
            <Plus className="w-4 h-4" />
            Grant Town Access
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${uiConfig.colors.body}`} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${uiConfig.colors.input} border ${uiConfig.colors.inputBorder} rounded-lg`}
            />
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className={`px-4 py-2 ${uiConfig.colors.input} border ${uiConfig.colors.inputBorder} rounded-lg`}
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="scout">Scout</option>
            <option value="town_manager">Town Manager</option>
            <option value="enterprise">Enterprise</option>
            <option value="assistant_admin">Assistant Admin</option>
            <option value="executive_admin">Executive Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${uiConfig.colors.cardHover} border-b ${uiConfig.colors.inputBorder}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${uiConfig.colors.body} uppercase tracking-wider`}>
                User
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${uiConfig.colors.body} uppercase tracking-wider`}>
                Tier
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${uiConfig.colors.body} uppercase tracking-wider`}>
                Town Access
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${uiConfig.colors.body} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${uiConfig.colors.inputBorder}`}>
            {filteredUsers.map(user => {
              const userAccess = getUserAccessRecords(user.id);
              const isExpanded = expandedUsers.has(user.id);
              const isAdmin = user.admin_role === 'executive_admin' || user.admin_role === 'assistant_admin';

              return (
                <React.Fragment key={user.id}>
                  <tr className={`hover:${uiConfig.colors.cardHover} transition-colors`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${uiConfig.colors.heading}`}>
                          {user.full_name || user.email}
                        </div>
                        <div className={`text-sm ${uiConfig.colors.body}`}>
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded">
                        {user.admin_role || user.category?.display_name || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          ∞ All towns (Admin)
                        </span>
                      ) : userAccess.length > 0 ? (
                        <button
                          onClick={() => toggleUser(user.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {userAccess.length} town{userAccess.length !== 1 ? 's' : ''} {isExpanded ? '▼' : '▶'}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No access</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setShowGrantModal({ userId: user.id, userEmail: user.email })}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        title="Grant access to town"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded town access */}
                  {isExpanded && userAccess.length > 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 bg-gray-50 dark:bg-gray-900/20">
                        <div className="space-y-2">
                          {userAccess.map(access => (
                            <div
                              key={access.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {access.towns?.name}, {access.towns?.country}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Granted: {new Date(access.granted_at).toLocaleDateString()}
                                    {access.granted_by_user && ` by ${access.granted_by_user.email}`}
                                  </div>
                                  {access.notes && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      📝 {access.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <AccessLevelBadge level={access.access_level} />
                                <button
                                  onClick={() => revokeAccess(access.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                  title="Revoke access"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Access Modal */}
      {showGrantModal && (
        <GrantAccessModal
          users={users}
          towns={towns}
          preselectedUserId={showGrantModal.userId}
          onClose={() => setShowGrantModal(false)}
          onSuccess={() => {
            setShowGrantModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Grant Access Modal Component
function GrantAccessModal({ users, towns, preselectedUserId, onClose, onSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || '');
  const [selectedTownId, setSelectedTownId] = useState('');
  const [accessLevel, setAccessLevel] = useState('edit');
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGrant = async () => {
    if (!selectedUserId || !selectedTownId) {
      toast.error('Please select a user and town');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('user_town_access')
        .insert({
          user_id: selectedUserId,
          town_id: selectedTownId,
          access_level: accessLevel,
          granted_by: user.id,
          notes: notes.trim() || null,
          expires_at: expiresAt || null,
          active: true
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('User already has access to this town');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Town access granted successfully');
      onSuccess();
    } catch (error) {
      console.error('Error granting access:', error);
      toast.error('Failed to grant access');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} max-w-lg w-full max-h-[90vh] overflow-y-auto ${uiConfig.layout.shadow.xl}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${uiConfig.colors.inputBorder} bg-green-50 dark:bg-green-900/20`}>
          <h3 className={`text-lg font-bold ${uiConfig.colors.heading} flex items-center gap-2`}>
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            Grant Town Access
          </h3>
          <p className={`text-sm ${uiConfig.colors.body} mt-1`}>
            Allow a user to view or edit a specific town
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* User Selection */}
          <div>
            <label className={`block text-sm font-medium ${uiConfig.colors.heading} mb-2`}>
              User *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={`w-full px-3 py-2 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} ${uiConfig.colors.input}`}
              disabled={!!preselectedUserId}
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.category?.display_name || 'Free'})
                </option>
              ))}
            </select>
          </div>

          {/* Town Selection */}
          <div>
            <label className={`block text-sm font-medium ${uiConfig.colors.heading} mb-2`}>
              Town *
            </label>
            <select
              value={selectedTownId}
              onChange={(e) => setSelectedTownId(e.target.value)}
              className={`w-full px-3 py-2 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} ${uiConfig.colors.input}`}
            >
              <option value="">Select a town...</option>
              {towns.map(town => (
                <option key={town.id} value={town.id}>
                  {town.town_name}, {town.country} {town.region ? `(${town.region})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Access Level */}
          <div>
            <label className={`block text-sm font-medium ${uiConfig.colors.heading} mb-2`}>
              Access Level *
            </label>
            <div className="space-y-2">
              <label className={`flex items-center gap-2 p-3 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} cursor-pointer hover:${uiConfig.colors.cardHover}`}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="view"
                  checked={accessLevel === 'view'}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className={`font-medium ${uiConfig.colors.heading}`}>View</div>
                  <div className={`text-xs ${uiConfig.colors.body}`}>Read-only access</div>
                </div>
              </label>

              <label className={`flex items-center gap-2 p-3 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} cursor-pointer hover:${uiConfig.colors.cardHover}`}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="edit"
                  checked={accessLevel === 'edit'}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className={`font-medium ${uiConfig.colors.heading}`}>Edit</div>
                  <div className={`text-xs ${uiConfig.colors.body}`}>Can modify all fields</div>
                </div>
              </label>

              <label className={`flex items-center gap-2 p-3 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} cursor-pointer hover:${uiConfig.colors.cardHover}`}>
                <input
                  type="radio"
                  name="accessLevel"
                  value="full"
                  checked={accessLevel === 'full'}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className={`font-medium ${uiConfig.colors.heading}`}>Full</div>
                  <div className={`text-xs ${uiConfig.colors.body}`}>Edit + manage hobbies/exclusions</div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium ${uiConfig.colors.heading} mb-2`}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why is this access being granted?"
              rows={3}
              className={`w-full px-3 py-2 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} ${uiConfig.colors.input}`}
            />
          </div>

          {/* Expiration */}
          <div>
            <label className={`block text-sm font-medium ${uiConfig.colors.heading} mb-2`}>
              Expires At (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={`w-full px-3 py-2 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} ${uiConfig.colors.input}`}
            />
            <p className={`text-xs ${uiConfig.colors.body} mt-1`}>
              Leave empty for permanent access
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${uiConfig.colors.inputBorder} ${uiConfig.colors.cardHover} flex justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 border ${uiConfig.colors.inputBorder} ${uiConfig.layout.radius.md} hover:${uiConfig.colors.cardHover} ${uiConfig.colors.heading}`}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleGrant}
            className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} hover:${uiConfig.colors.btnPrimaryHover} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={saving || !selectedUserId || !selectedTownId}
          >
            {saving ? 'Granting...' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
}
