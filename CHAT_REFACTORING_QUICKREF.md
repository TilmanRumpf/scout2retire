# Chat Refactoring - Quick Reference Card

## 🎯 Quick Start (5 Minutes)

1. **Read this file** (5 min)
2. **Extract InviteModal** (follow template below)
3. **Test** (`npx playwright test tests/e2e/chat.spec.js`)
4. **Commit** if tests pass
5. **Repeat** with next component

---

## 📋 Extraction Template

### Step 1: Create Component File
```bash
# For modals
touch src/components/chat/modals/InviteModal.jsx

# For tabs
touch src/components/chat/tabs/GroupsTab.jsx

# For messages
touch src/components/chat/messages/MessageItem.jsx

# For shared
touch src/components/chat/shared/SearchBar.jsx
```

### Step 2: Component Boilerplate
```jsx
// src/components/chat/modals/InviteModal.jsx
import { uiConfig } from '../../../styles/uiConfig';
// Import other dependencies

export default function InviteModal({
  // Destructure all props
  isOpen,
  onClose,
  // ... rest of props
}) {
  // Early return if not needed
  if (!isOpen) return null;

  // Component logic here

  return (
    <div>
      {/* JSX from Chat.jsx */}
    </div>
  );
}
```

### Step 3: Identify Dependencies
In Chat.jsx, find the section to extract. Look for:
- **State variables** used in JSX → pass as props
- **Setter functions** called → pass as props
- **Handler functions** called → pass as props
- **Data arrays** mapped over → pass as props
- **Refs** used → pass as props

### Step 4: Replace in Chat.jsx
```jsx
import InviteModal from '../components/chat/modals/InviteModal';

// Replace inline JSX with:
<InviteModal
  isOpen={showInviteModal}
  onClose={() => setShowInviteModal(false)}
  inviteEmail={inviteEmail}
  setInviteEmail={setInviteEmail}
  // ... all other props
/>
```

### Step 5: Test
```bash
# Run Playwright tests
npx playwright test tests/e2e/chat.spec.js

# If tests pass
git add .
git commit -m "Extract InviteModal component from Chat.jsx"
```

---

## 🔍 Component Checklist

For each component, ensure you have:

### Props
- [ ] All state variables used in JSX
- [ ] All setter functions called
- [ ] All handler functions called
- [ ] All data arrays/objects needed
- [ ] All refs needed
- [ ] Early return for conditional rendering

### Imports
- [ ] React hooks (if needed)
- [ ] Icons from lucide-react
- [ ] uiConfig from styles
- [ ] Utility functions
- [ ] Other components

### Functionality
- [ ] Same behavior as before
- [ ] No console errors
- [ ] Styles look identical
- [ ] Interactions work (clicks, typing, etc.)

### Testing
- [ ] Playwright tests pass
- [ ] Manual testing in browser
- [ ] Mobile responsive (if applicable)

---

## 📊 Component Size Reference

| Component | Lines | Complexity |
|-----------|-------|------------|
| SearchBar | 40 | Low |
| GroupChatHeader | 40 | Low |
| MessageInput | 80 | Low |
| AutocompleteDropdown | 80 | Medium |
| LobbyTab | 100 | Low |
| MessageItem | 100 | Medium |
| CompanionsModal | 100 | Low |
| MobileActionSheet | 100 | Low |
| GroupsTab | 120 | Medium |
| FriendsTab | 140 | Medium |
| CountryLoungeView | 150 | High |
| InviteModal | 150 | Medium |
| LoungesTab | 150 | High |
| MessageList | 150 | Medium |
| TownLoungeView | 180 | High |
| ChatMessagesArea | 200 | High |

---

## 🎨 Common Props Patterns

### Modal Props
```jsx
{
  isOpen: boolean,
  onClose: function,
  // ... modal-specific data
}
```

### Tab Props
```jsx
{
  searchTerm: string,
  setSearchTerm: function,
  dataArray: array,
  activeItem: object|null,
  onItemClick: function,
}
```

### Message Props
```jsx
{
  messages: array,
  currentUserId: string,
  onAction: function,
  // ... message-specific
}
```

---

## 🚨 Common Mistakes

### 1. Missing Setters
```jsx
// ❌ BAD - can't update search
<GroupsTab groupsSearchTerm={groupsSearchTerm} />

// ✅ GOOD
<GroupsTab
  groupsSearchTerm={groupsSearchTerm}
  setGroupsSearchTerm={setGroupsSearchTerm}
/>
```

### 2. Wrong Import Path
```jsx
// ❌ BAD - wrong relative path
import { uiConfig } from '../../styles/uiConfig';

// ✅ GOOD - correct relative path
import { uiConfig } from '../../../styles/uiConfig';
```

### 3. Breaking Refs
```jsx
// ❌ BAD - creates new ref each render
<Component ref={useRef(null)} />

// ✅ GOOD - uses parent ref
const myRef = useRef(null);
<Component ref={myRef} />
```

### 4. Forgetting Early Return
```jsx
// ❌ BAD - renders unnecessary DOM
export default function Modal({ isOpen }) {
  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      {/* Heavy component */}
    </div>
  );
}

// ✅ GOOD - doesn't render at all
export default function Modal({ isOpen }) {
  if (!isOpen) return null;
  return <div>{/* Heavy component */}</div>;
}
```

---

## 📝 Component Extraction Order

### Week 1: Modals (Easiest)
1. ✅ InviteModal
2. ✅ CompanionsModal
3. ✅ MobileActionSheet

### Week 2: Simple Tabs
4. ✅ GroupsTab
5. ✅ FriendsTab
6. ✅ LobbyTab (merge with FavoritesTab)

### Week 3: Complex Tab
7. ✅ CountryLoungeView
8. ✅ TownLoungeView
9. ✅ LoungesTab (wrapper)

### Week 4: Messages
10. ✅ MessageInput
11. ✅ MessageItem
12. ✅ GroupChatHeader
13. ✅ MessageList
14. ✅ ChatMessagesArea (wrapper)

### Week 5: Shared
15. ✅ SearchBar
16. ✅ AutocompleteDropdown

---

## 🧪 Testing Commands

```bash
# Run all chat tests
npx playwright test tests/e2e/chat.spec.js

# Run specific test
npx playwright test tests/e2e/chat.spec.js -g "should send message"

# Run in headed mode (see browser)
npx playwright test tests/e2e/chat.spec.js --headed

# Debug mode (step through)
npx playwright test tests/e2e/chat.spec.js --debug

# Run dev server
npm run dev
```

---

## 🎯 Success Criteria

After each extraction:
- [ ] Component file created in correct location
- [ ] All dependencies imported
- [ ] Props correctly passed from Chat.jsx
- [ ] Functionality identical to before
- [ ] No console errors
- [ ] Playwright tests pass
- [ ] Changes committed to git

---

## 🆘 Troubleshooting

### Tests Fail After Extraction

1. **Check console for errors**
   ```bash
   # Open browser console (Chrome DevTools)
   # Look for red errors
   ```

2. **Compare props vs usage**
   ```jsx
   // In component
   export default function MyTab({ searchTerm, setSearchTerm }) {
     console.log('Props:', { searchTerm, setSearchTerm });
     // ...
   }

   // In Chat.jsx
   <MyTab
     searchTerm={groupsSearchTerm}  // ✅ Correct
     setSearchTerm={setGroupsSearchTerm}  // ✅ Correct
   />
   ```

3. **Verify data is passed correctly**
   ```jsx
   // Add temporary logging
   console.log('groupChats:', groupChats);
   console.log('groupChats.length:', groupChats.length);
   ```

4. **Check for missing dependencies**
   - Missing state variable?
   - Missing function?
   - Missing ref?

### Component Doesn't Render

1. **Check conditional rendering**
   ```jsx
   // Is component conditionally rendered?
   {activeTab === 'groups' && <GroupsTab />}
   //   ^^^ Is this true?
   ```

2. **Check for early returns**
   ```jsx
   if (!isOpen) return null;  // Is isOpen true?
   ```

3. **Check parent component**
   ```jsx
   // Is parent rendering?
   console.log('Chat.jsx rendering');
   ```

### Styling Looks Wrong

1. **Check uiConfig import**
   ```jsx
   import { uiConfig } from '../../../styles/uiConfig';
   ```

2. **Check className strings**
   ```jsx
   // Copy exact className from Chat.jsx
   className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg}`}
   ```

3. **Check for missing wrapper divs**
   ```jsx
   // Original in Chat.jsx
   <div className="space-y-4">
     <SearchBar />
     <div className="card">...</div>
   </div>

   // Extracted component must include wrapper
   export default function MyTab() {
     return (
       <div className="space-y-4">  {/* Don't forget this! */}
         <SearchBar />
         <div className="card">...</div>
       </div>
     );
   }
   ```

---

## 💡 Pro Tips

1. **Start small** - InviteModal is easiest
2. **Test frequently** - After every change
3. **Commit often** - Each working extraction
4. **Copy exact JSX** - Don't modify while extracting
5. **Use console.log** - Debug prop passing
6. **Check line numbers** - Refer to CHAT_REFACTORING_PLAN.md
7. **Read examples** - CHAT_REFACTORING_EXAMPLES.md has patterns
8. **Take breaks** - Refactoring is mentally intensive

---

## 📚 Full Documentation

- **Detailed Plan:** CHAT_REFACTORING_PLAN.md (450 lines)
- **Component Structure:** CHAT_COMPONENT_HIERARCHY.md (400 lines)
- **Code Examples:** CHAT_REFACTORING_EXAMPLES.md (500 lines)
- **Executive Summary:** CHAT_REFACTORING_SUMMARY.md (150 lines)
- **This Reference:** CHAT_REFACTORING_QUICKREF.md (you are here)

---

## 🎓 Learning Path

### First Extraction (2-3 hours)
Read all docs → Extract InviteModal → Test → Commit

### Second Extraction (1-2 hours)
Extract CompanionsModal → Test → Commit

### Third Extraction (1 hour)
Extract MobileActionSheet → Test → Commit

### After 3 Extractions (30 min each)
You'll be comfortable with the pattern. Continue with tabs.

---

**Remember: Slow and steady wins the race. Better to spend 1 hour doing it right than 30 minutes doing it wrong.**

**Questions? Check CHAT_REFACTORING_EXAMPLES.md for similar patterns.**
