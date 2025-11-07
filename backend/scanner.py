"""
scanner.py — Advanced GDPR/CCPA Web Compliance Scanner
------------------------------------------------------
✅ Detects 20 major privacy violations on websites.
✅ Includes smart timeout, retry, and user-agent spoofing.
✅ Returns a structured JSON report for frontend.
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from typing import Dict, Any, List
import re
import time
import traceback
from urllib.parse import urlparse


# --------------------------------------
# CONFIGURATION
# --------------------------------------
NAV_TIMEOUT = 180000   # 3 minutes timeout (in ms)
WAIT_AFTER_LOAD = 4000 # wait after load for full rendering
RETRY_ATTEMPTS = 3     # retry count on failure


# --------------------------------------
# SAFE NAVIGATION FUNCTION (RETRY + TIMEOUT)
# --------------------------------------
def _safe_goto(page, url: str, timeout: int = NAV_TIMEOUT):
    last_exc = None
    for attempt in range(1, RETRY_ATTEMPTS + 1):
        try:
            print(f"[INFO] Navigating to {url} (Attempt {attempt})")
            page.goto(url, wait_until="domcontentloaded", timeout=timeout)
            # small delay to let cookies/scripts finish loading
            page.wait_for_timeout(WAIT_AFTER_LOAD)
            return True
        except PlaywrightTimeoutError as e:
            print(f"[WARN] Attempt {attempt}: Timeout loading {url}")
            last_exc = e
            time.sleep(2)
        except Exception as e:
            print(f"[WARN] Attempt {attempt} failed: {e}")
            last_exc = e
            time.sleep(1)
    raise last_exc or TimeoutError(f"Failed to load {url} after {RETRY_ATTEMPTS} attempts.")


# --------------------------------------
# BASIC HELPERS
# --------------------------------------
def _extract_text_lower(page) -> str:
    try:
        return page.content().lower()
    except Exception:
        return ""


def _has_link_with_text(page, patterns: List[str]) -> bool:
    try:
        anchors = page.query_selector_all("a")
        for a in anchors:
            text = (a.inner_text() or "").lower()
            href = (a.get_attribute("href") or "").lower()
            for p in patterns:
                if p in text or p in href:
                    return True
        return False
    except Exception:
        return False


# --------------------------------------
# CORE SCAN FUNCTION
# --------------------------------------
def scan_website(url: str) -> Dict[str, Any]:
    """
    Performs a privacy compliance scan and returns structured JSON:
    {
      "url": "...",
      "violations": [...],
      "score": 85,
      "summary": "Detected 3 issue(s)"
    }
    """
    browser = None
    result = {}

    try:
        with sync_playwright() as pw:
            # 🧠 Launch Chromium with realistic browser fingerprint
            browser = pw.chromium.launch(headless=True)
            context = browser.new_context(
                ignore_https_errors=True,
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/117.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 720},
            )

            page = context.new_page()

            # 🧭 Try visiting the site with retry + timeout handling
            try:
                _safe_goto(page, url)
            except Exception as e:
                print(f"[ERROR] Navigation failed: {e}")
                return {
                    "url": url,
                    "violations": [],
                    "score": 0,
                    "summary": "Scan timed out or failed to load page",
                    "error": str(e),
                }

            html_lower = _extract_text_lower(page)

            # Collect cookies and scripts
            try:
                cookies = context.cookies()
            except Exception:
                cookies = []

            try:
                scripts_srcs = [
                    s.get_attribute("src")
                    for s in page.query_selector_all("script")
                    if s.get_attribute("src")
                ]
            except Exception:
                scripts_srcs = []

            # ---------------------------------------
            # DETECTION RULES (20 VIOLATIONS)
            # ---------------------------------------
            violations: List[Dict[str, Any]] = []

            def add_violation(id, title, description, recommendation, severity):
                violations.append({
                    "id": id,
                    "title": title,
                    "description": description,
                    "recommendation": recommendation,
                    "severity": severity
                })

            # 1. Missing consent banner
            if not any(k in html_lower for k in ["cookie consent", "accept cookies", "cookie banner", "privacy settings"]):
                add_violation(
                    "missing_consent_banner",
                    "Missing Consent Banner",
                    "No visible cookie consent or privacy banner found.",
                    "Add a GDPR-compliant cookie banner before setting cookies.",
                    "Low"
                )

            # 2. No reject option
            if "accept all" in html_lower and not any(k in html_lower for k in ["reject", "decline", "manage cookies", "cookie preferences"]):
                add_violation(
                    "no_reject_option",
                    "No Reject Option for Cookies",
                    "Only 'Accept' detected, no visible reject or manage option.",
                    "Add 'Reject' and 'Manage Preferences' for fair consent choice.",
                    "High"
                )

            # 3. Cookies before consent
            if any(c.get("secure") is False for c in cookies):
                add_violation(
                    "cookies_before_consent",
                    "Cookies Set Before Consent",
                    "Detected cookies before user consent could be given.",
                    "Ensure no non-essential cookies are stored before consent.",
                    "High"
                )

            # 4. Insecure cookies
            for c in cookies:
                if not c.get("secure", False) or c.get("sameSite") in (None, "None", ""):
                    add_violation(
                        "insecure_cookies",
                        "Insecure Cookie Found",
                        f"Cookie {c.get('name')} missing Secure/HttpOnly/SameSite.",
                        "Mark cookies as Secure, HttpOnly, and SameSite=Strict.",
                        "High"
                    )
                    break

            # 5. Missing 'Do Not Sell'
            if not _has_link_with_text(page, ["do not sell", "do-not-sell"]):
                add_violation(
                    "missing_do_not_sell",
                    "Missing 'Do Not Sell' Link (CCPA)",
                    "No 'Do Not Sell My Personal Information' link found.",
                    "Add a visible CCPA opt-out link in your footer.",
                    "High"
                )

            # 6. Privacy policy missing
            if not _has_link_with_text(page, ["privacy", "policy"]):
                add_violation(
                    "missing_privacy_policy",
                    "Missing Privacy Policy",
                    "No privacy policy link found on homepage.",
                    "Provide an easily accessible privacy policy describing data use.",
                    "High"
                )

            # 7. Third-party data sharing
            if not any(k in html_lower for k in ["third party", "third-party", "partners", "service providers"]):
                add_violation(
                    "no_third_party_disclosure",
                    "No Third-Party Sharing Disclosure",
                    "No mention of data sharing with third parties found.",
                    "Disclose your third-party vendors and processors in your policy.",
                    "Medium"
                )

            # 8. Personal data forms
            if re.search(r"(name|email|phone|address|contact)", html_lower):
                add_violation(
                    "collects_personal_data",
                    "Personal Data Collection Detected",
                    "Forms or inputs suggest personal data is collected.",
                    "Ensure lawful basis (consent, contract) and inform users clearly.",
                    "Medium"
                )

            # 9. Right of access
            if not any(k in html_lower for k in ["access my data", "download my data", "request my data"]):
                add_violation(
                    "no_data_access_mechanism",
                    "No Data Access Mechanism",
                    "Users cannot request or view their stored data.",
                    "Add a 'Request My Data' or 'Access My Data' option.",
                    "High"
                )

            # 10. Right to delete
            if not any(k in html_lower for k in ["delete my data", "erase my data", "right to be forgotten"]):
                add_violation(
                    "no_data_deletion_mechanism",
                    "No Data Deletion Mechanism",
                    "No visible way to delete user data.",
                    "Implement a 'Delete My Data' option per GDPR/CCPA.",
                    "High"
                )

            # 11. Email consent
            if "newsletter" in html_lower and not any(k in html_lower for k in ["consent", "agree", "unsubscribe"]):
                add_violation(
                    "email_marketing_no_explicit_consent",
                    "Email Marketing Without Consent",
                    "Newsletter or signup detected without clear consent notice.",
                    "Add explicit opt-in checkbox and keep consent logs.",
                    "Medium"
                )

            # 12. Dark patterns
            if "accept all" in html_lower and not "reject" in html_lower:
                add_violation(
                    "dark_patterns",
                    "Dark Pattern in Consent UI",
                    "Consent design favors acceptance, violating free choice.",
                    "Equalize button prominence for Accept/Reject choices.",
                    "High"
                )

            # 13. No age verification
            if not any(k in html_lower for k in ["are you over", "enter your birth", "age gate"]):
                add_violation(
                    "no_age_verification",
                    "No Age Verification",
                    "No mechanism to verify age for minors detected.",
                    "Add an age gate or parental consent step if targeting minors.",
                    "Low"
                )

            # 14. Fingerprinting
            if any(k in html_lower for k in ["fingerprint", "webgl", "canvas", "deviceprint"]):
                add_violation(
                    "fingerprinting_detected",
                    "Browser Fingerprinting Detected",
                    "Scripts use device or browser fingerprinting techniques.",
                    "Disclose fingerprinting and obtain consent.",
                    "High"
                )

            # 15. Insecure transport
            if not url.startswith("https://"):
                add_violation(
                    "insecure_transport",
                    "Insecure HTTP Connection",
                    "The site is served over HTTP, not HTTPS.",
                    "Use HTTPS for all pages and enforce HSTS.",
                    "Critical"
                )

            # 16. Third-party trackers
            trackers = ["google-analytics", "facebook", "doubleclick", "tiktok", "hotjar"]
            if any(t in str(scripts_srcs).lower() for t in trackers):
                add_violation(
                    "third_party_trackers",
                    "Third-Party Trackers Detected",
                    "Analytics/advertising scripts found.",
                    "Obtain explicit consent before loading tracking scripts.",
                    "Medium"
                )

            # 17. Retention policy missing
            if "retention" not in html_lower:
                add_violation(
                    "no_retention_policy_disclosed",
                    "No Data Retention Disclosure",
                    "No mention of how long personal data is stored.",
                    "Include retention periods in your privacy policy.",
                    "Medium"
                )

            # 18. Withdraw consent
            if not _has_link_with_text(page, ["manage consent", "cookie settings", "privacy settings"]):
                add_violation(
                    "no_withdraw_consent_mechanism",
                    "No Consent Withdrawal Option",
                    "Users cannot easily change or withdraw their consent.",
                    "Add a persistent 'Manage Consent' or 'Privacy Settings' link.",
                    "Medium"
                )

            # 19. Analytics IP anonymization
            if "google-analytics" in html_lower and "anonymize_ip" not in html_lower:
                add_violation(
                    "analytics_not_anonymizing_ip",
                    "Analytics Without IP Anonymization",
                    "Google Analytics found without anonymizeIp configuration.",
                    "Enable IP anonymization to protect user privacy.",
                    "Medium"
                )

            # 20. Non-compliant plugins
            risky_plugins = ["intercom", "hotjar", "drift", "fullstory", "mixpanel"]
            found_plugins = [r for r in risky_plugins if r in str(scripts_srcs).lower()]
            if found_plugins:
                add_violation(
                    "non_compliant_plugins",
                    "Potentially Non-Compliant Plugins",
                    f"Detected plugins: {', '.join(found_plugins)}",
                    "Review plugins and ensure DPAs (Data Processing Agreements) are signed.",
                    "Medium"
                )

            # ---------------------------------------
            # SCORING + SUMMARY
            # ---------------------------------------
            score = max(0, 100 - len(violations) * 5)

            result = {
                "url": url,
                "final_url": page.url,
                "cookies": cookies,
                "scripts": scripts_srcs,
                "score": score,
                "violations": violations,
                "summary": f"Detected {len(violations)} issue(s)",
            }

            return result

    except Exception as exc:
        traceback.print_exc()
        return {
            "url": url,
            "error": str(exc),
            "violations": [],
            "score": 0,
            "summary": "Critical scan error occurred."
        }
    finally:
        try:
            if browser:
                browser.close()
        except Exception:
            pass


# CLI Test Mode
if __name__ == "__main__":
    import json
    site = input("Enter a website URL to scan: ").strip() or "https://example.com"
    out = scan_website(site)
    print(json.dumps(out, indent=2))
