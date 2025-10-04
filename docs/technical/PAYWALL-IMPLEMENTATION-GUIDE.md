# 🔐 PAYWALL SYSTEM - IMPLEMENTATION GUIDE

**Created:** October 4, 2025
**Status:** Phase 1 Complete, Phase 2 In Progress
**Completion:** 25% (Database + 2/8 features enforced)

---

## ✅ WHAT'S WORKING NOW

### Database Layer (100% Complete)
- ✅ **4 Subscription Tiers:** Free, Freemium (hidden), Premium, Enterprise
- ✅ **12 Features with Limits:** All configured and ready
- ✅ **RPC Functions:** `can_user_perform()`, `get_user_limits()`, `check_admin_access()`
- ✅ **Audit Logging:** GDPR-compliant, immutable, partitioned
- ✅ **All Users:** Assigned to FREE tier by default

### Enforcement Layer (25% Complete)
- ✅ **Chat Partners:** Limit enforced in `src/utils/companionUtils.js`
- ✅ **Town Favorites:** Limit enforced in `src/utils/townUtils.jsx`
- ✅ **Utility Library:** `src/utils/paywallUtils.js` ready for all features

---

## 📖 HOW TO ADD LIMIT ENFORCEMENT

### Pattern (Copy This for Each Feature):

```javascript
// 1. Import the utility
import { canUserPerform } from './paywallUtils.js';

// 2. Before performing the action, check current usage
const { data: currentUsage } = await supabase
  .from('some_table')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);

const currentCount = currentUsage?.length || 0;

// 3. Check if user can perform action
const limitCheck = await canUserPerform('feature_code_here', currentCount);

// 4. If not allowed, return error with upgrade suggestion
if (!limitCheck.allowed) {
  return {
    success: false,
    error: limitCheck.reason,
    limitReached: true,
    upgradeTo: limitCheck.upgrade_to,
    featureName: limitCheck.feature_name,
    currentUsage: limitCheck.current_usage,
    limit: limitCheck.limit
  };
}

// 5. Continue with normal logic if allowed
```

---

## 🎯 REMAINING FEATURES TO ENFORCE

### Feature 3: Regions in Preferences
**Feature Code:** `regions`
**File:** `src/pages/onboarding/OnboardingRegion.jsx`
**Where:** Before allowing user to add another region
**Current Usage:** Count selected regions in user_preferences

```javascript
// In region selection handler
const limitCheck = await canUserPerform('regions', selectedRegions.length);
if (!limitCheck.allowed) {
  toast.error(`${limitCheck.featureName}: ${limitCheck.reason}`);
  return; // Don't add region
}
```

### Feature 4: Town Displays (Search Results)
**Feature Code:** `town_displays`
**File:** Search results rendering logic
**Where:** After fetching towns, before displaying
**Implementation:** Truncate results array

```javascript
// After fetching towns
const limit = await getFeatureLimit('town_displays');
const displayTowns = limit === null ? allTowns : allTowns.slice(0, limit);

// Show upgrade hint if truncated
if (limit && allTowns.length > limit) {
  showUpgradePrompt('town_displays', allTowns.length);
}
```

### Feature 5: Scotty AI Chats
**Feature Code:** `scotty_chats`
**File:** Scotty chat initialization (scottyContext.js or chat component)
**Where:** Before starting new AI conversation
**Note:** Requires usage tracking table

```sql
-- Create usage tracking table
CREATE TABLE scotty_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  month TEXT GENERATED ALWAYS AS (TO_CHAR(started_at, 'YYYY-MM')) STORED
);

CREATE INDEX idx_scotty_usage_user_month ON scotty_chat_usage(user_id, month);
```

```javascript
// Before starting chat
const currentMonth = new Date().toISOString().slice(0, 7); // "2025-10"
const { data: usage } = await supabase
  .from('scotty_chat_usage')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .gte('started_at', `${currentMonth}-01`);

const limitCheck = await canUserPerform('scotty_chats', usage?.length || 0);
if (!limitCheck.allowed) {
  showUpgradeModal(limitCheck);
  return;
}

// Log usage
await supabase.from('scotty_chat_usage').insert({ user_id: userId });
```

### Feature 6: Top Matches (/today page)
**Feature Code:** `top_matches`
**File:** `/src/pages/Daily.jsx` or `/src/pages/Today.jsx`
**Where:** When rendering top matches list
**Implementation:** Slice array

```javascript
const limit = await getFeatureLimit('top_matches');
const displayMatches = limit === null ? topMatches : topMatches.slice(0, limit);
```

### Feature 7: Compare Towns
**Feature Code:** `compare_towns`
**File:** `/src/pages/Compare.jsx` or comparison component
**Where:** Before adding town to comparison
**Current Usage:** Count towns currently in comparison

```javascript
const limitCheck = await canUserPerform('compare_towns', selectedTowns.length);
if (!limitCheck.allowed) {
  toast.error(`You can compare up to ${limitCheck.limit} towns. Upgrade for more!`);
  return;
}
```

### Feature 8: Fresh Discoveries
**Feature Code:** `fresh_discoveries`
**File:** Discovery feature component
**Where:** Before showing new recommendations
**Note:** Requires daily usage tracking

```sql
-- Add to scotty_chat_usage table or create new one
CREATE TABLE discovery_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  date TEXT GENERATED ALWAYS AS (TO_CHAR(viewed_at, 'YYYY-MM-DD')) STORED
);

CREATE INDEX idx_discovery_views_user_date ON discovery_views(user_id, date);
```

```javascript
const today = new Date().toISOString().slice(0, 10); // "2025-10-04"
const { data: views } = await supabase
  .from('discovery_views')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .gte('viewed_at', `${today}T00:00:00`);

const limitCheck = await canUserPerform('fresh_discoveries', views?.length || 0);
```

---

## 🎨 PHASE 4: UPGRADE MODAL (Priority for Testing)

Create this ASAP so you can test limits visually:

```jsx
// src/components/UpgradeModal.jsx
import React from 'react';
import { X, Sparkles } from 'lucide-react';

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  currentTier = 'free',
  suggestedTier = 'premium',
  currentUsage,
  limit
}) {
  if (!isOpen) return null;

  const tierPricing = {
    premium: { monthly: 49, yearly: 490 },
    enterprise: { monthly: 200, yearly: 2000 }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Upgrade Required</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You've reached your limit of {limit} {featureName.toLowerCase()}.
          {currentUsage && ` (${currentUsage}/${limit} used)`}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">
            Upgrade to {suggestedTier.charAt(0).toUpperCase() + suggestedTier.slice(1)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ${tierPricing[suggestedTier]?.monthly}/month
            {' or '}
            ${tierPricing[suggestedTier]?.yearly}/year
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>✅ Unlimited {featureName.toLowerCase()}</li>
            <li>✅ Priority support</li>
            <li>✅ Advanced features</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Maybe Later
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Usage in components:**

```javascript
import { UpgradeModal } from '../components/UpgradeModal';

const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });

// When limit check fails
if (!limitCheck.allowed) {
  setUpgradeModal({
    isOpen: true,
    featureName: limitCheck.featureName,
    currentUsage: limitCheck.currentUsage,
    limit: limitCheck.limit,
    suggestedTier: limitCheck.upgrade_to
  });
  return;
}

// In JSX
<UpgradeModal
  {...upgradeModal}
  onClose={() => setUpgradeModal({ isOpen: false })}
/>
```

---

## 🔧 ADMIN UI REQUIREMENTS

### PaywallManager Component (Phase 3)

```jsx
// src/components/admin/PaywallManager.jsx
// Should allow executive_admin to:
// 1. Toggle tier visibility (show/hide freemium)
// 2. Edit tier pricing
// 3. Adjust feature limits via inline editing
// 4. View user distribution across tiers

// Use RPC functions:
// - check_admin_access('executive_admin') to protect
// - Direct table updates to user_categories, category_limits
// - set_category_limits(category_code, limits_json) for bulk updates
```

---

## 📊 TESTING CHECKLIST

### Test as Free User:
- [ ] Try adding 4th friend → blocked with upgrade modal
- [ ] Try favoriting 6th town → blocked
- [ ] Try starting 4th Scotty chat this month → blocked
- [ ] Search shows only 50 results (with "upgrade for more" hint)
- [ ] Compare limited to 2 towns
- [ ] Top matches shows only 3

### Test as Premium User:
- [ ] Unlimited friends
- [ ] Unlimited favorites
- [ ] 50 Scotty chats/month
- [ ] Unlimited search results
- [ ] Compare 5 towns

### Test as Enterprise User:
- [ ] Everything unlimited
- [ ] White label reports enabled
- [ ] API access enabled

### Test Admin Roles:
- [ ] Moderator can view PaywallManager but not edit
- [ ] Executive admin can edit all limits
- [ ] Auditor can view audit_log

### Test Community Roles:
- [ ] Scout verified → auto-upgraded to Premium
- [ ] Service provider verified → auto-upgraded to Enterprise
- [ ] Audit log records upgrade

---

## 🚨 COMMON PITFALLS

1. **Forgetting to check current usage first**
   - Always query current count before calling `canUserPerform()`

2. **Not handling limitReached in UI**
   - Check for `result.limitReached === true` and show modal

3. **Using wrong feature_code**
   - Codes: `chat_partners`, `town_favorites`, `regions`, `town_displays`, `scotty_chats`, `top_matches`, `compare_towns`, `fresh_discoveries`

4. **Forgetting monthly/daily resets**
   - Scotty chats reset monthly
   - Fresh discoveries reset daily
   - Track usage in separate tables with date columns

5. **Not testing with actual free user**
   - Test with real account, not service_role

---

## 📁 FILE LOCATIONS

**Database:**
- Migration: `supabase/migrations/20251004051700_user_roles_paywall_system.sql`
- Test script: `database-utilities/test-paywall-system.js`

**Utilities:**
- Paywall utils: `src/utils/paywallUtils.js`
- Friend limits: `src/utils/companionUtils.js` (lines 99-122)
- Favorite limits: `src/utils/townUtils.jsx` (lines 227-247)

**Documentation:**
- Progress tracker: `docs/project-history/PAYWALL-IMPLEMENTATION-PROGRESS.md`
- This guide: `docs/technical/PAYWALL-IMPLEMENTATION-GUIDE.md`

---

## 🎯 QUICK WINS

**Want to see it working fast? Do this:**

1. **Create UpgradeModal** (30 min) - Lets you test visually
2. **Add to one more feature** (15 min) - Pick "Compare Towns" (easiest)
3. **Test as free user** (5 min) - See modal in action
4. **Show to stakeholders** - Proof of concept ready!

**Total time to working demo:** 50 minutes

---

**Last Updated:** October 4, 2025 05:45 AM
**Next Task:** Create UpgradeModal → Add to Compare Towns → Test
