@echo off
title Traffic Analytics Platform — Setup
color 0A

echo.
echo  ============================================================
echo   Traffic Analytics Platform — First-Run Setup
echo  ============================================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js is not installed or not in PATH.
  echo  Please install Node.js from https://nodejs.org (v18 or newer)
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo  [OK] Node.js %NODE_VERSION% found.
echo.

:: Copy .env if it doesn't exist
if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo  [OK] Created .env from .env.example
    echo  [!]  IMPORTANT: Edit .env to set your JWT_SECRET and ADMIN_PASSWORD
    echo.
  )
) else (
  echo  [OK] .env already exists.
)

:: Install npm dependencies
echo  Installing npm packages (this may take a minute)...
echo.
npm install
if %errorlevel% neq 0 (
  echo.
  echo  [ERROR] npm install failed. Check your internet connection.
  pause
  exit /b 1
)

echo.
echo  ============================================================
echo   Setup Complete!
echo  ============================================================
echo.
echo   To start the server, run:   npm start
echo   Then open:                  http://localhost:3000/dashboard
echo.
echo   Default login:
echo     Username: admin
echo     Password: admin123
echo.
echo   !! Change your password after first login !!
echo.
pause
