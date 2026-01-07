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
using Newtonsoft.Json;
using System.Collections.Generic;

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

        // Load existing votes
        var voteData = LoadVotes();

        // Check if user already voted
        if (voteData.voterMap.ContainsKey(username))
        {
            int oldPosition = voteData.voterMap[username];
            // Remove old vote
            voteData.votes[oldPosition].voters.RemoveAll(v => v.username == username);
            voteData.votes[oldPosition].count--;
            voteData.totalVotes--;
        }

        // Add new vote
        var voter = new
        {
            username = username,
            avatar = avatarUrl,
            timestamp = DateTimeOffset.Now.ToUnixTimeMilliseconds()
        };

        voteData.votes[position].voters.Add(voter);
        voteData.votes[position].count++;
        voteData.voterMap[username] = position;
        voteData.totalVotes++;

        // Save votes
        SaveVotes(voteData);

        CPH.LogInfo($"Vote: {username} -> P{position}");
        return true;
    }

    private dynamic LoadVotes()
    {
        try
        {
            if (File.Exists(VOTE_FILE))
            {
                string json = File.ReadAllText(VOTE_FILE);
                return JsonConvert.DeserializeObject<dynamic>(json);
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error loading votes: {ex.Message}");
        }

        // Return new vote data
        var votes = new Dictionary<int, dynamic>();
        for (int i = 1; i <= 16; i++)
        {
            votes[i] = new { count = 0, voters = new List<dynamic>() };
        }

        return new
        {
            pollActive = true,
            votes = votes,
            totalVotes = 0,
            voterMap = new Dictionary<string, int>()
        };
    }

    private void SaveVotes(dynamic voteData)
    {
        try
        {
            string json = JsonConvert.SerializeObject(voteData, Formatting.Indented);
            File.WriteAllText(VOTE_FILE, json);
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving votes: {ex.Message}");
        }
    }
}
```

5. **Save** the action

### Step 3: Create Poll Control Actions (Optional)

#### Start Poll Action

1. Create **Action**: "GT7 Start Poll"
2. Add **Trigger**: YouTube → Chat Message → Command: `!startpoll` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;
using Newtonsoft.Json;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.json";

    public bool Execute()
    {
        try
        {
            // Create new vote file with poll active
            var votes = new Dictionary<int, object>();
            for (int i = 1; i <= 16; i++)
            {
                votes[i] = new { count = 0, voters = new List<object>() };
            }

            var voteData = new
            {
                pollActive = true,
                votes = votes,
                totalVotes = 0,
                voterMap = new Dictionary<string, int>()
            };

            string json = JsonConvert.SerializeObject(voteData, Formatting.Indented);
            File.WriteAllText(VOTE_FILE, json);

            CPH.LogInfo("Poll started");
            CPH.SendYouTubeMessage("🏁 Voting is now OPEN! Type !vote [1-16] to predict my finish position!");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error starting poll: {ex.Message}");
        }

        return true;
    }
}
```

#### Stop Poll Action

1. Create **Action**: "GT7 Stop Poll"
2. Add **Trigger**: YouTube → Chat Message → Command: `!stoppoll` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;
using Newtonsoft.Json;

public class CPHInline
{
    private const string VOTE_FILE = @"C:\GT7-Position-Voting\votes.json";

    public bool Execute()
    {
        try
        {
            if (File.Exists(VOTE_FILE))
            {
                string json = File.ReadAllText(VOTE_FILE);
                dynamic voteData = JsonConvert.DeserializeObject<dynamic>(json);
                voteData.pollActive = false;

                json = JsonConvert.SerializeObject(voteData, Formatting.Indented);
                File.WriteAllText(VOTE_FILE, json);

                CPH.LogInfo("Poll stopped");
                CPH.SendYouTubeMessage("🏁 Voting is now CLOSED! Let's see the results!");
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error stopping poll: {ex.Message}");
        }

        return true;
    }
}
```

#### Reset Poll Action

1. Create **Action**: "GT7 Reset Poll"
2. Add **Trigger**: YouTube → Chat Message → Command: `!resetpoll` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code

```csharp
using System;
using System.IO;
using Newtonsoft.Json;

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
            }

            CPH.LogInfo("Poll reset");
            CPH.SendYouTubeMessage("🔄 Poll has been reset!");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error resetting poll: {ex.Message}");
        }

        return true;
    }
}
```

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
