# Expected Image Files for Scout2Retire

Based on the towns in your database, here are all the image files you should have uploaded to the `town-images` bucket:

## Image Naming Convention
Pattern: `{country-code}-{town-name}.jpg`

## Complete List by Country

### Portugal (pt)
- [ ] pt-porto.jpg
- [ ] pt-lisbon.jpg
- [ ] pt-tavira.jpg

### Spain (es)
- [ ] es-valencia.jpg
- [ ] es-alicante.jpg

### France (fr)
- [ ] fr-bordeaux.jpg
- [ ] fr-saint-tropez.jpg
- [ ] fr-paris.jpg

### Italy (it)
- [ ] it-rome.jpg

### Greece (gr)
- [ ] gr-athens.jpg (if exists)
- [ ] gr-santorini.jpg (if exists)

### Croatia (hr)
- [ ] hr-split.jpg

### Slovenia (si)
- [ ] si-ljubljana.jpg

### Netherlands (nl)
- [ ] nl-lemmer.jpg

### Latvia (lv)
- [ ] lv-riga.jpg

### Malta (mt)
- [ ] mt-valletta.jpg (if exists)

### Mexico (mx)
- [ ] mx-san-miguel-de-allende.jpg
- [ ] mx-lake-chapala.jpg
- [ ] mx-merida.jpg

### Panama (pa)
- [ ] pa-boquete.jpg

### Colombia (co)
- [ ] co-medellin.jpg

### Ecuador (ec)
- [ ] ec-cuenca.jpg

### United States (us)
**Note: US files use pattern: `us-{state-code}-{city-name}-{unique-id}.jpg`**
- [ ] us-fl-gainesville-UNIQUEID.jpg
- [ ] us-fl-tallahassee-UNIQUEID.jpg (if exists)

### Thailand (th)
- [ ] th-chiang-mai.jpg

### Vietnam (vn)
- [ ] vn-da-nang.jpg

### Malaysia (my)
- [ ] my-george-town.jpg

## Next Steps

1. **Upload Images to Supabase**
   - Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/storage/buckets/town-images
   - Upload all images from this list
   - Make sure the bucket is set to public

2. **Run the SQL Update Script**
   - Go to SQL Editor in Supabase
   - Copy and run the contents of `UPDATE_ALL_TOWNS_WITH_STORAGE_IMAGES.sql`

3. **Verify in Your App**
   - Clear browser cache (important!)
   - Check that all town images are displaying correctly
   - Images should load from Supabase storage, not Unsplash

## Troubleshooting

If an image doesn't show:
1. Check the filename matches exactly (case-sensitive)
2. Verify the image was uploaded to the bucket
3. Check browser console for 404 errors
4. Clear cache and reload

## Special Cases

For cities with special characters or commas:
- `Gainesville, FL` → `us-fl-gainesville-{uniqueid}.jpg` (US uses state codes)
- `San Miguel de Allende` → `mx-san-miguel-de-allende.jpg`
- `Saint-Tropez` → `fr-saint-tropez.jpg`