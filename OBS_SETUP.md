# OBS Setup - Simple HTTP Server Method

OBS browser sources can't load local files via file:// URLs due to security restrictions. The solution is to use a simple local web server.

## Quick Setup (2 minutes)

### Step 1: Start the Local Server

1. **Double-click `START_SERVER.bat`** in the `GT7-Position-Voting` folder
2. A black window will appear saying "Starting GT7 Position Voting Server..."
3. **Keep this window open** while streaming
4. The server runs at: `http://localhost:8000`

### Step 2: Add to OBS

1. Open **OBS**
2. Add **Browser** source to your scene
3. **URL**: `http://localhost:8000/overlay-obs.html`
4. Width: `1920`
5. Height: `1080`
6. Click **OK**

That's it! No need to check "Local file" or any special permissions.

## How It Works

- Python's built-in web server serves your HTML files
- The overlay loads from `http://localhost:8000/overlay-obs.html`
- The votes.js file loads from `http://localhost:8000/votes.js`
- Everything updates automatically every 1 second

## Troubleshooting

### "Python is not recognized"

If you get this error, Python isn't installed:

1. Download Python from: https://www.python.org/downloads/
2. **Important**: Check "Add Python to PATH" during installation
3. Restart your computer
4. Run `START_SERVER.bat` again

### Port 8000 is already in use

Change the port number:
1. Edit `START_SERVER.bat`
2. Change `8000` to another number (like `8080`)
3. Update OBS URL to `http://localhost:8080/overlay-obs.html`

### Server stops when I close the window

That's normal - the server needs to run while you're streaming. Minimize the window instead of closing it.

## Alternative: Python Command

If you prefer to run it manually:

```bash
cd C:\GT7-Position-Voting
python -m http.server 8000
```

Then open OBS and use: `http://localhost:8000/overlay-obs.html`

## Stopping the Server

Press **Ctrl+C** in the black window, or just close it when you're done streaming.

---

**Why use a server instead of file:// URLs?**

OBS (and Chromium browsers) block JavaScript from loading local files for security. A local HTTP server bypasses this restriction because everything is served via HTTP, not file://.
