import { ReactElement } from "react";

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CookieInfo {
  name: string;
  value: string;
  domain: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | 'Unspecified';
}

export interface ScriptInfo {
  src: string;
  isThirdParty: boolean;
}

export interface Violation {
  id: string;
  type: string;
  category: string;
  description: string;
  recommendation: string;
  severity: Severity;
  element: string; // e.g., the cookie name or script src
  law: string; // e.g., "GDPR Article 32, CCPA Section 1798.150"
  learnMoreUrl?: string;
}

export interface AnalysisResult {
  url: string;
  scanDate: string;
  cookies: CookieInfo[];
  scripts: ScriptInfo[];
  violations: Violation[];
  hasConsentBanner: boolean;
  score: number;
}

export type Framework = 'React' | 'HTML';

export interface GeneratedCode {
  [violationId: string]: {
    [key in Framework]?: {
      code: string;
      guide: string;
    };
  };
}