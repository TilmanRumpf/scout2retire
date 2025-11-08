# Photo Migration - Quick Reference

**For**: Developers who need to work with the new photo system
**Created**: 2025-11-09

---

## 🎯 What Changed

### Before Migration
```javascript
// Old way: Access images directly from towns table
const { data: town } = await supabase
  .from('towns')
  .select('id, name, image_url_1, image_url_2, image_url_3, image_source, image_photographer')
  .eq('id', townId)
  .single();

console.log(town.image_url_1); // Primary image
console.log(town.image_url_2); // Second image
console.log(town.image_source); // Metadata (only for image_url_1)
```

### After Migration
```javascript
// New way: Get images from town_images table
const { data: town } = await supabase
  .from('towns')
  .select(`
    id,
    name,
    image_url_1,  // ⚠️ Still exists as cache field
    town_images (
      id,
      image_url,
      display_order,
      source,
      photographer,
      license,
      is_fallback
    )
  `)
  .eq('id', townId)
  .single();

console.log(town.image_url_1); // Cache field (same as display_order=1)
console.log(town.town_images); // Array of all images
console.log(town.town_images[0].image_url); // Primary image
console.log(town.town_images[0].source); // Metadata
```

---

## 📊 New Table Structure

### `town_images` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `town_id` | INTEGER | Foreign key to towns.id |
| `image_url` | TEXT | Full URL to image |
| `display_order` | INTEGER | Sort order (1 = primary) |
| `source` | TEXT | Image source/attribution |
| `photographer` | TEXT | Photographer name |
| `license` | TEXT | License type |
| `is_fallback` | BOOLEAN | True if generic/fallback image |
| `validated_at` | TIMESTAMPTZ | When image was validated |
| `validation_note` | TEXT | Notes from validation |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Key Constraints
- **Unique**: `(town_id, display_order)` - Each town can only have one image per display order
- **Check**: `display_order > 0` - Must be positive integer
- **Foreign Key**: `town_id` references `towns(id)` with CASCADE delete

---

## 🔄 Cache Sync Behavior

**Important**: `towns.image_url_1` is a cache field that auto-syncs with `town_images`

### Automatic Sync Trigger

When you:
- **INSERT** a new `display_order=1` image → `image_url_1` updates automatically
- **UPDATE** the `display_order=1` image → `image_url_1` updates automatically
- **DELETE** the `display_order=1` image → `image_url_1` clears (or promotes order=2)

### Example: Cache Auto-Update

```javascript
// Add a new primary image
await supabase
  .from('town_images')
  .insert({
    town_id: 123,
    image_url: 'https://example.com/new-image.jpg',
    display_order: 1
  });

// towns.image_url_1 is now 'https://example.com/new-image.jpg'
// This happened automatically via trigger!

// Update primary image
await supabase
  .from('town_images')
  .update({ image_url: 'https://example.com/updated.jpg' })
  .eq('town_id', 123)
  .eq('display_order', 1);

// towns.image_url_1 is now 'https://example.com/updated.jpg'
// Again, automatic!

// Delete primary image
await supabase
  .from('town_images')
  .delete()
  .eq('town_id', 123)
  .eq('display_order', 1);

// If display_order=2 existed: promoted to display_order=1
// If not: towns.image_url_1 set to NULL
```

---

## 📝 Common Queries

### Get All Images for a Town

```javascript
const { data: images } = await supabase
  .from('town_images')
  .select('*')
  .eq('town_id', townId)
  .order('display_order');

// images = [
//   { id: '...', image_url: '...', display_order: 1, ... },
//   { id: '...', image_url: '...', display_order: 2, ... },
// ]
```

### Get Primary Image Only

```javascript
// Option 1: Use cache field (fastest)
const { data: town } = await supabase
  .from('towns')
  .select('id, name, image_url_1')
  .eq('id', townId)
  .single();

// Option 2: Query town_images (if you need metadata)
const { data: primaryImage } = await supabase
  .from('town_images')
  .select('*')
  .eq('town_id', townId)
  .eq('display_order', 1)
  .single();
```

### Add New Image to Town

```javascript
// Find highest display_order
const { data: maxOrder } = await supabase
  .from('town_images')
  .select('display_order')
  .eq('town_id', townId)
  .order('display_order', { ascending: false })
  .limit(1);

const nextOrder = (maxOrder?.[0]?.display_order || 0) + 1;

// Insert new image
await supabase
  .from('town_images')
  .insert({
    town_id: townId,
    image_url: newImageUrl,
    display_order: nextOrder,
    source: 'Unsplash',
    photographer: 'John Doe',
    license: 'CC BY 4.0'
  });
```

### Replace Primary Image

```javascript
// Replace display_order=1 image
await supabase
  .from('town_images')
  .update({
    image_url: newImageUrl,
    source: 'New Source',
    photographer: 'New Photographer'
  })
  .eq('town_id', townId)
  .eq('display_order', 1);

// towns.image_url_1 updated automatically via trigger
```

### Reorder Images

```javascript
// Swap display_order=1 and display_order=2
// Note: Need to update in transaction to avoid constraint violation

// Temporary move first image to order 999
await supabase
  .from('town_images')
  .update({ display_order: 999 })
  .eq('town_id', townId)
  .eq('display_order', 1);

// Move second image to first
await supabase
  .from('town_images')
  .update({ display_order: 1 })
  .eq('town_id', townId)
  .eq('display_order', 2);

// Move temp to second
await supabase
  .from('town_images')
  .update({ display_order: 2 })
  .eq('town_id', townId)
  .eq('display_order', 999);
```

### Delete Image (Keep Others)

```javascript
// Delete specific image by display_order
await supabase
  .from('town_images')
  .delete()
  .eq('town_id', townId)
  .eq('display_order', 3);

// If deleting display_order=1, order=2 auto-promotes to order=1
```

### Delete All Images for Town

```javascript
// All images deleted (cascade works)
await supabase
  .from('town_images')
  .delete()
  .eq('town_id', townId);

// towns.image_url_1 automatically cleared via trigger
```

---

## 🔐 RLS Policies

### Public Access (Anon Key)
- **Read**: ✅ Anyone can view images
- **Write**: ❌ Not allowed

### Admin Access (Service Role or Admin User)
- **Read**: ✅ Full access
- **Write**: ✅ Can insert, update, delete

### Example: Admin Insert

```javascript
// This requires authenticated admin user
const { error } = await supabase
  .from('town_images')
  .insert({
    town_id: 123,
    image_url: 'https://example.com/image.jpg',
    display_order: 1
  });

// Will fail if:
// - User not authenticated
// - User not admin/super_admin role
```

---

## 🎨 Frontend Usage Examples

### TownCard Component

```jsx
function TownCard({ town }) {
  // Option 1: Use cache field (simple)
  return (
    <div>
      <img src={town.image_url_1} alt={town.name} />
    </div>
  );

  // Option 2: Use town_images (if loaded)
  return (
    <div>
      {town.town_images?.[0] && (
        <img
          src={town.town_images[0].image_url}
          alt={`${town.name} by ${town.town_images[0].photographer}`}
        />
      )}
    </div>
  );
}
```

### Image Gallery Component

```jsx
function TownGallery({ townId }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from('town_images')
        .select('*')
        .eq('town_id', townId)
        .order('display_order');

      setImages(data || []);
    }
    loadImages();
  }, [townId]);

  return (
    <div className="gallery">
      {images.map(img => (
        <div key={img.id} className="gallery-item">
          <img src={img.image_url} alt={`Photo ${img.display_order}`} />
          {img.photographer && (
            <p className="caption">Photo by {img.photographer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Admin Photo Upload

```jsx
function AdminPhotoUpload({ townId }) {
  async function handleUpload(file) {
    // 1. Upload to storage
    const { data: uploadData } = await supabase.storage
      .from('town-images')
      .upload(`${townId}/${file.name}`, file);

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('town-images')
      .getPublicUrl(uploadData.path);

    // 3. Add to town_images
    await supabase
      .from('town_images')
      .insert({
        town_id: townId,
        image_url: urlData.publicUrl,
        display_order: 1, // Make it primary
        source: 'Admin Upload',
        validated_at: new Date().toISOString()
      });

    // towns.image_url_1 auto-updates via trigger!
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleUpload(e.target.files[0])}
    />
  );
}
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: Forgetting to Order By display_order

```javascript
// ❌ WRONG: Images in random order
const { data } = await supabase
  .from('town_images')
  .select('*')
  .eq('town_id', townId);

// ✅ CORRECT: Images in proper order
const { data } = await supabase
  .from('town_images')
  .select('*')
  .eq('town_id', townId)
  .order('display_order'); // <-- Important!
```

### Pitfall 2: Manually Updating image_url_1

```javascript
// ❌ WRONG: Don't update cache field manually
await supabase
  .from('towns')
  .update({ image_url_1: newUrl })
  .eq('id', townId);

// ✅ CORRECT: Update town_images, cache syncs automatically
await supabase
  .from('town_images')
  .update({ image_url: newUrl })
  .eq('town_id', townId)
  .eq('display_order', 1);
```

### Pitfall 3: Duplicate display_order

```javascript
// ❌ WRONG: Will fail due to unique constraint
await supabase
  .from('town_images')
  .insert([
    { town_id: 123, image_url: 'url1.jpg', display_order: 1 },
    { town_id: 123, image_url: 'url2.jpg', display_order: 1 } // Duplicate!
  ]);

// ✅ CORRECT: Each image gets unique display_order
await supabase
  .from('town_images')
  .insert([
    { town_id: 123, image_url: 'url1.jpg', display_order: 1 },
    { town_id: 123, image_url: 'url2.jpg', display_order: 2 }
  ]);
```

---

## 🔍 Debugging

### Check Cache Sync Issues

```sql
-- Find towns where cache doesn't match source
SELECT
  t.id,
  t.town_name,
  t.image_url_1 as cache,
  ti.image_url as source
FROM towns t
LEFT JOIN town_images ti ON t.id = ti.town_id AND ti.display_order = 1
WHERE t.image_url_1 IS DISTINCT FROM ti.image_url;
```

### Check for Missing Images

```sql
-- Towns with image_url_1 but no town_images
SELECT
  t.id,
  t.town_name,
  t.image_url_1
FROM towns t
WHERE t.image_url_1 IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM town_images ti
  WHERE ti.town_id = t.id AND ti.display_order = 1
);
```

### Verify Trigger is Active

```sql
-- Check trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'town_images';
```

**Expected**: `sync_town_cache_image` trigger on INSERT, UPDATE, DELETE

---

## 📚 Related Documentation

- **Migration SQL**: `supabase/migrations/20251109000000_create_town_images_table.sql`
- **Rollback SQL**: `supabase/migrations/20251109000001_rollback_town_images.sql`
- **Verification Guide**: `docs/database/PHOTO_MIGRATION_VERIFICATION.md`
- **Pre-Flight Checklist**: `docs/database/PHOTO_MIGRATION_PREFLIGHT.md`
- **Verification Script**: `database-utilities/verify-photo-migration.js`

---

## 🆘 Need Help?

1. **Cache not syncing?** → Check if trigger exists (see Debugging section)
2. **Can't insert image?** → Check RLS policies and user role
3. **Constraint violation?** → Check for duplicate display_order
4. **Migration failed?** → Run rollback, check logs, retry

**Last Updated**: 2025-11-09
