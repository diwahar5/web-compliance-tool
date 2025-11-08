# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from advanced_scanner import powerful_scan
from snippet_registry import FIX_SNIPPETS

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered Web Compliance Scanner",
    description="Scans websites for GDPR/CCPA violations and provides code fixes.",
    version="2.0.0"
)

# CORS setup (open during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def root():
    return {"message": "✅ Web Compliance API is running."}

# --- SCAN ENDPOINT ---
@app.get("/scan")
def scan_website(url: str):
    """
    Scan a website for privacy violations.
    Example: /scan?url=https://example.com
    """
    try:
        result = powerful_scan(url)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- FIX ENDPOINT ---
@app.get("/fix")
def get_fix(violation_id: str):
    """
    Retrieve code snippets to fix a given violation.
    Example: /fix?violation_id=insecure_cookies
    """
    snippet = FIX_SNIPPETS.get(violation_id)
    if not snippet:
        raise HTTPException(status_code=404, detail="No fix snippet found for this violation.")
    return {"status": "success", "data": snippet}
