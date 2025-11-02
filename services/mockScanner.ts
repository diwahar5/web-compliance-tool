import type { AnalysisResult, Violation } from '../types';

const mockViolations: Violation[] = [
  {
    id: 'V-001',
    type: 'Missing Cookie Consent Banner',
    description: 'The website does not display a cookie consent banner, which is required by GDPR to inform users about cookie usage and obtain consent before storing non-essential cookies.',
    recommendation: 'Implement a compliant cookie consent banner that blocks non-essential cookies by default and provides clear options for users to accept or reject them.',
    severity: 'Critical',
    category: 'Consent & Transparency',
    law: 'GDPR Article 7, ePrivacy Directive',
    learnMoreUrl: 'https://gdpr.eu/cookies/',
  },
   {
      id: 'V-010',
      type: "Missing 'Do Not Sell My Personal Information' Link",
      description: "The website does not feature a 'Do Not Sell My Personal Information' link on its homepage, which is a key requirement under the CCPA for businesses that 'sell' consumer data (a term with a very broad definition).",
      recommendation: "Add a clear and conspicuous 'Do Not Sell My Personal Information' link to the website's footer. This link should lead to a page where users can easily opt out of the sale of their data.",
      severity: 'Critical',
      category: 'User Rights',
      law: 'CCPA',
      learnMoreUrl: 'https://oag.ca.gov/privacy/ccpa',
  },
  {
    id: 'V-015',
    type: 'Missing "Limit Use of Sensitive PII" Link',
    description: "The website does not provide a 'Limit the Use of My Sensitive Personal Information' link, a key requirement under the California Privacy Rights Act (CPRA) if sensitive data is collected and used for purposes beyond providing the requested service.",
    recommendation: "If you collect sensitive personal information (e.g., precise geolocation, health data, race), add a clear link with the required text to your website's footer. This should lead to a page where users can opt out.",
    severity: 'Critical',
    category: 'User Rights',
    law: 'CPRA / CCPA',
    learnMoreUrl: 'https://oag.ca.gov/privacy/ccpa',
  },
   {
      id: 'V-014',
      type: "Lack of Age-Gating / Parental Consent Mechanism",
      description: "The website may appeal to children under 16 but lacks an age-gating mechanism or a process to obtain verifiable parental consent before collecting personal information, creating risk under COPPA and GDPR.",
      recommendation: "Implement an age-gate for user registration. If a user is under the applicable age of consent (e.g., 13 in the US, 16 in the EU), require verifiable parental consent before creating an account or collecting data.",
      severity: 'Critical',
      category: 'User Rights',
      law: 'COPPA, GDPR Article 8',
  },
  {
    id: 'V-002',
    type: 'Insecure Cookie',
    description: 'A session cookie was found without the "Secure" flag, meaning it can be transmitted over unencrypted connections, making it vulnerable to interception.',
    recommendation: 'Ensure all cookies, especially those containing session identifiers or personal data, are transmitted only over HTTPS by setting the "Secure" flag.',
    severity: 'High',
    category: 'Data Security',
    law: 'GDPR Article 32',
    element: 'session_id=...; path=/',
  },
  {
      id: 'V-003',
      type: 'Third-Party Tracking Script without Consent',
      description: 'A third-party tracking script from "google-analytics.com" was loaded before any user consent was obtained, potentially collecting user data without permission.',
      recommendation: 'Use a tag manager or consent management platform to conditionally load tracking scripts only after the user has given explicit consent.',
      severity: 'High',
      category: 'Third-Party Risk',
      law: 'GDPR, CCPA',
      element: 'https://www.google-analytics.com/analytics.js',
  },
  {
      id: 'V-012',
      type: 'PII Exposed in URL Parameters',
      description: 'An email address or other personally identifiable information (PII) was detected in a URL query parameter. This is insecure as URLs are often logged by servers and can be exposed in browser history or referrer headers.',
      recommendation: 'Refactor the application to pass sensitive data through secure methods like POST request bodies or encrypted tokens, never through URL query parameters.',
      severity: 'High',
      category: 'Data Security',
      law: 'GDPR Article 32',
      element: 'https://example.com/profile?email=user@test.com'
  },
  {
      id: 'V-009',
      type: 'Pre-checked Consent Boxes',
      description: 'Forms for marketing subscriptions or other consents use pre-checked boxes. GDPR requires consent to be an unambiguous, affirmative action.',
      recommendation: 'Ensure all consent checkboxes on forms are unchecked by default, requiring the user to take a positive action to opt-in.',
      severity: 'High',
      category: 'User Rights',
      law: 'GDPR Article 4(11)',
  },
    {
      id: 'V-007',
      type: 'Data Transfer Without Adequate Safeguards',
      description: 'User data is transferred to third-party services located in countries without an adequate level of data protection, and no appropriate safeguards like Standard Contractual Clauses (SCCs) are mentioned.',
      recommendation: 'Ensure that any international data transfers are protected by adequate safeguards such as SCCs or Binding Corporate Rules (BCRs). Disclose these safeguards in your privacy policy.',
      severity: 'High',
      category: 'Data Transfers',
      law: 'GDPR Chapter 5',
  },
  {
      id: 'V-004',
      type: 'Missing Privacy Policy Link',
      description: 'No clear and accessible link to a privacy policy was found in the website footer or other common locations.',
      recommendation: 'Add a conspicuous link to your privacy policy in the website footer on all pages.',
      severity: 'Medium',
      category: 'Transparency',
      law: 'GDPR Article 13, CCPA',
  },
  {
      id: 'V-005',
      type: 'No Mechanism for Data Subject Rights (DSAR)',
      description: 'The website does not provide a clear process or form for users to exercise their data subject rights (e.g., access, deletion).',
      recommendation: 'Create a dedicated page or form where users can easily submit Data Subject Access Requests (DSARs).',
      severity: 'Medium',
      category: 'User Rights',
      law: 'GDPR Chapter 3, CCPA',
  },
  {
      id: 'V-008',
      type: 'Non-Essential Local Storage Use Without Consent',
      description: 'localStorage is being used to store user identifiers or tracking information without explicit consent. This falls under the same consent requirements as non-essential cookies.',
      recommendation: 'Treat data stored in localStorage with the same care as cookies. Obtain user consent before storing any non-essential data, including tracking identifiers, in localStorage.',
      severity: 'Medium',
      category: 'Consent & Transparency',
      law: 'ePrivacy Directive, GDPR',
      element: "localStorage.setItem('user_id', '...')"
  },
    {
      id: 'V-011',
      type: 'Undisclosed Financial Incentive',
      description: 'The website offers financial incentives (e.g., discounts for email sign-ups) without clearly explaining the terms or how the value of the consumer\'s data is calculated, as required by CCPA.',
      recommendation: 'Create a "Notice of Financial Incentive" that explains the program\'s material terms, how to opt-in, and includes a good-faith estimate of the value of the consumer\'s data.',
      severity: 'Medium',
      category: 'Transparency',
      law: 'CCPA',
  },
  {
    id: 'V-016',
    type: 'Undefined Data Retention Periods',
    description: 'The privacy policy lacks specific information on how long user data is stored. The GDPR principle of storage limitation requires data to be kept only as long as necessary for its stated purpose.',
    recommendation: 'Update your privacy policy to define clear retention periods for each category of personal data you collect (e.g., "Customer support inquiries are retained for 1 year after resolution.").',
    severity: 'Medium',
    category: 'Transparency',
    law: 'GDPR Article 5(1)(e)',
  },
  {
    id: 'V-017',
    type: 'Incomplete Disclosure of Data Categories',
    description: "The privacy policy fails to list the specific statutory categories of personal information collected and the categories of sources from which it was obtained, as mandated by the CCPA.",
    recommendation: "Update the privacy policy to include a detailed section listing the categories of PII defined by the CCPA (e.g., Identifiers, Commercial information, Internet activity) and the categories of sources (e.g., 'Directly from consumers', 'Analytics providers').",
    severity: 'Medium',
    category: 'Transparency',
    law: 'CCPA',
  },
  {
    id: 'V-006',
    type: 'Vague Language in Privacy Policy',
    description: 'The privacy policy uses vague or overly broad language (e.g., "we may collect data to improve our services") without specifying what data is collected and for what exact purposes.',
    recommendation: 'Update the privacy policy to be specific about the types of personal data collected, the legal basis for processing, the purpose of collection, and data retention periods.',
    severity: 'Low',
    category: 'Transparency',
    law: 'GDPR Article 13 & 14',
    learnMoreUrl: 'https://gdpr-info.eu/art-13-gdpr/',
  },
   {
      id: 'V-013',
      type: 'Undisclosed Third-Party Fonts',
      description: 'The website loads fonts from a third-party service (e.g., Google Fonts), which may collect user IP addresses. This data processing is not disclosed in the privacy policy.',
      recommendation: 'Disclose the use of third-party font services in the privacy policy, explaining what data is collected. For stronger compliance, consider self-hosting the fonts to avoid data transfer.',
      severity: 'Low',
      category: 'Third-Party Risk',
      law: 'GDPR',
  },
];

export const performMockScan = async (url: string): Promise<AnalysisResult> => {
  console.log(`Performing mock scan for: ${url}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Simulate a potential error for a specific URL for testing purposes
  if (url.includes('error')) {
      throw new Error("Mock Scan Error: This is a simulated failure for testing error handling.");
  }

  const result: AnalysisResult = {
    url,
    scanDate: new Date().toISOString(),
    score: 15,
    hasConsentBanner: false,
    violations: mockViolations,
  };

  return result;
};