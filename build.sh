#!/bin/bash
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p templates

echo "Build completed successfully!"