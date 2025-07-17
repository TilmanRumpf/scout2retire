#!/bin/bash
# Scout2Retire Pre-Commit Verification Script
# Run this before every commit to catch issues early

set -e  # Exit on error

echo "🔍 Scout2Retire Pre-Commit Checks"
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Function to run a check
run_check() {
    local name=$1
    local command=$2
    
    echo -n "Running $name... "
    
    if eval $command > /tmp/check_output.txt 2>&1; then
        echo -e "${GREEN}✓ Passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        echo -e "${YELLOW}Output:${NC}"
        cat /tmp/check_output.txt
        echo ""
        ((ERRORS++))
        return 1
    fi
}

# Function to run a warning check (doesn't block commit)
run_warning_check() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    
    if eval $command > /tmp/check_output.txt 2>&1; then
        echo -e "${GREEN}✓ Good${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Warning${NC}"
        cat /tmp/check_output.txt
        echo ""
        ((WARNINGS++))
        return 1
    fi
}

# 1. Check for syntax errors
echo "1. Syntax Validation"
echo "-------------------"
run_check "JavaScript/JSX syntax" "npx eslint . --ext .js,.jsx --no-eslintrc --parser-options=ecmaVersion:latest,sourceType:module,ecmaFeatures:{jsx:true}"

# 2. Run ESLint
echo ""
echo "2. Code Quality (ESLint)"
echo "------------------------"
run_check "ESLint rules" "npm run lint"

# 3. Check for style violations
echo ""
echo "3. Style Consistency"
echo "--------------------"
run_check "Style compliance" "node scripts/verify-styles.js"

# 4. Check navigation presence
echo ""
echo "4. Navigation Structure"
echo "-----------------------"
run_check "Navigation verification" "node scripts/verify-navigation.js"

# 5. Check for common mistakes
echo ""
echo "5. Common Mistakes"
echo "------------------"

# Check for console.log statements
echo -n "Checking for console.log... "
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.js" --include="*.jsx" --exclude-dir=node_modules || true)
if [ -z "$CONSOLE_LOGS" ]; then
    echo -e "${GREEN}✓ Clean${NC}"
else
    echo -e "${YELLOW}⚠ Found console.log statements${NC}"
    echo "$CONSOLE_LOGS" | head -5
    ((WARNINGS++))
fi

# Check for TODO/FIXME comments
echo -n "Checking for TODO/FIXME... "
TODOS=$(grep -r "TODO\|FIXME" src/ --include="*.js" --include="*.jsx" --exclude-dir=node_modules || true)
if [ -z "$TODOS" ]; then
    echo -e "${GREEN}✓ None found${NC}"
else
    echo -e "${YELLOW}⚠ Found TODO/FIXME comments${NC}"
    echo "$TODOS" | head -5
    ((WARNINGS++))
fi

# 6. Build verification
echo ""
echo "6. Build Verification"
echo "--------------------"
run_check "Production build" "npm run build"

# 7. Check file sizes
echo ""
echo "7. Bundle Size Check"
echo "--------------------"
if [ -d "dist" ]; then
    echo "Bundle sizes:"
    find dist -name "*.js" -o -name "*.css" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename "$file"): $size"
    done
else
    echo -e "${YELLOW}⚠ No dist folder found${NC}"
fi

# 8. Git checks
echo ""
echo "8. Git Status"
echo "-------------"
echo "Modified files:"
git status --porcelain | grep -E "^(M|A|D)" | head -10 || echo "  No changes staged"

# Summary
echo ""
echo "=================================="
echo "Summary"
echo "=================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to commit.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found.${NC}"
    echo ""
    echo "You can proceed with the commit, but consider addressing the warnings."
    echo -n "Continue with commit? (y/N): "
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        exit 0
    else
        exit 1
    fi
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please fix before committing.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}   Also found $WARNINGS warning(s).${NC}"
    fi
    exit 1
fi