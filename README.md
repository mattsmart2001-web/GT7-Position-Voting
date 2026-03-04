# GT7 Position Voting System

A live voting system for Gran Turismo 7 races that displays real-time YouTube viewer predictions in OBS.

## Features

- 🏁 Live voting for positions 1-16
- 🚦 Starting position display — set your grid slot before the race so viewers have context
- 🎯 Proximity-based scoring — closer guesses earn more points (exact = 5, ±1 = 3, ±2 = 1)
- 👥 YouTube profile picture display for voters
- 📊 Animated bar chart visualization with gold highlights
- 🎮 Streamerbot integration for YouTube chat
- 🎥 OBS browser source ready
- ⚡ Updates every second
- 🔄 Auto-reset when poll is cleared
- 🔁 One vote per user (can change vote)

## Quick Setup (5 minutes!)

### Prerequisites

- **Python** installed (comes with Windows 10/11, or download from [python.org](https://www.python.org/downloads/))
- **Streamerbot** running and connected to YouTube
- **OBS Studio** for streaming

### Step 1: Start the Local Server

1. **Double-click `START_SERVER.bat`** in the `GT7-Position-Voting` folder
2. A window will appear showing: "Starting GT7 Position Voting Server..."
3. **Keep this window open** while streaming
4. The server runs at: `http://localhost:8000`

### Step 2: Add Overlays to OBS

#### Voting Overlay (Main Display)

1. Open **OBS Studio**
2. Add a **Browser** source to your scene
3. **URL**: `http://localhost:8000/overlay-obs.html`
4. **Width**: `1920`
5. **Height**: `1080`
6. Click **OK**

#### Leaderboard Overlay (Optional - Shows Top Predictors)

1. Add another **Browser** source
2. **URL**: `http://localhost:8000/leaderboard-overlay.html`
3. **Width**: `400`
4. **Height**: `600`
5. Position it near your camera or wherever you prefer
6. Click **OK**

### Website Leaderboard Display

Want to show the complete leaderboard on your website? Access the full leaderboard page:

**URL**: `http://localhost:8000/leaderboard-full.html`

This displays:
- ✅ **Complete rankings** - All players, not just top 10
- ✅ **Real-time updates** - Auto-refreshes every 2 seconds
- ✅ **Statistics** - Total players, total predictions, last update time
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Embed-friendly** - Can be embedded in an iframe

**To embed on your website:**
```html
<iframe src="http://localhost:8000/leaderboard-full.html" width="100%" height="800px" frameborder="0"></iframe>
```

**Note**: For public website embedding, you'll need to host the files on a web server accessible from the internet, not just localhost.

### Step 3: Set Up Streamerbot

Create two actions in Streamerbot:

#### Vote Action (!vote)

1. Create **Action**: "GT7 Vote"
2. Add **Trigger**: YouTube → Chat Message → Command: `!vote`
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the code from `STREAMERBOT_FILE_SETUP.md` (or `STREAMERBOT_CLEAN_CODE.md` for production)
5. **Save**

#### Reset Poll Action (!resetpoll)

1. Create **Action**: "GT7 Reset Poll"
2. Add **Trigger**: YouTube → Chat Message → Command: `!resetpoll` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the reset code from `STREAMERBOT_FILE_SETUP.md`
5. **Save**

#### Lock Votes Action (!lockvotes) - Optional

1. Create **Action**: "GT7 Lock Votes"
2. Add **Trigger**: YouTube → Chat Message → Command: `!lockvotes` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the lock code from `STREAMERBOT_FILE_SETUP.md`
5. **Save**

#### Unlock Votes Action (!unlockvotes) - Optional

1. Create **Action**: "GT7 Unlock Votes"
2. Add **Trigger**: YouTube → Chat Message → Command: `!unlockvotes` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the unlock code from `STREAMERBOT_FILE_SETUP.md`
5. **Save**

#### Result Action (!result) - Awards Points to Winners

1. Create **Action**: "GT7 Result"
2. Add **Trigger**: YouTube → Chat Message → Command: `!result` (Moderators only)
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the result code from `STREAMERBOT_FILE_SETUP.md`
5. **Save**

#### Rigged Action (!rigged) - Penalty for Complainers 😄

1. Create **Action**: "GT7 Rigged"
2. Add **Trigger**: YouTube → Chat Message → Command: `!rigged` (Everyone)
3. Add **Sub-Action**: Core → Execute C# Code
4. Paste the rigged code from `STREAMERBOT_CLEAN_CODE.md`
5. **Save**

## How It Works

1. **Streamerbot** captures `!vote [1-16]` commands from YouTube chat
2. **C# code** writes vote data to `C:\GT7-Position-Voting\votes.js`
3. **Python HTTP server** serves the overlay and vote file
4. **OBS overlay** polls for updates every second
5. **Display** auto-updates when new votes come in
6. **!resetpoll** deletes the vote file, overlay auto-clears

## Usage During Stream

### Viewers
- Type `!vote [position]` to predict finish position
- Example: `!vote 5` predicts 5th place
- Can change vote by voting again
- Type `!rigged` to complain... but it'll cost you 1 point 😄
- Points are awarded based on **how close** the guess was:

| Difference | Points |
|---|---|
| Exact match | **5 pts** |
| Off by 1 | **3 pts** |
| Off by 2 | **1 pt** |
| Off by 3+ | 0 pts |

### Streamer
- Press a **Start Position button** on Stream Deck before the race (see `STREAMDECK_STARTPOS_SETUP.md`)
- Type `!lockvotes` to freeze voting (when race starts)
- Press the matching **Result button** on Stream Deck after the race (see `STREAMDECK_SETUP.md`)
- Type `!resetpoll` to clear votes for next race
- Type `!unlockvotes` to allow voting again (optional)
- Overlays automatically update without manual OBS refresh
- Leaderboard persists across streams

## Documentation

- **OBS Setup Guide**: `OBS_SETUP.md` - Detailed OBS configuration
- **Streamerbot Setup**: `STREAMERBOT_FILE_SETUP.md` - Complete C# code with debug logging
- **Clean Code**: `STREAMERBOT_CLEAN_CODE.md` - Production version without debug logs
- **Stream Deck Starting Position**: `STREAMDECK_STARTPOS_SETUP.md` - 16-button start position entry guide
- **Stream Deck Results**: `STREAMDECK_SETUP.md` - 16-button race result entry guide
- **Competition System**: `COMPETITION_SETUP.md` - !enterme command for running competitions

## File Structure

```
GT7-Position-Voting/
├── overlay-obs.html                # Main voting overlay (for OBS)
├── leaderboard-overlay.html        # Top 10 leaderboard (for OBS)
├── leaderboard-full.html           # Complete leaderboard (for website)
├── START_SERVER.bat                # Python HTTP server launcher
├── OBS_SETUP.md                    # OBS setup instructions
├── STREAMDECK_STARTPOS_SETUP.md    # Stream Deck 16-button start position guide
├── STREAMDECK_SETUP.md             # Stream Deck 16-button race result guide
├── STREAMERBOT_FILE_SETUP.md       # Streamerbot C# code (debug version)
├── STREAMERBOT_CLEAN_CODE.md       # Streamerbot C# code (production)
├── votes.js                        # Vote data (created by Streamerbot)
├── startpos.js                     # Starting position (created by Stream Deck button)
└── leaderboard.js                  # Persistent leaderboard data
```

## Troubleshooting

### Python not recognized
- Download Python from [python.org](https://www.python.org/downloads/)
- Check "Add Python to PATH" during installation
- Restart your computer

### Votes not showing in OBS
- Make sure `START_SERVER.bat` is running
- Check OBS URL is exactly: `http://localhost:8000/overlay-obs.html`
- Refresh the browser source in OBS

### !vote command not working
- Check the Streamerbot action is enabled
- Verify you're live on YouTube
- Check Streamerbot logs for errors

### Port 8000 already in use
- Edit `START_SERVER.bat` and change `8000` to another port (e.g., `8080`)
- Update OBS URL to match new port: `http://localhost:8080/overlay-obs.html`

## Customization

The overlay is fully customizable! Edit `overlay-obs.html` to:
- Change colors and styling (CSS section)
- Modify title text
- Adjust animation speeds
- Change bar heights and spacing

## Commands

| Command | Who Can Use | What It Does |
|---------|-------------|--------------|
| `!vote [1-16]` | Everyone | Vote for finishing position |
| `!rigged` | Everyone | Complain it's rigged — lose 1 point 😄 |
| `!lockvotes` | Moderators | Freeze voting (no more changes) |
| `!result [position]` | Moderators | Award proximity points after race (e.g., `!result 3`) |
| `!resetpoll` | Moderators | Clear all votes for new race |
| `!unlockvotes` | Moderators | Allow voting again |

**Stream Deck buttons** (no chat commands needed):
- **Start Position P1–P16**: Set grid position before race → announces in chat + shows on overlay
- **Result P1–P16**: Award points after race → announces point tiers in chat

## License

Free to use and modify for your streams! 🏁
