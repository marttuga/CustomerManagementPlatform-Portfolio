@echo off
title Customer Management Platform
cls

set "PEN_DIR=%~dp0"
set "APP_DIR=%PEN_DIR%app\backend"
set "RCLONE=%PEN_DIR%tools\rclone.exe"
set "RCLONE_CONFIG=%PEN_DIR%tools\rclone.conf"
set "APP_URL=http://localhost:5201"

:: Step 1: Sync from Google Drive
if exist "%RCLONE%" (
    "%RCLONE%" --config="%RCLONE_CONFIG%" copy gdrive:backup/ "%APP_DIR%\database\" --ignore-times --quiet 2>nul
)

:: Step 2: Start .NET server (hidden window)
cd /d "%APP_DIR%"
set ASPNETCORE_ENVIRONMENT=Production

:: Important: kill any old .NET or API process before starting!
taskkill /F /IM "dotnet.exe" > nul 2>&1
taskkill /F /IM "CustomerManagement.Api.exe" > nul 2>&1
timeout /t 1 /nobreak > nul

:: Start server completely hidden - no black window visible to the client
powershell -WindowStyle Hidden -Command "Start-Process 'CustomerManagement.Api.exe' -WindowStyle Hidden"

:: Show a friendly loading message while server starts
echo.
echo  Starting the application...
echo  Please wait...
echo.

:: Wait up to 30 seconds for the server to be ready
set /a tries=0
:WAIT_LOOP
timeout /t 2 /nobreak > nul
set /a tries+=1
powershell -Command "try { Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" > nul 2>&1
if %ERRORLEVEL% == 0 goto SERVER_READY
if %tries% LSS 15 goto WAIT_LOOP

echo  [Error] The server took too long to start.
echo  Please try again or contact support.
pause
exit

:SERVER_READY
:: Step 3: Open browser
set "EDGE1=%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
set "EDGE3=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
set "CHROME2=%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
set "CHROME3=%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE1%" ( start "" "%EDGE1%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=msedge" & goto MONITOR )
if exist "%EDGE2%" ( start "" "%EDGE2%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=msedge" & goto MONITOR )
if exist "%EDGE3%" ( start "" "%EDGE3%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=msedge" & goto MONITOR )
if exist "%CHROME%" ( start "" "%CHROME%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=chrome" & goto MONITOR )
if exist "%CHROME2%" ( start "" "%CHROME2%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=chrome" & goto MONITOR )
if exist "%CHROME3%" ( start "" "%CHROME3%" --app="%APP_URL%" --window-size=1400,900 & set "BROWSER_NAME=chrome" & goto MONITOR )

:: Fallback
start "" "%APP_URL%"
set "BROWSER_NAME=fallback"
goto MONITOR

:: Monitor - wait for browser to close
:MONITOR
if "%BROWSER_NAME%"=="fallback" (
    echo  Application opened. Close the browser when done and press any key.
    pause > nul
    goto SHUTDOWN
)

:MONITOR_LOOP
timeout /t 2 /nobreak > nul
tasklist /FI "IMAGENAME eq %BROWSER_NAME%.exe" 2>nul | find /I "%BROWSER_NAME%.exe" > nul
if %ERRORLEVEL% NEQ 0 goto SHUTDOWN
goto MONITOR_LOOP

:: Shutdown and backup
:SHUTDOWN
echo  Saving data...
taskkill /F /IM "CustomerManagement.Api.exe" > nul 2>&1
taskkill /F /IM "dotnet.exe" > nul 2>&1
timeout /t 2 /nobreak > nul

:: Note: no trailing backslash after "database" so the quotes do not break
if exist "%RCLONE%" (
    "%RCLONE%" --config="%RCLONE_CONFIG%" copy "%APP_DIR%\database" gdrive:backup/ --ignore-times --quiet 2>nul
)

echo  Done. You can remove the pen drive.
timeout /t 3 /nobreak > nul
exit