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
        or query in r["owner_name"].casefold()
    ]
    
    return jsonify({"results": results, "count": len(results)})