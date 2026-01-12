@echo off
echo ========================================
echo Starting MITS Result System
echo ========================================
echo.

echo Starting Backend Server...
start "MITS Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "MITS Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq MITS Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq MITS Frontend*" /T /F >nul 2>&1

echo.
echo All servers stopped.
