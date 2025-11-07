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

const StatCard: React.FC<{ label: string; value: number | string; colorClass?: string }> = ({ label, value, colorClass = 'text-brand-text' }) => (
    <div className="text-center flex-1 min-w-[120px]">
        <div className={`text-4xl font-bold ${colorClass}`}>{value}</div>
        <div className="text-sm text-brand-subtle mt-1 tracking-wide">{label}</div>
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ result, onCodeGenerated, generatedCode }) => {
    // ✅ Normalize violations into an array (supports both backend object and array)
    const violationsArray: Violation[] = Array.isArray(result.violations)
        ? result.violations
        : Object.keys(result.violations || {}).map((key) => ({
            id: key,
            title: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: `Detected issue: ${key.replace(/_/g, ' ')}.`,
            severity: result.violations[key] ? 'High' : 'Low', // default logic
        }));

    // ✅ Group violations by severity
    const groupedViolations = violationsArray.reduce((acc, v) => {
        (acc[v.severity] = acc[v.severity] || []).push(v);
        return acc;
    }, {} as Record<Violation['severity'], Violation[]>);

    const highSeverityCount =
        (groupedViolations['High']?.length || 0) +
        (groupedViolations['Critical']?.length || 0);
    const mediumSeverityCount = groupedViolations['Medium']?.length || 0;
    const lowSeverityCount = groupedViolations['Low']?.length || 0;
    const totalViolations = violationsArray.length;

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
                            The analysis for{' '}
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-accent hover:underline font-semibold"
                            >
                                {result.url}
                            </a>{' '}
                            is complete. The score indicates significant compliance risks that require your attention. See the breakdown of violations below.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 flex flex-wrap justify-around gap-y-4 gap-x-2">
                    <StatCard label="Total Violations" value={totalViolations} />
                    <StatCard label="Critical/High" value={highSeverityCount} colorClass="text-red-400" />
                    <StatCard label="Medium" value={mediumSeverityCount} colorClass="text-yellow-400" />
                    <StatCard label="Low" value={lowSeverityCount} colorClass="text-gray-400" />
                </div>
            </div>

            <div className="mt-8">
                <DownloadButtons result={result} generatedCode={generatedCode} />
            </div>

            <div className="mt-10">
                {severityOrder.map((severity) =>
                    groupedViolations[severity] ? (
                        <div key={severity} className="mb-8">
                            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-slate-700 text-brand-text flex items-center">
                                {severity}
                                <SeverityBadge severity={severity} count={groupedViolations[severity].length} />
                            </h3>
                            <div className="space-y-4">
                                {groupedViolations[severity].map((violation) => (
                                    <ViolationCard
                                        key={violation.id}
                                        violation={violation}
                                        onCodeGenerated={onCodeGenerated}
                                        generatedCode={generatedCode[violation.id]}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
};

export default ReportView;
