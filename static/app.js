let mapInstance = null;

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('resultsContainer');

    if (!query) {
        resultsContainer.innerHTML = '<p style="color: red; padding: 10px;">অনুগ্রহ করে অনুসন্ধান করার জন্য দাগ নম্বর, খতিয়ান বা আইডি লিখুন।</p>';
        return;
    }

    resultsContainer.innerHTML = '<p style="padding: 10px;">তথ্য খোঁজা হচ্ছে...</p>';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `<div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin-top: 10px;">
                ⚠️ কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য দাগ নম্বর (যেমন: 101, 110, 115) বা ID (যেমন: LT-BD-2026-010) দিয়ে চেষ্টা করুন।
            </div>`;
            return;
        }

        let html = `<h3 style="margin-top: 15px;">মোট ফলাফল পাওয়া গেছে: ${data.count} টি</h3>`;

        data.results.forEach((record, index) => {
            // Risk Color
            let riskBg = '#28a745'; // Green
            if (record.risk_report && record.risk_report.score === 'Medium Risk') riskBg = '#ffc107';
            if (record.risk_report && record.risk_report.score === 'High Risk') riskBg = '#dc3545';

            html += `
                <div style="border: 1px solid #e0e0e0; background: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <h2 style="margin-top:0; color: #2c3e50;">👤 ${record.owner_name} <small style="font-size: 0.6em; color: #7f8c8d;">(${record.record_id})</small></h2>
                    <p><strong>দাগ নম্বর:</strong> ${record.dag_no} | <strong>খতিয়ান নম্বর:</strong> ${record.khatian_no} | <strong>জমির পরিমাণ:</strong> ${record.land_amount}</p>
                    <p><strong>নামজারি স্থিতি (Mutation):</strong> <span style="font-weight:bold;">${record.mutation_status}</span></p>

                    <!-- Buyer Risk Report Badge -->
                    <div style="background: ${riskBg}; color: white; padding: 10px 15px; border-radius: 6px; font-weight: bold; margin: 12px 0; font-size: 0.95em;">
                        🛡️ Buyer Risk Assessment: ${record.risk_report ? record.risk_report.score : 'N/A'} — ${record.risk_report ? record.risk_report.summary : ''}
                    </div>

                    <!-- Metadata & Verification -->
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 0.9em; line-height: 1.6; border-left: 4px solid #007bff;">
                        <p style="margin: 3px 0;">📍 <strong>অবস্থান/ঠিকানা:</strong> ${record.location ? record.location.address : 'N/A'}</p>
                        <p style="margin: 3px 0;">📁 <strong>Data Source:</strong> ${record.data_source || 'N/A'}</p>
                        <p style="margin: 3px 0;">📅 <strong>Observation Date:</strong> ${record.observation_date || 'N/A'}</p>
                        <p style="margin: 3px 0;">✅ <strong>Verification Status:</strong> ${record.verification_status || 'N/A'}</p>
                        ${(record.inconsistencies && record.inconsistencies.length > 0) 
                            ? `<p style="color: #dc3545; font-weight: bold; margin: 5px 0 0 0;">⚠️ Inconsistency / Conflict: ${record.inconsistencies.join(', ')}</p>` 
                            : '<p style="color: #28a745; margin: 5px 0 0 0;">✔️ No Inconsistency Detected</p>'}
                    </div>

                    <!-- Ownership History -->
                    ${record.history ? `<p style="margin-top: 10px;">📜 <strong>মালিকানার ইতিহাস:</strong> ${record.history.join(' ➔ ')}</p>` : ''}

                    <!-- OpenStreetMap -->
                    <div id="map-${index}" style="height: 220px; width: 100%; border-radius: 8px; margin-top: 15px; border: 1px solid #ddd;"></div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;

        // Render OpenStreetMap for each record
        data.results.forEach((record, index) => {
            if (record.location && record.location.lat && record.location.lng) {
                setTimeout(() => {
                    const map = L.map(`map-${index}`).setView([record.location.lat, record.location.lng], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(map);
                    L.marker([record.location.lat, record.location.lng]).addTo(map)
                        .bindPopup(`<b>${record.owner_name}</b><br>${record.location.address}`)
                        .openPopup();
                }, 100);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p style="color: red; padding: 10px;">ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে রিফ্রেশ করে আবার চেষ্টা করুন।</p>';
    }
}