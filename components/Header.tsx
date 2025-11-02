import React from 'react';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.002L2.016 5.122a1 1 0 00-.868 1.488l1.492 4.474a1 1 0 00.98 1.132l4.248.607a1 1 0 01.884 1.155l-1.42 4.26a1 1 0 001.398 1.32l4.25-1.417a1 1 0 011.155.884l.607 4.248a1 1 0 001.132.98l4.474-1.492a1 1 0 00.58-.992l.144-1.152A11.954 11.954 0 0110 1.944zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary/75 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 md:px-8 flex items-center justify-center">
        <ShieldIcon />
        <h1 className="ml-3 text-xl md:text-2xl font-bold tracking-tight text-brand-text">
          Web Compliance & AI Code Fix Generator
        </h1>
      </div>
    </header>
  );
};