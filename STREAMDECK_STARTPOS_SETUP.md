# Stream Deck Setup for GT7 Starting Position

This guide sets up 16 buttons to announce your **starting grid position** before each race. Viewers will see where you're starting from and can make smarter vote predictions.

## Overview

Press the button matching your **qualifying/grid position** before the race starts. This:
- Writes `startpos.js` so the OBS overlay shows your starting position
- Announces in YouTube chat so viewers know where you're starting

## Prerequisites

1. **Stream Deck** software installed
2. **Streamerbot** plugin installed in Stream Deck
3. **Streamerbot** running and connected to YouTube

## Step 1: Create the First Action in Streamerbot

1. **Open Streamerbot**
2. In the **Actions** tab, click **Add**
3. **Name**: `GT7 Start Pos P1`
4. **Do NOT add a trigger** (triggered by Stream Deck button only)
5. Click **Add** under Sub-Actions
6. Select: **Core → Execute Code → Execute C# Code**
7. **Paste this code** (see below)
8. Click **Compile** to verify, then **OK**
9. Click **Save**

### C# Code for Starting Position 1:

```csharp
using System;
using System.IO;

public class CPHInline
{
    private const string STARTPOS_FILE = @"C:\GT7-Position-Voting\startpos.js";
    private const int POSITION = 1; // CHANGE THIS FOR EACH ACTION

    public bool Execute()
    {
        try
        {
            string dir = Path.GetDirectoryName(STARTPOS_FILE);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

            File.WriteAllText(STARTPOS_FILE, $"window.GT7StartPos = {POSITION};");

            CPH.SendYouTubeMessage($"🏁 Starting from P{POSITION}! Type !vote [1-16] to predict my finishing position!");
            CPH.LogInfo($"Starting position set to P{POSITION}");
        }
        catch (Exception ex)
        {
            CPH.LogError($"Error setting start position: {ex.Message}");
        }

        return true;
    }
}
```

## Step 2: Duplicate for All 16 Positions

1. Right-click on "GT7 Start Pos P1" → **Duplicate**
2. Rename to "GT7 Start Pos P2"
3. Double-click the **Execute C# Code** sub-action
4. Find the line: `private const int POSITION = 1;`
5. Change to: `private const int POSITION = 2;`
6. Click **Compile** to verify
7. Click **OK** and **Save**

Repeat for positions 3-16, changing only the POSITION constant each time.

### All 16 Actions Quick Reference:

| Action Name | POSITION Value |
|-------------|----------------|
| GT7 Start Pos P1 | `private const int POSITION = 1;` |
| GT7 Start Pos P2 | `private const int POSITION = 2;` |
| GT7 Start Pos P3 | `private const int POSITION = 3;` |
| GT7 Start Pos P4 | `private const int POSITION = 4;` |
| GT7 Start Pos P5 | `private const int POSITION = 5;` |
| GT7 Start Pos P6 | `private const int POSITION = 6;` |
| GT7 Start Pos P7 | `private const int POSITION = 7;` |
| GT7 Start Pos P8 | `private const int POSITION = 8;` |
| GT7 Start Pos P9 | `private const int POSITION = 9;` |
| GT7 Start Pos P10 | `private const int POSITION = 10;` |
| GT7 Start Pos P11 | `private const int POSITION = 11;` |
| GT7 Start Pos P12 | `private const int POSITION = 12;` |
| GT7 Start Pos P13 | `private const int POSITION = 13;` |
| GT7 Start Pos P14 | `private const int POSITION = 14;` |
| GT7 Start Pos P15 | `private const int POSITION = 15;` |
| GT7 Start Pos P16 | `private const int POSITION = 16;` |

## Step 3: Add Buttons to Stream Deck

1. **Open Stream Deck** software
2. Drag the **Streamerbot** action from the right panel to a button slot
3. In the settings for that button:
   - **Select Action**: Choose "GT7 Start Pos P1"
   - **Title**: "START P1"
4. Repeat for all 16 positions

### Suggested Layout (separate Stream Deck page):

```
[S1]  [S2]  [S3]  [S4]
[S5]  [S6]  [S7]  [S8]
[S9]  [S10] [S11] [S12]
[S13] [S14] [S15] [S16]
```

Use a different color or icon style to distinguish these from the result buttons.

## Step 4: Race Day Workflow

### Before the race:
1. Check your **qualifying/grid position**
2. **Press the matching Start Position button** on Stream Deck
3. Chat sees: `🏁 Starting from P8! Type !vote [1-16] to predict my finishing position!`
4. Overlay shows your starting position so viewers have context
5. Viewers type `!vote [1-16]` with their prediction

### After the race:
1. Press the matching **Result button** (from `STREAMDECK_SETUP.md`)
2. Points are awarded based on **how close** each vote was to your finish:

| Difference from actual finish | Points |
|-------------------------------|--------|
| Exact match | **5 points** |
| Off by 1 position | **3 points** |
| Off by 2 positions | **1 point** |
| Off by 3+ positions | **0 points** |

## Troubleshooting

### Button does nothing:
- Check Streamerbot is running
- Verify the action is enabled in Streamerbot
- Check Streamerbot console for errors

### Overlay not showing start position:
- Make sure `START_SERVER.bat` is running
- Check that `startpos.js` was created in `C:\GT7-Position-Voting\`
- Refresh the OBS browser source

### Not announcing in chat:
- Check Streamerbot is connected to YouTube
- Look for errors in Streamerbot logs
