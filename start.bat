@echo off
echo ========================================================
echo   Starting Collabsight Technologies AV CRM Web App
echo ========================================================
echo.
echo Starting Express API Server on http://localhost:5000 ...
start "Collabsight CRM Server" cmd /c "cd server && npm start"

timeout /t 2 /nobreak >nul

echo Starting React + Vite Client on http://localhost:5173 ...
start "Collabsight CRM Client" cmd /c "cd client && npm run dev"

echo.
echo Both services are booting!
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:5000/api
echo.
pause
