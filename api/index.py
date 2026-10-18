import sys
import os

# Root directory path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app

# Export app for Vercel
app = app
