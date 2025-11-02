import React from 'react';

const Loader = () => {
  return (
    <div className="my-12 flex flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-brand-accent rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-0 left-0 w-24 h-24 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>
      <p className="mt-6 text-lg font-semibold text-brand-text tracking-wider">Analyzing Website...</p>
      <p className="text-brand-subtle">This may take a moment. We're checking cookies, scripts, and consent prompts.</p>
    </div>
  );
};

export default Loader;
