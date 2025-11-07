"""
scanner.py — Web Compliance Scanner
-----------------------------------
Performs website privacy compliance scanning using Playwright.

Outputs structured JSON results with consistent fields for the frontend:
[
    {
        "id": "insecure_cookies",
        "title": "Insecure Cookies",
        "description": "Some cookies lack Secure or HttpOnly flags.",
        "recommendation": "Ensure all cookies use the Secure and HttpOnly attributes.",
        "severity": "High"
    },
    {
        "id": "missing_consent_banner",
        "title": "Missing Consent Banner",
        "description": "No visible cookie consent banner was found on the website.",
        "recommendation": "Implement a GDPR-compliant cookie banner to obtain user consent.",
        "severity": "Low"
    }
]
"""

from playwright.sync_api import sync_playwright
import re
from typing import Dict, Any, List


def scan_website(url: str) -> Dict[str, Any]:
    """
    Scans the given website URL and detects:
      - Missing consent banner
      - Insecure cookies (no Secure/HttpOnly flags)
      - Total scripts and cookies

    Returns:
        A dictionary containing site data and structured violations.
    """

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(ignore_https_errors=True)
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
        except Exception as e:
            browser.close()
            return {
                "url": url,
                "error": str(e),
                "violations": [],
                "summary": "Page could not be loaded",
            }

        # Collect cookies and scripts
        cookies = context.cookies()
        scripts = [
            s.get_attribute("src")
            for s in page.query_selector_all("script")
            if s.get_attribute("src")
        ]

        html_content = page.content().lower()

        # ------------------------------------------------------------------
        # ✅ DETECTION RULES
        # ------------------------------------------------------------------

        violations: List[Dict[str, Any]] = []

        # --- Rule 1: Missing consent banner ---
        has_consent_banner = bool(
            re.search(r"(cookie.*consent|accept cookies|cookie banner|privacy consent)", html_content)
        )
        if not has_consent_banner:
            violations.append({
                "id": "missing_consent_banner",
                "title": "Missing Consent Banner",
                "description": "No visible cookie consent banner or privacy notice was detected.",
                "recommendation": (
                    "Implement a GDPR-compliant cookie consent banner that allows users "
                    "to accept or reject non-essential cookies before they are set."
                ),
                "severity": "Low",
            })

        # --- Rule 2: Insecure cookies ---
        insecure_cookie_list = []
        for c in cookies:
            # Secure must be True; SameSite should not be None; HttpOnly recommended
            if not c.get("secure", False) or c.get("sameSite") in (None, "None"):
                insecure_cookie_list.append(c)

        if len(insecure_cookie_list) > 0:
            violations.append({
                "id": "insecure_cookies",
                "title": "Insecure Cookies",
                "description": (
                    "One or more cookies are missing Secure, HttpOnly, or SameSite attributes, "
                    "which could allow session hijacking or CSRF attacks."
                ),
                "recommendation": (
                    "Mark all cookies that store sensitive data as Secure and HttpOnly, "
                    "and set SameSite to 'Strict' or 'Lax' to mitigate CSRF risks."
                ),
                "severity": "High",
            })

        # --- Rule 3: Excessive 3rd-party trackers (optional extension) ---
        tracker_domains = ["google-analytics", "facebook", "doubleclick", "hotjar", "tiktok"]
        tracker_scripts = [s for s in scripts if s and any(td in s for td in tracker_domains)]
        if len(tracker_scripts) > 3:
            violations.append({
                "id": "third_party_trackers",
                "title": "Excessive Third-Party Trackers",
                "description": (
                    f"The site loads {len(tracker_scripts)} tracking scripts from analytics "
                    "or advertising networks, which may pose privacy risks."
                ),
                "recommendation": (
                    "Reduce third-party scripts and ensure you provide clear consent for data collection "
                    "as required by GDPR and CCPA."
                ),
                "severity": "Medium",
            })

        # ------------------------------------------------------------------
        # ✅ RETURN STRUCTURED RESULT
        # ------------------------------------------------------------------
        result = {
            "url": url,
            "cookies": cookies,
            "scripts": scripts,
            "score": max(0, 100 - len(violations) * 10),  # Basic scoring logic
            "violations": violations,
            "summary": f"Detected {len(violations)} issue(s)",
        }

        browser.close()
        return result


# ----------------------------------------------------------------------
# ✅ Standalone test (optional)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import json
    site = input("Enter a website URL to scan (e.g. https://example.com): ").strip()
    out = scan_website(site)
    print(json.dumps(out, indent=2))
