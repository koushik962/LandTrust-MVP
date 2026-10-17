// Active Leaflet Map Instances Store
let activeMaps = {};

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('resultsContainer');

    if (!query) {
        resultsContainer.innerHTML = '<p style="color: red;">অনুগ্রহ করে অনুসন্ধান করার জন্য কিছু লিখুন।</p>';
        return;
    }

    resultsContainer.innerHTML = '<p>তথ্য খোঁজা হচ্ছে...</p>';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.results.length === 0) {
            resultsContainer.innerHTML = '<p>কোনো তথ্য পাওয়া যায়নি।</p>';
            return;
        }

        resultsContainer.innerHTML = `<h3>মোট ফলাফল পাওয়া গেছে: ${data.count} টি</h3>`;

        data.results.forEach((record, index) => {
            const card = document.createElement('div');
            card.className = 'record-card';
            
            // Determine Risk Badge Color
            let riskColor = '#28a745'; // Green
            if (record.risk_report.score === 'Medium Risk') riskColor = '#ffc107'; // Yellow
            if (record.risk_report.score === 'High Risk') riskColor = '#dc3545'; // Red

            card.innerHTML = `
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px; background: #fff;">
                    <h2>📌 ${record.owner_name} <small>(${record.record_id})</small></h2>
                    <p><strong>দাগ নম্বর:</strong> ${record.dag_no} | <strong>খতিয়ান নম্বর:</strong> ${record.khatian_no} | <strong>জমির পরিমাণ:</strong> ${record.land_amount}</p>
                    <p><strong>নামজারি স্থিতি:</strong> ${record.mutation_status}</p>

                    <!-- Buyer Risk Report -->
                    <div style="background: ${riskColor}; color: white; padding: 8px 12px; border-radius: 5px; font-weight: bold; margin: 10px 0;">
                        🛡️ Buyer Risk Assessment: ${record.risk_report.score} — ${record.risk_report.summary}
                    </div>

                    <!-- Metadata & Verification -->
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 0.9em; line-height: 1.5;">
                        <p>📍 <strong>ঠিকানা:</strong> ${record.location.address}</p>
                        <p>📁 <strong>Data Source:</strong> ${record.data_source}</p>
                        <p>📅 <strong>Observation Date:</strong> ${record.observation_date}</p>
                        <p>✅ <strong>Verification Status:</strong> ${record.verification_status}</p>
                        ${record.inconsistencies.length > 0 ? `<p style="color: #d9534f; font-weight: bold;">⚠️ <strong>Inconsistency / Conflict:</strong> ${record.inconsistencies.join(', ')}</p>` : ''}
                    </div>

                    <!-- History -->
                    <p style="margin-top: 10px;">📜 <strong>মালিকানার ইতিহাস:</strong> ${record.history.join(' ➔ ')}</p>

                    <!-- Map Container -->
                    <div id="map-${index}" style="height: 220px; width: 100%; border-radius: 6px; margin-top: 10px;"></div>
                </div>
            `;
            resultsContainer.appendChild(card);

            // Render OpenStreetMap
            setTimeout(() => {
                if (record.location && record.location.lat && record.location.lng) {
                    const map = L.map(`map-${index}`).setView([record.location.lat, record.location.lng], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(map);
                    L.marker([record.location.lat, record.location.lng]).addTo(map)
                        .bindPopup(`<b>${record.owner_name}</b><br>${record.location.address}`)
                        .openPopup();
                }
            }, 100);
        });

    } catch (error) {
        console.error('Error fetching search results:', error);
        resultsContainer.innerHTML = '<p style="color: red;">তথ্য লোড করতে সমস্যা হয়েছে।</p>';
    }
}