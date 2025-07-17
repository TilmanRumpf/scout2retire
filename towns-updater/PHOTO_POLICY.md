# PHOTO UPDATE POLICY - CRITICAL

## 📸 PHOTOS ARE UPDATED ONLY VIA BUCKET IMPORT SYSTEM

### New Policy (Updated Jan 2025)
- **Photo import script** (`import-photos-from-bucket.js`) is the **ONLY approved method**
- **Upload photos to bucket** → **Run import script** → **Done**
- **No manual dashboard updates** - Use the automated system
- **All other scripts** still exclude photo fields completely

### How the Bucket System Works
1. Upload photos to `town-images` bucket in Supabase
2. Follow naming: `[country-code]-[city-name]-[optional].jpg`
   - Example: `es-barcelona-sunset.jpg`
   - Example: `vn-vung-tau-harbor.jpg`
3. Run: `node import-photos-from-bucket.js`
4. Script automatically matches and updates towns

### Why This System?
1. **Batch processing** - Update many towns at once
2. **Consistent naming** - Enforces standards
3. **Safe operation** - Won't overwrite existing photos
4. **Quality control** - Review photos before bucket upload
5. **Audit trail** - Script logs all updates

### Script Safety Features
- ✅ Only updates towns WITHOUT existing photos
- ✅ Validates country codes and city names
- ✅ Can run multiple times (idempotent)
- ✅ Detailed logging of matches and skips
- ✅ Preserves existing photos

### Current Status
- **71 out of 343 towns have photos (20.7%)**
- **48 photos imported** in last run
- **Photo filtering** is active (towns without photos are hidden)
- **Adding photos** via bucket is top priority

### Developer Notes
For photo updates:
1. **DON'T** manually edit image_url fields
2. **DON'T** update photos via SQL
3. **DO** upload to bucket with correct naming
4. **DO** run the import script
5. **DO** check logs for any issues

### Other Update Scripts
All non-photo update scripts in this folder:
- ✅ Update town data (costs, descriptions, ratings, etc.)
- ❌ NEVER touch photo fields
- ✅ Work alongside the photo import system

**Remember: Bucket Import = The Way!**