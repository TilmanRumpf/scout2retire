#!/bin/bash

echo "Fixing town.name references to town.town_name..."

# List of files and their specific fixes
declare -A fixes

# TownDiscovery.jsx
fixes["src/pages/TownDiscovery.jsx:449"]="alt={selectedTownData.town_name}"
fixes["src/pages/TownDiscovery.jsx:462"]="await handleToggleFavorite(selectedTownData.id, selectedTownData.town_name, selectedTownData.country);"
fixes["src/pages/TownDiscovery.jsx:477"]="return \`\${best.town_name} Match: \${Math.round(best.score)}%\`;"
fixes["src/pages/TownDiscovery.jsx:486"]="{selectedTownData.town_name}, {selectedTownData.country}"
fixes["src/pages/TownDiscovery.jsx:914"]="return \`\${best.town_name} Match: \${Math.round(best.score)}%\`;"

# OnboardingComplete.jsx
fixes["src/pages/onboarding/OnboardingComplete.jsx:283"]="alt={currentMatch.town_name}"
fixes["src/pages/onboarding/OnboardingComplete.jsx:322"]="{currentMatch.town_name}, {currentMatch.country}"

# Chat.jsx
fixes["src/pages/Chat.jsx:413"]="return a.towns.town_name.localeCompare(b.towns.town_name);"
fixes["src/pages/Chat.jsx:483"]="topic: towns[0].town_name,"

# Daily.jsx
fixes["src/pages/Daily.jsx:107"]=".bindPopup(\`<div style=\"padding: 8px; font-size: 14px;\"><strong>\${markerData.town_name}</strong></div>\`);"

# DailyTownCard.jsx
fixes["src/components/DailyTownCard.jsx:195"]="return \`\${highest.town_name} Match: \${Math.round(highest.score)}%\`;"
fixes["src/components/DailyTownCard.jsx:197"]="return \`Strong \${highest.town_name.toLowerCase()} match\`;"
fixes["src/components/DailyTownCard.jsx:199"]="return \`Good \${highest.town_name.toLowerCase()} fit\`;"
fixes["src/components/DailyTownCard.jsx:201"]="return \`\${highest.town_name}: \${Math.round(highest.score)}%\`;"

# TownComparison.jsx
fixes["src/pages/TownComparison.jsx:339"]="const nameA = (a.towns?.town_name || a.town_name || '').toLowerCase();"
fixes["src/pages/TownComparison.jsx:340"]="const nameB = (b.towns?.town_name || b.town_name || '').toLowerCase();"

# TownRadarChart.jsx
fixes["src/components/TownRadarChart.jsx:62"]="console.log(\`Spider Chart INSTANT for \${townData.town_name}:\`, {"
fixes["src/components/TownRadarChart.jsx:73"]="console.log(\`Spider Chart BREATHING for \${townData.town_name} - waiting for data\`);"
fixes["src/components/TownRadarChart.jsx:205"]="name={townData.town_name}"

# MessageInput.jsx
fixes["src/components/chat/MessageInput.jsx:19"]="return \`Message \${activeTown.town_name} chat...\`;"

# LoungesTab.jsx
fixes["src/components/chat/LoungesTab.jsx:304"]=".sort((a, b) => a.town_name.localeCompare(b.town_name))"

echo "Applying fixes..."

for file in "${!fixes[@]}"; do
    filepath="${file%:*}"
    echo "Fixing $filepath..."
done

echo "Done! Now need to manually apply these fixes."