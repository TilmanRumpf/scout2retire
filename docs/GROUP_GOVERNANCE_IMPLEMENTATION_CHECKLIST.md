# 🚀 Group Governance System - Implementation Checklist

## ✅ Completed (Database Layer)

- [x] **Migration 1**: Group tier system enums and columns (`20251007040000_group_tier_system.sql`)
- [x] **Migration 2**: Governance functions (succession, dormancy, exec admin) (`20251007041000_group_governance_functions.sql`)
- [x] **Migration 3**: RLS policies (role-based permissions) (`20251007042000_group_rls_policies.sql`)
- [x] **Migration 4**: Account tier column and validation (`20251007043000_add_account_tier.sql`)
- [x] **Utility**: Frontend account tier helpers (`src/utils/accountTiers.js`)
- [x] **Documentation**: Complete governance specification (`docs/GROUP_CHAT_GOVERNANCE.md`)

---

## 🔴 REQUIRED: Before Running Migrations

### 1. Create Executive Admin Account

**Option A: Via UI (Recommended)**
```bash
1. Sign up executive@scout2retire.com via normal registration
2. Then run SQL:
   UPDATE users SET account_tier = 'exec_admin'
   WHERE email = 'executive@scout2retire.com';
```

**Option B: Direct SQL** (if you have auth.users access)
```sql
-- Create user in auth.users first, then:
INSERT INTO users (id, email, username, account_tier)
VALUES ('[UUID-FROM-AUTH]', 'executive@scout2retire.com', 'Executive Admin', 'exec_admin');
```

### 2. Verify Users Table Exists

The migrations assume a `users` table with:
- `id UUID PRIMARY KEY`
- `email TEXT`
- `username TEXT`
- `created_at TIMESTAMPTZ`

If your users table has different structure, update migration 4.

---

## 📋 Ready to Run - Migration Order

Run these **in order** via Supabase SQL Editor or MCP:

```bash
1. 20251007040000_group_tier_system.sql       # Creates enums, columns, audit table
2. 20251007041000_group_governance_functions.sql  # Creates auto-succession functions
3. 20251007042000_group_rls_policies.sql      # Updates RLS policies
4. 20251007043000_add_account_tier.sql        # Adds account_tier to users
```

**Estimated time**: 2-3 minutes total

---

## 🎨 UI Implementation (Next Phase)

### Phase 1: Group Creation Modal

**File**: `src/components/GroupChatModal.jsx`

**Changes Needed**:
1. Add 4-tier selection UI (radio buttons or cards)
2. Import `canCreateSensitiveGroups` from `accountTiers.js`
3. Disable "Sensitive Private" option if user lacks permission
4. Show upgrade prompt for Free/Freemium users
5. Add invite policy selector
6. Add discoverability toggle

**Example UI**:
```jsx
import { canCreateSensitiveGroups, getTierIcon } from '../utils/accountTiers';

// In component:
const canCreateSensitive = canCreateSensitiveGroups(currentUser);

// In JSX:
<div className="space-y-3">
  {/* Sensitive Private - Premium+ only */}
  <button
    onClick={() => setGroupType('sensitive_private')}
    disabled={!canCreateSensitive}
    className={...}
  >
    <div>🔒 Sensitive Private {!canCreateSensitive && '(Premium Required)'}</div>
    <div className="text-xs">Ultra-private, creator control, no succession</div>
  </button>

  {/* Semi-Private */}
  <button onClick={() => setGroupType('semi_private')}>
    <div>🪶 Semi-Private</div>
    <div className="text-xs">Vetted community, admin approval</div>
  </button>

  {/* Private-Open */}
  <button onClick={() => setGroupType('private_open')}>
    <div>🌗 Private-Open</div>
    <div className="text-xs">Private but social, grows with you</div>
  </button>

  {/* Public */}
  <button onClick={() => setGroupType('public')}>
    <div>🌐 Public</div>
    <div className="text-xs">Searchable, anyone can join</div>
  </button>
</div>
```

---

### Phase 2: Group Edit Modal

**File**: `src/components/GroupChatEditModal.jsx`

**Changes Needed**:
1. Add "Promote to Admin" button next to members
2. Add "Demote" option for admins (with confirmation)
3. Show role badges (creator, admin, moderator, member)
4. Add tier conversion UI (with warnings)
5. Show dormancy state if group is dormant/inactive
6. Add "Transfer Ownership" for creators

**Example Admin Management**:
```jsx
{members.map(member => (
  <div key={member.user_id} className="flex items-center justify-between">
    <div>
      <div>{member.user.username}</div>
      <div className="text-xs">
        {member.role === 'creator' && '👑 Creator'}
        {member.role === 'admin' && '⭐ Admin'}
        {member.role === 'moderator' && '🛡️ Moderator'}
        {member.role === 'member' && '👤 Member'}
      </div>
    </div>

    {/* Admin actions (only if current user is admin) */}
    {isAdmin && member.role === 'member' && (
      <button onClick={() => promoteMember(member.user_id, 'admin')}>
        Promote to Admin
      </button>
    )}
  </div>
))}
```

---

### Phase 3: Leave Warnings

**File**: `src/components/GroupChatEditModal.jsx` or new `LeaveGroupModal.jsx`

**For Sensitive Private creators**:
```jsx
{groupChat.group_type === 'sensitive_private' && userRole === 'creator' && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 rounded-lg">
    <div className="font-semibold text-red-600">⚠️ Warning</div>
    <div className="text-sm text-red-700 dark:text-red-400">
      Leaving this Sensitive Private group will <strong>archive it permanently</strong>.
      All members will lose the ability to post or invite new members.
      The group will become read-only.
    </div>
    <div className="mt-3">
      <button className="bg-red-600 text-white px-4 py-2 rounded">
        I Understand - Archive Group
      </button>
    </div>
  </div>
)}
```

---

### Phase 4: Dormancy Banners

**File**: `src/pages/Chat.jsx` (in message area)

**Show banner if group is dormant/inactive**:
```jsx
{activeGroupChat?.dormancy_state === 'dormant' && (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-700">
    ⏰ This group has been quiet for a while. Post a message to reactivate!
  </div>
)}

{activeGroupChat?.dormancy_state === 'inactive' && (
  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 text-sm text-orange-700">
    📦 This group is entering recovery mode. Post to prevent archival.
  </div>
)}

{activeGroupChat?.archived && (
  <div className="bg-gray-100 dark:bg-gray-800 p-3 text-sm text-gray-600">
    🗄️ This group is archived (read-only).
    <button className="underline ml-2">Request Reactivation</button>
  </div>
)}
```

---

## 🔄 Backend Integration

### Update handleCreateGroup in Chat.jsx

**File**: `src/pages/Chat.jsx`

**Add validation**:
```javascript
import { canCreateSensitiveGroups } from '../utils/accountTiers';

const handleCreateGroup = async (groupData) => {
  const { name, category, location, invitePolicy, groupType, discoverability } = groupData;

  // Validate Sensitive Private permission
  if (groupType === 'sensitive_private' && !canCreateSensitiveGroups(user)) {
    toast.error('Premium tier or higher required to create Sensitive Private groups');
    return;
  }

  try {
    const { data: newThread, error } = await supabase
      .from('chat_threads')
      .insert([{
        topic: name,
        is_group: true,
        created_by: user.id,
        category: category,
        location: location?.name || null,
        location_type: location?.type || 'worldwide',
        group_type: groupType,                    // NEW
        invite_policy: invitePolicy,              // NEW
        discoverability: discoverability,         // NEW
        succession_enabled: groupType !== 'sensitive_private', // NEW
        is_public: groupType === 'public'
      }])
      .select()
      .single();

    // ... rest of existing code
  }
};
```

---

## 🧪 Testing Checklist

### Account Tier Tests
- [ ] Free user cannot create Sensitive Private (shows upgrade prompt)
- [ ] Premium user can create Sensitive Private
- [ ] Enterprise user can create Sensitive Private
- [ ] Assistant Admin can create Sensitive Private
- [ ] Executive Admin can create Sensitive Private

### Group Creation Tests
- [ ] Public group created successfully
- [ ] Semi-Private group created with link-only discoverability
- [ ] Private-Open group created
- [ ] Sensitive Private group created (Premium+ only)
- [ ] Group appears in Chat sidebar after creation

### Governance Tests
- [ ] Adding 10th member triggers Executive Admin assignment
- [ ] Creator leaving Public group promotes oldest admin
- [ ] Creator leaving Sensitive Private archives group
- [ ] Auto-promotion when group needs more admins (1:10 ratio)
- [ ] Archived group blocks new messages

### Admin Management Tests
- [ ] Admin can promote member to admin
- [ ] Admin can demote admin to member
- [ ] Cannot demote yourself if only admin
- [ ] Creator can transfer ownership
- [ ] Audit log records all role changes

---

## 🎯 Recommended Implementation Order

1. **Run migrations** (database ready)
2. **Update GroupChatModal** (4-tier selection + validation)
3. **Test group creation** (all 4 tiers)
4. **Update GroupChatEditModal** (admin promotion UI)
5. **Add leave warnings** (Sensitive Private)
6. **Add dormancy banners** (visual feedback)
7. **Create cron job** (run `update_dormancy_states()` daily)

---

## 🚨 Production Deployment Notes

### Before Going Live:

1. **Create Executive Admin account** (executive@scout2retire.com)
2. **Set up cron job** for `update_dormancy_states()` (run daily at 3am UTC)
3. **Update Terms of Service** with governance clauses (see docs)
4. **Test all tier-based restrictions** thoroughly
5. **Monitor audit logs** for first week after launch

### Monitoring:

```sql
-- Check exec admin assignments
SELECT thread_id, COUNT(*) as exec_admin_count
FROM group_chat_members
WHERE role = 'admin_executive'
GROUP BY thread_id;

-- Check dormant groups
SELECT id, topic, dormancy_state, last_activity_at
FROM chat_threads
WHERE dormancy_state != 'active'
ORDER BY last_activity_at ASC;

-- Check audit log volume
SELECT COUNT(*), action
FROM group_role_audit
WHERE created_at > now() - INTERVAL '7 days'
GROUP BY action;
```

---

## ❓ Questions to Answer Before Launch

1. **Exec Admin Email**: Create executive@scout2retire.com or different email?
2. **Cron Setup**: Use Supabase Cron, Vercel Cron, or external service?
3. **Upgrade Prompts**: Link to pricing page or inline upgrade flow?
4. **Audit Log Access**: Who can view full audit logs? (Just admins, or platform staff?)
5. **Recovery Protocol**: When inactive group hits 90 days, email all members or just admins?

---

**Status**: Database layer complete. Ready for UI implementation.
**Next Step**: Run migrations, then update GroupChatModal UI.
