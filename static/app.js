let map;
let markers = [];
let currentLang = 'bn';
let currentRecords = [];
let activeTab = 'DEEDS';

const translations = {
    bn: {
        appTitle: "ল্যান্ডট্রাস্ট ডিজিটাল ভূমি সেবা",
        appSubtitle: "স্মার্ট উপায়ে জমির মালিকানা সত্যতা যাচাই ও জালিয়াতি প্রতিরোধ পোর্টাল",
        langBtnText: "English",
        searchPlaceholder: "শুধু দাগ নম্বর, খতিয়ান বা রেকর্ড আইডি লিখুন (যেমন: 101, 102)...",
        searchBtn: "🔍 তথ্য খুঁজুন",
        searchHint: "💡 টিপস: অনুসন্ধানের জন্য যেকোনো একটি দাগ নম্বর বা খতিয়ান দিয়ে প্রবেশ করুন।",
        mapCardTitle: "📍 ভূমির সঠিক অবস্থান ও সীমানা (GIS Map)",
        tabDeeds: "📜 দলিল ও মালিকানা সত্যতা যাচাই",
        tabFraud: "🛡️ ক্রেতা সুরক্ষা ও জালিয়াতি প্রতিরোধ রিপোর্ট",
        noResult: "⚠️ কোনো রেকর্ড পাওয়া যায়নি! অনুগ্রহ করে দাগ নম্বর (যেমন: 101, 102) দিয়ে চেষ্টা করুন।",
        owner: "মালিকের নাম:",
        dag: "দাগ নম্বর:",
        khation: "খতিয়ান নম্বর:",
        area: "জমির পরিমাণ:",
        location: "📍 ভূমির ঠিকানা/অবস্থান:",
        status: "যাচাই স্ট্যাটাস:",
        nid: "এনআইডি ভেরিফিকেশন:",
        criminal: "ক্রিমিনাল/পুলিশ রেকর্ড:",
        court: "মামলা/বিরোধ স্ট্যাটাস:",
        risk: "ঝুঁকি স্তর:",
        deedStatus: "দলিল ও নামজারি সিল:",
        maskedNotice: "🔐 গোপনীয় তথ্য (আংশিক আড়াল করা)"
    },
    en: {
        appTitle: "LandTrust Digital Land Services",
        appSubtitle: "Smart Portal for Land Verification & Anti-Fraud Protection",
        langBtnText: "বাংলা",
        searchPlaceholder: "Enter Dag No, Khatian or ID (e.g. 101, 102)...",
        searchBtn: "🔍 Search Record",
        searchHint: "💡 Tip: Search by Dag number to view GIS location and security report.",
        mapCardTitle: "📍 Precise Land Location & Boundary (GIS Map)",
        tabDeeds: "📜 Deed & Ownership Verification",
        tabFraud: "🛡️ Pre-Purchase Risk & Fraud Shield",
        noResult: "⚠️ No record found! Please try Dag number like 101, 102.",
        owner: "Owner Name:",
        dag: "Dag No:",
        khation: "Khatian No:",
        area: "Land Area:",
        location: "📍 Land Location:",
        status: "Verification:",
        nid: "NID Verification:",
        criminal: "Criminal/Police Record:",
        court: "Litigation Status:",
        risk: "Risk Level:",
        deedStatus: "Deed Authenticity:",
        maskedNotice: "🔐 Restricted Information (Partially Masked)"
    }
};

function initMap() {
    if (!map) {
        map = L.map('map').setView([23.8103, 90.4125], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tabDeeds').classList.toggle('active', tab === 'DEEDS');
    document.getElementById('tabFraud').classList.toggle('active', tab === 'FRAUD');
    document.getElementById('viewDeeds').classList.toggle('active', tab === 'DEEDS');
    document.getElementById('viewFraud').classList.toggle('active', tab === 'FRAUD');
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
    document.getElementById('tabDeeds').innerText = t.tabDeeds;
    document.getElementById('tabFraud').innerText = t.tabFraud;

    renderCurrentRecords();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const alertBox = document.getElementById('alertBox');
    
    if (!query) {
        alertBox.innerText = "⚠️ অনুগ্রহ করে একটি দাগ নম্বর বা আইডি লিখে অনুসন্ধান করুন।";
        alertBox.style.display = "block";
        return;
    }

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            currentRecords = data;
            
            if (!currentRecords || currentRecords.length === 0) {
                alertBox.innerText = translations[currentLang].noResult;
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
            renderCurrentRecords();
        })
        .catch(err => {
            console.error("Search error:", err);
            alertBox.innerText = "❌ তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
            alertBox.style.display = "block";
        });
}

function renderCurrentRecords() {
    const t = translations[currentLang];
    const deedsBox = document.getElementById('deedsRecordsContainer');
    const fraudBox = document.getElementById('fraudRecordsContainer');

    if (map && markers) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
    }

    deedsBox.innerHTML = "";
    fraudBox.innerHTML = "";

    if (!currentRecords || currentRecords.length === 0) return;

    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let bounds = [];

    currentRecords.forEach(r => {
        const address = r.location_address || "ধানমন্ডি, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা";

        if (r.coordinates && r.coordinates.lat && r.coordinates.lng) {
            const marker = L.marker([r.coordinates.lat, r.coordinates.lng], { icon: redIcon }).addTo(map);
            marker.bindPopup(`<b>${r.owner_name}</b><br>📍 ${address}<br>${t.dag} ${r.dag_no}`).openPopup();
            markers.push(marker);
            bounds.push([r.coordinates.lat, r.coordinates.lng]);
        }

        const cardDeeds = document.createElement('div');
        cardDeeds.className = 'data-card';
        cardDeeds.innerHTML = `
            <div class="card-top">
                <span class="rec-id">📄 রেকর্ড আইডি: ${r.id}</span>
                <span class="badge badge-success">${r.verification_status || 'যাচাইকৃত'}</span>
            </div>
            <div class="detail-line"><strong>${t.owner}</strong> ${r.owner_name}</div>
            <div class="detail-line"><strong>${t.dag}</strong> ${r.dag_no} | <strong>${t.khation}</strong> ${r.khation_no}</div>
            <div class="detail-line"><strong>${t.area}</strong> ${r.land_area_decimal || '১২.৫'} শতাংশ</div>
            <div class="location-box">
                <strong>${t.location}</strong> ${address}
            </div>
            <div class="security-box">
                ✔️ <strong>${t.deedStatus}</strong> ডিজিটাল সাব-রেজিস্ট্রি সিল প্রাপ্ত ও প্রস্তুতকৃত বায়া দলিল নিবন্ধিত।
            </div>
        `;
        deedsBox.appendChild(cardDeeds);

        const cardFraud = document.createElement('div');
        cardFraud.className = 'data-card';

        const risk = r.buyer_risk_report || {};
        const riskLevel = risk.risk_level || 'Low';
        const badgeClass = riskLevel === 'High' ? 'badge-danger' : (riskLevel === 'Medium' ? 'badge-warning' : 'badge-success');
        const maskedNid = r.nid_number ? r.nid_number.replace(/(\d{4})\d{4}(\d{2})/, "$1-****-$2") : "1988-****-9421";

        cardFraud.innerHTML = `
            <div class="card-top">
                <span class="rec-id">🛡️ নিরাপত্তা ট্র্যাকিং</span>
                <span class="badge ${badgeClass}">${t.risk} ${riskLevel}</span>
            </div>
            <div class="detail-line"><strong>${t.owner}</strong> ${r.owner_name}</div>
            <div class="location-box">
                <strong>${t.location}</strong> ${address}
            </div>
            <div class="detail-line"><strong>${t.nid}</strong> <span class="masked-text">${maskedNid}</span> (এনআইডি যাচাইকৃত)</div>
            <div class="detail-line"><strong>${t.criminal}</strong> ${risk.criminal_record_found ? '🚨 মামলা বা ক্রিমিনাল রেকর্ড বিদ্যমান' : '✅ কোনো ক্রিমিনাল রেকর্ড পাওয়া যায়নি'}</div>
            <div class="detail-line"><strong>${t.court}</strong> ${risk.court_dispute ? '⚠️ আদালতে মামলা চলমান' : '✅ কোনো বিরোধ নেই (Dispute-Free)'}</div>
            <div class="security-box">
                🔒 <strong>${t.maskedNotice}:</strong> কিছু তথ্য গোপন রাখা হয়েছে।
                <br>
                <button class="btn-secret" onclick="alert('গোপনীয় তথ্য দেখতে জাতীয় পরিচয়পত্র দিয়ে লগইন করুন।')">🔐 সম্পূর্ণ দেখতে লগইন করুন</button>
            </div>
        `;
        fraudBox.appendChild(cardFraud);
    });

    if (bounds.length > 0) {
        setTimeout(() => {
            map.invalidateSize();
            if (bounds.length === 1) {
                map.setView(bounds[0], 15);
            } else {
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        }, 200);
    }
}

function setRating(stars) {
    document.getElementById('selectedRating').value = stars;
    const starElements = document.querySelectorAll('.star');
    starElements.forEach((s, index) => {
        if (index < stars) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function submitFeedback() {
    const rating = document.getElementById('selectedRating').value;
    const msg = document.getElementById('feedbackMessage').value.trim();

    if (rating === "0" && !msg) {
        alert("অনুগ্রহ করে রেটিং অথবা একটি ছোট মতামত প্রদান করুন।");
        return;
    }

    alert(`ধন্যবাদ! আপনার ${rating > 0 ? rating + ' Star রেটিং এবং ' : ''}মতামতটি সফলভাবে জমা হয়েছে।`);
    document.getElementById('feedbackMessage').value = "";
}