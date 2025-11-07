from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scanner import scan_website

app = FastAPI(
    title="Web Compliance API",
    description="An API for scanning websites and detecting privacy compliance issues.",
    version="1.0.0"
)

# Allow frontend access (adjust domain for production)
origins = [
    "http://localhost:5173",
    "https://web-compliance-tool.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Web Compliance API is running successfully."}


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
