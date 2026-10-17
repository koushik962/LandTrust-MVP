@app.get("/api/search")
def search_land():
    query = request.args.get("q", "").strip().casefold()
    if not query:
        return jsonify({"results": [], "count": 0})
    
    records = load_records()
    results = []
    
    for r in records:
        # Check against record_id, dag_no, khatian_no, and owner_name safely
        if (query in str(r.get("record_id", "")).casefold() or
            query in str(r.get("dag_no", "")).casefold() or
            query in str(r.get("khatian_no", "")).casefold() or
            query in str(r.get("owner_name", "")).casefold()):
            results.append(r)
            
    return jsonify({"results": results, "count": len(results)})