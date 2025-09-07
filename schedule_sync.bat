@echo off
REM Windows Batch Script for Scheduling ESPN Data Sync
REM
REM This script can be scheduled using Windows Task Scheduler
REM to run the ESP sync process automatically
REM
REM Setup Instructions:
REM 1. Open Windows Task Scheduler
REM 2. Create a new task
REM 3. Set the program to run: schedule_sync.bat
REM 4. Set the working directory to the project root
REM 5. Schedule to run daily during off-peak hours (e.g., 6 AM weekdays)

echo ========================================
echo ESPN NBA Stats Sync - Scheduled Run
echo %DATE% %TIME%
echo ========================================

REM Change to the project directory
cd /d "%~dp0"

REM Activate Python virtual environment if using one
REM Uncomment and modify the line below if you have a virtual environment
REM call path\to\your\venv\Scripts\activate.bat

REM Run the sync process
echo Running ESPN data synchronization...
python sync_espn_data.py

REM Check the result
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo Sync completed successfully
    echo ========================================
) else (
    echo ========================================
    echo ERROR: Sync failed with exit code %ERRORLEVEL%
    echo ========================================
    REM You can add email notification here using tools like sendmail or PowerShell
    REM Example: powershell -ExecutionPolicy Bypass -File send_notification.ps1
)

REM Log the completion time
echo Sync process finished at %DATE% %TIME%
echo.

pause