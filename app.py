from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import json

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'landtrust_super_secret_admin_key'

# Admin Credentials
ADMIN_USER = "admin"
ADMIN_PASS = "landtrust2026"

def load_records():
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'land_records.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading records: {e}")
        return []

def save_records(records):
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'land_records.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    message = ""
    if request.method == 'POST':
        action = request.form.get('action')
        
        # Login Handler
        if action == 'login':
            username = request.form.get('username')
            password = request.form.get('password')
            if username == ADMIN_USER and password == ADMIN_PASS:
                session['admin_logged_in'] = True
                return redirect(url_for('admin'))
            else:
                message = "❌ ভুল ইউজারনেম বা পাসওয়ার্ড!"
                
        # Add Land Record Handler
        elif action == 'add_land' and session.get('admin_logged_in'):
            records = load_records()
            new_record = {
                "id": request.form.get('id'),
                "dag_no": request.form.get('dag_no'),
                "khation_no": request.form.get('khation_no'),
                "owner_name": request.form.get('owner_name'),
                "nid_number": request.form.get('nid_number'),
                "land_area_decimal": request.form.get('land_area_decimal'),
                "location_address": request.form.get('location_address'),
                "verification_status": "যাচাইকৃত",
                "coordinates": {
                    "lat": float(request.form.get('lat', 23.8103)),
                    "lng": float(request.form.get('lng', 90.4125))
                },
                "buyer_risk_report": {
                    "risk_level": request.form.get('risk_level', 'Low'),
                    "nid_verified": True,
                    "criminal_record_found": request.form.get('criminal_record') == 'yes',
                    "court_dispute": request.form.get('court_dispute') == 'yes',
                    "buying_recommendation": request.form.get('recommendation', 'জমির রেকর্ড সঠিক পাওয়া গেছে।')
                }
            }
            records.append(new_record)
            save_records(records)
            message = "✅ নতুন জমির তথ্য সফলভাবে যুক্ত হয়েছে!"

    logged_in = session.get('admin_logged_in', False)
    return render_template('admin.html', logged_in=logged_in, message=message)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin'))

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
        
        if query in rec_id or query in dag or query in khation or query in owner:
            filtered.append(r)
            
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(debug=True)
    