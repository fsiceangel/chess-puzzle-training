@echo off
setlocal
cd /d "%~dp0"

rem One-click launcher: builds the site the first time, then serves it locally
rem and opens it in the browser. Nothing is uploaded and nothing is downloaded.

if not exist "dist\index.html" (
  echo Building Chess Puzzle Training for the first time...
  if not exist "node_modules" call npm install --no-audit --no-fund
  call npm run build
  if errorlevel 1 (
    echo.
    echo Build failed. Make sure Node.js is installed, then run this again.
    pause
    exit /b 1
  )
)

echo Starting Chess Puzzle Training at http://localhost:4173
echo Close this window when you are done playing.
start "" "http://localhost:4173"

rem Always serve on port 4173: saved progress belongs to that address.
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 4173 --directory dist
) else (
  call npm run preview
)

endlocal
