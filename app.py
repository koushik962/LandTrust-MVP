import os
import json

def load_records():
    # Absolute path check for Vercel deployment
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "data", "land_records.json")
    
    if not os.path.exists(file_path):
        # Fallback to relative path if absolute fails
        file_path = "data/land_records.json"
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return []