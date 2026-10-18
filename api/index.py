import sys
import os

# Root directory path add kora holo jate app.py ke thikmoto pawa jay
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app

# Vercel serverless function export
app = app