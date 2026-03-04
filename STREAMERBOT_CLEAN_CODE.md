# Clean C# Code (Without Debug Logging)

Once everything is working, you can replace your C# code with this cleaner version that removes the debug logging:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.js";
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\locked.txt";

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
            string dir = Path.GetDirectoryName(VOTE_FILE);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            File.AppendAllText(VOTE_FILE, jsContent + Environment.NewLine);
            CPH.LogInfo($"Vote: {username} -> P{position}");
        }
        catch (Exception ex)
        {
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

This version:
- ✅ Removes all debug logging to `debug.txt`
- ✅ Keeps essential error logging to Streamerbot console
- ✅ Is more efficient and cleaner
- ✅ Still logs each vote to Streamerbot: "Vote: username -> P5"
- ✅ Includes lock check to prevent voting when locked

## Lock Votes (Clean Version)

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
            // Check if already locked to prevent repeated messages
            if (File.Exists(LOCK_FILE))
            {
                CPH.LogInfo("Voting is already locked");
                return false;
            }

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

## Unlock Votes (Clean Version)

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

## Rigged Command (Clean Version)

Deducts 1 point from anyone who types `!rigged` in chat. Floor at 0 — can't go negative.

```csharp
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

public class CPHInline
{
    private const string LEADERBOARD_FILE = @"C:\GT7-Position-Voting\leaderboard.js";

    public bool Execute()
    {
        try
        {
            string username = args["userName"].ToString();

            var leaderboard = LoadLeaderboard();

            if (leaderboard.ContainsKey(username))
            {
                leaderboard[username].Points = Math.Max(0, leaderboard[username].Points - 1);
                leaderboard[username].LastUpdated = DateTimeOffset.Now.ToUnixTimeMilliseconds();
                SaveLeaderboard(leaderboard);
                CPH.SendYouTubeMessage($"😤 @{username} RIGGED?! Bold claim... costs you 1 point! (-1 pt)");
            }
            else
            {
                CPH.SendYouTubeMessage($"😤 @{username} RIGGED?! You don't even have any points to lose!");
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error processing !rigged: {ex.Message}");
        }

        return true;
    }

    private Dictionary<string, Player> LoadLeaderboard()
    {
        var leaderboard = new Dictionary<string, Player>();

        try
        {
            if (!File.Exists(LEADERBOARD_FILE)) return leaderboard;

            string content = File.ReadAllText(LEADERBOARD_FILE);
            string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string line in lines)
            {
                if (!line.Contains("username:")) continue;

                string uname = ExtractValue(line, "username: '", "'");
                string avatar = ExtractValue(line, "avatar: '", "'");
                string pointsStr = ExtractValue(line, "points: ", ",");
                string lastUpdatedStr = ExtractValue(line, "lastUpdated: ", "}");

                if (string.IsNullOrEmpty(uname)) continue;

                int points = 0;
                int.TryParse(pointsStr, out points);
                long lastUpdated = 0;
                long.TryParse(lastUpdatedStr, out lastUpdated);

                leaderboard[uname] = new Player { Username = uname, Avatar = avatar, Points = points, LastUpdated = lastUpdated };
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error loading leaderboard: {ex.Message}");
        }

        return leaderboard;
    }

    private void SaveLeaderboard(Dictionary<string, Player> leaderboard)
    {
        try
        {
            string dir = Path.GetDirectoryName(LEADERBOARD_FILE);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

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
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving leaderboard: {ex.Message}");
        }
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
        catch { return ""; }
    }

    private string EscapeJs(string text)
    {
        if (text == null) return "";
        return text.Replace("\\", "\\\\").Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "\\r");
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
