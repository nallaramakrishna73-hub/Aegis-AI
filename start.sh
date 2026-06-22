#!/bin/bash

# Aegis-AI Quick Start Script

echo "🛡️ Aegis-AI - Cybersecurity Assistant"
echo "======================================"
echo ""

# Check if both services need to be started
read -p "Start both backend and frontend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Starting Aegis-AI backend..."
    cd /home/kali/aegis-ai/backed
    npm run dev &
    BACKEND_PID=$!
    
    sleep 3
    
    echo "Starting Aegis-AI frontend..."
    cd /home/kali/aegis-ai/frontend
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Services started!"
    echo "   Backend:  http://localhost:4000"
    echo "   Frontend: http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop both services"
    
    wait $BACKEND_PID $FRONTEND_PID
else
    echo "Select service to start:"
    echo "1. Backend (port 4000)"
    echo "2. Frontend (port 5173)"
    read -p "Choice (1/2): " choice
    
    if [ "$choice" = "1" ]
    then
        cd /home/kali/aegis-ai/backed
        npm run dev
    elif [ "$choice" = "2" ]
    then
        cd /home/kali/aegis-ai/frontend
        npm run dev
    fi
fi
