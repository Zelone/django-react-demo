#!/bin/bash

set -e

echo "🚀 Setting up Django React Demo with Ngrok..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Ngrok Auth Token (get from https://dashboard.ngrok.com/get-started/your-authtoken)
NGROK_AUTHTOKEN=your_ngrok_auth_token_here

# Django Secret Key
DJANGO_SECRET_KEY=your-secret-key-here
EOF
    echo "⚠️  Please edit .env file and add your Ngrok auth token"
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗃️ Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@example.com || true

echo "✅ Setup complete!"
echo ""
echo "📊 Access your services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Jenkins:  http://localhost:8080"
echo "   Ngrok UI: http://localhost:4040"
echo ""
echo "🔑 Jenkins initial admin password:"
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
