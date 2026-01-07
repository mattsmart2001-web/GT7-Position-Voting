# Streamerbot File-Based Setup (SUPER SIMPLE!)

No WebSocket, no ports, no configuration headaches! This version uses a simple JSON file.

## How It Works

1. When someone votes, Streamerbot writes to `votes.json`
2. The overlay reads this file every 500ms
3. That's it! No server needed!

## Setup Steps

### Step 1: Add to OBS (1 minute)

1. Open **OBS**
2. Add **Browser Source** to your scene
3. Click **"Browse"** and select `overlay-file-based.html`
4. Check **"Local file"** box
5. Set Width: `1920`
6. Set Height: `1080`
7. **IMPORTANT**: Check **"Allow access to local files"**
8. Click **OK**

### Step 2: Create Streamerbot Vote Action (2 minutes)

1. In Streamerbot, create **Action**: "GT7 Vote"
2. Add **Trigger**: YouTube → Chat Message → Command: `!vote`
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste this code:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.json";

    public bool Execute()
    {
        string message = args["message"].ToString();
        string username = args["userName"].ToString();
        string[] parts = message.Split(' ');

        if (parts.Length < 2) return false;

        int position;
        if (!int.TryParse(parts[1], out position) || position < 1 || position > 16)
        {
            return false;
        }

        // Get avatar
        string avatarUrl = $"https://ui-avatars.com/api/?name={username.Replace(" ", "+")}&background=random";
        if (args.ContainsKey("profileImageUrl") && args["profileImageUrl"] != null)
        {
            avatarUrl = args["profileImageUrl"].ToString();
        }

        // Build simple JSON manually (no library needed)
        string voteJson = $@"{{
  ""username"": ""{EscapeJson(username)}"",
  ""position"": {position},
  ""avatar"": ""{EscapeJson(avatarUrl)}"",
  ""timestamp"": {DateTimeOffset.Now.ToUnixTimeMilliseconds()}
}}";

        // Append vote to file
        try
        {
            // Create directory if it doesn't exist
            string dir = Path.GetDirectoryName(VOTE_FILE);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            // Write vote (one per line for easy reading)
            File.AppendAllText(VOTE_FILE, voteJson + Environment.NewLine);

            CPH.LogInfo($"Vote: {username} -> P{position}");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving vote: {ex.Message}");
        }

        return true;
    }

    private string EscapeJson(string text)
    {
        if (text == null) return "";
        return text.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
    }
}
```

5. **Save** the action

### Step 3: Create Poll Control Actions (Optional)

#### Reset Poll Action (Recommended)

The easiest way to reset is just to delete the vote file:

1. Create **Action**: "GT7 Reset Poll"
2. Add **Trigger**: YouTube → Chat Message → Command: `!resetpoll` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.json";

    public bool Execute()
    {
        try
        {
            // Delete the vote file to reset
            if (File.Exists(VOTE_FILE))
            {
                File.Delete(VOTE_FILE);
                CPH.LogInfo("Poll reset - file deleted");
            }
            else
            {
                CPH.LogInfo("Poll already empty");
            }

            CPH.SendYouTubeMessage("🔄 Poll has been reset! Type !vote [1-16] to predict my finish position!");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error resetting poll: {ex.Message}");
        }

        return true;
    }
}
```

**Note:** The poll is always "active" with this simple version. Votes start as soon as someone types `!vote`. To reset for a new race, just use `!resetpoll`.

## Test It!

1. Make sure the folder `C:\GT7-Position-Voting\` exists
2. In Streamerbot, manually run the "GT7 Start Poll" action (or type `!startpoll` in chat)
3. Run the "GT7 Vote" action or type `!vote 5` in chat
4. Check OBS - you should see the vote appear!

## Troubleshooting

### Overlay shows "Waiting for votes"
- Make sure `C:\GT7-Position-Voting\votes.json` exists
- Check the file path in both the overlay HTML and C# code match
- Verify OBS browser source has "Allow access to local files" checked

### Votes not updating
- Refresh the browser source in OBS
- Check Streamerbot logs for errors
- Make sure the vote action is enabled

### File path errors
- The default path is `C:\GT7-Position-Voting\votes.json`
- If your folder is elsewhere, update BOTH:
  - The `VOTE_FILE` constant in the C# code
  - The `VOTE_FILE_PATH` constant in `overlay-file-based.html`

## Advantages

✅ **No WebSocket** - No ports to configure
✅ **No server** - Nothing to run
✅ **Simple** - Just a file
✅ **Reliable** - Files always work
✅ **Fast** - Updates every 500ms
✅ **Portable** - Works anywhere

## File Location

The votes are stored in: `C:\GT7-Position-Voting\votes.json`

You can look at this file anytime to see the current vote status!

## Commands

| Command | Who Can Use | What It Does |
|---------|-------------|--------------|
| `!vote [1-16]` | Everyone | Vote for a position |
| `!startpoll` | Moderators | Start voting |
| `!stoppoll` | Moderators | Stop voting |
| `!resetpoll` | Moderators | Clear all votes |

## During a Race

1. Type `!startpoll` to begin
2. Viewers vote with `!vote [position]`
3. Watch votes appear in real-time!
4. Type `!stoppoll` when ready
5. Type `!resetpoll` for next race

That's it! Super simple, super reliable! 🏁
