#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install frontend dependencies and build React app
if command -v npm &> /dev/null
then
    echo "Installing frontend dependencies..."
    npm install
    echo "Building frontend React app..."
    npm run build
else
    echo "Warning: npm is not installed. Skipping frontend compilation."
fi
