from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scanner import scan_website
from fix_snippets import FIX_SNIPPETS  # ✅ import moved to top

# ----------------------------------------
# App Initialization
# ----------------------------------------
app = FastAPI(
    title="Web Compliance API",
    description="An API for scanning websites and detecting privacy compliance issues.",
    version="1.0.0"
)

# ----------------------------------------
# CORS Setup
# ----------------------------------------
origins = [
    "http://localhost:5173",
    "https://web-compliance-tool.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or ["*"] for full access in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# Root Endpoint (Health Check)
# ----------------------------------------
@app.get("/")
def root():
    return {"message": "Web Compliance API is running successfully."}


# ----------------------------------------
# Website Scanner Endpoint
# ----------------------------------------
@app.get("/scan")
def scan(url: str):
    """
    Endpoint to perform real-time website scan.
    Example: /scan?url=https://example.com
    """
    try:
        result = scan_website(url)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------------------
# Code Fix Snippet Endpoint
# ----------------------------------------
@app.get("/fix")
def get_fix(violation_id: str):
    """
    Returns example code snippets for a given violation ID.
    Example: /fix?violation_id=insecure_cookies
    """
    snippet = FIX_SNIPPETS.get(violation_id)
    if not snippet:
        raise HTTPException(status_code=404, detail="No fix snippet available for this violation.")
    return {"status": "success", "data": snippet}