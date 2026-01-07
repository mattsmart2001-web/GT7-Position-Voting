# Quick Start - File-Based (EASIEST WAY!)

Get your voting system working in 3 minutes with ZERO configuration!

## Step 1: Add to OBS (30 seconds)

1. Open **OBS**
2. Add **Browser Source**
3. Select file: `overlay-file-based.html`
4. Check **"Local file"**
5. Check **"Allow access to local files"** ← IMPORTANT!
6. Width: `1920`, Height: `1080`
7. Click OK

## Step 2: Create Vote Action in Streamerbot (2 minutes)

1. Open **Streamerbot**
2. Create new **Action**: "GT7 Vote"
3. Add **Trigger**: YouTube Chat → Command: `!vote`
4. Add **Sub-Action**: Execute C# Code
5. **Copy the code from `STREAMERBOT_FILE_SETUP.md`** (it's the long code block)
6. **Paste** it into the C# editor
7. **Save** the action

## Step 3: Test It! (30 seconds)

1. In Streamerbot, right-click "GT7 Vote" → **Test**
2. In the test window, add these fields:
   - `message`: `!vote 5`
   - `userName`: `TestUser`
3. Click **Test**
4. **Look at OBS** - you should see a vote appear!

## That's It! 🎉

You're done! No server, no WebSocket, no ports, just works!

## During a Stream

**Start voting:**
- Type `!startpoll` in chat (or manually run the action)

**Viewers vote:**
- They type `!vote 1` through `!vote 16`

**Stop voting:**
- Type `!stoppoll`

**Reset for next race:**
- Type `!resetpoll`

## Need the Control Commands?

See `STREAMERBOT_FILE_SETUP.md` for the !startpoll, !stoppoll, and !resetpoll actions.

## Troubleshooting

**Not seeing votes?**
- Make sure OBS browser source has "Allow access to local files" checked
- Refresh the browser source (right-click → Refresh)
- Check that `C:\GT7-Position-Voting\` folder exists

**Different folder?**
- Edit `overlay-file-based.html` line 268: Change the path
- Edit the C# code: Change `VOTE_FILE` path at the top

## What's Happening Behind the Scenes?

1. Viewer types `!vote 5`
2. Streamerbot catches it
3. C# code writes to `votes.json` file
4. Overlay reads the file every 0.5 seconds
5. Vote appears with animation!

Simple, reliable, no networking required! 🏁
