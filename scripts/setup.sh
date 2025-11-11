#!/bin/bash

set -e

echo "🚀 Setting up Django React Demo with PostgreSQL and Ngrok..."

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
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production

# Database Configuration
DB_NAME=django_demo
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432
EOF
    echo "⚠️  Please edit .env file and add your Ngrok auth token"
fi

# Install netcat for PostgreSQL health check
echo "📦 Installing dependencies..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y netcat
elif command -v yum &> /dev/null; then
    sudo yum install -y nc
elif command -v brew &> /dev/null; then
    brew install netcat
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres; do
    sleep 5
done

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 30

# Run database migrations
echo "🗃️ Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser (if not already created by entrypoint)
echo "👤 Creating superuser..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
"

echo "✅ Setup complete!"
echo ""
echo "📊 Access your services:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Jenkins:     http://localhost:8080"
echo "   Ngrok UI:    http://localhost:4040"
echo "   PGAdmin:     http://localhost:5050"
echo "   PostgreSQL:  localhost:5432"
echo ""
echo "🔑 Default credentials:"
echo "   Django Admin: admin / admin123"
echo "   PGAdmin:      admin@demo.com / admin123"
echo "   PostgreSQL:   postgres / postgres"
echo ""
echo "🔧 Jenkins initial admin password:"
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword