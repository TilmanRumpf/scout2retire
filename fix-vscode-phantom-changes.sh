#!/bin/bash

echo "🔧 Fixing VS Code phantom git changes..."

# 1. Remove any git index lock files
rm -f .git/index.lock 2>/dev/null

# 2. Clean up duplicate index files
rm -f .git/index\ * 2>/dev/null

# 3. Refresh git index
git update-index --refresh

# 4. Reset any assumed unchanged files
git update-index --no-assume-unchanged $(git ls-files) 2>/dev/null

# 5. Clear VS Code's git cache (requires VS Code restart)
echo "✅ Git index cleaned"
echo "⚠️  IMPORTANT: Now do one of these:"
echo "   1. Press Cmd+Shift+P → 'Developer: Reload Window' in VS Code"
echo "   2. Or close and reopen VS Code"
echo ""
echo "This will clear VS Code's git extension cache."