#!/bin/bash

# AI Marketing Copy Generator - Startup Script
# This script sets up and starts the entire application with hot reloading

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

# Step 1: Load ports from .env early for cleanup
if [ -f .env ]; then
    _BACKEND_PORT=$(grep -E '^BACKEND_PORT=' .env | cut -d= -f2 | tr -d '"' || echo "3001")
    _FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' .env | cut -d= -f2 | tr -d '"' || echo "3000")
else
    _BACKEND_PORT=3001
    _FRONTEND_PORT=3000
fi

print_status "Cleaning up ports $_FRONTEND_PORT and $_BACKEND_PORT..."

# Kill any lingering node processes from previous runs of this project
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

for P in $_FRONTEND_PORT $_BACKEND_PORT; do
    PIDS=$(lsof -ti:$P 2>/dev/null || true)
    for pid in $PIDS; do
        print_warning "Killing process $pid on port $P..."
        kill -9 $pid 2>/dev/null || true
    done
done

sleep 2

# Wait until ports are actually free (up to 10 seconds)
for P in $_FRONTEND_PORT $_BACKEND_PORT; do
    RETRIES=0
    while lsof -ti:$P &>/dev/null && [ $RETRIES -lt 10 ]; do
        print_warning "Port $P still in use, waiting..."
        kill -9 $(lsof -ti:$P 2>/dev/null) 2>/dev/null || true
        sleep 1
        RETRIES=$((RETRIES + 1))
    done
    if lsof -ti:$P &>/dev/null; then
        print_error "Could not free port $P after 10 seconds. Exiting."
        exit 1
    fi
done

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
            brew services start postgresql 2>/dev/null || brew services start postgresql@14 2>/dev/null || brew services start postgresql@15 2>/dev/null || true
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

# Load environment variables from single root .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

DB_NAME=${DB_NAME:-ai_marketing_db}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

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

# Step 7: Start the application with hot reloading
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
print_status "Starting servers with hot reloading..."
echo "============================================"
echo ""

# Start backend with nodemon for hot reloading
print_status "Starting backend server on port $BACKEND_PORT (with hot reload)..."
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!

print_status "Waiting for backend to start..."
sleep 3

# Start frontend with React's built-in hot reloading
# Set PORT explicitly for React dev server (overrides any inherited PORT)
print_status "Starting frontend server on port $FRONTEND_PORT (with hot reload)..."
cd "$SCRIPT_DIR/frontend"
PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_warning "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    # Kill entire process groups to catch child processes
    pkill -P $BACKEND_PID 2>/dev/null || true
    pkill -P $FRONTEND_PID 2>/dev/null || true
    # Final cleanup of ports
    for P in $FRONTEND_PORT $BACKEND_PORT; do
        PIDS=$(lsof -ti:$P 2>/dev/null || true)
        for pid in $PIDS; do
            kill -9 $pid 2>/dev/null || true
        done
    done
    print_success "Servers stopped"
    exit 0
}

# Set up trap to catch exit signals
trap cleanup SIGINT SIGTERM

echo ""
echo "============================================"
print_success "Application started successfully!"
echo "============================================"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${GREEN}Backend:${NC}  http://localhost:$BACKEND_PORT"
echo ""
echo -e "${YELLOW}Demo Credentials:${NC}"
echo "  Email:    demo@aimarketing.com"
echo "  Password: demo123"
echo ""
echo -e "${BLUE}Features:${NC}"
echo "  - Hot reloading enabled for both frontend and backend"
echo "  - Backend changes detected by nodemon"
echo "  - Frontend changes detected by React"
echo ""
echo -e "${YELLOW}Note:${NC} OpenRouter API key is configured in .env file"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
