import React, { useState, useEffect } from 'react';

interface CodeSnippetProps {
  code?: string;
  language: string;
  isLoading: boolean;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language, isLoading }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
    }
  };
  
  if (isLoading) {
    return (
      <div className="mt-4 w-full bg-brand-secondary p-4 rounded-md border border-slate-700 animate-pulse">
        <div className="h-4 bg-brand-primary rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-brand-primary rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-brand-primary rounded w-5/6"></div>
      </div>
    );
  }

  if (!code) {
    return null;
  }

  return (
    <div className="mt-4 relative bg-brand-primary p-4 rounded-md border border-slate-700">
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md text-brand-subtle bg-brand-secondary hover:bg-slate-600 transition-colors duration-200"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
          </svg>
        )}
      </button>
      <pre className="text-sm text-brand-text whitespace-pre-wrap overflow-x-auto">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};