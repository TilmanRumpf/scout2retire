#!/bin/bash

# Script to update all geographic feature references to lowercase

echo "Updating geographic feature references to lowercase..."

# List of files to update
files=(
  "src/utils/enhancedMatchingAlgorithm.js"
  "fill-walkability.js"
  "fill-retirement-community.js"
  "fill-public-transport.js"
  "fill-lifestyle-ratings.js"
  "fill-humidity.js"
  "fill-expat-community.js"
  "fill-english-doctors.js"
  "fill-disaster-risk.js"
  "fill-airport-distance.js"
  "fill-air-quality.js"
)

# Update each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Replace capitalized versions with lowercase
    sed -i '' "s/'Coastal'/'coastal'/g" "$file"
    sed -i '' "s/'Mountain'/'mountain'/g" "$file"
    sed -i '' "s/'Mountains'/'mountain'/g" "$file"
    sed -i '' "s/'Island'/'island'/g" "$file"
    sed -i '' "s/'Lake'/'lake'/g" "$file"
    sed -i '' "s/'Lakes'/'lake'/g" "$file"
    sed -i '' "s/'River'/'river'/g" "$file"
    sed -i '' "s/'Valley'/'valley'/g" "$file"
    sed -i '' "s/'Desert'/'desert'/g" "$file"
    sed -i '' "s/'Forest'/'forest'/g" "$file"
    sed -i '' "s/'Plains'/'plains'/g" "$file"
    
    echo "  ✓ Updated"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "All geographic feature references have been updated to lowercase!"