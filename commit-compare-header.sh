#!/bin/bash

# Change to the project directory
cd /Users/tilmanrumpf/Desktop/scout2retire

# Show current status
echo "Current git status:"
git status

# Add the modified file
echo "Adding TownComparison.jsx..."
git add src/pages/TownComparison.jsx

# Create commit
echo "Creating commit..."
git commit -m "Update Compare Towns header to match onboarding design

- Replace AppHeader with onboarding-style 2-row header (68px total)
- Add icons to all category tabs (Eye, Globe, CloudSun, etc.)
- Fix labels: 'Administration' → 'Admin', 'Budget' → 'Costs'
- Implement QuickNav overlay for navigation menu
- Ensure visual consistency with onboarding flow

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Done! Changes have been pushed to GitHub."