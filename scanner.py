from playwright.sync_api import sync_playwright
import re

def scan_website(url: str):
    """
    Scans a given website and extracts cookies, scripts, and detects
    basic privacy compliance issues such as missing Secure cookies or
    consent banners.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to URL
        page.goto(url, wait_until="networkidle", timeout=45000)

        # Extract cookies and script sources
        cookies = context.cookies()
        scripts = [
            s.get_attribute("src")
            for s in page.query_selector_all("script")
            if s.get_attribute("src")
        ]

        # Check for consent banner
        html_content = page.content().lower()
        consent_banner = bool(re.search(r"(cookie.*consent|accept cookies)", html_content))

        # Detect insecure cookies (missing Secure/HttpOnly/SameSite)
        insecure_cookies = []
        for c in cookies:
            if not c.get("secure") or c.get("sameSite") == "None":
                insecure_cookies.append(c)

        result = {
            "url": url,
            "cookies": cookies,
            "scripts": scripts,
            "consent_banner": consent_banner,
            "violations": {
                "missing_consent_banner": not consent_banner,
                "insecure_cookies": len(insecure_cookies) > 0,
            },
            "insecure_cookie_count": len(insecure_cookies)
        }

        browser.close()
        return result


if __name__ == "__main__":
    # Local test
    import json
    print(json.dumps(scan_website("https://example.com"), indent=2))
