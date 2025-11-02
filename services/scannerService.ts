import { AnalysisResult } from '../types';

// The URL of the Python backend.
// In a real production app, this would be an environment variable.
const API_BASE_URL = 'http://127.0.0.1:8000';

export const performScan = async (url: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Use the detailed error message from the backend if available
      throw new Error(errorData.detail || `Scan failed with status: ${response.status}`);
    }

    const result: AnalysisResult = await response.json();
    return result;

  } catch (error) {
    if (error instanceof TypeError) {
      // This often happens if the backend server is not running (network error)
      throw new Error('Could not connect to the scanning service. Please ensure the backend server is running and accessible.');
    }
    // Re-throw other errors to be caught by the calling component
    throw error;
  }
};
