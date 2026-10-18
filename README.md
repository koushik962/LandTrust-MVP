# LandTrust MVP - Smart Digital Land Verification & Anti-Fraud Portal

## 🌟 Overview
LandTrust MVP is a modern e-governance web application developed for the **LandTech 2026 Innovation Hackathon** (Track: Digital Land Records, Verification & Digitization). It provides citizens and sub-registry offices a fast, secure way to verify land ownership, view precise GIS map boundaries with red location pins, and check pre-purchase fraud risk reports.

## 🚀 Live Demo & Repository
- **Vercel Live URL:** [https://land-trust-mvp-steel.vercel.app](https://land-trust-mvp-steel.vercel.app)
- **GitHub Repository:** [https://github.com/koushik962/LandTrust-MVP](https://github.com/koushik962/LandTrust-MVP)

## 💡 How to Test / How It Works
Anyone can easily test and verify the live application by following these simple steps:

1. **Search Land Record (Public Citizen View):**
   - Open the live web link: [https://land-trust-mvp-steel.vercel.app](https://land-trust-mvp-steel.vercel.app)
   - Enter a **Dag Number** (Sample available records: `101`, `102`, `103` ... up to `120`).
   - Click **Search** to view the verified owner details, NID status, interactive GIS map with red location pin, and fraud risk report.

2. **Access Admin Panel (Government/Sub-Registry View):**
   - Navigate to the admin path: [https://land-trust-mvp-steel.vercel.app/admin](https://land-trust-mvp-steel.vercel.app/admin)
   - **Username:** `admin`
   - **Password:** `landtrust2026`
   - Log in to access the administrative controls for managing and updating land record data.

## 🛠️ Tech Stack & Architecture
- **Front-End:** HTML5, CSS3, JavaScript (Client-side fast search rendering)
- **Back-End:** Python Flask
- **GIS & Mapping:** Leaflet.js library integrated with OpenStreetMap tiles
- **Deployment Platform:** Vercel Serverless Platform

## 📝 How to Run Locally
To run this project on your local machine, follow these steps:

1. Clone the repository:
   `git clone [https://github.com/koushik962/LandTrust-MVP.git](https://github.com/koushik962/LandTrust-MVP.git)`

2. Navigate into the directory:
   `cd LandTrust-MVP`

3. Install dependencies:
   `pip install flask`

4. Run the application:
   `python app.py`

5. Open your browser and go to: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 📊 Data Use & Compliance
- As per hackathon guidelines, this project strictly utilizes dummy/sample data (20 verified master records from Dag 101 to 120).
- No actual, sensitive, or live citizen NID data has been scraped or misused.

## 🤖 AI Tools Usage
- ChatGPT / Gemini was utilized for architectural guidance, debugging, and UI refinement.

## 👥 Team & Mentors
- **Team Name:** Team Bug Busters
- **Team Members:** Koushik Deb (Lead) & Prionti Biswas
- **Mentors:** Mohammed Sami Khan & Fayaz Rayat
