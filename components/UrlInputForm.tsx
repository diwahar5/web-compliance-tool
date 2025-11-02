import React, { useState } from 'react';

interface UrlInputFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onScan, isLoading }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan(url);
  };

  return (
    <div className="bg-brand-secondary p-6 rounded-lg shadow-lg border border-slate-200">
        <form onSubmit={handleSubmit}>
            <label htmlFor="url-input" className="block text-sm font-medium text-brand-subtle mb-2">
                Enter Website URL to Analyze
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    className="flex-grow bg-brand-primary border border-slate-300 text-brand-text rounded-md px-4 py-3 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all duration-200 placeholder-brand-subtle/75"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center bg-brand-accent hover:bg-blue-500 disabled:bg-brand-accent/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-200 shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40"
                >
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanning...
                        </>
                    ) : (
                        'Scan Website'
                    )}
                </button>
            </div>
        </form>
    </div>
  );
};