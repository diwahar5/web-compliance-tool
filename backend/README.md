# Web Compliance Backend Scanner

This directory contains the Python backend for the Web Compliance Analysis tool. It uses FastAPI to create a web server and Playwright for headless browser automation to perform live scans of websites.

## Setup Instructions

### 1. Prerequisites
- Python 3.8+ installed.
- `pip` (Python package installer).

### 2. Create a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Install the required Python packages from `requirements.txt`.

```bash
pip install -r requirements.txt
```

### 4. Install Playwright Browsers
Playwright requires you to download browser binaries for automation. This command will download the recommended browser (Chromium).

```bash
playwright install
```

## Running the Server

Once the setup is complete, you can start the FastAPI server using `uvicorn`.

```bash
# Make sure you are in the 'backend' directory and your virtual environment is active
uvicorn app:app --reload
```
- `--reload` enables auto-reloading, so the server will restart automatically when you make code changes.

The server will start and be accessible at `http://127.0.0.1:8000`. The frontend application is configured to send API requests to this address.

## API Endpoint

- **`POST /api/scan`**: The primary endpoint for scanning a website.
  - **Request Body**:
    ```json
    {
      "url": "https://example.com"
    }
    ```
  - **Success Response**: A JSON object matching the `AnalysisResult` type defined in the frontend, containing the scan results and a list of violations.
  - **Error Response**: A JSON object with an `error` key describing the failure (e.g., navigation timeout, invalid URL).
