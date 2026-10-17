from flask import Flask, render_template, request, jsonify
import json
import hashlib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "land_records.json"

app = Flask(__name__)

def load_records():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def canonical_hash(record):
    """Demo integrity hash. Not a government signature or proof of ownership."""
    stable = {
        "record_id": record["record_id"],
        "owner_name": record["owner_name"],
        "dag_no": record["dag_no"],
        "khatian_no": record["khatian_no"],
        "land_amount": record["land_amount"],
        "mutation_status": record["mutation_status"],
    }
    raw = json.dumps(stable, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/search")
def search_land():
    query = request.args.get("q", "").strip().casefold()
    if not query:
        return jsonify({"results": [], "message": "Enter a dag number, khatian number, or record ID."})
    records = load_records()
    results = [
        r for r in records
        if query in r["record_id"].casefold()
        or query in r["dag_no"].casefold()
        or query in r["khatian_no"].casefold()
    ]
    # Return only fields used by the citizen portal.
    safe_results = []
    for r in results:
        safe_results.append({
            "record_id": r["record_id"],
            "owner_name": r["owner_name"],
            "dag_no": r["dag_no"],
            "khatian_no": r["khatian_no"],
            "land_amount": r["land_amount"],
            "mutation_status": r["mutation_status"],
            "history": r["history"],
        })
    return jsonify({"results": safe_results, "count": len(safe_results)})

@app.post("/api/verify")
def verify_document():
    payload = request.get_json(silent=True) or {}
    record_id = str(payload.get("record_id", "")).strip().upper()
    submitted_hash = str(payload.get("hash", "")).strip().lower()

    if not record_id or not submitted_hash:
        return jsonify({
            "status": "incomplete",
            "message": "Provide both a demo record ID and its SHA-256 integrity hash."
        }), 400

    records = load_records()
    record = next((r for r in records if r["record_id"].upper() == record_id), None)

    if not record:
        return jsonify({
            "status": "not_found",
            "message": "No matching record exists in this demo database."
        }), 404

    expected_hash = canonical_hash(record)
    if submitted_hash == expected_hash:
        return jsonify({
            "status": "valid_demo_match",
            "message": "The submitted hash matches this demo record.",
            "record_id": record["record_id"],
            "owner_name": record["owner_name"],
            "expected_hash": expected_hash,
            "notice": "Demo-only integrity check. It does not prove legal ownership or government authenticity."
        })

    return jsonify({
        "status": "mismatch",
        "message": "The submitted hash does not match the current demo record.",
        "record_id": record["record_id"],
        "expected_hash": expected_hash,
        "notice": "This indicates a mismatch in the demo data, not definitive proof of fraud."
    })

@app.get("/api/demo-document/<record_id>")
def demo_document(record_id):
    record = next((r for r in load_records() if r["record_id"].upper() == record_id.upper()), None)
    if not record:
        return jsonify({"error": "Demo record not found"}), 404
    return jsonify({
        "record_id": record["record_id"],
        "hash": canonical_hash(record),
        "note": "Sample verification value for this prototype only."
    })

if __name__ == "__main__":
    app.run(debug=True)
