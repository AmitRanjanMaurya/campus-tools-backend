@echo off
title Student Tools Platform - Development Server
echo.
echo ========================================
echo   Student Tools Platform
echo   Development Environment Setup
echo ========================================
echo.

REM Kill any existing Node.js processes
echo [1/5] Stopping existing processes...
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

REM Clean build cache
echo [2/5] Cleaning build cache...
if exist .next rmdir /s /q .next 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul
if exist .turbo rmdir /s /q .turbo 2>nul

REM Verify Node.js installation
echo [3/5] Verifying Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check dependencies
echo [4/5] Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start development server
echo [5/5] Starting development server...
echo.
echo Server will be available at:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause
