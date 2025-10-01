# Admin Access System - Implementation Plan

**Created:** October 1, 2025
**Priority:** 🔴 CRITICAL
**Status:** Planning Phase
**Estimated Time:** 4-6 hours

---

## CURRENT PROBLEM

**Hardcoded admin email blocks other administrators:**
```javascript
// src/pages/admin/TownsManager.jsx:19
const ADMIN_EMAIL = 'tilman.rumpf@gmail.com';  // ❌ Only Tilman can access
```

**Impact:**
- No other users can access admin panel
- Not scalable for team growth
- Security risk (can't revoke access)
- Can't grant temporary admin access

---

## PROPOSED SOLUTION

### Database-First Approach (Recommended)

**1. Add `role` column to `profiles` table:**

```sql
-- Migration: Add role-based access control
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));

-- Create index for performance
CREATE INDEX idx_profiles_role ON profiles(role);

-- Grant Tilman super_admin role
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'tilman.rumpf@gmail.com';
```

**2. Create admin utility function:**

```javascript
// src/utils/adminUtils.js
import supabase from './supabaseClient';

export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const checkAdminAccess = async (userId, requiredRole = ROLES.ADMIN) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Admin check error:', error);
      return { hasAccess: false, role: null };
    }

    const roleHierarchy = [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    const userRoleLevel = roleHierarchy.indexOf(profile.role);
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

    return {
      hasAccess: userRoleLevel >= requiredRoleLevel,
      role: profile.role,
      isSuperAdmin: profile.role === ROLES.SUPER_ADMIN
    };
  } catch (error) {
    console.error('Unexpected admin check error:', error);
    return { hasAccess: false, role: null };
  }
};
```

**3. Protect admin routes:**

```javascript
// src/components/AdminRoute.jsx (NEW FILE)
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { checkAdminAccess } from '../utils/adminUtils';
import toast from 'react-hot-toast';

export default function AdminRoute({ children, requiredRole = 'admin' }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { user } = await getCurrentUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { hasAccess: access, role } = await checkAdminAccess(user.id, requiredRole);

      if (!access) {
        toast.error(`Admin access required (you are: ${role || 'user'})`);
      }

      setHasAccess(access);
      setLoading(false);
    };

    checkAccess();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-scout-accent-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
```

**4. Update App.jsx routes:**

```javascript
// src/App.jsx
import AdminRoute from './components/AdminRoute';

// Change from:
<Route path="/admin/towns" element={<ProtectedRoute><TownsManager /></ProtectedRoute>} />

// To:
<Route path="/admin/towns" element={
  <ProtectedRoute>
    <AdminRoute requiredRole="admin">
      <TownsManager />
    </AdminRoute>
  </ProtectedRoute>
} />
```

**5. Remove hardcoded email check:**

```javascript
// src/pages/admin/TownsManager.jsx
// DELETE line 19:
// const ADMIN_EMAIL = 'tilman.rumpf@gmail.com';

// REPLACE lines that check email with:
// (Access already verified by AdminRoute wrapper)
```

---

## UI ENHANCEMENTS

### Admin Management Page (NEW)

**Create:** `src/pages/admin/UserManagement.jsx`

Features:
- List all users with current roles
- Edit user roles (admin+ only)
- View login history
- Revoke access
- Audit log of role changes

```javascript
// Minimal UI mockup
<AdminRoute requiredRole="super_admin">
  <UserManagement>
    <UserTable>
      {users.map(user => (
        <UserRow key={user.id}>
          <td>{user.email}</td>
          <td>
            <RoleSelector
              currentRole={user.role}
              onChange={(newRole) => updateUserRole(user.id, newRole)}
            />
          </td>
          <td>{user.last_login}</td>
        </UserRow>
      ))}
    </UserTable>
  </UserManagement>
</AdminRoute>
```

---

## ROLE CAPABILITIES

| Role | Towns Manager | User Management | Database Direct | Settings |
|------|---------------|-----------------|-----------------|----------|
| **user** | ❌ | ❌ | ❌ | Own profile only |
| **moderator** | ✅ Read only | ❌ | ❌ | Own profile only |
| **admin** | ✅ Full access | ❌ | ❌ | Admin settings |
| **super_admin** | ✅ Full access | ✅ Full access | ✅ Full access | All settings |

---

## IMPLEMENTATION STEPS

### Phase 1: Database (1 hour)
1. Create migration file: `supabase/migrations/add_role_column.sql`
2. Test migration locally
3. Apply to production
4. Verify Tilman has super_admin role

### Phase 2: Utilities (1 hour)
1. Create `src/utils/adminUtils.js`
2. Create `src/components/AdminRoute.jsx`
3. Write unit tests for role hierarchy

### Phase 3: Routes (1 hour)
1. Update `App.jsx` to use `AdminRoute` wrapper
2. Remove hardcoded email from TownsManager.jsx
3. Test admin access with different roles

### Phase 4: UI (2-3 hours)
1. Create `src/pages/admin/UserManagement.jsx`
2. Add route for `/admin/users`
3. Add navigation link in QuickNav (admin+ only)
4. Test role changes and permissions

---

## TESTING CHECKLIST

- [ ] User with no role → Blocked from /admin/towns
- [ ] User with 'moderator' → Read-only access to towns
- [ ] User with 'admin' → Full access to towns, blocked from user management
- [ ] User with 'super_admin' → Full access to everything
- [ ] Role change takes effect immediately (no re-login needed)
- [ ] Non-admin cannot see admin links in QuickNav
- [ ] Toast messages show helpful errors for blocked access

---

## SECURITY CONSIDERATIONS

1. **Row Level Security (RLS):**
   - Add RLS policies to profiles table
   - Only super_admins can UPDATE role column
   - All users can SELECT their own profile

```sql
-- RLS Policy: Users can read own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Only super_admins can update roles
CREATE POLICY "Only super_admins can update roles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);
```

2. **Audit Logging:**
   - Log all role changes to `admin_audit_log` table
   - Include: who, what, when, old role, new role

---

## ROLLBACK PLAN

If issues arise:

1. **Immediate:** Revert App.jsx to use hardcoded email check
2. **Database:** Rollback migration (drop role column)
3. **Code:** Delete AdminRoute.jsx and adminUtils.js

```bash
# Emergency rollback
git revert HEAD
node restore-database-snapshot.js 2025-10-01T17-28-42
```

---

## FUTURE ENHANCEMENTS

- **Team invites:** Allow admins to invite new team members
- **Temporary access:** Grant time-limited admin rights
- **2FA requirement:** Require 2FA for admin accounts
- **IP whitelist:** Restrict admin access to certain IPs
- **Slack notifications:** Alert on new admin access grants

---

**Status:** Ready for implementation pending Tilman approval
**Risk Level:** Medium (touching auth/access control)
**Testing Required:** Heavy (all role combinations)
