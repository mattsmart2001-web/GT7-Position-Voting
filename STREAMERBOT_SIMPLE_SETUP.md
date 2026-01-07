# Streamerbot Setup (No Node.js Required!)

This is the simple setup that works directly with Streamerbot's WebSocket - no server needed!

## Prerequisites

- Streamerbot installed
- YouTube connected to Streamerbot
- OBS Studio

## Step 1: Configure Streamerbot WebSocket Server

1. Open Streamerbot
2. Go to **Servers/Clients** tab
3. Find **WebSocket Server**
4. Make sure it's **enabled**
5. Note the port (usually `8080`)
6. Note the host (usually `127.0.0.1`)

## Step 2: Add OBS Browser Source

1. Open OBS
2. Add a **Browser Source**
3. Click "Browse" and select: `overlay-standalone.html`
   - Or use the full path: `C:\GT7-Position-Voting\overlay-standalone.html`
4. Set Width: `1920`
5. Set Height: `1080`
6. Check **"Local file"** box
7. Click OK

That's it! No server to run, no npm install needed!

## Step 3: Create Streamerbot Actions

### Action 1: GT7 Vote Handler

1. In Streamerbot, create a new **Action** called "GT7 Vote"

2. Add **Trigger**:
   - Type: **YouTube → Chat Message**
   - Command: `!vote`
   - Set as Command: **Yes**

3. Add **Sub-Action**: **Core → Execute C# Code**

Paste this code:

```csharp
using System;

public class CPHInline
{
    public bool Execute()
    {
        // Get message and user info
        string message = args["message"].ToString();
        string username = args["userName"].ToString();

        // Parse position from message
        string[] parts = message.Split(' ');
        if (parts.Length < 2)
        {
            return false;
        }

        int position;
        if (!int.TryParse(parts[1], out position) || position < 1 || position > 16)
        {
            return false;
        }

        // Get avatar URL
        string avatarUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(username)}&background=random";

        // Try to get YouTube profile picture
        if (args.ContainsKey("profileImageUrl"))
        {
            avatarUrl = args["profileImageUrl"].ToString();
        }

        // Broadcast vote to overlay via WebSocket
        CPH.BroadcastWs("GT7Vote", new {
            name = "GT7Vote",
            username = username,
            position = position,
            avatar = avatarUrl
        });

        CPH.LogInfo($"Vote: {username} -> P{position}");

        return true;
    }
}
```

4. **Save** the action

### Action 2: GT7 Start Poll

1. Create new **Action** called "GT7 Start Poll"

2. Add **Trigger**:
   - Type: **YouTube → Chat Message**
   - Command: `!startpoll`
   - Set as Command: **Yes**
   - Permissions: **Moderators Only** (recommended)

3. Add **Sub-Action**: **Core → Execute C# Code**

```csharp
using System;

public class CPHInline
{
    public bool Execute()
    {
        CPH.BroadcastWs("GT7StartPoll", new {
            name = "GT7StartPoll"
        });

        CPH.LogInfo("Poll started");
        CPH.SendYouTubeMessage("🏁 Voting is now OPEN! Type !vote [1-16] to predict the finish position!");

        return true;
    }
}
```

### Action 3: GT7 Stop Poll

1. Create new **Action** called "GT7 Stop Poll"

2. Add **Trigger**:
   - Type: **YouTube → Chat Message**
   - Command: `!stoppoll`
   - Set as Command: **Yes**
   - Permissions: **Moderators Only**

3. Add **Sub-Action**: **Core → Execute C# Code**

```csharp
using System;

public class CPHInline
{
    public bool Execute()
    {
        CPH.BroadcastWs("GT7StopPoll", new {
            name = "GT7StopPoll"
        });

        CPH.LogInfo("Poll stopped");
        CPH.SendYouTubeMessage("🏁 Voting is now CLOSED! Let's see the results!");

        return true;
    }
}
```

### Action 4: GT7 Reset Poll

1. Create new **Action** called "GT7 Reset Poll"

2. Add **Trigger**:
   - Type: **YouTube → Chat Message**
   - Command: `!resetpoll`
   - Set as Command: **Yes**
   - Permissions: **Moderators Only**

3. Add **Sub-Action**: **Core → Execute C# Code**

```csharp
using System;

public class CPHInline
{
    public bool Execute()
    {
        CPH.BroadcastWs("GT7ResetPoll", new {
            name = "GT7ResetPoll"
        });

        CPH.LogInfo("Poll reset");
        CPH.SendYouTubeMessage("🔄 Poll has been reset!");

        return true;
    }
}
```

## Step 4: Configure the Overlay (if needed)

If your Streamerbot WebSocket is not on the default port (8080), edit `overlay-standalone.html`:

1. Open the file in a text editor
2. Find these lines near the top of the `<script>` section:
```javascript
const STREAMERBOT_HOST = '127.0.0.1';
const STREAMERBOT_PORT = 8080;
```
3. Change the port number to match your Streamerbot settings
4. Save the file

## How to Use

### During Stream:

1. **Start Voting**: You (or mod) type: `!startpoll`
   - Chat will see: "🏁 Voting is now OPEN!"
   - Overlay shows "LIVE VOTING" indicator

2. **Viewers Vote**: They type: `!vote 5` (or any position 1-16)
   - Votes appear in real-time on overlay
   - Avatars show under their chosen position
   - Users can change votes anytime

3. **Stop Voting**: You type: `!stoppoll`
   - Voting closes (votes still displayed)
   - Chat sees: "🏁 Voting is now CLOSED!"

4. **Reset for Next Race**: You type: `!resetpoll`
   - Clears all votes
   - Ready for next race

### Commands:

| Command | Who Can Use | What It Does |
|---------|-------------|--------------|
| `!vote [1-16]` | Everyone | Vote for a position |
| `!startpoll` | Moderators | Start voting |
| `!stoppoll` | Moderators | Stop voting |
| `!resetpoll` | Moderators | Clear all votes |

## Testing

### Test in OBS:
1. Make sure Streamerbot is running
2. Make sure WebSocket Server is enabled
3. The overlay should show "✅ Connected" briefly
4. Type `!startpoll` in YouTube chat
5. Type `!vote 1` to test a vote
6. Watch it appear in OBS!

### Test in Browser Console:
1. Right-click the overlay in OBS → Interact
2. Press F12 to open developer console
3. Type: `GT7Voting.startPoll()`
4. Type: `GT7Voting.processVote("TestUser", 5, null)`
5. You should see the vote appear!

## Troubleshooting

### Overlay shows "Disconnected"
- Check that Streamerbot is running
- Check that WebSocket Server is enabled in Streamerbot
- Verify the port matches (default 8080)
- Try restarting Streamerbot

### Votes not appearing
- Make sure you ran `!startpoll` first
- Check Streamerbot logs for errors
- Verify actions are enabled
- Test with browser console first

### OBS shows blank page
- Make sure you selected the HTML file as a "Local file"
- Check the file path is correct
- Try refreshing the browser source

### Avatars not showing
- The overlay will always show generated avatars
- For real YouTube avatars, ensure YouTube is properly connected
- Check that `profileImageUrl` is available in Streamerbot

## Advantages of This Approach

✅ **No Node.js** - Just HTML and Streamerbot
✅ **No Server** - Nothing to install or run
✅ **Simple Setup** - Drag HTML file into OBS
✅ **Built-in WebSocket** - Uses Streamerbot's server
✅ **Easy Testing** - Open HTML file in browser
✅ **Portable** - Copy HTML file anywhere

## File You Need

- `overlay-standalone.html` - That's it! Just this one file!

Everything else (Node.js version, backend server, etc.) is optional for more advanced setups.

## Next Steps

Want more features?
- Add sound effects when votes come in
- Customize colors and animations in the HTML
- Add vote counts per position in chat
- Show voter leaderboard
- Add confetti for top prediction

The HTML file is fully customizable - edit the CSS styles to match your stream branding!
