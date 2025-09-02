#!/usr/bin/env python3
"""
Startup script for Hatay Earthquake Damage Assessment API Server
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if FastAPI dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import pydantic
        return True
    except ImportError as e:
        print(f"Missing API dependencies: {e}")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("Installing API server dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        return False

def main():
    print("HATAY EARTHQUAKE API SERVER STARTUP")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("api_server.py"):
        print("Error: api_server.py not found in current directory")
        print("Please run this script from the project root directory")
        return
    
    # Check dependencies
    if not check_dependencies():
        print("📦 Installing missing dependencies...")
        if not install_dependencies():
            print("Failed to install dependencies")
            return
    
    print("Dependencies check passed")
    
    # Check data availability
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    if not os.path.exists(data_dir):
        print(f"Warning: Data directory not found: {data_dir}")
        print("Some API endpoints may not work without the data files")
    else:
        print("Data directory found")
    
    print("\nStarting API Server...")
    print("=" * 50)
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("API ReDoc: http://127.0.0.1:8000/redoc")
    print("Health Check: http://127.0.0.1:8000/health")
    print("Data Info: http://127.0.0.1:8000/data/info")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    # Start the server
    try:
        subprocess.run([sys.executable, "api_server.py"])
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == "__main__":
    main()
