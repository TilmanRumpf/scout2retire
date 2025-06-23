# Scout2Retire Image Storage Guidelines

## Overview
This guide provides best practices for naming, formatting, and organizing images in Supabase storage buckets for the Scout2Retire application.

## Bucket Structure

### 1. Town Images Bucket (`town-images`)
For specific town/city photographs

### 2. Region Images Bucket (`region-images`)  
For regional inspiration images used in daily content

## Naming Conventions

### Town Images
Use lowercase, hyphenated names combining country and town:

```
Pattern: {country-code}-{town-name}.{extension}
US Pattern: {country-code}-{state-code}-{town-name}-{unique-id}.{extension}

Examples:
- pt-porto.jpg
- pt-lisbon.jpg
- es-valencia.jpg
- th-chiang-mai.jpg
- mx-san-miguel-de-allende.jpg
- us-fl-gainesville-a1b2c3d4.jpg (US with Florida state code and unique ID)
- us-tx-austin-x9y8z7w6.jpg (US with Texas state code and unique ID)
```

**Country Codes:**
```
Portugal: pt
Spain: es
France: fr
Italy: it
Greece: gr
Croatia: hr
Slovenia: si
Netherlands: nl
Latvia: lv
Malta: mt
Mexico: mx
Panama: pa
Colombia: co
Ecuador: ec
United States: us
Thailand: th
Vietnam: vn
Malaysia: my
```

### Region Images
Use descriptive names for regional/thematic images:

```
Pattern: {country-code}-{descriptor}-{number}.{extension}
Examples:
- pt-douro-valley-01.jpg
- es-mediterranean-coast-01.jpg
- th-temple-golden-01.jpg
- mx-colonial-architecture-01.jpg
```

## Image Specifications

### Dimensions
- **Primary Display Size**: 800x600px (4:3 ratio)
- **Maximum Width**: 1200px
- **Maximum Height**: 900px
- **Minimum Width**: 800px
- **Minimum Height**: 600px

### File Format
- **Format**: JPEG (.jpg)
- **Quality**: 80-85% (optimal balance of quality and file size)
- **Color Mode**: RGB
- **Color Profile**: sRGB

### File Size
- **Target Size**: 100-200KB per image
- **Maximum Size**: 300KB
- **Use compression tools if needed**

### Image Requirements
- **Resolution**: 72-96 DPI (web optimized)
- **Orientation**: Landscape preferred
- **Aspect Ratio**: 4:3 or 16:9

## Content Guidelines

### Town Images Should Show:
- Iconic architecture or landmarks
- Typical street scenes
- Local atmosphere
- Natural beauty if relevant
- **Avoid**: People as main subjects, cars/traffic, construction, temporary events

### Region Images Should Show:
- Regional characteristics
- Cultural elements
- Natural landscapes
- Lifestyle representations
- **Avoid**: Generic stock photos, heavily edited images

## Folder Structure in Buckets

### Option 1: Flat Structure (Recommended for smaller sets)
```
town-images/
├── pt-porto.jpg
├── pt-lisbon.jpg
├── es-valencia.jpg
└── th-chiang-mai.jpg

region-images/
├── pt-douro-valley-01.jpg
├── pt-coastal-town-01.jpg
└── es-mediterranean-coast-01.jpg
```

### Option 2: Country Folders (Better for large sets)
```
town-images/
├── portugal/
│   ├── porto.jpg
│   └── lisbon.jpg
├── spain/
│   └── valencia.jpg
└── thailand/
    └── chiang-mai.jpg
```

## Image Processing Workflow

### 1. Source Images
- Use high-quality sources (Unsplash, Pexels, or original photography)
- Ensure proper licensing
- Download highest quality available

### 2. Edit Images
```bash
# Using ImageMagick (recommended)
# Resize to exact dimensions with smart cropping
magick input.jpg -resize 800x600^ -gravity center -extent 800x600 -quality 85 output.jpg

# Batch process all images in a folder
for img in *.jpg; do
    magick "$img" -resize 800x600^ -gravity center -extent 800x600 -quality 85 "processed/${img}"
done
```

### 3. Optimize Images
```bash
# Using jpegoptim
jpegoptim -m85 --strip-all *.jpg

# Or using imagemin
imagemin *.jpg --out-dir=optimized
```

### 4. Rename Files
```bash
# Example renaming script
mv "Porto Portugal.jpg" "pt-porto.jpg"
mv "Chiang Mai Temple.jpg" "th-chiang-mai.jpg"
```

## Upload Process

### 1. Prepare Upload List
Create a CSV file mapping towns to images:
```csv
town_id,town_name,country,image_filename
d2085a2d-03db-4248-8aa8-5f73fab0ecc6,Porto,Portugal,pt-porto.jpg
286843dc-1919-4bf3-bbf6-79b751b20e8a,Lisbon,Portugal,pt-lisbon.jpg
```

### 2. Upload to Supabase
- Use Supabase Dashboard for manual upload
- Or use Supabase CLI/API for batch upload

### 3. Set Bucket Permissions
Ensure buckets are public for read access:
```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name IN ('town-images', 'region-images');
```

## URL Structure

After upload, images will be accessible at:
```
https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/pt-porto.jpg
https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/region-images/pt-douro-valley-01.jpg
```

## SQL Update Script

Once images are uploaded, update the database:
```sql
-- Update all towns with new storage URLs
UPDATE towns
SET image_url_1 = CONCAT(
  'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/',
  LOWER(
    CONCAT(
      CASE country
        WHEN 'Portugal' THEN 'pt'
        WHEN 'Spain' THEN 'es'
        WHEN 'France' THEN 'fr'
        WHEN 'Italy' THEN 'it'
        WHEN 'Greece' THEN 'gr'
        WHEN 'Croatia' THEN 'hr'
        WHEN 'Slovenia' THEN 'si'
        WHEN 'Netherlands' THEN 'nl'
        WHEN 'Latvia' THEN 'lv'
        WHEN 'Malta' THEN 'mt'
        WHEN 'Mexico' THEN 'mx'
        WHEN 'Panama' THEN 'pa'
        WHEN 'Colombia' THEN 'co'
        WHEN 'Ecuador' THEN 'ec'
        WHEN 'United States' THEN 'us'
        WHEN 'Thailand' THEN 'th'
        WHEN 'Vietnam' THEN 'vn'
        WHEN 'Malaysia' THEN 'my'
      END,
      '-',
      LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), ',', ''), '.', ''))
    )
  ),
  '.jpg'
);
```

## Quality Checklist

Before uploading, ensure each image:
- [ ] Shows appropriate content for the location
- [ ] Is 800x600px (or within specified range)
- [ ] Is under 300KB file size
- [ ] Has correct filename format
- [ ] Is in JPEG format
- [ ] Has been optimized for web
- [ ] Looks good at display size
- [ ] Has proper color/contrast
- [ ] Is free of watermarks
- [ ] Has appropriate usage rights

## Tools Recommendations

### Image Editing
- **Adobe Photoshop** - Professional editing
- **GIMP** - Free alternative
- **Canva** - Quick edits and batch processing
- **Squoosh** - Google's web-based optimizer

### Batch Processing
- **ImageMagick** - Command line tool
- **XnConvert** - GUI batch processor
- **FastStone** - Windows batch processor

### Optimization
- **jpegoptim** - JPEG optimization
- **TinyPNG** - Online optimizer
- **ImageOptim** - Mac optimizer

## Example Complete Workflow

```bash
# 1. Create working directories
mkdir -p images/original images/processed images/optimized

# 2. Download and save original images to images/original/

# 3. Batch resize and crop
cd images/original
for img in *.jpg; do
    magick "$img" -resize 800x600^ -gravity center -extent 800x600 -quality 85 "../processed/${img}"
done

# 4. Rename files according to convention
cd ../processed
mv "Porto.jpg" "pt-porto.jpg"
mv "Lisbon.jpg" "pt-lisbon.jpg"
# ... etc

# 5. Optimize file sizes
jpegoptim -m85 --strip-all *.jpg

# 6. Move to final directory
mv *.jpg ../optimized/

# 7. Upload to Supabase storage
```

## Maintenance

- Review images quarterly for quality
- Update any images that receive complaints
- Monitor storage usage and costs
- Keep a backup of all original images
- Document any special cases or exceptions