@echo off
cd mobile
echo Starting Ngrok for Backend (Port 3000)...
echo Copy the https URL (e.g. https://xxxx.ngrok-free.app) and paste it into mobile/src/services/api.js
ngrok.exe http 3000
