# GT7 Position Voting System

A live voting system for Gran Turismo 7 races that displays real-time YouTube viewer predictions in OBS.

## Features

- 🏁 Live voting for positions 1-16
- 👥 Google/YouTube avatar display for voters
- 📊 Animated bar chart visualization
- 🎮 Streamerbot integration
- 🎥 OBS browser source ready
- ⚡ Real-time updates

## ⭐ Recommended: File-Based Setup (EASIEST!)

**No server, no ports, no WebSocket configuration needed!**

The **file-based version** is the simplest way to get started:
- **File**: `overlay-file-based.html`
- **Quick Guide**: `QUICKSTART_FILE.md`
- **Detailed Guide**: `STREAMERBOT_FILE_SETUP.md`
- **How it works**: Streamerbot writes votes to a JSON file, overlay reads it every 500ms
- **Setup time**: 3 minutes!

[👉 Start Here: QUICKSTART_FILE.md](QUICKSTART_FILE.md)

## Alternative Setups

### WebSocket-Based (Advanced)
- **File**: `overlay-standalone.html`
- **Guide**: `STREAMERBOT_SIMPLE_SETUP.md`
- Requires finding and configuring Streamerbot WebSocket port
- True real-time updates via WebSocket

### Node.js Server (For Developers)
- **Guide**: `QUICKSTART.md`
- Full-featured backend with REST API
- Admin web panel
- Multiple client support
- Requires Node.js installation

## Quick Setup (File-Based - Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Add OBS Browser Source:
   - URL: `http://localhost:3000/overlay`
   - Width: 1920
   - Height: 1080

4. Open Admin Panel:
   - URL: `http://localhost:3000/admin`

5. Configure Streamerbot:
   - Connect to WebSocket: `ws://localhost:3000`
   - Set up chat command trigger (e.g., !vote 1-16)

## Usage

- Viewers vote with: `!vote [position]` (e.g., `!vote 1`, `!vote 12`)
- Start/stop poll from admin panel
- Poll data persists during race
- Manual control for variable race lengths
