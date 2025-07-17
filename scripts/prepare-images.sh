#!/bin/bash

# Scout2Retire Image Preparation Script
# This script helps prepare images for upload to Supabase storage

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TARGET_WIDTH=800
TARGET_HEIGHT=600
QUALITY=85
MAX_SIZE_KB=300

# Create directory structure
echo -e "${GREEN}Creating directory structure...${NC}"
mkdir -p images/{original,processed,optimized,ready}

# Function to process a single image
process_image() {
    local input_file=$1
    local output_name=$2
    
    echo -e "${YELLOW}Processing: $input_file -> $output_name${NC}"
    
    # Resize and crop to exact dimensions
    magick "$input_file" \
        -resize "${TARGET_WIDTH}x${TARGET_HEIGHT}^" \
        -gravity center \
        -extent "${TARGET_WIDTH}x${TARGET_HEIGHT}" \
        -quality "$QUALITY" \
        "images/processed/$output_name"
    
    # Optimize the image
    jpegoptim -m"$QUALITY" --strip-all "images/processed/$output_name"
    
    # Check file size
    size=$(du -k "images/processed/$output_name" | cut -f1)
    if [ "$size" -gt "$MAX_SIZE_KB" ]; then
        echo -e "${RED}Warning: $output_name is ${size}KB (max: ${MAX_SIZE_KB}KB)${NC}"
        # Try additional compression
        jpegoptim -m70 "images/processed/$output_name"
    fi
    
    # Move to ready folder
    mv "images/processed/$output_name" "images/ready/$output_name"
    echo -e "${GREEN}✓ Completed: $output_name${NC}"
}

# Function to generate filename from country and city
generate_filename() {
    local country=$1
    local city=$2
    local country_code=""
    
    # Map country to code
    case "$country" in
        "Portugal") country_code="pt" ;;
        "Spain") country_code="es" ;;
        "France") country_code="fr" ;;
        "Italy") country_code="it" ;;
        "Greece") country_code="gr" ;;
        "Croatia") country_code="hr" ;;
        "Slovenia") country_code="si" ;;
        "Netherlands") country_code="nl" ;;
        "Latvia") country_code="lv" ;;
        "Malta") country_code="mt" ;;
        "Mexico") country_code="mx" ;;
        "Panama") country_code="pa" ;;
        "Colombia") country_code="co" ;;
        "Ecuador") country_code="ec" ;;
        "United States") country_code="us" ;;
        "Thailand") country_code="th" ;;
        "Vietnam") country_code="vn" ;;
        "Malaysia") country_code="my" ;;
        *) country_code="xx" ;;
    esac
    
    # Clean city name
    local clean_city=$(echo "$city" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
    
    echo "${country_code}-${clean_city}.jpg"
}

# Main processing
echo -e "${GREEN}Scout2Retire Image Preparation Tool${NC}"
echo "======================================"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}Error: ImageMagick is not installed${NC}"
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Check if jpegoptim is installed
if ! command -v jpegoptim &> /dev/null; then
    echo -e "${RED}Error: jpegoptim is not installed${NC}"
    echo "Install with: brew install jpegoptim"
    exit 1
fi

# Example usage
echo ""
echo "Example commands:"
echo "----------------"
echo "# Process a single image:"
echo "./prepare-images.sh process 'Porto.jpg' 'pt-porto.jpg'"
echo ""
echo "# Batch process with mapping file:"
echo "./prepare-images.sh batch mapping.csv"
echo ""

# Handle command line arguments
case "$1" in
    "process")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}Usage: $0 process <input-file> <output-name>${NC}"
            exit 1
        fi
        process_image "$2" "$3"
        ;;
        
    "batch")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 batch <mapping-file.csv>${NC}"
            echo "CSV format: country,city,source_file"
            exit 1
        fi
        
        # Read CSV and process each line
        while IFS=',' read -r country city source_file; do
            # Skip header
            if [ "$country" = "country" ]; then
                continue
            fi
            
            # Generate output filename
            output_name=$(generate_filename "$country" "$city")
            
            # Process the image
            if [ -f "images/original/$source_file" ]; then
                process_image "images/original/$source_file" "$output_name"
            else
                echo -e "${RED}Error: File not found: images/original/$source_file${NC}"
            fi
        done < "$2"
        ;;
        
    "check")
        echo "Checking images in ready folder..."
        echo ""
        for img in images/ready/*.jpg; do
            if [ -f "$img" ]; then
                size=$(du -k "$img" | cut -f1)
                dims=$(identify -format "%wx%h" "$img")
                name=$(basename "$img")
                
                # Color code based on size
                if [ "$size" -gt "$MAX_SIZE_KB" ]; then
                    echo -e "${RED}✗ $name: ${dims} (${size}KB)${NC}"
                else
                    echo -e "${GREEN}✓ $name: ${dims} (${size}KB)${NC}"
                fi
            fi
        done
        ;;
        
    *)
        echo -e "${YELLOW}Usage:${NC}"
        echo "  $0 process <input-file> <output-name>  - Process single image"
        echo "  $0 batch <mapping.csv>                 - Batch process from CSV"
        echo "  $0 check                               - Check processed images"
        ;;
esac