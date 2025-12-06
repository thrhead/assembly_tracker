@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starting Expo...
cd /d "%~dp0..\mobile"
call npx expo start --web