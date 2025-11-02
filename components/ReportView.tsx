import React from 'react';
import ComplianceScoreCircle from './ComplianceScoreCircle';
import DownloadButtons from './DownloadButtons';
import ViolationCard from './ViolationCard';
import type { AnalysisResult, Violation } from '../types';

interface ReportViewProps {
    result: AnalysisResult;
    generatedCode: Record<string, any>;
    onCodeGenerated: (violationId: string, framework: string, data: { code: string; guide: string }) => void;
}

const severityOrder: Violation['severity'][] = ['Critical', 'High', 'Medium', 'Low'];

const SeverityBadge: React.FC<{ severity: Violation['severity']; count: number }> = ({ severity, count }) => {
    const styles: Record<Violation['severity'], string> = {
        'Low': 'bg-gray-500/20 text-gray-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-orange-500/20 text-orange-300',
        'Critical': 'bg-red-600/20 text-red-300',
    };
    return (
        <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[severity]}`}>
            {`${count} ${count > 1 ? 'issues' : 'issue'}`}
        </span>
    );
};

const ReportView: React.FC<ReportViewProps> = ({ result, onCodeGenerated, generatedCode }) => {
    const groupedViolations = result.violations.reduce((acc, v) => {
        (acc[v.severity] = acc[v.severity] || []).push(v);
        return acc;
    }, {} as Record<Violation['severity'], Violation[]>);

    const highSeverityCount = (groupedViolations['High']?.length || 0) + (groupedViolations['Critical']?.length || 0);
    const mediumSeverityCount = groupedViolations['Medium']?.length || 0;
    const lowSeverityCount = groupedViolations['Low']?.length || 0;

    return (
        <div className="mt-8 animate-fade-in">
            <div className="bg-brand-secondary p-6 md:p-8 rounded-lg shadow-lg border border-slate-700">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-text mb-6">Overall Compliance Score</h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                       <ComplianceScoreCircle score={result.score} />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-brand-subtle leading-relaxed">
                            The analysis for <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline font-semibold">{result.url}</a> is complete. It identified <span className="text-brand-text font-semibold">{`${highSeverityCount} high-severity`}</span>, <span className="text-brand-text font-semibold">{`${mediumSeverityCount} medium-severity`}</span>, and <span className="text-brand-text font-semibold">{`${lowSeverityCount} low-severity`}</span> violations, indicating significant compliance risks that require attention.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <DownloadButtons result={result} generatedCode={generatedCode} />
            </div>

            <div className="mt-10">
                {severityOrder.map(severity => (
                    groupedViolations[severity] && (
                        <div key={severity} className="mb-8">
                            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-slate-700 text-brand-text flex items-center">
                                {severity}
                                <SeverityBadge severity={severity} count={groupedViolations[severity].length} />
                            </h3>
                            <div className="space-y-4">
                                {groupedViolations[severity].map(violation => (
                                    <ViolationCard
                                        key={violation.id} 
                                        violation={violation} 
                                        onCodeGenerated={onCodeGenerated}
                                        generatedCode={generatedCode[violation.id]}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default ReportView;
