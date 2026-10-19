#!/bin/bash
# ============================================================
#   ONLINE ELECTRICITY BILLING SYSTEM - LOCALHOST LAUNCHER
# ============================================================

echo "============================================================"
echo "  ONLINE ELECTRICITY BILLING SYSTEM - LOCALHOST LAUNCHER"
echo "============================================================"
echo ""
echo "Select execution mode:"
echo "  1) Start Spring Boot Backend with H2 In-Memory DB (Instant, zero MySQL setup)"
echo "  2) Start Spring Boot Backend with MySQL (requires MySQL on port 3306)"
echo "  3) Start React Frontend on port 3000"
echo "  4) Start BOTH Backend (H2) and Frontend concurrently"
echo ""

read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo "Starting Spring Boot with H2 in-memory DB on port 8080..."
    cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2
    ;;
  2)
    echo "Starting Spring Boot with MySQL on port 8080..."
    cd backend && mvn spring-boot:run
    ;;
  3)
    echo "Starting React Frontend on port 3000..."
    npm run dev
    ;;
  4)
    echo "Starting Backend and Frontend concurrently..."
    (cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2) &
    npm run dev
    ;;
  *)
    echo "Invalid option."
    exit 1
    ;;
esac
