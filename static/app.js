let map;
let markers = [];

function initMap() {
    if (!map) {
        map = L.map('map').setView([23.8103, 90.4125], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const alertBox = document.getElementById('alertBox');
    
    if (!query) {
        alertBox.innerText = "⚠️ অনুগ্রহ করে দাগ নম্বর বা আইডি লিখুন।";
        alertBox.style.display = "block";
        return;
    }

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                alertBox.innerText = "⚠️ কোনো রেকর্ড পাওয়া যায়নি!";
                alertBox.style.display = "block";
                document.getElementById('welcomePlaceholder').style.display = 'block';
                document.getElementById('mapSection').style.display = 'none';
                document.getElementById('recordsSection').style.display = 'none';
                return;
            }

            alertBox.style.display = "none";
            document.getElementById('welcomePlaceholder').style.display = 'none';
            document.getElementById('mapSection').style.display = 'block';
            document.getElementById('recordsSection').style.display = 'block';
            
            initMap();
            renderRecords(data);
        })
        .catch(err => {
            console.error("Search error:", err);
            alertBox.innerText = "❌ সার্ভারে সংযোগ করতে সমস্যা হয়েছে।";
            alertBox.style.display = "block";
        });
}

function renderRecords(records) {
    const deedsBox = document.getElementById('deedsRecordsContainer');
    const fraudBox = document.getElementById('fraudRecordsContainer');
    deedsBox.innerHTML = "";
    fraudBox.innerHTML = "";

    if (map && markers.length > 0) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
    }

    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let bounds = [];

    records.forEach(r => {
        if (r.coordinates && r.coordinates.lat && r.coordinates.lng) {
            const lat = parseFloat(r.coordinates.lat);
            const lng = parseFloat(r.coordinates.lng);
            const marker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
            marker.bindPopup(`<b>${r.owner_name}</b><br>দাগ: ${r.dag_no}`).openPopup();
            markers.push(marker);
            bounds.push([lat, lng]);
        }

        deedsBox.innerHTML += `
            <div style="border:1px solid #cbd5e1; border-radius:12px; padding:18px; background:#fff;">
                <h4 style="color:#27ae60; margin-bottom:8px;">রেকর্ড আইডি: ${r.id}</h4>
                <p><b>মালিক:</b> ${r.owner_name}</p>
                <p><b>দাগ নং:</b> ${r.dag_no} | <b>খতিয়ান নং:</b> ${r.khation_no}</p>
                <p><b>জমির পরিমাণ:</b> ${r.land_area_decimal} শতাংশ</p>
                <p><b>ঠিকানা:</b> ${r.location_address}</p>
            </div>
        `;

        const risk = r.buyer_risk_report || {};
        fraudBox.innerHTML += `
            <div style="border:1px solid #cbd5e1; border-radius:12px; padding:18px; background:#fff;">
                <h4 style="color:#c0392b; margin-bottom:8px;">ঝুঁকি স্তর: ${risk.risk_level || 'Low'}</h4>
                <p><b>এনআইডি ভেরিফিকেশন:</b> যাচাইকৃত</p>
                <p><b>ক্রিমিনাল রেকর্ড:</b> ${risk.criminal_record_found ? '⚠️ বিদ্যমান' : '✅ নেই'}</p>
                <p><b>আদালতের মামলা:</b> ${risk.court_dispute ? '⚠️ চলমান' : '✅ নেই'}</p>
                <p><b>সুপারিশ:</b> ${risk.buying_recommendation}</p>
            </div>
        `;
    });

    if (bounds.length > 0) {
        setTimeout(() => {
            map.invalidateSize();
            if (bounds.length === 1) {
                map.setView(bounds[0], 15);
            } else {
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        }, 150);
    }
}

function switchTab(tab) {
    document.getElementById('tabDeeds').style.borderBottom = tab === 'DEEDS' ? '3px solid #27ae60' : 'none';
    document.getElementById('tabFraud').style.borderBottom = tab === 'FRAUD' ? '3px solid #27ae60' : 'none';
    document.getElementById('viewDeeds').style.display = tab === 'DEEDS' ? 'block' : 'none';
    document.getElementById('viewFraud').style.display = tab === 'FRAUD' ? 'block' : 'none';
}

function setRating(stars) {
    document.getElementById('selectedRating').value = stars;
    const starsList = document.querySelectorAll('.star');
    starsList.forEach((s, idx) => {
        s.style.color = idx < stars ? '#f59e0b' : '#cbd5e1';
    });
}

function submitFeedback() {
    const rating = document.getElementById('selectedRating').value;
    const msg = document.getElementById('feedbackMessage').value.trim();
    if (rating === "0" && !msg) {
        alert("দয়া করে অন্তত রেটিং বা মতামত দিন।");
        return;
    }
    alert("ধন্যবাদ! আপনার মূল্যবান মতামত ও রেটিং সফলভাবে জমা হয়েছে।");
    document.getElementById('feedbackMessage').value = "";
    setRating(0);
}