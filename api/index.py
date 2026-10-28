import sys
import os

# Ensure backend modules can be resolved
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

# Import the configured FastAPI application
try:
    from backend.main import app
except ImportError:
    # If invoked directly in api/ directory
    from main import app
