# GT7 Position Voting System

A live voting system for Gran Turismo 7 races that displays real-time YouTube viewer predictions in OBS.

## Features

- 🏁 Live voting for positions 1-16
- 👥 YouTube profile picture display for voters
- 📊 Animated bar chart visualization with gold highlights
- 🎮 Streamerbot integration for YouTube chat
- 🎥 OBS browser source ready
- ⚡ Updates every second
- 🔄 Auto-reset when poll is cleared
- 🎯 One vote per user (can change vote)

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

### Step 2: Add Overlay to OBS

1. Open **OBS Studio**
2. Add a **Browser** source to your scene
3. **URL**: `http://localhost:8000/overlay-obs.html`
4. **Width**: `1920`
5. **Height**: `1080`
6. Click **OK**

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

### Streamer
- Type `!resetpoll` in chat to clear votes for next race
- Overlay automatically resets without manual OBS refresh
- Results display in real-time as viewers vote

## Documentation

- **OBS Setup Guide**: `OBS_SETUP.md` - Detailed OBS configuration
- **Streamerbot Setup**: `STREAMERBOT_FILE_SETUP.md` - Complete C# code with debug logging
- **Clean Code**: `STREAMERBOT_CLEAN_CODE.md` - Production version without debug logs

## File Structure

```
GT7-Position-Voting/
├── overlay-obs.html          # Main overlay (served via HTTP)
├── START_SERVER.bat           # Python HTTP server launcher
├── OBS_SETUP.md              # OBS setup instructions
├── STREAMERBOT_FILE_SETUP.md # Streamerbot C# code (debug version)
├── STREAMERBOT_CLEAN_CODE.md # Streamerbot C# code (production)
└── votes.js                  # Vote data (created by Streamerbot)
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
| `!resetpoll` | Moderators | Clear all votes for new race |

## License

Free to use and modify for your streams! 🏁
