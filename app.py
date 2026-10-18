from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__, template_folder='templates', static_folder='static')

def load_records():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, 'data', 'land_records.json')
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading records: {e}")
        return []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/search')
def search():
    query = request.args.get('q', '').strip().lower()
    records = load_records()
    
    if not query:
        return jsonify([])
    
    filtered = []
    for r in records:
        rec_id = str(r.get('id', '')).lower()
        dag = str(r.get('dag_no', '')).lower()
        khation = str(r.get('khation_no', '')).lower()
        owner = str(r.get('owner_name', '')).lower()
        
        # ২০টি রেকর্ডের যেকোনা সংকেত (p2, p5, 101, 102 বা নাম) মিললেই ফিল্টার হবে
        if query in rec_id or query in dag or query in khation or query in owner:
            filtered.append(r)
            
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(debug=True)