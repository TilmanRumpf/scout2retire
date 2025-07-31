#!/bin/bash
# Quick backup script - run before any violent changes!

echo "🛡️ CREATING SAFE CHECKPOINT..."
echo "================================"

# 1. Database snapshot
echo "📸 Creating database snapshot..."
node create-database-snapshot.js

# 2. Git checkpoint
echo "📝 Creating git checkpoint..."
git add -A
git commit -m "🔒 CHECKPOINT: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# 3. Create tag
TAG="checkpoint-$(date +%Y%m%d-%H%M%S)"
git tag -a "$TAG" -m "Safe return point"
echo "🏷️  Tagged as: $TAG"

# 4. Verify
echo ""
echo "✅ CHECKPOINT COMPLETE!"
echo "========================"
echo "📁 Database snapshot: database-snapshots/latest/"
echo "🏷️  Git tag: $TAG"
echo ""
echo "🔄 TO RESTORE:"
echo "  Code: git checkout $TAG"
echo "  DB: node restore-database-snapshot.js $(ls -t database-snapshots | grep -v latest | head -1)"
echo ""
echo "🚀 You can now make violent changes safely!"