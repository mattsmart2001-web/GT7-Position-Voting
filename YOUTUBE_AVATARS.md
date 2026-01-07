# YouTube Avatar Integration Guide

This guide explains how to get real YouTube profile pictures for voters.

## Current Implementation

The system currently uses two methods for avatars:

1. **YouTube Profile Pictures** (via Streamerbot) - Requires Streamerbot integration
2. **UI Avatars** (Fallback) - Generates colorful initials from usernames

## Method 1: Via Streamerbot (Recommended)

Streamerbot can pass YouTube profile pictures when processing chat messages.

### Setup

In your Streamerbot C# code (see STREAMERBOT_SETUP.md), the code already attempts to extract the profile image:

```csharp
string avatarUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(username)}&background=random";

// Try to use actual YouTube avatar if available
try
{
    var userPlatform = args["userType"].ToString();
    if (userPlatform == "youtube" && args.ContainsKey("profileImageUrl"))
    {
        avatarUrl = args["profileImageUrl"].ToString();
    }
}
catch { }
```

### Available YouTube User Data

Streamerbot provides these fields from YouTube:
- `user` - Username/Display name
- `userId` - YouTube channel ID
- `userType` - Platform (should be "youtube")
- `profileImageUrl` - Direct URL to profile picture
- `isSubscribed` - Subscriber status
- `isModerator` - Moderator status

## Method 2: YouTube Data API v3 (Advanced)

For more control or if not using Streamerbot, you can use the YouTube Data API directly.

### Setup

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "YouTube Data API v3"
   - Create credentials (API Key)

2. **Add API Key to Environment**:
   Create a `.env` file:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

3. **Install dotenv**:
   ```bash
   npm install dotenv
   ```

4. **Update server.js** (optional - for direct API integration):

   Add at the top:
   ```javascript
   require('dotenv').config();
   const axios = require('axios');
   ```

   Add function to fetch avatar:
   ```javascript
   async function getYouTubeAvatar(channelId) {
     try {
       const response = await axios.get(
         `https://www.googleapis.com/youtube/v3/channels`,
         {
           params: {
             part: 'snippet',
             id: channelId,
             key: process.env.YOUTUBE_API_KEY
           }
         }
       );

       if (response.data.items && response.data.items.length > 0) {
         return response.data.items[0].snippet.thumbnails.default.url;
       }
     } catch (error) {
       console.error('Error fetching YouTube avatar:', error);
     }
     return null;
   }
   ```

## Method 3: Google Account Avatars

If users are signed in with Google accounts, you can use their Google profile pictures:

```javascript
// Generate Google account avatar URL
function getGoogleAvatar(email) {
  return `https://www.google.com/s2/photos/profile/${email}`;
}

// Or use a hash-based approach
function getGravatarUrl(email, size = 80) {
  // This works with Google accounts too
  const hash = md5(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
```

## UI Avatars (Current Fallback)

The system uses [UI Avatars API](https://ui-avatars.com/) as a fallback:

```javascript
`https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
```

### UI Avatars Customization

You can customize the fallback avatars:

```javascript
const avatarUrl = `https://ui-avatars.com/api/?` + new URLSearchParams({
  name: username,
  background: 'random',  // or specific color like 'ff6b6b'
  color: 'fff',          // text color
  size: 128,             // image size
  bold: true,            // bold text
  rounded: true          // rounded corners
}).toString();
```

## Testing Avatars

### Test with Admin Panel

1. Open `http://localhost:3000/admin`
2. Use the "Test Vote" feature
3. Enter different usernames to see generated avatars

### Test with Real YouTube Data

1. Set up Streamerbot with the C# code
2. Start a test stream or use YouTube Studio chat
3. Have users vote with `!vote [position]`
4. Check if their real profile pictures appear

## Troubleshooting

### Avatars not loading in OBS

1. **CORS Issues**: Ensure your server allows image loading from external sources
2. **HTTPS Mixed Content**: If using HTTPS, ensure avatar URLs are also HTTPS
3. **Browser Cache**: Clear OBS browser source cache (right-click → Refresh)

### YouTube avatars showing as UI Avatars

1. Check that `profileImageUrl` is available in Streamerbot args
2. Verify YouTube is properly connected in Streamerbot
3. Check Streamerbot logs for any errors
4. Test with a known YouTube user

### Avatar loading slowly

1. Consider caching avatar URLs in your database
2. Use a CDN for frequently accessed avatars
3. Preload avatars when votes come in

## Best Practices

1. **Always have a fallback**: UI Avatars ensures everyone has an avatar
2. **Cache avatar URLs**: Don't fetch the same avatar repeatedly
3. **Handle errors gracefully**: If one method fails, try the next
4. **Respect rate limits**: YouTube API has daily quotas
5. **Test thoroughly**: Different users may have different avatar setups

## Avatar Priority Flow

The recommended priority for avatar sources:

1. **Streamerbot YouTube Profile Picture** ⭐ (Best quality, real-time)
2. **YouTube Data API v3** (Good quality, but API quota limited)
3. **UI Avatars** (Always available, generated from username)

## Privacy Considerations

- YouTube profile pictures are public information
- Always inform users that their avatar will be displayed
- Consider adding a privacy policy for your stream
- Allow users to opt-out if needed

## Future Enhancements

Possible improvements:
- Cache avatar URLs in Redis or database
- Add avatar quality selection (thumbnail, medium, high)
- Support custom avatar uploads for regular viewers
- Add VIP/subscriber badge overlays on avatars
- Implement avatar animation effects
