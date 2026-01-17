# Competition Entry System Setup

A simple system for viewers to enter competitions during your stream using the `!enterme` command.

## Features

- ✅ One entry per person (tracked by YouTube User ID)
- ✅ Chat confirmation when entered (shows total entries)
- ✅ Stores entries in a text file for easy random selection
- ✅ Entry count command for moderators
- ✅ **Animated winner reveal overlay** with confetti and fireworks 🎉
- ✅ Random winner picker command
- ✅ Reset command to clear entries between competitions

## Setup in Streamerbot

### Step 1: Create the !enterme Action

1. Open **Streamerbot**
2. Go to **Actions** tab
3. Click **Add** to create a new action
4. Name it: **"Competition Entry"**

### Step 2: Add Trigger

1. In the action, click **Add Trigger**
2. Select **YouTube → Chat Message → Command**
3. Set **Command**: `!enterme`
4. Enable **Enabled** checkbox
5. Click **OK**

### Step 3: Add Execute C# Code Sub-Action

1. In the action, click **Add Sub-Action**
2. Select **Core → Execute C# Code**
3. Paste the code below into the code editor:

```csharp
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

public class CPHInline
{
    // FILE PATH - Change this if needed
    private const string ENTRIES_FILE = @"C:\GT7-Position-Voting\competition_entries.txt";

    public bool Execute()
    {
        // Get user info from YouTube chat
        string username = args["userName"].ToString();
        string userId = args["userId"].ToString();

        CPH.LogInfo($"Competition entry attempt from: {username} ({userId})");

        // Read existing entries
        List<string> entries = new List<string>();
        if (File.Exists(ENTRIES_FILE))
        {
            entries = File.ReadAllLines(ENTRIES_FILE).ToList();
        }

        // Check if user already entered
        bool alreadyEntered = entries.Any(line => line.Contains($"|{userId}|"));

        if (alreadyEntered)
        {
            CPH.SendYouTubeMessage($"@{username} You've already entered! Good luck! 🎉");
            CPH.LogInfo($"{username} tried to enter again - already entered");
            return false;
        }

        // Add new entry
        string timestamp = DateTimeOffset.Now.ToUnixTimeMilliseconds().ToString();
        string entry = $"{username}|{userId}|{timestamp}";
        entries.Add(entry);

        // Save to file
        try
        {
            File.WriteAllLines(ENTRIES_FILE, entries);
            CPH.LogInfo($"Saved entry for {username}");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving entry: {ex.Message}");
            CPH.SendYouTubeMessage($"@{username} Error recording your entry - please try again!");
            return false;
        }

        // Calculate total entries
        int totalEntries = entries.Count;

        // Send confirmation
        CPH.SendYouTubeMessage($"@{username} You're entered! Good luck! 🎉 (Total entries: {totalEntries})");
        CPH.LogInfo($"Successfully added entry for {username} - Total entries: {totalEntries}");

        return true;
    }
}
```

4. Click **Save and Compile**
5. Make sure there are no errors
6. Click **OK**

---

## Optional Commands

### Count Entries Command (!entrycount)

Shows how many people have entered (moderators only).

1. Create new action: **"Competition Count"**
2. Add trigger: **YouTube → Chat Message → Command** → `!entrycount`
3. Set to **Moderators only**
4. Add **Execute C# Code** sub-action:

```csharp
using System;
using System.IO;
using System.Linq;

public class CPHInline
{
    private const string ENTRIES_FILE = @"C:\GT7-Position-Voting\competition_entries.txt";

    public bool Execute()
    {
        if (!File.Exists(ENTRIES_FILE))
        {
            CPH.SendYouTubeMessage("📊 No entries yet!");
            return true;
        }

        int count = File.ReadAllLines(ENTRIES_FILE).Length;
        string plural = count == 1 ? "person has" : "people have";

        CPH.SendYouTubeMessage($"📊 {count} {plural} entered the competition!");
        CPH.LogInfo($"Entry count: {count}");

        return true;
    }
}
```

### Reset Entries Command (!resetentries)

Clears all competition entries to start fresh (moderators only).

1. Create new action: **"Competition Reset"**
2. Add trigger: **YouTube → Chat Message → Command** → `!resetentries`
3. Set to **Moderators only**
4. Add **Execute C# Code** sub-action:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string ENTRIES_FILE = @"C:\GT7-Position-Voting\competition_entries.txt";

    public bool Execute()
    {
        if (File.Exists(ENTRIES_FILE))
        {
            File.Delete(ENTRIES_FILE);
            CPH.SendYouTubeMessage("🔄 Competition entries have been reset!");
            CPH.LogInfo("Competition entries file deleted");
        }
        else
        {
            CPH.SendYouTubeMessage("No entries to reset!");
            CPH.LogInfo("No entries file found to delete");
        }

        return true;
    }
}
```

### Pick Winner Command (!pickwinner) - **WITH ANIMATED OVERLAY!**

Randomly selects and reveals a winner with a dramatic animated overlay on stream!

1. Create new action: **"Competition Pick Winner"**
2. Add trigger: **YouTube → Chat Message → Command** → `!pickwinner`
3. Set to **Moderators only**
4. Add **Execute C# Code** sub-action:

```csharp
using System;
using System.IO;
using System.Linq;

public class CPHInline
{
    private const string ENTRIES_FILE = @"C:\GT7-Position-Voting\competition_entries.txt";
    private const string WINNER_FILE = @"C:\GT7-Position-Voting\winner.js";

    public bool Execute()
    {
        // Check if entries file exists
        if (!File.Exists(ENTRIES_FILE))
        {
            CPH.SendYouTubeMessage("📊 No entries yet! Use !enterme to join the competition.");
            return false;
        }

        // Read all entries
        string[] entries = File.ReadAllLines(ENTRIES_FILE);

        if (entries.Length == 0)
        {
            CPH.SendYouTubeMessage("📊 No entries yet! Use !enterme to join the competition.");
            return false;
        }

        // Pick random winner
        Random random = new Random();
        int winnerIndex = random.Next(entries.Length);
        string winnerLine = entries[winnerIndex];

        // Parse winner data (format: username|userId|timestamp)
        string[] parts = winnerLine.Split('|');
        if (parts.Length < 2)
        {
            CPH.SendYouTubeMessage("Error reading winner data!");
            return false;
        }

        string winnerUsername = parts[0];
        string winnerUserId = parts[1];

        // Get avatar URL - use fallback avatar generator
        // Replace spaces with + for URL encoding
        string encodedName = winnerUsername.Replace(" ", "+").Replace("'", "");
        string avatarUrl = $"https://ui-avatars.com/api/?name={encodedName}&background=random";

        // Try to get real YouTube avatar if possible
        try
        {
            // This is a fallback - Streamerbot might have the avatar in user data
            if (args.ContainsKey("userAvatar"))
            {
                avatarUrl = args["userAvatar"].ToString();
            }
        }
        catch
        {
            // Use fallback avatar
        }

        // Save winner data for overlay
        long timestamp = DateTimeOffset.Now.ToUnixTimeMilliseconds();
        string winnerData = $"window.GT7Winner = {{\n" +
                          $"  username: '{winnerUsername.Replace("'", "\\'")}',\n" +
                          $"  userId: '{winnerUserId}',\n" +
                          $"  avatar: '{avatarUrl}',\n" +
                          $"  timestamp: {timestamp}\n" +
                          $"}};";

        try
        {
            File.WriteAllText(WINNER_FILE, winnerData);
            CPH.LogInfo($"Winner saved: {winnerUsername}");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error saving winner: {ex.Message}");
        }

        // Announce winner in chat
        CPH.SendYouTubeMessage($"🏆 THE WINNER IS @{winnerUsername}! 🎉 Congratulations!");
        CPH.LogInfo($"Winner picked: {winnerUsername} (out of {entries.Length} entries)");

        return true;
    }
}
```

---

## Winner Reveal Overlay Setup (OBS)

Add the animated winner reveal to your stream!

### Step 1: Add to OBS

1. Open **OBS Studio**
2. Add a **Browser** source to your scene
3. **URL**: `http://localhost:8000/winner-reveal-overlay.html`
4. **Width**: `1920`
5. **Height**: `1080`
6. **FPS**: `60` (for smooth animations)
7. ✅ Check **Refresh browser when scene becomes active**
8. Click **OK**

### Step 2: Position the Source

- Place it above all other sources in your scene (so it appears on top)
- Make sure it covers the full screen for maximum impact
- The overlay is transparent when no winner is active

### How It Works

1. Type `!pickwinner` in chat (moderators only)
2. Bot randomly selects a winner
3. Overlay automatically detects the winner and triggers animation:
   - **Golden trophy** bounces in
   - **Winner's name and avatar** appear with glow effects
   - **Confetti** rains down
   - **Fireworks** explode across the screen
   - Animation plays for 8 seconds
   - Automatically fades out

### Tips

- Position your camera so the winner reveal appears center screen
- Use during climactic moments for maximum excitement
- The overlay polls every 500ms so reveals are instant!

---

## How to Pick a Winner (Alternative Methods)

### Method 1: Online Random Picker

1. Open the file: `C:\GT7-Position-Voting\competition_entries.txt`
2. Copy all the names
3. Go to: https://wheelofnames.com/ or https://www.randomresult.com/
4. Paste the names
5. Spin to pick a winner!

### Method 2: Manual Random Selection

1. Open `C:\GT7-Position-Voting\competition_entries.txt`
2. Count the lines (e.g., 47 entries)
3. Use a random number generator (1-47)
4. Pick the person at that line number

**Note**: Using `!pickwinner` command with the animated overlay is recommended for the best viewer experience!

---

## File Format

The `competition_entries.txt` file stores entries in this format:

```
Username|UserID|Timestamp
SparksTheory|UC1234567890|1736534567890
JohnDoe|UC9876543210|1736534568901
JaneSmith|UC5555555555|1736534569123
```

- **Username**: YouTube display name
- **UserID**: Unique YouTube user ID (prevents duplicate entries if name changes)
- **Timestamp**: When they entered (milliseconds since epoch)

---

## Usage During Stream

### Viewers:
- Type `!enterme` to enter the competition
- Can only enter once
- Get instant confirmation message with total entry count

### Streamer/Moderators:
- `!entrycount` - Check how many people have entered
- `!pickwinner` - Randomly pick and reveal winner with animated overlay! 🎉
- `!resetentries` - Clear all entries for new competition

---

## Troubleshooting

### Command not responding:
- Check Streamerbot is running
- Check action is enabled
- Check trigger command is correct
- View Streamerbot logs for errors

### File not found error:
- The file is created automatically on first entry
- Make sure folder `C:\GT7-Position-Voting\` exists

### Users entering multiple times:
- The system tracks by YouTube User ID, not username
- If someone changes their username, they still can't enter twice

### Want to change file location:
- Edit the `ENTRIES_FILE` path in the code
- Use forward slashes `/` or double backslashes `\\`

---

## Commands Summary

| Command | Who Can Use | What It Does |
|---------|-------------|--------------|
| `!enterme` | Everyone | Enter the competition (once per person) |
| `!entrycount` | Moderators | Show total entries |
| `!pickwinner` | Moderators | Randomly pick winner with animated reveal overlay |
| `!resetentries` | Moderators | Clear all entries for new competition |

---

## Tips

- **Announce clearly** when the competition is open
- **Tell viewers** when entries close (just stop accepting them)
- **Pick winner on stream** for transparency and excitement
- **Reset entries** after each competition using `!resetentries`
- **Optional**: Save a backup of entries file before picking if you want to verify later

Enjoy running your competitions! 🎉
