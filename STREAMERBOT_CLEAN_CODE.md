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
            if (File.Exists(LOCK_FILE))
            {
                File.Delete(LOCK_FILE);
                CPH.LogInfo("Voting unlocked");
                CPH.SendYouTubeMessage("🔓 Voting is now UNLOCKED! Type !vote [1-16] to predict!");
            }
            else
            {
                CPH.SendYouTubeMessage("Voting is already unlocked!");
            }
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error unlocking votes: {ex.Message}");
        }

        return true;
    }
}
```
