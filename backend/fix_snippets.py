# fix_snippets.py
# -----------------
# Registry of example fix snippets for detected violations

FIX_SNIPPETS = {
    "missing_consent_banner": {
        "title": "Add a Cookie Consent Banner",
        "react": """import CookieConsent from "react-cookie-consent";

<CookieConsent
  location="bottom"
  buttonText="Accept"
  enableDeclineButton
  declineButtonText="Reject"
>
  We use cookies to personalize content. Read our <a href="/privacy">Privacy Policy</a>.
</CookieConsent>""",
        "html": """<!-- Cookie Consent Banner -->
<div id="cookie-banner">
  <p>We use cookies to enhance your experience. <a href="/privacy">Learn more</a>.</p>
  <button id="accept">Accept</button>
  <button id="reject">Reject</button>
</div>"""
    },

    "insecure_cookies": {
        "title": "Set Secure and HttpOnly Cookies",
        "react": """// Example: Set cookies securely in React (client)
document.cookie = "session_id=abc123; Secure; HttpOnly; SameSite=Strict";

// Example: In Node.js/Express backend
res.cookie("session_id", "abc123", {
  secure: true,
  httpOnly: true,
  sameSite: "Strict"
});""",
        "html": """<!-- Secure cookies cannot be fully set in static HTML -->
<!-- Configure cookies via backend (e.g., Express, Django, Flask) with Secure/HttpOnly flags. -->"""
    },

    "cookies_before_consent": {
        "title": "Delay Cookies Until Consent",
        "react": """// Example: Set analytics only after consent
if (userConsented) {
  window.gtag('config', 'GA_MEASUREMENT_ID');
}""",
        "html": """<!-- Delay analytics script until user clicks 'Accept' -->
<script>
document.getElementById("accept").onclick = function() {
  var gtag = document.createElement('script');
  gtag.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(gtag);
};
</script>"""
    },

    "missing_do_not_sell": {
        "title": "Add Do Not Sell My Information Link",
        "react": """<footer>
  <a href="/do-not-sell">Do Not Sell My Personal Information</a>
</footer>""",
        "html": """<footer>
  <a href="/do-not-sell">Do Not Sell My Personal Information</a>
</footer>"""
    },

    "missing_privacy_policy": {
        "title": "Add a Privacy Policy Link",
        "react": """<footer>
  <a href="/privacy">Privacy Policy</a>
</footer>""",
        "html": """<footer>
  <a href="/privacy">Privacy Policy</a>
</footer>"""
    },

    "third_party_trackers": {
        "title": "Obtain Consent Before Loading Trackers",
        "react": """if (userConsented) {
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
  document.head.appendChild(script);
}""",
        "html": """<!-- Use Consent Mode -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied'
});
</script>"""
    },

    "no_data_deletion_mechanism": {
        "title": "Add Data Deletion Request Form",
        "react": """<form action="/delete-request" method="POST">
  <input type="email" placeholder="Enter your email" required />
  <button>Request Data Deletion</button>
</form>""",
        "html": """<form action="/delete-request" method="POST">
  <input type="email" placeholder="Enter your email" required />
  <button>Request Data Deletion</button>
</form>"""
    },

    "analytics_not_anonymizing_ip": {
        "title": "Enable IP Anonymization in Analytics",
        "react": """window.gtag('config', 'GA_MEASUREMENT_ID', {
  'anonymize_ip': true
});""",
        "html": """<script>
gtag('config', 'GA_MEASUREMENT_ID', { 'anonymize_ip': true });
</script>"""
    }
}
