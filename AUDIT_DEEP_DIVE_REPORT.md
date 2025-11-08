# DEEP DIVE UI/UX AUDIT REPORT

**Date:** 11/8/2025, 1:19:30 AM
**Environment:** http://localhost:5173
**Test Account:** tilman.rumpf@gmail.com

---

## 🔍 DETAILED PAGE ANALYSIS


### Towns Manager

- **URL:** http://localhost:5173/admin/towns-manager
- **Load Time:** 5592ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (387 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 406 ()
- Error fetching field definitions: {code: PGRST116, details: The result contains 0 rows, hint: null, message: Cannot coerce the result to a single JSON object}
- Failed to load resource: the server responded with a status of 404 ()
- Error loading alerts: {code: PGRST205, details: null, hint: Perhaps you meant the table 'public.user_device_history', message: Could not find the table 'public.town_data_history' in the schema cache}
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/user_preferences?select=onboarding_completed&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `towns-manager.png`

---


### Algorithm Manager

- **URL:** http://localhost:5173/admin/algorithm
- **Load Time:** 5632ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (2351 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `algorithm-manager.png`

---


### Region Manager

- **URL:** http://localhost:5173/admin/region-manager
- **Load Time:** 5755ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (6210 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `region-manager.png`

---


### Data Verification

- **URL:** http://localhost:5173/admin/data-verification
- **Load Time:** 5644ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (4566 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `data-verification.png`

---


### Paywall Manager

- **URL:** http://localhost:5173/admin/paywall
- **Load Time:** 5606ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (1081 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `paywall-manager.png`

---


### Daily

- **URL:** http://localhost:5173/daily
- **Load Time:** 5638ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (2277 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `daily.png`

---


### Profile

- **URL:** http://localhost:5173/profile
- **Load Time:** 5613ms
- **HTTP Status:** 200
- **Has Content:** ✅ Yes (585 characters)
- **Has Header:** ✅ Yes
- **Has Navigation:** ✅ Yes
- **Loading State:** ✅ No
- **Error Message:** ✅ No


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()



**Network Errors:**
- https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/favorites?select=*&user_id=eq.83d285b2-b21b-4d13-a1a1-6d51b6733d52 - net::ERR_ABORTED




**Screenshot:** `profile.png`

---


## 🎯 CRITICAL FINDINGS

### ❌ Pages With No Content
None

### ⚠️ Pages Stuck in Loading State
None

### 🚨 Pages With Error Messages
None

### 📊 Performance Summary
- **Towns Manager**: 5592ms
- **Algorithm Manager**: 5632ms
- **Region Manager**: 5755ms
- **Data Verification**: 5644ms
- **Paywall Manager**: 5606ms
- **Daily**: 5638ms
- **Profile**: 5613ms

---

## 📸 SCREENSHOTS
All screenshots saved to: `./audit-deep-dive/`

- Towns Manager.png
- Algorithm Manager.png
- Region Manager.png
- Data Verification.png
- Paywall Manager.png
- Daily.png
- Profile.png
