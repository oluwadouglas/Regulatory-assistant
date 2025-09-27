#!/bin/bash

# Print header
echo "====================================="
echo "  Regulatory Report Assistant Setup   "
echo "====================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.8 or higher is required but not installed."
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 16+ is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm (it usually comes with Node.js)"
    exit 1
fi

# Create and activate virtual environment
echo "🚀 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Download spaCy model
echo "🔍 Downloading spaCy language model..."
python -m spacy download en_core_web_sm

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, follow these steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend"
echo "   uvicorn main:app --reload --host 0.0.0.0 --port 5000"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "The application will be available at http://localhost:3000"
echo "API documentation will be available at http://localhost:5000/docs"
echo ""

# Make the script executable
chmod +x setup.sh
