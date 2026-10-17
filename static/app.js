let map;
let markers = [];
let currentLang = 'bn';
let allRecords = [];

const translations = {
    bn: {
        appTitle: "ল্যান্ডট্রাস্ট সিটিজেন পোর্টাল",
        appSubtitle: "নিরাপদ জমি লেনদেন ও ডিজিটাল খতিয়ান সত্যতা যাচাই প্ল্যাটফর্ম",
        langBtnText: "English",
        searchPlaceholder: "দাগ, খতিয়ান, মালিকের নাম বা রেকর্ড আইডি লিখুন (যেমন: P2, P5, 101, 105)...",
        searchBtn: "🔍 অনুসন্ধান করুন",
        searchHint: "💡 টিপস: আপনি সরাসরি দাগ নম্বর, খতিয়ান বা রেকর্ড আইডি দিয়ে সার্চ করতে পারেন।",
        mapCardTitle: "🗺️ ভূমির ভৌগোলিক মানচিত্র (GIS Map)",
        resultsCardTitle: "📋 ভূমির বিবরণ ও রেকর্ডসমূহ",
        recordCount: "টি রেকর্ড প্রদর্শিত",
        footerText: "© ২০২৬ LandTrust Ecosystem | স্মার্ট বাংলাদেশ স্মার্ট ভূমি সেবা",
        noResult: "⚠️ কোনো তথ্য পাওয়া যায়নি! অন্য দাগ বা আইডি দিয়ে চেষ্টা করুন।",
        owner: "মালিক:",
        dag: "দাগ নম্বর:",
        khation: "খতিয়ান নম্বর:",
        area: "জমির পরিমাণ:",
        status: "স্ট্যাটাস:",
        risk: "ঝুঁকি:"
    },
    en: {
        appTitle: "LandTrust Citizen Portal",
        appSubtitle: "Secure Land Transaction & Digital Record Verification Platform",
        langBtnText: "বাংলা",
        searchPlaceholder: "Enter Dag, Khatian, Owner Name or Record ID (e.g., P2, P5, 101)...",
        searchBtn: "🔍 Search Record",
        searchHint: "💡 Tip: You can search directly by Dag No, Khatian or Record ID.",
        mapCardTitle: "🗺️ GIS Land Location Map",
        resultsCardTitle: "📋 Land Details & Records",
        recordCount: "Records Displayed",
        footerText: "© 2026 LandTrust Ecosystem | Smart Bangladesh Land Services",
        noResult: "⚠️ No records found! Please try another Dag or ID.",
        owner: "Owner:",
        dag: "Dag No:",
        khation: "Khatian No:",
        area: "Area:",
        status: "Status:",
        risk: "Risk:"
    }
};

document.addEventListener("DOMContentLoaded", function () {
    initMap();
    loadDefaultRecords();
});

function initMap() {
    map = L.map('map').setView([23.8103, 90.4125], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function toggleLanguage() {
    currentLang = currentLang === 'bn' ? 'en' : 'bn';
    const t = translations[currentLang];

    document.getElementById('appTitle').innerText = t.appTitle;
    document.getElementById('appSubtitle').innerText = t.appSubtitle;
    document.getElementById('langBtnText').innerText = t.langBtnText;
    document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    document.getElementById('searchBtn').innerText = t.searchBtn;
    document.getElementById('searchHint').innerText = t.searchHint;
    document.getElementById('mapCardTitle').innerText = t.mapCardTitle;
    document.getElementById('resultsCardTitle').innerText = t.resultsCardTitle;
    document.getElementById('footerText').innerText = t.footerText;

    renderRecords(allRecords);
}

function loadDefaultRecords() {
    // P2 (LT-BD-2026-002) and P5 (LT-BD-2026-005) or all records initially
    fetch('/api/search')
        .then(res => res.json())
        .then(data => {
            // Filter initially for P2 and P5 if exist, or load first few records
            let defaultData = data.filter(r => 
                String(r.id).toLowerCase().includes('002') || 
                String(r.id).toLowerCase().includes('005') ||
                String(r.id).toLowerCase().includes('p2') || 
                String(r.id).toLowerCase().includes('p5')
            );
            
            if (defaultData.length === 0) {
                defaultData = data.slice(0, 5); // Fallback to first 5
            }

            allRecords = defaultData;
            renderRecords(allRecords);
        })
        .catch(err => console.error("Error loading initial data:", err));
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            allRecords = data;
            renderRecords(allRecords);
        });
}

function renderRecords(records) {
    const container = document.getElementById('resultsContainer');
    const alertBox = document.getElementById('alertBox');
    const countBadge = document.getElementById('recordCount');
    const t = translations[currentLang];

    // Clear map markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    container.innerHTML = "";

    if (records.length === 0) {
        alertBox.innerText = t.noResult;
        alertBox.style.display = "block";
        countBadge.innerText = `0 ${t.recordCount}`;
        return;
    }

    alertBox.style.display = "none";
    countBadge.innerText = `${records.length} ${t.recordCount}`;

    let bounds = [];

    records.forEach(r => {
        // Build Record HTML Card
        const item = document.createElement('div');
        item.className = 'record-item';
        
        const riskClass = (r.buyer_risk_report && r.buyer_risk_report.risk_level === 'High') ? 'risk-high' : 
                          (r.buyer_risk_report && r.buyer_risk_report.risk_level === 'Medium') ? 'risk-med' : 'risk-low';

        item.innerHTML = `
            <div class="record-header">
                <span class="record-id">🆔 ${r.id}</span>
                <span class="risk-badge ${riskClass}">${t.risk} ${r.buyer_risk_report ? r.buyer_risk_report.risk_level : 'Low'}</span>
            </div>
            <div class="record-details">
                <p><strong>${t.owner}</strong> ${r.owner_name}</p>
                <p><strong>${t.dag}</strong> ${r.dag_no} | <strong>${t.khation}</strong> ${r.khation_no}</p>
                <p><strong>${t.area}</strong> ${r.land_area_decimal || 'N/A'} শতাংশ</p>
                <p><strong>${t.status}</strong> ${r.verification_status || 'যাচাইকৃত'}</p>
            </div>
        `;
        container.appendChild(item);

        // Add Marker to Map if coordinates exist
        if (r.coordinates && r.coordinates.lat && r.coordinates.lng) {
            const marker = L.marker([r.coordinates.lat, r.coordinates.lng]).addTo(map);
            marker.bindPopup(`<b>${r.owner_name}</b><br>${t.dag} ${r.dag_no}<br>ID: ${r.id}`);
            markers.push(marker);
            bounds.push([r.coordinates.lat, r.coordinates.lng]);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}
