"""
MENTORA BACKEND CONFIGURATION
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
root_dir = Path(__file__).resolve().parent.parent.parent
env_path = root_dir / ".env"
load_dotenv(dotenv_path=env_path)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
