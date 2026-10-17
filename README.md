# LandTrust: Secure Verification & Citizen Portal

A hackathon MVP prototype combining:
- **P5 — Check Before You Buy:** search fictional land records by record ID, dag number, or khatian number.
- **P2 — Verify Deeds & Ownership:** compare a submitted SHA-256 integrity hash with a hash calculated from a sample record.

## Important limitations
All names, identifiers, and histories are fictional sample data. This project is not a government service. A matching hash only demonstrates integrity comparison against this prototype's current database; it does not prove ownership, legal authenticity, or that a document was issued by a trusted authority. A mismatch is not definitive proof of fraud.

## Requirements
- Python 3.10+
- pip

## Run locally (Windows)
```powershell
cd LandTrust_MVP
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000

If PowerShell blocks activation, use Command Prompt:
```bat
.venv\Scripts\activate.bat
```

## Demo
1. Search `LT-1001`, `101`, `55`, `205`, or `102`.
2. Open Document Check.
3. Click **Load valid demo**, then **Verify record**.
4. Click **Load mismatch demo**, then **Verify record**.

## Technology
HTML, CSS, JavaScript, Python, Flask, JSON sample data, SHA-256 (Python hashlib).

## AI tool disclosure
AI assistance: ChatGPT (OpenAI) was used to help plan and draft parts of the starter code and documentation. The team should review, understand, test, and adapt the code before submission.

## Nationwide roadmap
A real deployment would require authorized integration with trusted official land-record services, secure identity/access controls, audit logs, privacy and legal review, and issuer-signed records. These are future scope, not implemented in this MVP.
