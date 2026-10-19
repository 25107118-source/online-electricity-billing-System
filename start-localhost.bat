@echo off
echo ============================================================
echo   ONLINE ELECTRICITY BILLING SYSTEM - LOCALHOST LAUNCHER
echo ============================================================
echo.
echo Choose an option to start:
echo   1. Start Spring Boot Backend with H2 In-Memory DB (No MySQL required)
echo   2. Start Spring Boot Backend with MySQL (requires MySQL on port 3306)
echo   3. Start React Frontend (port 3000)
echo   4. Start BOTH Backend (H2) and Frontend
echo.

set /p choice="Enter choice (1, 2, 3, or 4): "

if "%choice%"=="1" (
    echo Starting Spring Boot with H2 In-Memory DB...
    cd backend
    mvn spring-boot:run -Dspring-boot.run.profiles=h2
) else if "%choice%"=="2" (
    echo Starting Spring Boot with MySQL...
    cd backend
    mvn spring-boot:run
) else if "%choice%"=="3" (
    echo Starting React Frontend on port 3000...
    npm run dev
) else if "%choice%"=="4" (
    echo Starting Backend in separate window...
    start cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2"
    echo Starting Frontend in current window...
    npm run dev
) else (
    echo Invalid choice.
)

pause
