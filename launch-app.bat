@echo off
title CodePulse — CP Contest Tracker App Launcher
echo Starting CodePulse App Server...
cd /d "%~dp0"
start /min cmd /c "node server.js"
timeout /t 2 /nobreak >nul
echo Launching CodePulse Standalone App Window...
start "" "chrome.exe" --app=http://localhost:5000 || start "" "msedge.exe" --app=http://localhost:5000 || start http://localhost:5000
exit
