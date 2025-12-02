@echo off
cd mobile
echo Starting Expo in Tunnel Mode...
echo Make sure you have updated mobile/src/services/api.js with your backend Ngrok URL!
call npx expo start --tunnel
