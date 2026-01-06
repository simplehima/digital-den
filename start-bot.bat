@echo off
echo ========================================
echo   Starting Hima The Musician Bot
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Display timestamp
echo Starting bot at %date% %time%
echo.

REM Start the bot
node index.js

REM If the bot crashes, this will be shown
echo.
echo ========================================
echo   Bot has stopped
echo ========================================
pause
