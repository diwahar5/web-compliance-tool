import React from 'react';

// A simple and safe markdown to JSX parser
// FIX: Changed JSX.Element to React.ReactElement to resolve namespace error on line 4.
const parseMarkdownToJsx = (markdown: string): React.ReactElement[] => {
    if (!markdown) return [];

    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    // FIX: Changed JSX.Element to React.ReactElement to resolve namespace error on line 8.
    const elements: React.ReactElement[] = [];
    let currentListItems: string[] = [];

    // Simple inline parser for **bold** text
    const processLine = (line: string): string => {
        return line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-text">$1</strong>');
    };

    const flushList = () => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 space-y-1.5">
                    {currentListItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: processLine(item) }} />
                    ))}
                </ul>
            );
            currentListItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith('- ')) {
            currentListItems.push(line.trim().substring(2));
        } else {
            flushList();
            elements.push(
                <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: processLine(line) }} />
            );
        }
    });
    
    flushList(); // Add any remaining list items

    return elements;
};

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const jsxElements = parseMarkdownToJsx(content);
  return <div className="space-y-3">{jsxElements}</div>;
};

export default MarkdownRenderer;