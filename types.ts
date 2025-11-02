// FIX: Add type definitions and export them to make this file a module.
// This resolves the "not a module" error when importing from this file.

export type ViolationSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

/**
 * Represents a single compliance violation found during a scan.
 */
export interface Violation {
  id: string;
  type: string;
  description: string;
  recommendation: string;
  severity: ViolationSeverity;
  category: string;
  law: string;
  element?: string;
  learnMoreUrl?: string;
}

/**
 * Represents the complete result of a website compliance analysis.
 */
export interface AnalysisResult {
  url: string;
  scanDate: string; // ISO date string
  score: number;
  hasConsentBanner: boolean;
  violations: Violation[];
}
