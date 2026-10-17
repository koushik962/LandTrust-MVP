import os
import json

def load_records():
    # Vercel-এর জন্য absolute path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "data", "land_records.json")
    
    if not os.path.exists(file_path):
        file_path = "data/land_records.json"
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return []