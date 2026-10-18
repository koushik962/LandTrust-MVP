function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const alertBox = document.getElementById('alertBox');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alertBox.innerText = "⚠️ অনুগ্রহ করে একটি দাগ নম্বর, খতিয়ান বা আইডি লিখুন!";
        alertBox.style.display = "block";
        resultsContainer.innerHTML = "";
        return;
    }

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                alertBox.innerText = "⚠️ কোনো রেকর্ড পাওয়া যায়নি! অন্য দাগ নম্বর বা আইডি দিয়ে চেষ্টা করুন।";
                alertBox.style.display = "block";
                resultsContainer.innerHTML = "";
                return;
            }

            alertBox.style.display = "none";
            document.getElementById('welcomePlaceholder').style.display = "none";
            
            // ২০টি ডাটা প্রদর্শনের জন্য কার্ড তৈরি
            let html = "";
            data.forEach(r => {
                const risk = r.buyer_risk_report || {};
                html += `
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 12px;">
                            <h3 style="color: #27ae60; margin: 0;">রেকর্ড আইডি: ${r.id}</h3>
                            <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 15px; font-weight: bold; font-size: 13px;">${r.verification_status || 'যাচাইকৃত'}</span>
                        </div>
                        <p style="margin: 6px 0; font-size: 15px;"><b>মালিকের নাম:</b> ${r.owner_name}</p>
                        <p style="margin: 6px 0; font-size: 15px;"><b>দাগ নম্বর:</b> ${r.dag_no} | <b>খতিয়ান নম্বর:</b> ${r.khation_no}</p>
                        <p style="margin: 6px 0; font-size: 15px;"><b>জমির পরিমাণ:</b> ${r.land_area_decimal} শতাংশ</p>
                        <p style="margin: 6px 0; font-size: 15px;"><b>ঠিকানা:</b> ${r.location_address || 'ঢাকা'}</p>
                        
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px; border: 1px solid #e2e8f0;">
                            <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px;">🛡️ নিরাপত্তা ও জালিয়াতি রিপোর্ট:</h4>
                            <p style="margin: 4px 0; font-size: 13px;"><b>ঝুঁকির মাত্রা:</b> ${risk.risk_level || 'Low'}</p>
                            <p style="margin: 4px 0; font-size: 13px;"><b>ক্রিমিনাল রেকর্ড:</b> ${risk.criminal_record_found ? '🚨 বিদ্যমান' : '✅ কোনো মামলা নেই'}</p>
                            <p style="margin: 4px 0; font-size: 13px;"><b>আদালতের বিরোধ:</b> ${risk.court_dispute ? '⚠️ আদালতে মামলা চলছে' : '✅ কোনো বিরোধ নেই'}</p>
                            <p style="margin: 4px 0; font-size: 13px; color: #059669;"><b>সুপারিশ:</b> ${risk.buying_recommendation || 'জমির রেকর্ড সঠিক।'}</p>
                        </div>
                    </div>
                `;
            });

            resultsContainer.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            alertBox.innerText = "❌ তথ্য লোড করতে সমস্যা হয়েছে।";
            alertBox.style.display = "block";
        });
}