const tabs = document.querySelectorAll(".tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".feature-panel").forEach((panel) => panel.classList.add("hidden"));
    document.getElementById(tab.dataset.tab).classList.remove("hidden");
  });
});

const searchForm = document.getElementById("searchForm");
const searchQuery = document.getElementById("searchQuery");
const searchMessage = document.getElementById("searchMessage");
const searchResults = document.getElementById("searchResults");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function renderResults(results) {
  if (!results.length) {
    searchResults.innerHTML = "";
    searchMessage.innerHTML = '<div class="result-box warning">No sample record found. Try LT-1001, 101, 55, 205, or 102.</div>';
    return;
  }
  searchMessage.textContent = `${results.length} sample record(s) found.`;
  searchResults.innerHTML = results.map((r) => `
    <article class="record-card">
      <span class="status">${escapeHtml(r.mutation_status)}</span>
      <h3>${escapeHtml(r.owner_name)}</h3>
      <div class="record-id">Record ID: ${escapeHtml(r.record_id)}</div>
      <div class="record-grid">
        <div><span>Dag number</span><strong>${escapeHtml(r.dag_no)}</strong></div>
        <div><span>Khatian number</span><strong>${escapeHtml(r.khatian_no)}</strong></div>
        <div><span>Land amount</span><strong>${escapeHtml(r.land_amount)}</strong></div>
        <div><span>Record type</span><strong>Demo record</strong></div>
      </div>
      <strong>Sample history</strong>
      <ul class="history">${r.history.map(h => `<li><b>${escapeHtml(h.year)}</b> — ${escapeHtml(h.event)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

async function doSearch(query) {
  searchMessage.textContent = "Searching sample database...";
  searchResults.innerHTML = "";
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    renderResults(data.results || []);
  } catch {
    searchMessage.innerHTML = '<div class="result-box danger">Could not connect to the app server. Refresh and try again.</div>';
  }
}
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  doSearch(searchQuery.value.trim());
});
document.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
  searchQuery.value = chip.dataset.query;
  doSearch(chip.dataset.query);
}));

const verifyForm = document.getElementById("verifyForm");
const verifyId = document.getElementById("verifyId");
const verifyHash = document.getElementById("verifyHash");
const verifyResult = document.getElementById("verifyResult");

async function getDemoDocument(recordId) {
  const response = await fetch(`/api/demo-document/${encodeURIComponent(recordId)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load demo record.");
  return data;
}

document.getElementById("loadValidDemo").addEventListener("click", async () => {
  try {
    const demo = await getDemoDocument("LT-1001");
    verifyId.value = demo.record_id;
    verifyHash.value = demo.hash;
    verifyResult.innerHTML = '<div class="result-box success">Valid demo values loaded. Click “Verify record”.</div>';
  } catch (err) {
    verifyResult.innerHTML = `<div class="result-box danger">${escapeHtml(err.message)}</div>`;
  }
});

document.getElementById("loadMismatchDemo").addEventListener("click", async () => {
  try {
    const demo = await getDemoDocument("LT-1001");
    verifyId.value = demo.record_id;
    verifyHash.value = "0".repeat(64);
    verifyResult.innerHTML = '<div class="result-box warning">A deliberately incorrect hash is loaded to demonstrate mismatch handling.</div>';
  } catch (err) {
    verifyResult.innerHTML = `<div class="result-box danger">${escapeHtml(err.message)}</div>`;
  }
});

verifyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  verifyResult.textContent = "Checking demo integrity...";
  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record_id: verifyId.value, hash: verifyHash.value })
    });
    const data = await response.json();
    const isMatch = data.status === "valid_demo_match";
    const isMismatch = data.status === "mismatch";
    const cls = isMatch ? "success" : (isMismatch ? "danger" : "warning");
    verifyResult.innerHTML = `
      <div class="result-box ${cls}">
        <h3>${isMatch ? "✓ Valid demo match" : (isMismatch ? "⚠ Hash mismatch" : "ℹ Verification incomplete")}</h3>
        <p>${escapeHtml(data.message || "Verification could not be completed.")}</p>
        ${data.owner_name ? `<p><b>Sample owner:</b> ${escapeHtml(data.owner_name)}</p>` : ""}
        ${data.expected_hash ? `<p><b>Stored record hash</b></p><div class="hash">${escapeHtml(data.expected_hash)}</div>` : ""}
        ${data.notice ? `<p>${escapeHtml(data.notice)}</p>` : ""}
      </div>`;
  } catch {
    verifyResult.innerHTML = '<div class="result-box danger">Server connection failed. Refresh and try again.</div>';
  }
});
