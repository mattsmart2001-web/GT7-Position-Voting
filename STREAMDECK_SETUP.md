# Stream Deck Setup for GT7 Results

This guide will help you set up 16 buttons on your Stream Deck to quickly award points after each race.

## Overview

Instead of typing `!result [1-16]` in chat, you'll press a button on your Stream Deck corresponding to your finish position. This is much faster during live streams!

## Prerequisites

1. **Stream Deck** software installed
2. **Streamerbot** plugin installed in Stream Deck
3. **Streamerbot** running and connected to YouTube

## Step 1: Create 16 Actions in Streamerbot

You need to create 16 actions in Streamerbot, one for each position.

### Quick Method (Copy & Modify):

1. **Open Streamerbot**
2. In the **Actions** tab, click **Add**
3. **Name**: `GT7 Result P1`
4. Click **Add** under Sub-Actions
5. Select: **Platforms → YouTube → Send Message to Channel**
6. In the **Message** field, type: `!result 1`
7. Click **OK**
8. Click **Save**

Now **duplicate this action 15 times** and modify each:

1. Right-click on "GT7 Result P1" → **Duplicate**
2. Rename to "GT7 Result P2"
3. Double-click the Sub-Action
4. Change message to: `!result 2`
5. Click **OK** and **Save**

Repeat for positions 3-16.

### All 16 Actions Quick Reference:

| Action Name | Message to Send |
|-------------|----------------|
| GT7 Result P1 | `!result 1` |
| GT7 Result P2 | `!result 2` |
| GT7 Result P3 | `!result 3` |
| GT7 Result P4 | `!result 4` |
| GT7 Result P5 | `!result 5` |
| GT7 Result P6 | `!result 6` |
| GT7 Result P7 | `!result 7` |
| GT7 Result P8 | `!result 8` |
| GT7 Result P9 | `!result 9` |
| GT7 Result P10 | `!result 10` |
| GT7 Result P11 | `!result 11` |
| GT7 Result P12 | `!result 12` |
| GT7 Result P13 | `!result 13` |
| GT7 Result P14 | `!result 14` |
| GT7 Result P15 | `!result 15` |
| GT7 Result P16 | `!result 16` |

## Step 2: Add Actions to Stream Deck

1. **Open Stream Deck** software
2. Drag the **Streamerbot** action from the right panel to a button slot
3. In the settings for that button:
   - **Action**: Select "GT7 Result P1"
   - **Icon**: You can customize (type "1" or use an image)
   - **Title**: "P1"
4. Repeat for all 16 positions

### Suggested Layout:

```
[P1]  [P2]  [P3]  [P4]
[P5]  [P6]  [P7]  [P8]
[P9]  [P10] [P11] [P12]
[P13] [P14] [P15] [P16]
```

## Step 3: Customize Button Appearance (Optional)

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
- Verify action names match exactly
- Make sure Streamerbot is connected to YouTube

### Wrong position announced:
- Double-check the message in each action
- Make sure you didn't accidentally duplicate with same number

### Not announcing in chat:
- Verify you have the `!result` action set up (from STREAMERBOT_FILE_SETUP.md)
- Check Streamerbot console for errors
