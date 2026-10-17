import os
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def load_records():
    # JSON ফাইলের সঠিক পাথ
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'land_records.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading records: {e}")
        return []