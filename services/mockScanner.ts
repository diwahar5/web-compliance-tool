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
    score: 45,
    hasConsentBanner: false,
    violations: mockViolations,
  };

  return result;
};
