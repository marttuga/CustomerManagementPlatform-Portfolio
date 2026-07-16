@echo off
title Prepare Pen Drive - Customer Management Platform
color 0B
cls

echo.
echo ================================================
echo  BUILD FOR USB PEN DRIVE
echo  Customer Management Platform
echo ================================================
echo.
echo  This script prepares all files to be copied
echo  to the client's USB pen drive.
echo.
echo  Requirements:
echo     - .NET 9 SDK installed
echo     - Node.js 18+ installed
echo     - Angular CLI 16 installed (npm install -g @angular/cli@16)
echo.
pause

set "SCRIPT_DIR=%~dp0"
set "OUTPUT_DIR=%SCRIPT_DIR%pen_output"
set "BACKEND_DIR=%SCRIPT_DIR%backend\CustomerManagement.Api"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend\customer-management-frontend"

:: --- Clean output folder -----------------------------------------------------
echo.
echo [1/5] Cleaning output folder...
if exist "%OUTPUT_DIR%" rmdir /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\app\backend"
mkdir "%OUTPUT_DIR%\app\backend\database"
mkdir "%OUTPUT_DIR%\tools"

:: --- Build Angular -----------------------------------------------------------
echo.
echo [2/5] Building the frontend (Angular)...
cd /d "%FRONTEND_DIR%"
call npm install
call ng build --configuration production --output-path "%BACKEND_DIR%\wwwroot"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Angular build failed!
    pause
    exit /b 1
)
echo Frontend built successfully.

:: --- Build .NET self-contained -----------------------------------------------
echo.
echo [3/5] Building the backend (.NET self-contained)...
cd /d "%BACKEND_DIR%"
dotnet publish -c Release -r win-x64 --self-contained true ^
    -p:PublishSingleFile=false ^
    -o "%OUTPUT_DIR%\app\backend"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: .NET build failed!
    pause
    exit /b 1
)
echo Backend built successfully.

:: --- Copy database folder (empty, just the folder) ---------------------------
echo.
echo [4/5] Preparing data structure...
if not exist "%OUTPUT_DIR%\app\backend\database\" (
    mkdir "%OUTPUT_DIR%\app\backend\database"
)

:: --- Copy bat and tools -------------------------------------------------------
echo.
echo [5/5] Copying startup files...
copy "%SCRIPT_DIR%deploy\Open App.bat" "%OUTPUT_DIR%\Open App.bat"
copy "%SCRIPT_DIR%deploy\INSTRUCTIONS.txt" "%OUTPUT_DIR%\INSTRUCTIONS.txt"

if exist "%SCRIPT_DIR%deploy\tools\rclone.exe" (
    copy "%SCRIPT_DIR%deploy\tools\rclone.exe" "%OUTPUT_DIR%\tools\rclone.exe"
    copy "%SCRIPT_DIR%deploy\tools\rclone.conf" "%OUTPUT_DIR%\tools\rclone.conf"
)

:: --- Done & Auto-Copy to PEN -------------------------------------------------
echo.
echo ================================================
echo  BUILD COMPLETE!
echo ================================================
echo.
echo [AUTOMATION] Starting direct transfer to the pen drive (D:)...
echo.

:: 1. Startup files at the root of D:
echo - Updating the startup file at the root of the pen drive...
robocopy "%OUTPUT_DIR%" "D:" "Open App.bat" "INSTRUCTIONS.txt" /R:1 /W:1

echo.
:: 2. Update Frontend and Backend in D:\app\backend (strictly ignoring the database)
echo - Transferring the frontend (wwwroot) and new executables to the pen drive...
echo   (The 'database' folder with your real clients is protected and will not be touched!)
echo.
robocopy "%OUTPUT_DIR%\app\backend" "D:\app\backend" /E /XD "database" /R:1 /W:1

echo.
echo ================================================
echo  PEN DRIVE UPDATED SUCCESSFULLY!
echo  You can close this terminal and open the app on the pen drive.
echo ================================================
echo.
pause