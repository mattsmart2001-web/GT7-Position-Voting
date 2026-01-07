# GT7 Position Voting System

A live voting system for Gran Turismo 7 races that displays real-time YouTube viewer predictions in OBS.

## Features

- 🏁 Live voting for positions 1-16
- 👥 Google avatar display for voters
- 📊 Animated bar chart visualization
- 🎮 Streamerbot integration
- 🎥 OBS browser source ready
- ⚡ Real-time updates via WebSocket

## Setup

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
