# Quick Start (No Node.js!)

Get GT7 Position Voting running in 3 minutes - no installation needed!

## What You Need

- ✅ Streamerbot (installed)
- ✅ OBS Studio
- ✅ The file: `overlay-standalone.html`

That's it!

## Setup Steps

### 1. Enable Streamerbot WebSocket (30 seconds)

1. Open **Streamerbot**
2. Go to **Servers/Clients** tab
3. Find **WebSocket Server**
4. Make sure it's **enabled**
5. Default port is `8080` - remember this!

### 2. Add to OBS (1 minute)

1. Open **OBS**
2. Add **Browser Source** to your scene
3. Click **"Browse"** and select `overlay-standalone.html`
4. Check **"Local file"** box
5. Set Width: `1920`
6. Set Height: `1080`
7. Click **OK**

### 3. Create Streamerbot Actions (2 minutes)

#### Vote Action

1. In Streamerbot, create **Action**: "GT7 Vote"
2. Add **Trigger**: YouTube → Chat Message → Command: `!vote`
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste this:

```csharp
using System;
using System.Web;

public class CPHInline
{
    public bool Execute()
    {
        string message = args["message"].ToString();
        string username = args["userName"].ToString();
        string[] parts = message.Split(' ');

        if (parts.Length < 2) return false;

        int position;
        if (!int.TryParse(parts[1], out position) || position < 1 || position > 16)
            return false;

        string avatarUrl = $"https://ui-avatars.com/api/?name={HttpUtility.UrlEncode(username)}&background=random";
        if (args.ContainsKey("profileImageUrl"))
            avatarUrl = args["profileImageUrl"].ToString();

        string json = $@"{{
            ""event"": {{
                ""type"": ""Custom"",
                ""data"": {{
                    ""name"": ""GT7Vote"",
                    ""username"": ""{username.Replace("\"", "\\\"")}"",
                    ""position"": {position},
                    ""avatar"": ""{avatarUrl.Replace("\"", "\\\"")}""
                }}
            }}
        }}";

        CPH.WebsocketBroadcastJson(json);
        return true;
    }
}
```

#### Control Actions (Optional but Recommended)

Create 3 more actions for poll control:
- **!startpoll** - Starts the voting
- **!stoppoll** - Stops the voting
- **!resetpoll** - Clears all votes

For the complete C# code for these actions, see **STREAMERBOT_SIMPLE_SETUP.md**

Quick version - use this C# code for each:
```csharp
// For !startpoll
CPH.WebsocketBroadcastJson(@"{""event"":{""type"":""Custom"",""data"":{""name"":""GT7StartPoll""}}}");

// For !stoppoll
CPH.WebsocketBroadcastJson(@"{""event"":{""type"":""Custom"",""data"":{""name"":""GT7StopPoll""}}}");

// For !resetpoll
CPH.WebsocketBroadcastJson(@"{""event"":{""type"":""Custom"",""data"":{""name"":""GT7ResetPoll""}}}");
```

## Test It!

1. Make sure Streamerbot is running
2. Check OBS - overlay should show "✅ Connected"
3. In YouTube chat, type: `!startpoll`
4. Type: `!vote 5`
5. Watch it appear! 🎉

## During a Race

1. `!startpoll` - Start voting
2. Viewers type `!vote [1-16]`
3. `!stoppoll` - Close voting
4. `!resetpoll` - Clear for next race

## That's It!

No npm, no Node.js, no server to run. Just one HTML file and Streamerbot! 🏁

## Troubleshooting

**"Disconnected" showing?**
- Check Streamerbot WebSocket Server is enabled
- Default port is 8080

**Votes not showing?**
- Type `!startpoll` first
- Check Streamerbot actions are enabled

**Need help?**
- See: `STREAMERBOT_SIMPLE_SETUP.md` for detailed setup
