import * as cheerio from 'cheerio';
import { RawScanData } from './scanner';
import { AnalysisResult, Violation, CookieInfo, ScriptInfo } from '../../types';
import { Cookie } from 'playwright-core';

// A simple function to determine if a script is third-party
const isThirdParty = (src: string, ownDomain: string): boolean => {
  try {
    const scriptUrl = new URL(src);
    return !scriptUrl.hostname.endsWith(ownDomain) && scriptUrl.hostname !== ownDomain;
  } catch (e) {
    return false; // Invalid URL or relative path
  }
};

// Expanded list of known trackers, analytics, ad networks, and social widgets
const knownTrackers = [
    // Analytics
    'google-analytics.com', 'googletagmanager.com', 'analytics.js', 'ga.js', 'gtag.js',
    'matomo.js', 'piwik.js', 'statcounter.com', 'hotjar.com', 'clarity.ms', 'yandex.ru/metrika',
    'mixpanel.com', 'segment.com', 'amplitude.com',
    // Advertising & Marketing
    'doubleclick.net', 'ads.google.com', 'adservice.google.com', 'criteo.net', 'adnxs.com',
    'scorecardresearch.com', 'quantserve.com', 'rubiconproject.com', 'taboola.com', 'outbrain.com',
    'adsrvr.org', 'hubspot.com', 'marketo.net', 'krxd.net', 'dotomi.com', 'pubmatic.com', 'openx.net',
    // Social Media Pixels & Widgets
    'connect.facebook.net', 'facebook.net/sdk.js', 'platform.twitter.com', 'static.licdn.com',
    'linkedin.com/px', 'pinterest.com/pin.js', 'tiktok.com', 'snap.com',
    // Tag Managers
    'googletagmanager.com/gtm.js', 'launch.adobe.com', 'ensighten.com', 'tealiumiq.com',
    // Device Fingerprinting
    'fingerprintjs.com', 'fingerprint.com',
    // Embedded Content that sets cookies
    'youtube.com/embed', 'player.vimeo.com',
];


const calculateScore = (violations: Violation[]): number => {
    let score = 100;
    const weights = { Low: 2, Medium: 5, High: 10, Critical: 20 };
    violations.forEach(v => {
        score -= weights[v.severity];
    });
    return Math.max(0, score); // Score cannot be negative
};

let violationIdCounter = 0;
const generateId = () => `violation-${violationIdCounter++}`;


export function mapViolations(rawData: RawScanData, url: string): AnalysisResult {
  const { cookies, scripts, html } = rawData;
  const $ = cheerio.load(html);
  const violations: Violation[] = [];
  const siteUrl = new URL(url);
  const ownDomain = siteUrl.hostname.replace('www.', '');
  violationIdCounter = 0; // Reset counter for each scan

  // === 1. Cookie Analysis ===
  const mappedCookies: CookieInfo[] = cookies.map((c: Cookie) => {
    const cookieDomain = c.domain.startsWith('.') ? c.domain.substring(1) : c.domain;
    const isThirdPartyCookie = !cookieDomain.endsWith(ownDomain);
    
    if (isThirdPartyCookie) {
        violations.push({
            id: generateId(), type: 'Third-Party Cookie Set', category: 'Tracking & Consent',
            description: `A third-party cookie '${c.name}' from the domain '${c.domain}' was set. Third-party cookies often track users across different websites and require explicit consent.`,
            recommendation: "Audit all third-party cookies. Ensure they are not set before the user gives explicit, informed consent for tracking purposes.",
            severity: 'High', element: `${c.name} (${c.domain})`, law: 'ePrivacy Directive, GDPR Article 6',
        });
    }

    if (!c.secure) {
      violations.push({
        id: generateId(), type: 'Insecure Cookie Transmission', category: 'Data Security',
        description: `The cookie '${c.name}' is not using the 'Secure' flag, meaning it can be transmitted over unencrypted connections.`,
        recommendation: "Ensure all cookies are transmitted only over HTTPS by adding the 'Secure' flag.",
        severity: 'High', element: c.name, law: 'GDPR Article 32',
      });
    }
    if (!c.httpOnly && !c.name.startsWith('__utm') && !c.name.startsWith('_ga')) { // Exclude common analytics cookies often read by JS
       violations.push({
        id: generateId(), type: 'Cookie Accessible to Client-Side Scripts', category: 'Data Security',
        description: `The cookie '${c.name}' is missing the 'HttpOnly' flag, making it accessible to client-side scripts and vulnerable to XSS attacks.`,
        recommendation: "Set the 'HttpOnly' flag on cookies that do not need to be accessed by JavaScript unless absolutely necessary.",
        severity: 'Medium', element: c.name, law: 'ePrivacy Directive',
      });
    }
    if (c.sameSite === 'None' && !c.secure) {
        violations.push({
            id: generateId(), type: 'Insecure SameSite=None Cookie', category: 'Data Security',
            description: `The cookie '${c.name}' is set with 'SameSite=None' but is not marked 'Secure'. Modern browsers require 'SameSite=None' cookies to also be 'Secure'.`,
            recommendation: "Add the 'Secure' flag to any cookie that uses 'SameSite=None'.",
            severity: 'High', element: c.name, law: 'Browser Security Policy',
        });
    }
    // Check for excessive cookie expiration (e.g., > 13 months)
    const thirteenMonthsInSeconds = 13 * 30 * 24 * 60 * 60;
    if (c.expires !== -1 && c.expires > (Date.now() / 1000 + thirteenMonthsInSeconds)) {
        violations.push({
            id: generateId(), type: 'Excessive Cookie Expiration Date', category: 'Data Minimization',
            description: `The cookie '${c.name}' has an expiration date set for more than 13 months in the future, which may not comply with data retention guidelines.`,
            recommendation: "Review the purpose of this cookie and set a shorter, more appropriate expiration date (typically 12 months or less).",
            severity: 'Low', element: c.name, law: 'GDPR Article 5(1)(e)',
        });
    }

    return {
      name: c.name, value: c.value, domain: c.domain, secure: c.secure,
      httpOnly: c.httpOnly, sameSite: c.sameSite as CookieInfo['sameSite'] || 'Unspecified',
    };
  });

  // === 2. Script & Tracker Analysis ===
  const mappedScripts: ScriptInfo[] = scripts.map(s => {
    const isThirdPartyScript = isThirdParty(s.src, ownDomain);
    if (isThirdPartyScript && knownTrackers.some(tracker => s.src.includes(tracker))) {
        const trackerDomain = new URL(s.src).hostname;
        const violationType = s.src.includes('fingerprint') ? 'Device Fingerprinting Script Detected' : 'Third-Party Tracking Script Detected';
        const description = s.src.includes('fingerprint') 
            ? `The script from '${trackerDomain}' appears to be a device fingerprinting script, a highly invasive tracking technique.`
            : `The script from '${trackerDomain}' appears to be a tracking/analytics script. This requires explicit user consent before loading.`;
         violations.push({
            id: generateId(), type: violationType, category: 'Tracking & Consent',
            description: description,
            recommendation: "Implement a Consent Management Platform (CMP) to block this script from loading until the user provides specific, informed consent.",
            severity: 'Critical', element: s.src, law: 'GDPR Article 6, ePrivacy Directive',
        });
    }
    // Check for third party fonts (potential data transfer)
    if (s.src.includes('fonts.googleapis.com')) {
         violations.push({
            id: generateId(), type: 'Third-Party Fonts Loaded', category: 'Data Transfer',
            description: `Google Fonts are loaded from a third-party server, which may transfer user IP addresses to Google. This has been scrutinized under GDPR.`,
            recommendation: "Consider self-hosting the fonts to avoid sending user data to third parties.",
            severity: 'Low', element: s.src, law: 'GDPR Chapter V',
        });
    }
    if (s.src.includes('google.com/recaptcha')) {
        violations.push({
            id: generateId(), type: 'Google ReCAPTCHA Implementation', category: 'Data Transfer',
            description: 'Google ReCAPTCHA is implemented, which transfers significant user data to Google for analysis and may be subject to data transfer regulations.',
            recommendation: 'Ensure your privacy policy clearly discloses the use of ReCAPTCHA and the associated data transfer to Google. Consider privacy-focused alternatives.',
            severity: 'Medium', element: s.src, law: 'GDPR Chapter V, Article 13',
        })
    }
    return { src: s.src, isThirdParty: isThirdPartyScript };
  });

  // === 3. HTML Content Analysis ===
  const bodyText = $('body').text();
  const consentBanner = $('[id*="consent"], [class*="cookie"], [aria-label*="cookie"], [data-testid*="consent"]');
  const hasConsentBanner = consentBanner.length > 0;
  if (!hasConsentBanner) {
      violations.push({
        id: generateId(), type: 'No Consent Banner Detected', category: 'Consent & Transparency',
        description: 'The scanner could not find a clear cookie consent banner or pop-up on the page.',
        recommendation: "Implement a compliant consent banner that allows users to accept, reject, and manage their cookie preferences before any non-essential cookies are set.",
        severity: 'Critical', element: '<body>', law: 'GDPR Article 7, ePrivacy Directive',
      });
  } else {
      const bannerText = consentBanner.text().toLowerCase();
      if (!bannerText.includes('setting') && !bannerText.includes('manage') && !bannerText.includes('preference') && !bannerText.includes('reject')) {
          violations.push({
            id: generateId(), type: 'Lack of Granular Consent Control', category: 'Consent & Transparency',
            description: 'The consent banner does not appear to offer granular controls (e.g., "Settings", "Reject"). A simple "Accept" button is not sufficient for GDPR.',
            recommendation: 'Update the consent banner to provide clear options to reject non-essential cookies and manage preferences in detail.',
            severity: 'High', element: 'Consent Banner', law: 'GDPR Article 7',
          });
      }
  }

  $('input[type="checkbox"][checked]').each((i, el) => {
    const textAround = $(el).parent().text().toLowerCase();
    if (textAround.includes('consent') || textAround.includes('agree') || textAround.includes('newsletter')) {
        violations.push({
            id: generateId(), type: 'Pre-ticked Consent Box', category: 'Consent & Transparency',
            description: 'A checkbox related to consent or marketing was found to be pre-ticked, which is not a valid form of affirmative consent.',
            recommendation: "Ensure all consent checkboxes are unchecked by default, requiring an explicit action from the user.",
            severity: 'High', element: `Checkbox with label: "${$(el).parent().text().trim()}"`, law: 'GDPR Article 4(11)',
        });
    }
  });
  
  if (bodyText.match(/by using this site|by continuing to use/i)) {
      violations.push({
        id: generateId(), type: 'Vague or Implied Consent Language', category: 'Consent & Transparency',
        description: 'The site contains language like "By using this site, you accept cookies," which is not considered valid, explicit consent under GDPR.',
        recommendation: "Remove implied consent language and rely on a consent banner with clear accept/reject actions.",
        severity: 'Medium', element: 'Body text', law: 'GDPR Article 7',
      });
  }
  
  if ($('a:contains("Privacy Policy"), a:contains("privacy policy"), a:contains("Privacy")').length === 0) {
      violations.push({
        id: generateId(), type: 'Privacy Policy Link Missing', category: 'Consent & Transparency',
        description: 'A clear and accessible link to the Privacy Policy was not found on the page.',
        recommendation: "Add a conspicuous link to your Privacy Policy in the website's footer.",
        severity: 'High', element: '<footer>', law: 'GDPR Article 13, CCPA Section 1798.130',
      });
  }
  
  if ($('a:contains("Cookie Policy"), a:contains("cookie policy"), a:contains("Cookie Settings")').length === 0) {
      violations.push({
        id: generateId(), type: 'Cookie Policy or Settings Link Missing', category: 'Consent & Transparency',
        description: 'A link to a detailed cookie policy or a settings panel for managing consent was not found.',
        recommendation: "Provide a link in the footer to a page explaining the cookies used and for managing preferences.",
        severity: 'Medium', element: '<footer>', law: 'ePrivacy Directive',
      });
  }

  if ($('a:contains("Do Not Sell"), a:contains("Do not sell"), a:contains("Do Not Share")').length === 0) {
        violations.push({
            id: generateId(), type: "CCPA: 'Do Not Sell or Share' Link Missing", category: 'User Rights',
            description: 'A "Do Not Sell or Share My Personal Information" link, required under CCPA/CPRA, is missing.',
            recommendation: "Add a 'Do Not Sell or Share My Personal Information' link to the website footer.",
            severity: 'High', element: '<footer>', law: 'CCPA Section 1798.135',
        });
  }

  if ($('a:contains("Limit the Use of My Sensitive Personal Information")').length === 0) {
        violations.push({
            id: generateId(), type: "CPRA: 'Limit Use of Sensitive Information' Link Missing", category: 'User Rights',
            description: 'A "Limit the Use of My Sensitive Personal Information" link, required under CPRA for businesses that collect sensitive data, is missing.',
            recommendation: "If you collect sensitive personal information, add this link to your website footer.",
            severity: 'High', element: '<footer>', law: 'CPRA Section 1798.121',
        });
  }
  
  if ($('a:contains("Data Subject Request"), a:contains("Access My Data")').length === 0 && !bodyText.includes('data subject access request')) {
      violations.push({
        id: generateId(), type: 'No Clear Mechanism for Data Subject Rights (DSAR)', category: 'User Rights',
        description: 'No clear link or form was found for users to exercise their data subject rights (e.g., access, deletion).',
        recommendation: 'Provide a clear and accessible way for users to submit DSARs, such as a dedicated page linked from the privacy policy or footer.',
        severity: 'High', element: '<footer>', law: 'GDPR Chapter 3',
      });
  }
  
  $('form').each((i, el) => {
    const action = $(el).attr('action');
    // FIX: Replaced .startsWith() with .indexOf() === 0 for broader compatibility and to avoid potential
    // environment-specific issues with ES6 string methods.
    if (action && action.indexOf('http://') === 0) {
        violations.push({
            id: generateId(), type: 'Insecure Form Submission', category: 'Data Security',
            description: 'A form was found that submits data to a non-HTTPS (http://) endpoint, which is insecure.',
            recommendation: 'Ensure all form actions use HTTPS to encrypt user data in transit.',
            severity: 'Critical', element: `<form action="${action}">`, law: 'GDPR Article 32',
        });
    }
  });

  $('input[name*="passw"], input[name*="card"], input[name*="credit"], input[name="cvv"]').each((i, el) => {
    if ($(el).attr('autocomplete') !== 'off') {
        violations.push({
            id: generateId(), type: 'Autocomplete Enabled on Sensitive Field', category: 'Data Security',
            description: `A form field with a sensitive name ('${$(el).attr('name')}') does not have autocomplete disabled. This can pose a security risk in shared environments.`,
            recommendation: "Add the 'autocomplete=\"off\"' attribute to sensitive input fields like passwords and credit card numbers.",
            severity: 'Low', element: `input[name="${$(el).attr('name')}"]`, law: 'General Security Best Practice',
        });
    }
  });
  
  $('a[href^="mailto:"]').each((i, el) => {
      violations.push({
        id: generateId(), type: 'Plaintext Email Address Found', category: 'Data Security',
        description: `An email address (${$(el).attr('href')}) was found directly in the HTML, making it vulnerable to harvesting by spam bots.`,
        recommendation: 'Obfuscate email addresses using JavaScript or use a contact form instead.',
        severity: 'Low', element: $(el).attr('href') || 'mailto link', law: 'General Security Best Practice',
      });
  });

  // Check for mixed content
  if (siteUrl.protocol === 'https:') {
    $('img, script, link[rel="stylesheet"]').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('href');
        if (src && src.startsWith('http://')) {
            violations.push({
                id: generateId(), type: 'Mixed Content - Insecure Asset Loaded', category: 'Data Security',
                description: `An insecure asset (${src}) is being loaded on a secure (HTTPS) page. This can compromise the security of the entire page.`,
                recommendation: 'Ensure all assets (images, scripts, stylesheets) are loaded over HTTPS.',
                severity: 'Medium', element: src, law: 'General Security Best Practice',
            });
        }
    });
  }

  return {
    url,
    scanDate: new Date().toISOString(),
    cookies: mappedCookies,
    scripts: mappedScripts,
    violations,
    hasConsentBanner,
    score: calculateScore(violations),
  };
}
