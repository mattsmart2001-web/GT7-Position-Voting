# Competition Entry System Setup

A simple system for viewers to enter competitions during your stream using the `!enterme` command.

## Features

- ✅ One entry per person
- ✅ Chat confirmation when entered
- ✅ Stores entries in a text file
- ✅ Easy random selection afterwards
- ✅ Optional reset command to clear entries

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
    // FILE PATHS - Change these if needed
    private const string ENTRIES_FILE = @"C:\GT7-Position-Voting\competition_entries.txt";
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\competition_lock.txt";

    public bool Execute()
    {
        // Get user info from YouTube chat
        string username = args["userName"].ToString();
        string userId = args["userId"].ToString();

        CPH.LogInfo($"Competition entry attempt from: {username} ({userId})");

        // Check if entries are locked
        if (File.Exists(LOCK_FILE))
        {
            CPH.SendYouTubeMessage($"@{username} Sorry, entries are currently closed!");
            CPH.LogInfo("Entries are locked");
            return false;
        }

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

### Reset Entries Command (!resetentries)

Clears all competition entries to start fresh.

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

### Lock Entries Command (!lockentries)

Prevents new entries (competition closed).

1. Create new action: **"Competition Lock"**
2. Add trigger: **YouTube → Chat Message → Command** → `!lockentries`
3. Set to **Moderators only**
4. Add **Execute C# Code** sub-action:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\competition_lock.txt";

    public bool Execute()
    {
        if (File.Exists(LOCK_FILE))
        {
            CPH.LogInfo("Entries already locked");
            return false;
        }

        File.WriteAllText(LOCK_FILE, DateTime.Now.ToString());
        CPH.SendYouTubeMessage("🔒 Competition entries are now closed!");
        CPH.LogInfo("Competition entries locked");

        return true;
    }
}
```

### Unlock Entries Command (!unlockentries)

Allows entries again.

1. Create new action: **"Competition Unlock"**
2. Add trigger: **YouTube → Chat Message → Command** → `!unlockentries`
3. Set to **Moderators only**
4. Add **Execute C# Code** sub-action:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string LOCK_FILE = @"C:\GT7-Position-Voting\competition_lock.txt";

    public bool Execute()
    {
        if (!File.Exists(LOCK_FILE))
        {
            CPH.LogInfo("Entries already unlocked");
            return false;
        }

        File.Delete(LOCK_FILE);
        CPH.SendYouTubeMessage("🔓 Competition entries are now open!");
        CPH.LogInfo("Competition entries unlocked");

        return true;
    }
}
```

### Count Entries Command (!entrycount)

Shows how many people have entered.

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

---

## How to Pick a Winner

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

### Method 3: Streamerbot Random Picker (Advanced)

Want a chat command to pick winners? I can create a `!pickwinner` command that randomly selects from entries!

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
- Get confirmation message

### Streamer/Moderators:
- `!lockentries` - Close entries
- `!unlockentries` - Open entries again
- `!entrycount` - Check how many entries
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
| `!lockentries` | Moderators | Close entries |
| `!unlockentries` | Moderators | Open entries |
| `!entrycount` | Moderators | Show total entries |
| `!resetentries` | Moderators | Clear all entries |

---

## Tips

- **Announce clearly** when competition is open
- **Lock entries** when you want to stop accepting
- **Pick winner on stream** for transparency
- **Reset entries** after each competition
- **Save backup** of entries file before picking if you want to verify later

Enjoy running your competitions! 🎉
