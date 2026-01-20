@echo off
echo ===================================================
echo   ASSEMBLY TRACKER - VERSION DOWNGRADE REPAIR
echo ===================================================
echo 1. Sunucu islemleri kapatiliyor...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Temizlik Yapiliyor...
rmdir /s /q .next >nul 2>&1
rmdir /s /q node_modules >nul 2>&1
del /f /q package-lock.json >nul 2>&1

echo 3. Next.js v15 (Stabil) Yukleniyor...
echo Next.js 16'daki Windows hatalarindan kacmak icin surum dusuruldu.
call npm install

echo 4. Prisma Client Olusturuluyor...
call npx prisma generate

echo 5. Sunucu Baslatiliyor...
echo ===================================================
call npm run dev:next
pause
