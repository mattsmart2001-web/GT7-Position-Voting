# Quick Start Guide

Get your GT7 Position Voting system up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Server

```bash
npm start
```

You should see:
```
🏁 GT7 Position Voting Server running on port 3000
📊 Overlay: http://localhost:3000/overlay
⚙️  Admin: http://localhost:3000/admin
🔌 WebSocket: ws://localhost:3000
```

## Step 3: Add to OBS

1. Open OBS Studio
2. Add a new **Browser Source**
3. Set URL to: `http://localhost:3000/overlay`
4. Set Width: `1920`
5. Set Height: `1080`
6. Check "Shutdown source when not visible" (optional, saves resources)
7. Click OK

## Step 4: Open Admin Panel

1. Open your browser
2. Go to: `http://localhost:3000/admin`
3. Click "▶️ Start Poll" when ready to begin voting

## Step 5: Set Up Streamerbot (Optional but Recommended)

### Quick Import Method:
1. Open Streamerbot
2. Go to **Import/Export** → **Import**
3. Copy the text from `streamerbot-action.txt`
4. Paste and import
5. Enable the action

### Manual Setup:
See detailed instructions in `STREAMERBOT_SETUP.md`

## Step 6: Test It Out!

### Test from Admin Panel:
1. In the admin panel, scroll to "Test Vote"
2. Enter a username and position (1-16)
3. Click "Submit Test Vote"
4. Watch it appear in the overlay!

### Test from YouTube Chat:
1. Make sure Streamerbot is connected to YouTube
2. Type in chat: `!vote 5`
3. Your vote should appear in real-time!

## That's It! 🎉

You're now ready to use the voting system during your GT7 races!

## Quick Tips

- **Start/Stop Poll**: Use the admin panel to control when voting is active
- **Reset Votes**: Click "Reset All Votes" to clear everything and start fresh
- **Change Votes**: Viewers can vote multiple times; only their latest vote counts
- **Positions**: Voters can choose any position from 1-16

## Troubleshooting

### Overlay not showing in OBS
- Check that the server is running (see terminal)
- Verify the URL is exactly: `http://localhost:3000/overlay`
- Try refreshing the browser source in OBS

### Votes not appearing
- Make sure the poll is started (green "Poll Active" in admin panel)
- Check that Streamerbot action is enabled
- Verify the server URL in Streamerbot code is correct

### Port 3000 already in use
- Stop any other services using port 3000
- Or change the port in `backend/server.js`

## What's Next?

- Read `STREAMERBOT_SETUP.md` for detailed Streamerbot integration
- Check `YOUTUBE_AVATARS.md` to improve avatar quality
- Customize the overlay colors in `public/overlay.html`
- Adjust bar chart animations and styling

## During a Race

1. **Before Race**: Start the poll from admin panel
2. **During Race**: Let viewers vote for first half of race
3. **Mid-Race**: Stop the poll when ready
4. **After Race**: Compare predictions with actual result!
5. **Next Race**: Reset votes and start again

## Commands

- `npm start` - Start the server
- `npm run dev` - Start with auto-reload (requires nodemon)

## Need Help?

Check the full documentation:
- `README.md` - Overview and features
- `STREAMERBOT_SETUP.md` - Detailed Streamerbot guide
- `YOUTUBE_AVATARS.md` - Avatar integration guide

Happy racing! 🏁
