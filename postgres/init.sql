-- Additional database initialization
CREATE DATABASE django_demo_test;

-- Create additional user if needed
CREATE USER demo_user WITH PASSWORD 'demo123';
GRANT ALL PRIVILEGES ON DATABASE django_demo TO demo_user;
GRANT ALL PRIVILEGES ON DATABASE django_demo_test TO demo_user;