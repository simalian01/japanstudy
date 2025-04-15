@echo off
echo Killing existing live-server processes...
taskkill /F /IM node.exe /T > nul 2>&1
echo Starting live-server in src directory...
cd src
start "Live Server" live-server
echo Server started. Check your browser.
pause