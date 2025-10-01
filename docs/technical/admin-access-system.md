# Admin Access System - Documentation

**Last Updated:** October 1, 2025
**Status:** ✅ IMPLEMENTED (Database-Driven)

---

## OVERVIEW

Scout2Retire uses a **database-driven admin access system** with the `is_admin` boolean column on the `users` table. This system is already fully functional and does NOT require additional implementation.

---

## DATABASE SCHEMA

### `users` Table - `is_admin` Column

```sql
-- Column definition (from migration 20250830_add_admin_column.sql)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;
```

### Current Admins

The following users have admin access (as of August 30, 2025):

- `tilman.rumpf@gmail.com` (Super Admin)
- `tobiasrumpf@gmx.de`
- `tobias.rumpf1@gmail.com`
- `madara.grisule@gmail.com`

---

## IMPLEMENTATION DETAILS

### 1. TownsManager Admin Check

**File:** `src/pages/admin/TownsManager.jsx`
**Lines:** 204-237

```javascript
useEffect(() => {
  const checkAuth = async () => {
    // 1. Verify user is logged in
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error('You must be logged in to access the admin panel.');
      navigate('/welcome');
      return;
    }

    // 2. Check if user has admin privileges from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      console.error('❌ Not authorized - user is not admin');
      toast.error('You are not authorized to access the admin panel.');
      navigate('/');
      return;
    }

    // User is admin - continue loading
    setCurrentUser({ id: user.id, email: user.email });
    setIsLoading(false);
  };

  checkAuth();
}, [navigate]);
```

### 2. QuickNav Admin UI

**File:** `src/components/QuickNav.jsx`
**Lines:** 17-18, 58, 238, 302

```javascript
// State
const [isAdmin, setIsAdmin] = useState(false);

// Load admin status from profile
const loadUserAndInvites = async () => {
  const { user, profile } = await getCurrentUser();
  if (currentUser && profile) {
    setIsAdmin(profile.is_admin === true);
  }
};

// Conditionally render admin UI
{isAdmin && (
  <button onClick={() => setAdminExpanded(!adminExpanded)}>
    {/* Gear icon */}
  </button>
)}

{isAdmin && adminExpanded && (
  <>
    <div>S<span>2</span>R Admin</div>
    <Link to="/admin/towns-manager">Towns-Manager</Link>
  </>
)}
```

---

## HOW TO GRANT ADMIN ACCESS

### Method 1: SQL Update (Recommended)

```sql
-- Grant admin access to a user by email
UPDATE users
SET is_admin = true
WHERE email = 'new.admin@example.com';
```

### Method 2: Supabase Dashboard

1. Navigate to Supabase Dashboard → Table Editor
2. Select `users` table
3. Find the user by email
4. Edit the `is_admin` column to `true`
5. Save changes

### Method 3: Programmatic (Future Enhancement)

Create an admin utility function for super admins to grant/revoke access:

```javascript
// src/utils/adminUtils.js (NOT YET IMPLEMENTED)
export const grantAdminAccess = async (userId, isSuperAdmin = false) => {
  // Only super admins can grant admin access
  // Implement role hierarchy if needed
};
```

---

## HOW TO REVOKE ADMIN ACCESS

```sql
-- Revoke admin access
UPDATE users
SET is_admin = false
WHERE email = 'former.admin@example.com';
```

---

## SECURITY CONSIDERATIONS

### ✅ What's Secure:

1. **Database-driven**: Admin status stored in database, not hardcoded
2. **RLS Policies**: Row Level Security prevents unauthorized access
3. **Route Protection**: Admin pages check `is_admin` before rendering
4. **UI Hiding**: Admin menu only visible to admins
5. **Indexed**: Fast lookups via `idx_users_is_admin` index

### ⚠️ Potential Improvements:

1. **Role Hierarchy**: Currently binary (admin/not admin)
   - Could add: `user`, `moderator`, `admin`, `super_admin`
   - Would allow granular permissions

2. **Audit Logging**: Track admin actions
   - Who made changes?
   - What was changed?
   - When was it changed?

3. **Admin UI for Access Management**:
   - Super admins could grant/revoke access via UI
   - Currently requires SQL or Supabase dashboard

4. **Permission Levels**:
   - Read-only admin
   - Edit admin
   - Super admin (can grant/revoke)

---

## TESTING

### How to Verify Admin Access:

1. **Login as admin user**
   ```
   Email: tilman.rumpf@gmail.com
   Password: [Your password]
   ```

2. **Check QuickNav menu**
   - Should see gear icon in top-right
   - Click gear → "S2R Admin" section expands
   - "Towns-Manager" link visible

3. **Navigate to admin page**
   ```
   http://localhost:5173/admin/towns-manager
   ```
   - Should load successfully
   - Should NOT redirect to /welcome

4. **Login as non-admin user**
   - Should NOT see gear icon
   - Navigate to `/admin/towns-manager` → Redirects to `/`
   - Toast message: "You are not authorized to access the admin panel."

---

## MIGRATION HISTORY

- **August 30, 2025**: Created `is_admin` column and index
  - Migration: `20250830_add_admin_column.sql`
  - Granted admin to 4 initial users

- **September 29, 2025**: Added RLS policies for admin access
  - Migration: `20250929213035_add_admin_rls_policies.sql`

- **October 1, 2025**: Removed unused hardcoded `ADMIN_EMAIL` constant
  - File: `src/pages/admin/TownsManager.jsx`
  - Reason: Already using database-driven `is_admin` check

---

## CONCLUSION

The admin access system is **ALREADY FULLY FUNCTIONAL**. No additional implementation needed.

The system:
- ✅ Uses database for admin status
- ✅ Protects admin routes
- ✅ Hides admin UI from non-admins
- ✅ Has proper indexes for performance
- ✅ Includes RLS policies for security

**Future enhancements could include:**
- Role hierarchy (user → moderator → admin → super_admin)
- Admin UI for access management
- Audit logging for admin actions
- Permission-based access control

---

## FILES REFERENCE

### Database:
- `supabase/migrations/20250830_add_admin_column.sql` - Creates `is_admin` column
- `supabase/migrations/20250929213035_add_admin_rls_policies.sql` - RLS policies

### Frontend:
- `src/pages/admin/TownsManager.jsx:204-237` - Admin route protection
- `src/components/QuickNav.jsx:17-18,58,238,302` - Admin UI display
- `src/utils/authUtils.js` - Authentication utilities

### Future:
- `src/utils/adminUtils.js` - Admin utilities (to be created)
- `src/components/AdminRoute.jsx` - Reusable admin route wrapper (optional)
