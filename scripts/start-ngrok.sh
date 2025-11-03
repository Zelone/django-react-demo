#!/bin/bash

# Start ngrok separately
docker-compose up -d ngrok

echo "🌐 Ngrok started! Check tunnels at: http://localhost:4040"
echo ""
echo "Your public URLs will be available at:"
echo "  http://localhost:4040/status"
