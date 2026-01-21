#!/bin/bash

# AI Marketing Copy Generator - Startup Script
# This script sets up and starts the entire application

set -e

echo "============================================"
echo "   AI Marketing Copy Generator Startup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Clean up used ports
print_status "Cleaning up ports 3000 and 3001..."

# Force kill all processes on port 3000 (frontend)
for pid in $(lsof -ti:3000 2>/dev/null); do
    print_warning "Killing process $pid on port 3000..."
    kill -9 $pid 2>/dev/null || true
done

# Force kill all processes on port 3001 (backend)
for pid in $(lsof -ti:3001 2>/dev/null); do
    print_warning "Killing process $pid on port 3001..."
    kill -9 $pid 2>/dev/null || true
done

sleep 2
print_success "Ports cleaned up"

# Step 2: Check if PostgreSQL is running
print_status "Checking PostgreSQL..."

if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        print_success "PostgreSQL is running"
    else
        print_warning "PostgreSQL is not running. Attempting to start..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew services start postgresql 2>/dev/null || brew services start postgresql@14 2>/dev/null || true
        else
            # Linux
            sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || true
        fi
        sleep 2
    fi
else
    print_warning "pg_isready not found. Please ensure PostgreSQL is installed and running."
fi

# Step 3: Create database if it doesn't exist
print_status "Setting up database..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_NAME=${DB_NAME:-ai_marketing_db}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Try to create database (ignore error if it exists)
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
print_success "Database ready"

# Step 4: Install backend dependencies
print_status "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --silent
print_success "Backend dependencies installed"

# Step 5: Run database seed
print_status "Seeding database with sample data..."
npm run seed
print_success "Database seeded with 15+ items for each feature"

# Step 6: Install frontend dependencies
print_status "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
print_success "Frontend dependencies installed"

# Step 7: Start the application
cd "$SCRIPT_DIR"

print_status "Starting backend server on port 3001..."
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!

print_status "Waiting for backend to start..."
sleep 3

print_status "Starting frontend server on port 3000..."
cd "$SCRIPT_DIR/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "============================================"
print_success "Application started successfully!"
echo "============================================"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
echo ""
echo -e "${YELLOW}Demo Credentials:${NC}"
echo "  Email:    demo@aimarketing.com"
echo "  Password: demo123"
echo ""
echo -e "${YELLOW}Note:${NC} Add your OpenRouter API key to .env file for AI features"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
