@echo off
echo Starting GT7 Position Voting Server...
echo.
echo Open OBS and use this URL in your Browser Source:
echo http://localhost:8000/overlay-obs.html
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "C:\GT7-Position-Voting"
python -m http.server 8000
