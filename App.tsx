import React, { useState, useCallback, JSX } from "react";
import Header from "./components/Header";
import UrlInputForm from "./components/UrlInputForm";
import Loader from "./components/Loader";
import ReportView from "./components/ReportView";
import { AnalysisResult } from "./types";

// ✅ Backend API URL — change this when deploying
const BACKEND_URL = "http://127.0.0.1:8000";
// For local testing, use: const BACKEND_URL = "http://127.0.0.1:8000";

// ✅ Function to perform the actual scan using FastAPI backend
const performScan = async (scanUrl: string): Promise<AnalysisResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch(
      `${BACKEND_URL}/scan?url=${encodeURIComponent(scanUrl)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch scan results.");
    }

    if (data.status !== "success") {
      throw new Error("Scanning failed. Please try again.");
    }

    return data.data as AnalysisResult;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Scan timed out. The website took too long to respond.");
    }
    throw new Error(error.message || "Unknown error during scanning.");
  }
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedCode, setGeneratedCode] = useState<Record<string, any>>({});

  // ✅ Validate URL format before scanning
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // ✅ Handle Scan Button
  const handleScan = useCallback(async (scanUrl: string) => {
    if (!scanUrl) {
      setError("Please enter a URL to scan.");
      return;
    }

    if (!isValidUrl(scanUrl)) {
      setError("Invalid URL format. Please enter a full URL, including http:// or https://.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);
    setGeneratedCode({});

    try {
      const result = await performScan(scanUrl);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      console.error("Scan error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Handle Code Generation Output (if applicable)
  const handleCodeGenerated = useCallback(
    (violationId: string, framework: string, data: { code: string; guide: string }) => {
      setGeneratedCode((prev) => ({
        ...prev,
        [violationId]: {
          ...prev[violationId],
          [framework]: data,
        },
      }));
    },
    []
  );

  // ✅ Conditional Rendering Logic
  const renderContent = (): JSX.Element => {
    if (isLoading) return <Loader />;

    if (error) {
      return (
        <div className="mt-8 text-center text-red-400 bg-red-900/50 p-4 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      );
    }

    if (analysisResult) {
      return (
        <ReportView
          result={analysisResult}
          onCodeGenerated={handleCodeGenerated}
          generatedCode={generatedCode}
        />
      );
    }

    return (
      <div className="text-center max-w-2xl mx-auto pt-16">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-text tracking-tight">
          Privacy Compliance Scanner
        </h2>
        <p className="mt-4 text-lg text-brand-subtle">
          Enter a website URL to perform a deep analysis of its GDPR &amp; CCPA compliance.
        </p>
        <div className="mt-8">
          <UrlInputForm onScan={handleScan} isLoading={isLoading} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
