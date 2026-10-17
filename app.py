from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__, template_folder='templates', static_folder='static')

def load_records():
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'land_records.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading records: {e}")
        return []

# রুট রাউট এবং যেকোনো ফলব্যাক রাউট ফিক্স
@app.route('/')
@app.route('/<path:path>')
def home(path=''):
    return render_template('index.html')

@app.route('/api/search')
def search():
    query = request.args.get('q', '').strip()
    records = load_records()
    if not query:
        return jsonify(records)
    
    filtered = [
        r for r in records 
        if query.lower() in str(r.get('id', '')).lower() 
        or query.lower() in str(r.get('dag_no', '')).lower()
        or query.lower() in str(r.get('khation_no', '')).lower()
    ]
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(debug=True)
    