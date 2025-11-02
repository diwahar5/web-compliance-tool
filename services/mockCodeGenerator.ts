import type { Violation } from '../types';

const mockCodeFixes: Record<string, Record<string, { code: string; guide: string }>> = {
  'V-001': { // Missing Cookie Consent Banner
    'React': {
      code: `import React, { useState, useEffect } from 'react';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
    // Logic to enable cookies/scripts
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setVisible(false);
    // Logic to keep cookies/scripts disabled
  };
  
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-secondary p-4 text-brand-text shadow-lg z-50 flex items-center justify-between">
      <p className="text-sm">We use cookies to improve your experience. Please accept our cookie policy.</p>
      <div>
        <button onClick={handleAccept} className="bg-brand-accent text-white px-4 py-2 rounded-md text-sm font-bold mr-2">Accept</button>
        <button onClick={handleDecline} className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-bold">Decline</button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
`,
      guide: `
- Place this \`CookieConsentBanner\` component in your main App layout.
- It uses \`localStorage\` to remember the user's choice.
- You'll need to add your own logic to conditionally load tracking scripts based on the user's consent.
      `
    },
    'HTML': {
      code: `<div id="cookie-banner" style="position: fixed; bottom: 0; width: 100%; background: #1E293B; color: #E2E8F0; padding: 1rem; text-align: center; z-index: 1000;">
  <p>This website uses cookies to ensure you get the best experience. <a href="/privacy-policy" style="color: #3B82F6;">Learn more</a>.</p>
  <button id="accept-cookies" style="background: #3B82F6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; margin: 0.5rem;">Got it!</button>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    
    if (!localStorage.getItem('cookies_accepted')) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }

    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('cookies_accepted', 'true');
      banner.style.display = 'none';
    });
  });
</script>
`,
      guide: `
- Paste this HTML snippet just before the closing \`</body>\` tag.
- Create a '/privacy-policy' page or update the link.
- This is a basic example; a full solution requires blocking scripts before consent is given.
`
    }
  },
  'V-002': { // Insecure Cookie
    'React': { // This is a server-side or JS cookie setting example.
      code: `// In a Node.js/Express backend:
// res.cookie('session_id', 'your_session_value', { 
//   httpOnly: true, 
//   secure: true, 
//   sameSite: 'Strict' 
// });

// In client-side JavaScript (less secure):
document.cookie = "session_id=your_value; SameSite=Strict; Secure";
`,
      guide: `
- The 'Secure' flag ensures the cookie is only sent over HTTPS.
- The 'HttpOnly' flag (server-side only) prevents JavaScript access, mitigating XSS attacks.
- 'SameSite=Strict' provides protection against CSRF attacks.
- It's best practice to set sensitive cookies from the server-side.
      `
    },
    'HTML': {
      code: `// This fix is typically applied in JavaScript or on the server.
// When setting a cookie via JavaScript:
document.cookie = "myCookie=myValue; Secure; SameSite=Strict";`,
      guide: `
- The 'Secure' flag should be added when setting cookies.
- This tells the browser to only send the cookie with an encrypted request over HTTPS.
- If you set cookies from a backend server, ensure you are setting the 'secure' attribute there.
`
    }
  },
  'V-003': { // Third-Party Tracking Script
    'React': {
      code: `import React, { useEffect } from 'react';
import { useCookieConsent } from './useCookieConsent'; // Assume a custom hook

const GoogleAnalytics = () => {
  const { consentGiven } = useCookieConsent();

  useEffect(() => {
    if (consentGiven) {
      const script = document.createElement('script');
      script.src = 'https://www.google-analytics.com/analytics.js';
      script.async = true;
      document.body.appendChild(script);

      // Initialize GA or other trackers here...

      return () => {
        document.body.removeChild(script);
      }
    }
  }, [consentGiven]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
`,
      guide: `
- This component conditionally loads the Google Analytics script based on consent state.
- You need to implement a consent management solution (e.g., a custom hook or context) to provide the \`consentGiven\` value.
- Include this component in your app's main layout.
      `
    },
    'HTML': {
      code: `<script>
function loadAnalytics() {
  // Check if consent has been given
  if (localStorage.getItem('cookie_consent') === 'true') {
    var script = document.createElement('script');
    script.src = 'https://www.google-analytics.com/analytics.js';
    script.async = true;
    document.head.appendChild(script);
    // ... further initialization for analytics
    console.log('Analytics loaded.');
  } else {
    console.log('Analytics blocked due to lack of consent.');
  }
}

// Call this function after the user gives consent.
// For example, in the 'Accept' button's click handler from the cookie banner.
// document.getElementById('accept-cookies').addEventListener('click', loadAnalytics);
</script>
`,
      guide: `
- This script should be placed in the \`<head>\` of your HTML.
- The \`loadAnalytics\` function should only be called *after* a user explicitly gives consent.
- Integrate this with your cookie consent banner logic.
`
    }
  },
  'V-004': { // Missing Privacy Policy Link
    'React': {
      code: `const Footer = () => (
  <footer className="bg-brand-primary border-t border-slate-700 p-4 text-center">
    <p>&copy; ${new Date().getFullYear()} Your Company Name</p>
    <a href="/privacy-policy" className="text-brand-accent hover:underline">
      Privacy Policy
    </a>
  </footer>
);

export default Footer;
`,
      guide: `
- Add this \`Footer\` component to your main application layout.
- Ensure you have a page/route set up at '/privacy-policy'.
      `
    },
    'HTML': {
      code: `<footer>
  <p>&copy; 2024 Your Website</p>
  <a href="/privacy-policy.html">Privacy Policy</a>
</footer>
`,
      guide: `
- Add this HTML snippet to the bottom of every page on your site, typically just before the closing \`</body>\` tag.
- Create a file named 'privacy-policy.html' with your privacy policy content.
`
    }
  },
  'V-005': { // No Mechanism for Data Subject Rights (DSAR)
    'React': {
      code: `import React, { useState } from 'react';

const DSARForm = () => {
  const [requestType, setRequestType] = useState('access');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to submit the DSAR request
    console.log({ email, requestType, message });
    setSubmitted(true);
  };

  if (submitted) {
    return <div className="text-green-400">Your request has been submitted. We will respond shortly.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-brand-secondary p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-brand-text">Data Subject Request</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-subtle">Your Email</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-brand-primary p-2 rounded-md mt-1" />
      </div>
      <div>
        <label htmlFor="requestType" className="block text-sm font-medium text-brand-subtle">Request Type</label>
        <select id="requestType" value={requestType} onChange={e => setRequestType(e.target.value)} className="w-full bg-brand-primary p-2 rounded-md mt-1">
          <option value="access">Request Access to My Data</option>
          <option value="delete">Request Deletion of My Data</option>
          <option value="correct">Request Correction of My Data</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-subtle">Additional Information (Optional)</label>
        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows="4" className="w-full bg-brand-primary p-2 rounded-md mt-1"></textarea>
      </div>
      <button type="submit" className="w-full bg-brand-accent text-white py-2 rounded-md font-bold">Submit Request</button>
    </form>
  );
};

export default DSARForm;`,
      guide: `
- Create a dedicated page for this DSAR form (e.g., /data-request).
- Link to this page from your privacy policy and website footer.
- You must implement a backend endpoint to receive and process these form submissions securely.
`
    },
    'HTML': {
      code: `<form action="/submit-dsar" method="post">
  <h2>Data Subject Request Form</h2>
  
  <label for="email">Your Email:</label><br>
  <input type="email" id="email" name="email" required><br><br>
  
  <label for="request_type">I want to:</label><br>
  <select name="request_type" id="request_type">
    <option value="access">Access my data</option>
    <option value="delete">Delete my data</option>
  </select><br><br>
  
  <label for="details">Details:</label><br>
  <textarea id="details" name="details" rows="4" cols="50"></textarea><br><br>
  
  <input type="submit" value="Submit Request">
</form>`,
      guide: `
- Place this form on a dedicated page on your website (e.g., 'data-request.html').
- The 'action' attribute should point to a server-side script that can process the form data.
- Ensure the submission process is secure and you have a system to track and respond to requests.
`
    }
  },
  'V-006': { // Vague Language in Privacy Policy
    'React': {
      code: `// This is a content fix, not a code fix.
// Example of specific language for a privacy policy:

/*
**OLD (Vague):**
"We may collect personal information to improve our services."

**NEW (Specific):**
"**Analytics Data:** We collect anonymized IP addresses, browser types, and page view information using Google Analytics to understand user behavior and improve our website's performance. Our legal basis for this is our legitimate interest. This data is retained for 26 months."
*/
const PrivacyPolicySection = () => (
  <div>
    <h3>Analytics Data</h3>
    <p>
      We collect anonymized IP addresses, browser types, and page view information using Google Analytics
      to understand user behavior and improve our website's performance. Our legal basis for this is our
      legitimate interest. This data is retained for 26 months.
    </p>
  </div>
);
`,
      guide: `
- Review your privacy policy for ambiguous terms like "may collect," "etc.," or "for business purposes."
- Replace them with specific details: **What** data, **Why** you collect it (purpose), **How long** you keep it (retention), and your **Legal Basis** (e.g., consent, legitimate interest).
`
    },
    'HTML': {
      code: `<!-- This is a content fix. Update your privacy policy page with specific language. -->
<!-- OLD (Vague): -->
<p>We may collect personal information to improve our services.</p>

<!-- NEW (Specific): -->
<h3>Analytics Data</h3>
<p>
  We collect anonymized IP addresses, browser types, and page view information using Google Analytics
  to understand user behavior and improve our website's performance. Our legal basis for this is our
  legitimate interest. This data is retained for 26 months.
</p>
`,
      guide: `
- Go through your privacy policy document.
- For each data collection point, clearly state the **specific data** collected, the **purpose**, the **retention period**, and the **legal basis** for processing.
`
    }
  },
  'V-007': { // Data Transfer Without Adequate Safeguards
    'React': {
      code: `// This is a content fix for your privacy policy.
const InternationalTransfersSection = () => (
  <div>
    <h3>International Data Transfers</h3>
    <p>
      Your information may be transferred to and maintained on computers located outside of your state,
      province, country, or other governmental jurisdiction where the data protection laws may differ.
      If you are located in the European Economic Area (EEA), we will ensure that any transfer of your
      personal data to third countries is protected by appropriate safeguards, such as the use of
      Standard Contractual Clauses (SCCs) approved by the European Commission.
    </p>
  </div>
);
`,
      guide: `
- Identify all third-party services you use that might transfer data outside the user's jurisdiction (e.g., non-EU/EEA).
- Add a section to your privacy policy explaining that these transfers occur and what safeguards (like SCCs) are in place.
- You must actually have these safeguards in place (e.g., signing a Data Processing Addendum with the service).
`
    },
    'HTML': {
      code: `<!-- Add a section like this to your privacy policy page -->
<h3>International Data Transfers</h3>
<p>
  Your information may be transferred to and maintained on computers located outside of your state,
  province, country, or other governmental jurisdiction where the data protection laws may differ.
  If you are located in the European Economic Area (EEA), we will ensure that any transfer of your
  personal data to third countries is protected by appropriate safeguards, such as the use of
  Standard Contractual Clauses (SCCs) approved by the European Commission.
</p>
`,
      guide: `
- List the third-party services you use (e.g., cloud providers, analytics tools) and check their data processing locations.
- Update your privacy policy to disclose international transfers and mention the legal safeguards you rely on.
`
    }
  },
  'V-008': { // Non-Essential Local Storage Use Without Consent
    'React': {
      code: `import { useCookieConsent } from './useCookieConsent'; // Assume a custom hook

function setTrackingId(userId) {
  const { consentGiven } = useCookieConsent();

  if (consentGiven) {
    // Only set tracking data if user has consented
    localStorage.setItem('user_tracking_id', userId);
  } else {
    console.log('Consent not given. Aborting localStorage set.');
  }
}
`,
      guide: `
- The rules for cookies also apply to other forms of local storage like \`localStorage\` and \`sessionStorage\` when used for non-essential purposes.
- Wrap any code that writes to \`localStorage\` for tracking or analytics in a consent check.
`
    },
    'HTML': {
      code: `<script>
// Before:
// localStorage.setItem('user_id', '123-abc');

// After:
function saveUserIdWithConsent(userId) {
  if (localStorage.getItem('cookie_consent') === 'true') {
    localStorage.setItem('user_id', userId);
  }
}

// Only call saveUserIdWithConsent after the user has accepted cookies.
</script>
`,
      guide: `
- Just like with tracking scripts, you must not write non-essential data to \`localStorage\` until the user has given consent.
- Check your consent flag before calling \`localStorage.setItem\`.
`
    }
  },
  'V-009': { // Pre-checked Consent Boxes
    'React': {
      code: `import { useState } from 'react';

const NewsletterForm = () => {
  const [agreed, setAgreed] = useState(false); // Default state is false

  return (
    <form>
      {/* ... other form fields ... */}
      <label>
        <input 
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I agree to receive marketing emails.
      </label>
    </form>
  );
};
`,
      guide: `
- For checkboxes related to consent (e.g., marketing, terms of service), ensure their default state is **unchecked**.
- The user must perform a positive action (clicking the box) to give consent. Do not use \`defaultChecked={true}\` or initialize the state to \`true\`.
`
    },
    'HTML': {
      code: `<!-- WRONG: Pre-checked box -->
<!-- <input type="checkbox" name="newsletter" checked> Sign up for newsletter -->

<!-- CORRECT: Unchecked by default -->
<label>
  <input type="checkbox" name="newsletter">
  Sign up for our newsletter
</label>
`,
      guide: `
- Remove the \`checked\` attribute from any consent-related \`<input type="checkbox">\` elements.
- Consent must be opt-in, not opt-out. The user must actively check the box.
`
    }
  },
};

export const generateMockCodeFix = async (violation: Violation, framework: string): Promise<{code: string, guide: string}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const fix = mockCodeFixes[violation.id]?.[framework];
  
  if (fix) {
    return fix;
  }

  return {
    code: `// No mock code available for "${violation.type}" in ${framework}.`,
    guide: `* This is a placeholder. In a real scenario, AI would generate a specific fix.`
  };
};