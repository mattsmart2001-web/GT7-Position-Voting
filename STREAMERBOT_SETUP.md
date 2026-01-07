# Streamerbot Setup Guide

This guide will help you integrate the GT7 Position Voting system with Streamerbot.

## Prerequisites

- Streamerbot installed and running
- GT7 Position Voting server running (`npm start`)
- YouTube account connected to Streamerbot

## Setup Steps

### Method 1: Using Streamerbot Actions (Recommended)

1. **Open Streamerbot** and go to the Actions tab

2. **Create a new Action** called "GT7 Vote"

3. **Add a YouTube Chat Message Trigger**:
   - Click "Add" under Triggers
   - Select "YouTube" → "Chat Message"
   - Command: `!vote`
   - Set as Command: Yes
   - Allow while Bot is Connected: Yes

4. **Add Sub-Action to Parse Vote**:
   - Add Sub-Action → "Core" → "Code" → "Execute C# Code"
   - Paste the following code:

   ```csharp
   using System;
   using System.Net.Http;
   using System.Text;
   using Newtonsoft.Json;

   public class CPHInline
   {
       public bool Execute()
       {
           // Get the message and user info
           string message = args["message"].ToString();
           string username = args["user"].ToString();
           string userId = args["userId"].ToString();

           // Parse position from message (e.g., "!vote 5" -> 5)
           string[] parts = message.Split(' ');
           if (parts.Length < 2)
           {
               CPH.SendMessage("Usage: !vote [position 1-16]", true);
               return false;
           }

           int position;
           if (!int.TryParse(parts[1], out position) || position < 1 || position > 16)
           {
               CPH.SendMessage("Invalid position! Choose between 1-16", true);
               return false;
           }

           // Get YouTube avatar URL
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

           // Send vote to server
           var payload = new
           {
               username = username,
               position = position,
               avatar = avatarUrl
           };

           string json = JsonConvert.SerializeObject(payload);
           var content = new StringContent(json, Encoding.UTF8, "application/json");

           using (var client = new HttpClient())
           {
               try
               {
                   var response = client.PostAsync("http://localhost:3000/api/vote", content).Result;
                   if (response.IsSuccessStatusCode)
                   {
                       CPH.LogInfo($"Vote recorded: {username} voted for P{position}");
                   }
               }
               catch (Exception ex)
               {
                   CPH.LogError($"Error sending vote: {ex.Message}");
               }
           }

           return true;
       }
   }
   ```

5. **Save the Action** and enable it

### Method 2: Using WebSocket (Alternative)

1. **Create a WebSocket Client in Streamerbot**:
   - Go to Servers/Clients → WebSocket Client
   - Add new client
   - URI: `ws://localhost:3000`
   - Auto Connect: Yes
   - Reconnect: Yes

2. **Create Action with WebSocket Send**:
   - Follow steps 1-3 from Method 1
   - Add Sub-Action → "WebSocket Client" → "Send Message"
   - Use the vote parsing C# code to format data as JSON
   - Send message to the WebSocket client

## Chat Command

Users vote by typing in YouTube chat:
```
!vote [position]
```

Examples:
- `!vote 1` - Vote for 1st place
- `!vote 8` - Vote for 8th place
- `!vote 16` - Vote for 16th place

## YouTube Avatar Integration

### Getting Real YouTube Avatars

The C# code above attempts to get the real YouTube profile picture. If you want to ensure you're getting the actual YouTube avatars:

1. Make sure your YouTube account is properly connected to Streamerbot
2. Check that the `profileImageUrl` variable is being passed in the args
3. If avatars aren't showing, check Streamerbot logs for any errors

### Fallback to UI Avatars

If YouTube avatars aren't available, the system uses `ui-avatars.com` which generates colorful avatar initials based on the username. This ensures everyone always has an avatar.

## Testing

1. Start your GT7 voting server: `npm start`
2. Open the admin panel: `http://localhost:3000/admin`
3. Click "Start Poll"
4. Test the command in YouTube chat: `!vote 5`
5. Watch votes appear in real-time!

## Troubleshooting

### Votes not registering
- Check that the server is running on port 3000
- Verify Streamerbot action is enabled
- Check Streamerbot logs for errors

### Avatars not showing
- Fallback avatars will always show (UI Avatars)
- For YouTube avatars, ensure proper permissions in Streamerbot
- Check browser console in OBS for any image loading errors

### Permission denied errors
- Ensure Streamerbot has internet access
- Check firewall settings for localhost connections

## Advanced Configuration

### Custom Port

If you need to change the port from 3000:

1. Update `backend/server.js`: Change `PORT` constant
2. Update the Streamerbot C# code: Change the URL
3. Update OBS browser source URL

### Rate Limiting

To prevent spam voting, you can add rate limiting in Streamerbot:
- Add a "Condition" sub-action checking last command time
- Use "Set Argument" to track user cooldowns
- Typical cooldown: 5-10 seconds between votes

### Custom Chat Responses

Add a "Send Message to Channel" sub-action after the vote is recorded:
```csharp
CPH.SendMessage($"✅ {username} voted for P{position}!", true);
```

## Support

If you encounter issues:
1. Check all URLs and ports match
2. Verify Streamerbot is connected to YouTube
3. Test with the admin panel test vote feature first
4. Check browser console in OBS for errors
