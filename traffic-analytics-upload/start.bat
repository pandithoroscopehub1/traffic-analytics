@echo off
title Traffic Analytics Platform
color 0A

echo.
echo  ============================================================
echo   Traffic Analytics Platform — Starting...
echo  ============================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js not found. Run setup.bat first.
  pause
  exit /b 1
)

if not exist node_modules (
  echo  [!] Dependencies not installed. Running npm install...
  npm install
  if %errorlevel% neq 0 (
    echo  [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo  [OK] Created .env with defaults
    echo  [!]  Edit .env to set your JWT_SECRET and ADMIN_PASSWORD
    echo.
  )
)

REM Apply DB migrations if database exists
if exist data\analytics.db (
  echo  Applying database migrations...
  node migrate.js
  echo.
)

echo  Starting server on http://localhost:3000
echo  Dashboard:  http://localhost:3000/dashboard
echo  Health:     http://localhost:3000/health
echo  Press Ctrl+C to stop.
echo.

node server/index.js
