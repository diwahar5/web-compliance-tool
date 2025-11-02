import React, { useState, useCallback } from 'react';
import CodeSnippet from './CodeSnippet';
import MarkdownRenderer from './MarkdownRenderer';
import { generateMockCodeFix as generateCodeFix } from '../services/mockCodeGenerator';
import type { Violation, ViolationSeverity } from '../types';

const severityBadgeConfig: Record<ViolationSeverity, string> = {
    'Low': 'bg-gray-500/20 text-gray-300',
    'Medium': 'bg-yellow-500/20 text-yellow-300',
    'High': 'bg-orange-500/20 text-orange-300',
    'Critical': 'bg-red-600/20 text-red-300',
};

const StarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const WarningTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.273-1.21 2.91 0l5.397 10.293c.636 1.21-.19 2.607-1.455 2.607H4.314c-1.265 0-2.091-1.397-1.455-2.607l5.397-10.293zM10 14a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const SparkleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
const ExternalLinkIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>);

interface ViolationCardProps {
    violation: Violation;
    generatedCode: Record<string, { code: string; guide: string }>;
    onCodeGenerated: (violationId: string, framework: string, data: { code: string; guide: string }) => void;
}

const ViolationCard: React.FC<ViolationCardProps> = ({ violation, onCodeGenerated, generatedCode }) => {
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('React');
  const frameworks = ['React', 'HTML'];
  const badgeClass = severityBadgeConfig[violation.severity];
  const currentCode = generatedCode?.[selectedFramework];
  
  const handleGenerateCode = useCallback(async (framework: string) => {
    if (generatedCode?.[framework]) return;
    setIsGenerating(true);
    try {
      const result = await generateCodeFix(violation, framework);
      onCodeGenerated(violation.id, framework, result);
    } catch (error) {
      console.error('Failed to generate code:', error);
      const errorMessage = {
          code: `// Failed to generate code: ${error instanceof Error ? error.message : "Unknown error"}`,
          guide: "* An error occurred during code generation."
      };
      onCodeGenerated(violation.id, framework, errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [violation, onCodeGenerated, generatedCode]);

  const handleTabClick = (framework: string) => {
      setSelectedFramework(framework);
      if (isCodeVisible && !generatedCode?.[framework]) {
        handleGenerateCode(framework);
      }
  }

  const toggleCodeVisibility = () => {
    const newVisibility = !isCodeVisible;
    setIsCodeVisible(newVisibility);
    if (newVisibility && !currentCode) {
        handleGenerateCode(selectedFramework);
    }
  };

  return (
    <div className="bg-brand-secondary rounded-lg shadow-md border border-slate-700 transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center text-sm text-yellow-400 mb-2">
                    <StarIcon />
                    <span className="ml-1.5 font-semibold">{violation.category}</span>
                </div>
                <h4 className="font-bold text-lg text-brand-text">{violation.type}</h4>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{violation.severity}</span>
        </div>
        <div className="mt-4 flex items-start text-sm text-brand-subtle">
            <WarningTriangleIcon />
            <span className="ml-2">{violation.description}</span>
        </div>
        <div className="mt-4 flex items-start text-sm text-brand-subtle">
            <SparkleIcon />
            <div className="ml-2">
                <span className="font-semibold text-brand-text">Recommendation:</span>
                <span className="ml-1">{violation.recommendation}</span>
            </div>
        </div>
        <div className="mt-5 flex items-center space-x-6">
            <button
                onClick={toggleCodeVisibility}
                className="text-sm font-semibold text-brand-accent hover:text-blue-400 flex items-center transition-colors"
                aria-expanded={isCodeVisible}
                aria-controls={`code-snippet-${violation.id}`}
            >
              <CodeIcon />
              <span className="ml-2">{isCodeVisible ? 'Hide Code Snippet' : 'View Code Snippet'}</span>
            </button>
            {violation.learnMoreUrl && (
                <a
                    href={violation.learnMoreUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-accent hover:text-blue-400 flex items-center transition-colors"
                >
                    <ExternalLinkIcon />
                    <span className="ml-2">Learn More</span>
                </a>
            )}
        </div>
      </div>
      {isCodeVisible && (
        <div id={`code-snippet-${violation.id}`} className="bg-brand-primary/50 border-t border-slate-700 px-5 py-4 animate-fade-in">
          <div className="flex items-center border-b border-slate-600 mb-3">
            {frameworks.map(fw => (
              <button
                key={fw}
                onClick={() => handleTabClick(fw)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2
                  ${selectedFramework === fw 
                    ? 'border-brand-accent text-brand-accent' 
                    : 'border-transparent text-brand-subtle hover:text-brand-text'}`}
              >{fw}</button>
            ))}
          </div>
          <div>
             <h6 className="font-semibold text-brand-text mb-2">Quick Guide</h6>
             <div className="text-sm text-brand-subtle mb-4">
                {(isGenerating && !currentCode) 
                    ? <p>Generating guide...</p>
                    : <MarkdownRenderer content={currentCode?.guide || ''} />
                }
             </div>
             <CodeSnippet
                code={currentCode?.code} 
                language={(selectedFramework === 'HTML' ? 'html' : 'javascript')} 
                isLoading={isGenerating && !currentCode}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationCard;