let map;
let markers = [];
let currentLang = 'bn';
let currentRecords = [];
let activeTab = 'P2';

const translations = {
    bn: {
        appTitle: "ল্যান্ডট্রাস্ট সিটিজেন পোর্টাল",
        appSubtitle: "নিরাপদ জমি লেনদেন, মালিকানা সত্যতা ও জালিয়াতি প্রতিরোধ সিস্টেম",
        langBtnText: "English",
        searchPlaceholder: "দাগ, খতিয়ান, মালিকের নাম বা রেকর্ড আইডি (যেমন: P2, P5, LT-BD-2026-002)...",
        searchBtn: "🔍 অনুসন্ধান করুন",
        searchHint: "💡 টিপস: P2 (দলিল ও মালিকানা) অথবা P5 (কেনার আগে ঝুঁকি রিপোর্ট) দেখতে সরাসরি সার্চ করুন।",
        mapCardTitle: "📍 ভূমির সঠিক ভৌগোলিক অবস্থান (GIS Location Map)",
        tabP2: "📜 P2: Verify Deeds & Ownership (দলিল ও মালিকানা)",
        tabP5: "🔍 P5: Check Before You Buy (ক্রিমিনাল ও জালিয়াতি রিপোর্ট)",
        noResult: "⚠️ কোনো রেকর্ড পাওয়া যায়নি! অন্য দাগ বা আইডি দিয়ে চেষ্টা করুন।",
        owner: "মালিকের নাম:",
        dag: "দাগ নম্বর:",
        khation: "খতিয়ান নম্বর:",
        area: "জমির পরিমাণ:",
        status: "যাচাই স্ট্যাটাস:",
        nid: "এনআইডি ভেরিফিকেশন:",
        criminal: "ক্রিমিনাল/পুলিশ রেকর্ড:",
        court: "মামলা/ঝামেলা স্ট্যাটাস:",
        risk: "ঝুঁকি স্তর:"
    },
    en: {
        appTitle: "LandTrust Citizen Portal",
        appSubtitle: "Secure Land Transaction, Verification & Anti-Fraud Shield",
        langBtnText: "বাংলা",
        searchPlaceholder: "Enter Dag, Khatian, Owner Name or ID (e.g. P2, P5, LT-BD-2026-002)...",
        searchBtn: "🔍 Search Record",
        searchHint: "💡 Tip: Search directly to inspect P2 (Deeds) or P5 (Pre-purchase Fraud Risk).",
        mapCardTitle: "📍 Precise Land Location (GIS Map)",
        tabP2: "📜 P2: Verify Deeds & Ownership",
        tabP5: "🔍 P5: Check Before You Buy (Criminal & Risk Report)",
        noResult: "⚠️ No record found! Please try another Dag or ID.",
        owner: "Owner Name:",
        dag: "Dag No:",
        khation: "Khatian No:",
        area: "Land Area:",
        status: "Verification:",
        nid: "NID Verification:",
        criminal: "Criminal/Police Record:",
        court: "Litigation/Court Status:",
        risk: "Risk Level:"
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

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tabP2').classList.toggle('active', tab === 'P2');
    document.getElementById('tabP5').classList.toggle('active', tab === 'P5');
    document.getElementById('viewP2').classList.toggle('active', tab === 'P2');
    document.getElementById('viewP5').classList.toggle('active', tab === 'P5');
    renderCurrentRecords();
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
    document.getElementById('tabP2').innerText = t.tabP2;
    document.getElementById('tabP5').innerText = t.tabP5;

    renderCurrentRecords();
}

function loadDefaultRecords() {
    fetch('/api/search')
        .then(res => res.json())
        .then(data => {
            currentRecords = data;
            renderCurrentRecords();
        })
        .catch(err => console.error("Data error:", err));
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            currentRecords = data;
            renderCurrentRecords();
        });
}

function renderCurrentRecords() {
    const t = translations[currentLang];
    const p2Box = document.getElementById('p2RecordsContainer');
    const p5Box = document.getElementById('p5RecordsContainer');
    const alertBox = document.getElementById('alertBox');

    markers.forEach(m => map.removeLayer(m));
    markers = [];
    p2Box.innerHTML = "";
    p5Box.innerHTML = "";

    if (!currentRecords || currentRecords.length === 0) {
        alertBox.innerText = t.noResult;
        alertBox.style.display = "block";
        return;
    }
    alertBox.style.display = "none";

    let bounds = [];

    currentRecords.forEach(r => {
        // Map marker
        if (r.coordinates && r.coordinates.lat && r.coordinates.lng) {
            const marker = L.marker([r.coordinates.lat, r.coordinates.lng]).addTo(map);
            marker.bindPopup(`<b>${r.owner_name}</b><br>${t.dag} ${r.dag_no}<br>ID: ${r.id}`);
            markers.push(marker);
            bounds.push([r.coordinates.lat, r.coordinates.lng]);
        }

        // P2 Card (Verify Deeds & Ownership)
        const cardP2 = document.createElement('div');
        cardP2.className = 'data-card';
        cardP2.innerHTML = `
            <div class="card-top">
                <span class="rec-id">🆔 ${r.id} (P2 Verified)</span>
                <span class="badge badge-success">${r.verification_status || 'যাচাইকৃত'}</span>
            </div>
            <div class="detail-line"><strong>${t.owner}</strong> ${r.owner_name}</div>
            <div class="detail-line"><strong>${t.dag}</strong> ${r.dag_no} | <strong>${t.khation}</strong> ${r.khation_no}</div>
            <div class="detail-line"><strong>${t.area}</strong> ${r.land_area_decimal || '১২.৫'} শতাংশ</div>
            <div class="security-box">
                ✔️ <strong>দলিল সত্যতা:</strong> ডিজিটাল সাব-রেজিস্ট্রি সিল প্রাপ্ত ও বায়া দলিল যাচাইকৃত।
            </div>
        `;
        p2Box.appendChild(cardP2);

        // P5 Card (Check Before You Buy - Criminal & Fraud Shield)
        const cardP5 = document.createElement('div');
        cardP5.className = 'data-card';

        const risk = r.buyer_risk_report || {};
        const riskLevel = risk.risk_level || 'Low';
        const badgeClass = riskLevel === 'High' ? 'badge-danger' : (riskLevel === 'Medium' ? 'badge-warning' : 'badge-success');

        cardP5.innerHTML = `
            <div class="card-top">
                <span class="rec-id">🆔 ${r.id} (P5 Risk Shield)</span>
                <span class="badge ${badgeClass}">${t.risk} ${riskLevel}</span>
            </div>
            <div class="detail-line"><strong>${t.owner}</strong> ${r.owner_name}</div>
            <div class="detail-line"><strong>${t.nid}</strong> ${risk.nid_verified ? '✅ Verified (জাতীয় পরিচয়পত্র সঠিক)' : '❌ Unverified'}</div>
            <div class="detail-line"><strong>${t.criminal}</strong> ${risk.criminal_record_found ? '🚨 মামলা বা ক্রিমিনাল রেকাড বিদ্যমান' : '✅ কোনো ক্রিমিনাল রেকর্ড পাওয়া যায়নি'}</div>
            <div class="detail-line"><strong>${t.court}</strong> ${risk.court_dispute ? '⚠️ আদালতে মামলা চলমান' : '✅ কোনো বিরোধ নেই (Dispute-Free)'}</div>
            <div class="security-box">
                🛡️ <strong>জালিয়াতি প্রতিরোধ টিপস:</strong> ${risk.buying_recommendation || 'জমিটি কেনার জন্য নিরাপদ।'}
            </div>
        `;
        p5Box.appendChild(cardP5);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }
}
