import React from 'react';
import type { AnalysisResult } from '../types';

interface DownloadButtonsProps {
    result: AnalysisResult;
    generatedCode: Record<string, any>;
}

const generateReportContent = (result: AnalysisResult, generatedCode: Record<string, any>, format: 'txt' | 'html'): string => {
  const nl = format === 'txt' ? '\n' : '<br>';
  const h1 = (text: string) => format === 'txt' ? `\n=== ${text.toUpperCase()} ===\n` : `<h2>${text}</h2>`;
  const h2 = (text: string) => format === 'txt' ? `\n--- ${text} ---\n` : `<h3>${text}</h3>`;
  const p = (text: string) => format === 'txt' ? text + '\n' : `<p>${text}</p>`;
  
  const escapeHtml = (unsafe: string) => {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  const pre = (code: string, lang: string) => format === 'txt' ? `\n${code}\n` : `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;

  let content = '';
  if (format === 'html') {
    content += `
      <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Compliance Report for ${result.url}</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:800px;margin:0 auto;padding:20px}h1,h2,h3{color:#111}h1{border-bottom:2px solid #eee;padding-bottom:10px}pre{background-color:#f4f4f4;padding:15px;border-radius:5px;white-space:pre-wrap;word-wrap:break-word}code{font-family:monospace}.violation{border:1px solid #ddd;padding:15px;margin-bottom:20px;border-radius:5px}.violation h3{margin-top:0}</style>
      </head><body><h1>Compliance Report</h1>`;
  }

  content += p(`URL: ${result.url}`);
  content += p(`Scan Date: ${new Date(result.scanDate).toLocaleString()}`);
  content += p(`Overall Score: ${result.score}/100`);
  content += h1('Scan Summary');
  content += p(`Violations Found: ${result.violations.length}`);
  content += p(`Consent Banner Detected: ${result.hasConsentBanner ? 'Yes' : 'No'}`);

  content += h1('Detected Violations & Fixes');
  result.violations.forEach(v => {
    if (format === 'html') content += `<div class="violation">`;
    content += h2(`Violation: ${v.type}`);
    content += p(`Severity: ${v.severity}`);
    content += p(`Description: ${v.description}`);
    content += p(`Recommendation: ${v.recommendation}`);
    const fixes = generatedCode[v.id];
    if (fixes) {
        if (format === 'html') content += `<h4>Generated Code Fixes</h4>`;
        else content += `\nGenerated Code Fixes:\n`;
        Object.entries(fixes).forEach(([framework, data]: [string, any]) => {
            content += p(format === 'html' ? `<strong>${framework}:</strong>` : `${framework}:`);
            content += pre(data.code, framework.toLowerCase());
        });
    }
    if (format === 'html') content += `</div>`;
  });

  if (format === 'html') {
    content += '</body></html>';
  }
  return content;
};

const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);

const DownloadButtons: React.FC<DownloadButtonsProps> = ({ result, generatedCode }) => {
  const handleDownload = (format: 'txt' | 'html' | 'pdf') => {
    // Note: PDF generation is complex and would require a library like jsPDF.
    // For this implementation, 'pdf' will download the HTML version which can then be printed to PDF.
    const fileFormat = format === 'pdf' ? 'html' : format;
    const content = generateReportContent(result, generatedCode, fileFormat);
    const mimeType = fileFormat === 'txt' ? 'text/plain' : 'text/html';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new URL(result.url).hostname}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const buttonClass = "flex items-center justify-center bg-brand-accent hover:bg-blue-500 disabled:bg-brand-accent/50 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 text-sm";

  return (
    <div className="bg-brand-secondary p-4 rounded-lg shadow-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-text mb-3 sm:mb-0">Download Report</h3>
            <div className="flex gap-3">
                <button onClick={() => handleDownload('txt')} className={buttonClass}>
                    <DownloadIcon /> Download .TXT
                </button>
                <button onClick={() => handleDownload('html')} className={buttonClass}>
                    <DownloadIcon /> Download .HTML
                </button>
                 <button onClick={() => handleDownload('pdf')} className={buttonClass} title="Downloads as HTML, then use browser's Print to PDF feature">
                    <DownloadIcon /> Download .PDF
                </button>
            </div>
        </div>
    </div>
  );
};

export default DownloadButtons;
