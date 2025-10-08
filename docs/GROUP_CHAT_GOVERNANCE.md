# 🧩 Scout2Retire Group Chat Governance System

## Overview

Scout2Retire implements a **4-tier group privacy model** designed for:
- **Knowledge preservation** beyond any single user
- **Community continuity** (no orphaned groups)
- **Privacy** for sensitive discussions
- **Platform safety** and compliance

---

## The Four Tiers

### 1. 🔒 Sensitive Private (Premium Only)

**Intended Use**: Highly personal or delicate topics (health, relationships, legal)

**Key Traits**:
- **Privacy**: Hidden (not searchable, no invite links shown publicly)
- **Invite Control**: Creator only
- **Succession**: Disabled (group archives when creator leaves)
- **Max Members**: 10
- **Premium Requirement**: Yes

**Use Cases**:
- Terminal illness discussions (close family only)
- Relationship issues / divorce planning
- Abuse escape planning
- Financial crisis management

**What Happens When Creator Leaves**:
→ Group becomes **read-only** (archived). All messages preserved, but no new activity allowed.

---

### 2. 🪶 Semi-Private

**Intended Use**: Vetted communities with sensitive themes

**Key Traits**:
- **Privacy**: Link-only (not searchable)
- **Invite Control**: Members invite → admin approval required
- **Succession**: Auto-enabled at ≥10 members
- **Max Members**: Unlimited
- **Executive Admin**: Added at ≥10 members

**Use Cases**:
- Healthcare experiences in specific regions
- Budgeting / financial struggles
- LGBTQ+ retirement planning
- Addiction recovery support

**Governance**:
- 90-day admin review (system suggests promotions/demotions)
- Auto-promotes active members to admin (1:10 ratio)
- Platform oversight via Executive Admin

---

### 3. 🌗 Private-Open

**Intended Use**: Private but social groups (growth-friendly)

**Key Traits**:
- **Privacy**: Link-only (optionally hidden)
- **Invite Control**: Members invite → admin approval (auto-relaxes at ≥50 members)
- **Succession**: Auto-enabled
- **Max Members**: Unlimited
- **Executive Admin**: Added at ≥10 members

**Use Cases**:
- Regional expat communities
- Hobby groups (photography, hiking)
- Language practice groups
- Casual meetup coordination

**Governance**:
- Becomes more open as group grows
- At 50+ members, switches to "members can invite freely" mode
- Auto-succession ensures continuity

---

### 4. 🌐 Public

**Intended Use**: Open communities, general discussions

**Key Traits**:
- **Privacy**: Searchable & discoverable
- **Invite Control**: Anyone can join, members invite unrestricted
- **Succession**: Auto-enabled
- **Max Members**: Unlimited
- **Executive Admin**: Added at ≥10 members

**Use Cases**:
- "Best retirement locations in Portugal"
- "Spanish language learners"
- "Digital nomad retirees"
- General advice forums

**Governance**:
- Community-run with platform oversight
- Auto-admin ratio (1:10)
- Democratic, self-healing

---

## Role Hierarchy

```
creator          → Original creator (1 per group)
                  Can: Everything, transfer ownership, delete group

admin            → Group administrator (unlimited)
                  Can: Invite members, edit settings, promote moderators
                  Cannot: Delete group, demote creator

admin_executive  → Platform-assigned (≥10 members, auto-added)
                  Can: Everything (for safety & compliance)
                  Hidden from normal member list
                  All actions logged immutably

moderator        → Content moderator
                  Can: Remove disruptive members, mute users
                  Cannot: Edit settings, promote others

member           → Regular participant
                  Can: Read, write, invite (if policy allows)
```

---

## Auto-Succession Logic

### When Creator Leaves:

**Sensitive Private**:
→ Group **archives** (read-only). No succession.

**All Other Groups** (if succession enabled):
1. Find oldest admin → promote to creator
2. If no admins → promote oldest active member
3. If no active members → promote oldest member
4. Log succession in audit table

### Admin Ratio Enforcement (≥10 members):

```
Required Admins = CEIL(member_count / 10)
Minimum Admins = 2

Example:
- 15 members → 2 admins required
- 35 members → 4 admins required
- 100 members → 10 admins required
```

**Auto-Promotion Criteria**:
1. Most active member (posted in last 30 days)
2. If no active → oldest member by join date

---

## Dormancy Lifecycle

| State | Trigger | Action |
|-------|---------|--------|
| **Active** | Activity within 30 days | Normal operation |
| **Dormant** | 60 days inactive | Warning banner shown, notifications sent |
| **Inactive** | 90 days inactive | Recovery protocol (offer revival to top contributors) |
| **Archived** | 120 days inactive | Read-only (one-click reactivation available) |

**Sensitive Private Exception**:
→ Archives at 60 days (no recovery unless creator returns)

---

## Executive Admin Oversight

**When Added**: Automatically at ≥10 members (except Sensitive Private)

**Purpose**:
- Ensures continuity if all admins leave
- Safety & compliance monitoring
- Legal/abuse response capability

**Transparency**:
- Not visible in normal member list (optional toggle)
- All actions logged in `group_role_audit` table
- Users notified when assigned

**Legal Coverage**:
> "Scout2Retire assigns an Executive Administrator to all non-Sensitive groups exceeding ten members for safety and compliance purposes."

---

## Invite Policies

| Policy | Description | Who Approves |
|--------|-------------|--------------|
| **Creator Only** | Only creator invites | N/A |
| **Two-Key** | Creator + co-creator both approve | Both creators |
| **Admins Only** | Admins control invites | Any admin |
| **Members with Approval** | Members propose, admins approve | Admins |
| **Council** | N-of-M stewards approve | Steward vote |
| **Vouch + Approval** | N vouches + admin confirmation | Members + admin |
| **Application Form** | Submit form, admin reviews | Admins |
| **All Members** | Members invite freely | N/A |

**Security Add-ons**:
- TTL-based invite links (expire after X hours)
- Rate limits (max invites per user per day)
- Single-use tokens
- Phone/email verification
- Geo/IP restrictions

---

## Tier Conversion Rules

| From → To | Allowed? | Conditions |
|-----------|----------|------------|
| Public → Semi-Private | ✅ | Instant, notify members |
| Semi-Private → Public | ⚠️ | Admin vote + 7-day notice |
| Semi ↔ Private-Open | ✅ | Instant, logged |
| Sensitive → Others | ❌ | Only with unanimous consent + 7-day wait |
| Anything → Sensitive | ✅ | If creator is Premium |
| Public ↔ Sensitive | ❌ | Never allowed |

---

## Account Tier Requirements

**Who Can Create Sensitive Private Groups**:
- ✅ Premium ($49/month)
- ✅ Enterprise ($200/month)
- ✅ Town Manager (manages town content)
- ✅ Assistant Admin (staff account)
- ✅ Executive Admin (platform oversight)
- ❌ Free (cannot create Sensitive Private)
- ❌ Freemium (cannot create Sensitive Private)

**Validation**:
```javascript
import { canCreateSensitiveGroups } from './utils/accountTiers';

if (!canCreateSensitiveGroups(user) && group_type === 'sensitive_private') {
  throw new Error('Premium tier or higher required to create Sensitive Private groups');
}
```

**Tier Downgrade**:
- Existing Sensitive groups remain functional
- Creator cannot create NEW Sensitive groups
- Members can still be invited (by elevated-tier creator)

---

## Database Schema Summary

```sql
-- Group tier type
CREATE TYPE group_type AS ENUM (
  'sensitive_private', 'semi_private', 'private_open', 'public'
);

-- Invite policies
CREATE TYPE invite_policy AS ENUM (
  'creator_only', 'two_key', 'admins_only',
  'members_with_approval', 'council',
  'vouch_plus_approval', 'application_plus_approval',
  'all_members'
);

-- Member roles
CREATE TYPE member_role AS ENUM (
  'creator', 'admin', 'admin_executive', 'moderator', 'member'
);

-- Dormancy states
CREATE TYPE dormancy_state AS ENUM (
  'active', 'dormant', 'inactive', 'archived'
);
```

---

## Key Functions

### `ensure_executive_admin(thread_id)`
Auto-assigns Executive Admin to groups ≥10 members.

### `enforce_admin_ratio(thread_id)`
Auto-promotes members to maintain 1:10 admin:member ratio.

### `handle_creator_departure(thread_id, user_id)`
Archives Sensitive groups or promotes successor for others.

### `update_dormancy_states()`
Run via cron to update inactive/archived states.

---

## Implementation Checklist

- [x] Database migrations (enums, columns)
- [x] Governance functions (succession, dormancy)
- [x] RLS policies (role-based, not creator-based)
- [ ] UI for group creation (4-tier selection)
- [ ] UI for admin management (promote/demote)
- [ ] Premium validation checks
- [ ] Audit log viewer
- [ ] Leave warnings for Sensitive creators
- [ ] Dormancy banners and notifications
- [ ] Executive admin account creation

---

## Legal & Compliance

**ToS Clauses Required**:

1. **Community Continuity Clause**:
   > "Scout2Retire reserves the right to reassign group administration or archive inactive groups to preserve community continuity."

2. **Administrative Oversight Clause**:
   > "Groups exceeding ten members (excluding Sensitive Private) are subject to Executive Administrator oversight for safety and compliance."

3. **Privacy vs Secrecy**:
   > "While we protect user privacy, Scout2Retire retains controlled emergency access for child safety, fraud prevention, legal compliance, and abuse prevention."

**Audit Trail**:
- All admin actions logged immutably in `group_role_audit`
- Dual authorization required for Trust & Safety access
- Post-event user notification (delayed if risk exists)

---

## Migration Path

**Existing Groups**:
- Public groups → `public` tier
- Private groups → `private_open` tier
- Existing creators keep `creator` role
- Other members → `member` role
- Apply succession and executive admin policies

**Rollout Plan**:
1. Run migrations (enums, functions, RLS)
2. Update UI (group creation, admin management)
3. Notify users of new features
4. Create Executive Admin account
5. Enable cron job for dormancy checks

---

**Last Updated**: 2025-10-07
**Status**: Implementation in progress
