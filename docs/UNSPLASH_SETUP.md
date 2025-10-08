# 🔍 Unsplash Image Search Setup

The group logo feature includes web image search powered by Unsplash API.

## Quick Setup (Free)

### 1. Get Unsplash API Key

1. Go to https://unsplash.com/developers
2. Click **"Register as a developer"** or **"New Application"**
3. Accept the API Terms
4. Create a new app:
   - **Application name**: Scout2Retire
   - **Description**: Retirement planning platform with group chat feature
   - Select **"Demo"** (free tier - 50 requests/hour)
5. Copy your **Access Key**

### 2. Add to Environment Variables

Add to your `.env` file:

```bash
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Usage

Users can now:
1. Click **"Search Web"** when creating a group
2. Search for images (e.g., "hiking", "travel", "retirement")
3. Click any image to select it as the group logo
4. Or upload their own image as before

## Rate Limits

- **Demo (Free)**: 50 requests/hour
- **Production**: 5,000 requests/hour (requires approval)

For production, apply for Production access in your Unsplash Developer account.

## Optional Feature

If you don't add the API key, the feature will gracefully fail:
- "Image search not configured" toast message
- Upload still works normally
- No errors or crashes

## Free Alternatives

If you prefer not to use Unsplash:
1. **Pexels API**: https://www.pexels.com/api/
2. **Pixabay API**: https://pixabay.com/api/docs/
3. Disable search: Remove the "Search Web" button in GroupChatModal.jsx

---

**Cost**: 100% Free (Demo tier)
**Setup time**: ~3 minutes
**Benefits**: Better UX, more group logo options
