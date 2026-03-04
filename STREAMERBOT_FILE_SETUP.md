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
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.js";
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\locked.txt";
    private const string LOG_FILE = @"C:\GT7-Position-Voting\debug.txt";

    public bool Execute()
    {
        try
        {
            // Check if voting is locked
            if (File.Exists(LOCK_FILE))
            {
                CPH.LogInfo("Vote rejected - voting is locked");
                return false;
            }

            // DEBUG: Log all available keys from YouTube chat
            File.AppendAllText(LOG_FILE, $"\n[{DateTime.Now}] Action triggered from chat\n");
            File.AppendAllText(LOG_FILE, "Available keys:\n");

            foreach (var entry in args)
            {
                File.AppendAllText(LOG_FILE, $"  Key: '{entry.Key}' = '{entry.Value}'\n");
            }

            string message = args["message"].ToString();
            string username = args["userName"].ToString();
            string[] parts = message.Split(' ');

            if (parts.Length < 2) return false;

            int position;
            if (!int.TryParse(parts[1], out position) || position < 1 || position > 16)
            {
                return false;
            }

            // Get avatar from YouTube profile
            string avatarUrl = $"https://ui-avatars.com/api/?name={username.Replace(" ", "+")}&background=random";
            if (args.ContainsKey("userProfileUrl") && args["userProfileUrl"] != null)
            {
                avatarUrl = args["userProfileUrl"].ToString();
            }

            // Build JavaScript content
            string jsContent = $@"window.GT7VoteData = window.GT7VoteData || [];
window.GT7VoteData.push({{
  username: '{EscapeJs(username)}',
  position: {position},
  avatar: '{EscapeJs(avatarUrl)}',
  timestamp: {DateTimeOffset.Now.ToUnixTimeMilliseconds()}
}});";

            // Write to JavaScript file
            try
            {
                // Create directory if it doesn't exist
                string dir = Path.GetDirectoryName(VOTE_FILE);
                if (!Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                // Append vote to JavaScript file
                File.AppendAllText(VOTE_FILE, jsContent + Environment.NewLine);

                CPH.LogInfo($"Vote: {username} -> P{position}");
                File.AppendAllText(LOG_FILE, $"SUCCESS: Vote saved - {username} -> P{position}\n");
            }
            catch (Exception ex)
            {
                CPH.LogError($"Error saving vote: {ex.Message}");
                File.AppendAllText(LOG_FILE, $"FILE ERROR: {ex.Message}\n");
            }
        }
        catch (Exception ex)
        {
            File.AppendAllText(LOG_FILE, $"EXCEPTION: {ex.Message}\n{ex.StackTrace}\n");
            CPH.LogError($"Vote action error: {ex.Message}");
        }

        return true;
    }

    private string EscapeJs(string text)
    {
        if (text == null) return "";
        return text.Replace("\\", "\\\\").Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "\\r");
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
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.js";

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

#### Lock Votes Action (Freeze Voting)

Lock the poll so viewers can't change their votes once the race starts:

1. Create **Action**: "GT7 Lock Votes"
2. Add **Trigger**: YouTube → Chat Message → Command: `!lockvotes` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\locked.txt";

    public bool Execute()
    {
        try
        {
            // Check if already locked
            if (File.Exists(LOCK_FILE))
            {
                CPH.LogInfo("Voting is already locked");
                return false;
            }

            // Create lock file
            File.WriteAllText(LOCK_FILE, DateTime.Now.ToString());
            CPH.LogInfo("Voting locked");
            CPH.SendYouTubeMessage("🔒 Voting is now LOCKED! No more vote changes allowed!");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error locking votes: {ex.Message}");
        }

        return true;
    }
}
```

#### Unlock Votes Action (Re-enable Voting)

Unlock the poll to allow voting again:

1. Create **Action**: "GT7 Unlock Votes"
2. Add **Trigger**: YouTube → Chat Message → Command: `!unlockvotes` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\locked.txt";

    public bool Execute()
    {
        try
        {
            // Only unlock if currently locked to prevent spam
            if (!File.Exists(LOCK_FILE))
            {
                CPH.LogInfo("Voting is already unlocked");
                return false;
            }

            // Delete lock file
            File.Delete(LOCK_FILE);
            CPH.LogInfo("Voting unlocked");
            CPH.SendYouTubeMessage("🔓 Voting is now UNLOCKED! Type !vote [1-16] to predict!");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error unlocking votes: {ex.Message}");
        }

        return true;
    }
}
```

#### Result Command (Award Points to Winners)

After a race ends, use this to award points to everyone who guessed correctly:

1. Create **Action**: "GT7 Result"
2. Add **Trigger**: YouTube → Chat Message → Command: `!result` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.js";
    private const string LEADERBOARD_FILE = @"C:\GT7-Position-Voting\leaderboard.js";

    public bool Execute()
    {
        try
        {
            string message = args["message"].ToString();
            string[] parts = message.Split(' ');

            if (parts.Length < 2)
            {
                CPH.SendYouTubeMessage("Usage: !result [position] - Example: !result 3");
                return false;
            }

            int actualPosition;
            if (!int.TryParse(parts[1], out actualPosition) || actualPosition < 1 || actualPosition > 16)
            {
                CPH.SendYouTubeMessage("Invalid position! Use !result [1-16]");
                return false;
            }

            // Check if votes file exists
            if (!File.Exists(VOTE_FILE))
            {
                CPH.SendYouTubeMessage("No votes found for this race!");
                return false;
            }

            // Read and parse votes
            var votes = ParseVotes();
            if (votes.Count == 0)
            {
                CPH.SendYouTubeMessage("No votes found for this race!");
                return false;
            }

            // Calculate points for each voter based on proximity to actual finish
            // Exact match = 5pts, off by 1 = 3pts, off by 2 = 1pt, off by 3+ = 0pts
            var awarded = votes
                .Select(v => new { v.Username, v.Avatar, Diff = Math.Abs(v.Position - actualPosition) })
                .Select(v => new { v.Username, v.Avatar, v.Diff, Points = v.Diff == 0 ? 5 : v.Diff == 1 ? 3 : v.Diff == 2 ? 1 : 0 })
                .Where(v => v.Points > 0)
                .ToList();

            if (awarded.Count == 0)
            {
                CPH.SendYouTubeMessage($"No one came close to P{actualPosition}! Better luck next time!");
                return true;
            }

            // Load existing leaderboard
            var leaderboard = LoadLeaderboard();

            // Award points
            foreach (var a in awarded)
            {
                if (leaderboard.ContainsKey(a.Username))
                {
                    leaderboard[a.Username].Points += a.Points;
                    leaderboard[a.Username].LastUpdated = DateTimeOffset.Now.ToUnixTimeMilliseconds();
                }
                else
                {
                    leaderboard[a.Username] = new Player
                    {
                        Username = a.Username,
                        Avatar = a.Avatar,
                        Points = a.Points,
                        LastUpdated = DateTimeOffset.Now.ToUnixTimeMilliseconds()
                    };
                }
            }

            // Save updated leaderboard
            SaveLeaderboard(leaderboard);

            // Announce results by tier
            var exact = awarded.Where(a => a.Diff == 0).Select(a => a.Username).ToList();
            var closeOne = awarded.Where(a => a.Diff == 1).Select(a => a.Username).ToList();
            var closeTwo = awarded.Where(a => a.Diff == 2).Select(a => a.Username).ToList();

            if (exact.Count > 0)
                CPH.SendYouTubeMessage($"🏆 Perfect guess P{actualPosition}: {string.Join(", ", exact)} (+5 pts!)");
            if (closeOne.Count > 0)
                CPH.SendYouTubeMessage($"🎯 So close (±1): {string.Join(", ", closeOne)} (+3 pts!)");
            if (closeTwo.Count > 0)
                CPH.SendYouTubeMessage($"👍 Near miss (±2): {string.Join(", ", closeTwo)} (+1 pt!)");

            CPH.LogInfo($"Awarded points to {awarded.Count} voter(s) for P{actualPosition} result");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error processing result: {ex.Message}");
        }

        return true;
    }

    private List<Vote> ParseVotes()
    {
        var votes = new List<Vote>();
        var voterMap = new Dictionary<string, Vote>();

        try
        {
            string content = File.ReadAllText(VOTE_FILE);

            // Split by .push({ to find each vote object
            string[] voteBlocks = content.Split(new[] { ".push({" }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string block in voteBlocks)
            {
                if (!block.Contains("username")) continue;

                string username = ExtractValue(block, "username: '", "'");
                string posStr = ExtractValue(block, "position: ", ",");
                string avatar = ExtractValue(block, "avatar: '", "'");

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(posStr)) continue;

                int position;
                if (!int.TryParse(posStr.Trim(), out position)) continue;

                // Only keep last vote per user
                voterMap[username] = new Vote
                {
                    Username = username,
                    Position = position,
                    Avatar = avatar
                };
            }

            votes = voterMap.Values.ToList();
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error parsing votes: {ex.Message}");
        }

        return votes;
    }

    private Dictionary<string, Player> LoadLeaderboard()
    {
        var leaderboard = new Dictionary<string, Player>();

        try
        {
            if (!File.Exists(LEADERBOARD_FILE))
            {
                return leaderboard;
            }

            string content = File.ReadAllText(LEADERBOARD_FILE);
            string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string line in lines)
            {
                if (!line.Contains("username:")) continue;

                string username = ExtractValue(line, "username: '", "'");
                string avatar = ExtractValue(line, "avatar: '", "'");
                string pointsStr = ExtractValue(line, "points: ", ",");
                string lastUpdatedStr = ExtractValue(line, "lastUpdated: ", "}");

                if (string.IsNullOrEmpty(username)) continue;

                int points = 0;
                int.TryParse(pointsStr, out points);

                long lastUpdated = 0;
                long.TryParse(lastUpdatedStr, out lastUpdated);

                leaderboard[username] = new Player
                {
                    Username = username,
                    Avatar = avatar,
                    Points = points,
                    LastUpdated = lastUpdated
                };
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error loading leaderboard: {ex.Message}");
        }

        return leaderboard;
    }

    private string ExtractValue(string text, string startMarker, string endMarker)
    {
        try
        {
            int startIdx = text.IndexOf(startMarker);
            if (startIdx < 0) return "";

            startIdx += startMarker.Length;
            int endIdx = text.IndexOf(endMarker, startIdx);
            if (endIdx < 0) return "";

            return text.Substring(startIdx, endIdx - startIdx).Trim();
        }
        catch
        {
            return "";
        }
    }

    private void SaveLeaderboard(Dictionary<string, Player> leaderboard)
    {
        try
        {
            string dir = Path.GetDirectoryName(LEADERBOARD_FILE);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var lines = new List<string>();
            lines.Add("window.GT7Leaderboard = [");

            var players = leaderboard.Values.OrderByDescending(p => p.Points).ToList();
            for (int i = 0; i < players.Count; i++)
            {
                var p = players[i];
                var comma = i < players.Count - 1 ? "," : "";
                lines.Add($"  {{username: '{EscapeJs(p.Username)}', avatar: '{EscapeJs(p.Avatar)}', points: {p.Points}, lastUpdated: {p.LastUpdated}}}{comma}");
            }

            lines.Add("];");

            File.WriteAllText(LEADERBOARD_FILE, string.Join(Environment.NewLine, lines));
            CPH.LogInfo($"Leaderboard saved with {players.Count} players");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving leaderboard: {ex.Message}");
        }
    }

    private string EscapeJs(string text)
    {
        if (text == null) return "";
        return text.Replace("\\", "\\\\").Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "\\r");
    }

    private class Vote
    {
        public string Username { get; set; }
        public int Position { get; set; }
        public string Avatar { get; set; }
    }

    private class Player
    {
        public string Username { get; set; }
        public string Avatar { get; set; }
        public int Points { get; set; }
        public long LastUpdated { get; set; }
    }
}
```

**Workflow:**
1. Start race → viewers type `!vote [1-16]`
2. Race begins → type `!lockvotes` to freeze votes
3. Race ends → type `!result [position]` to award points (e.g., `!result 3` if you finished 3rd)
4. Type `!resetpoll` to clear votes for next race
5. (Optional) Type `!unlockvotes` to allow voting before locking again

## Test It!

1. Make sure the folder `C:\GT7-Position-Voting\` exists
2. In Streamerbot, right-click "GT7 Vote" → **Test Trigger**
3. Add test data:
   - `message`: `!vote 5`
   - `userName`: `TestUser`
4. Click **Test**
5. Check `C:\GT7-Position-Voting\votes.js` - should see JavaScript code
6. Check OBS - you should see the vote appear!

## Troubleshooting

### Overlay shows "Waiting for votes"
- Make sure `C:\GT7-Position-Voting\votes.js` exists
- Check that votes are being written to the file (open it in Notepad)
- Check the file path in both the overlay HTML and C# code match
- Verify OBS browser source has "Local file" checked

### Votes not updating
- Refresh the browser source in OBS
- Check Streamerbot logs for errors
- Make sure the vote action is enabled

### File path errors
- The default path is `C:\GT7-Position-Voting\votes.js`
- If your folder is elsewhere, update BOTH:
  - The `VOTE_FILE` constant in the C# code
  - The `VOTE_FILE_PATH` constant in `overlay-file-based.html`

### Why JavaScript instead of JSON?
- Browsers block local file:// reading for security (CORS policy)
- Script tags CAN load local JavaScript files
- This works around the browser restriction without needing a server!

## Advantages

✅ **No WebSocket** - No ports to configure
✅ **No server** - Nothing to run
✅ **Simple** - Just a file
✅ **Reliable** - Files always work
✅ **Fast** - Updates every 500ms
✅ **Portable** - Works anywhere

## File Location

The votes are stored in: `C:\GT7-Position-Voting\votes.js`

This is a JavaScript file that contains all votes as an array. You can open it in Notepad to see the votes!

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
