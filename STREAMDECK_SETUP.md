# Stream Deck Setup for GT7 Results

This guide will help you set up 16 buttons on your Stream Deck to quickly award points after each race.

## Overview

Press a button on your Stream Deck corresponding to your finish position. No chat commands needed - direct trigger from Stream Deck!

## Prerequisites

1. **Stream Deck** software installed
2. **Streamerbot** plugin installed in Stream Deck
3. **Streamerbot** running and connected to YouTube

## Step 1: Create the First Action in Streamerbot

We'll create one action with the full C# code, then duplicate it 15 times.

1. **Open Streamerbot**
2. In the **Actions** tab, click **Add**
3. **Name**: `GT7 Result P1`
4. **Do NOT add a trigger** (no chat command needed!)
5. Click **Add** under Sub-Actions
6. Select: **Core → Execute Code → Execute C# Code**
7. **Paste this code** (see below)
8. Click **OK**
9. Click **Save**

### C# Code for Position 1:

```csharp
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.js";
    private const string LEADERBOARD_FILE = @"C:\GT7-Position-Voting\leaderboard.js";
    private const int POSITION = 1; // CHANGE THIS FOR EACH ACTION

    // Points awarded based on how close the vote was to the actual finish position
    private int GetPoints(int diff)
    {
        if (diff == 0) return 5;
        if (diff == 1) return 3;
        if (diff == 2) return 1;
        return 0;
    }

    public bool Execute()
    {
        try
        {
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
            var awarded = votes
                .Select(v => new { v.Username, v.Avatar, Diff = Math.Abs(v.Position - POSITION), Points = GetPoints(Math.Abs(v.Position - POSITION)) })
                .Where(v => v.Points > 0)
                .ToList();

            if (awarded.Count == 0)
            {
                CPH.SendYouTubeMessage($"No one came close to P{POSITION}! Better luck next time!");
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

            // Save leaderboard
            SaveLeaderboard(leaderboard);

            // Announce results by tier
            var exact = awarded.Where(a => a.Diff == 0).Select(a => a.Username).ToList();
            var closeOne = awarded.Where(a => a.Diff == 1).Select(a => a.Username).ToList();
            var closeTwo = awarded.Where(a => a.Diff == 2).Select(a => a.Username).ToList();

            if (exact.Count > 0)
                CPH.SendYouTubeMessage($"🏆 Perfect guess P{POSITION}: {string.Join(", ", exact)} (+5 pts!)");
            if (closeOne.Count > 0)
                CPH.SendYouTubeMessage($"🎯 So close (±1): {string.Join(", ", closeOne)} (+3 pts!)");
            if (closeTwo.Count > 0)
                CPH.SendYouTubeMessage($"👍 Near miss (±2): {string.Join(", ", closeTwo)} (+1 pt!)");

            CPH.LogInfo($"Awarded points to {awarded.Count} voter(s) for P{POSITION} result");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error: {ex.Message}");
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
            if (!File.Exists(LEADERBOARD_FILE)) return leaderboard;

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

## Step 2: Duplicate for All 16 Positions

Now duplicate this action 15 times and change the position number:

1. Right-click on "GT7 Result P1" → **Duplicate**
2. Rename to "GT7 Result P2"
3. Double-click the **Execute C# Code** sub-action
4. Find the line: `private const int POSITION = 1;`
5. Change to: `private const int POSITION = 2;`
6. Click **Compile** to verify
7. Click **OK** and **Save**

Repeat for positions 3-16, changing only the POSITION constant each time.

### All 16 Actions Quick Reference:

| Action Name | POSITION Value |
|-------------|----------------|
| GT7 Result P1 | `private const int POSITION = 1;` |
| GT7 Result P2 | `private const int POSITION = 2;` |
| GT7 Result P3 | `private const int POSITION = 3;` |
| GT7 Result P4 | `private const int POSITION = 4;` |
| GT7 Result P5 | `private const int POSITION = 5;` |
| GT7 Result P6 | `private const int POSITION = 6;` |
| GT7 Result P7 | `private const int POSITION = 7;` |
| GT7 Result P8 | `private const int POSITION = 8;` |
| GT7 Result P9 | `private const int POSITION = 9;` |
| GT7 Result P10 | `private const int POSITION = 10;` |
| GT7 Result P11 | `private const int POSITION = 11;` |
| GT7 Result P12 | `private const int POSITION = 12;` |
| GT7 Result P13 | `private const int POSITION = 13;` |
| GT7 Result P14 | `private const int POSITION = 14;` |
| GT7 Result P15 | `private const int POSITION = 15;` |
| GT7 Result P16 | `private const int POSITION = 16;` |

## Step 3: Add Actions to Stream Deck

1. **Open Stream Deck** software
2. Drag the **Streamerbot** action from the right panel to a button slot
3. In the settings for that button:
   - **Select Action**: Choose "GT7 Result P1"
   - **Icon**: Customize as desired (use text "1" or an image)
   - **Title**: "P1"
4. Repeat for all 16 positions

### Suggested Layout:

```
[P1]  [P2]  [P3]  [P4]
[P5]  [P6]  [P7]  [P8]
[P9]  [P10] [P11] [P12]
[P13] [P14] [P15] [P16]
```

## Step 4: Customize Button Appearance (Optional)

### Add Colors:
- **P1-P3**: Gold/Yellow background (podium positions)
- **P4-P8**: Green background (points positions)
- **P9-P16**: Red/Orange background (no points)

### Add Icons:
You can use text or create custom icons showing position numbers.

## Usage During Race

1. **Race ends**
2. **Look at your finish position**
3. **Press the corresponding button** on Stream Deck
4. **System automatically**:
   - Awards points to correct predictors
   - Announces winners in chat
   - Updates leaderboard

That's it! Much faster than typing! 🏁

## Testing

Test each button by:
1. Have some test votes in the system (`!vote` commands)
2. Press a button
3. Check chat for the announcement
4. Verify leaderboard updates

## Troubleshooting

### Button does nothing:
- Check Streamerbot is running
- Verify the action is enabled in Streamerbot
- Check Streamerbot console for errors
- Make sure votes.js file exists

### Wrong position announced:
- Double-check the `POSITION` constant in each action's C# code
- Make sure you changed it when duplicating (easy to miss!)
- Verify with Compile before saving

### Not announcing in chat:
- Check Streamerbot is connected to YouTube
- Look for errors in Streamerbot logs
- Verify votes.js file has content

### Compilation errors:
- Make sure you copied the complete code
- Check for missing braces or semicolons
- Try the code from STREAMDECK_SETUP.md again
