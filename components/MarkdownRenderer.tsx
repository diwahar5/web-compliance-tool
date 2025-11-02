import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A simple parser to handle bold text and bulleted lists.
// Fix: Use React.JSX.Element to specify the return type explicitly and resolve "Cannot find namespace 'JSX'".
const parseMarkdownToJsx = (markdown: string): React.JSX.Element[] => {
    if (!markdown) return [];

    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    // Fix: Use React.JSX.Element for the elements array type to resolve "Cannot find namespace 'JSX'".
    const elements: React.JSX.Element[] = [];
    let currentListItems: string[] = [];

    const processLine = (line: string): string => {
        // BOLD: **text** -> <strong>text</strong>
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
            flushList(); // End any current list
            elements.push(
                <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: processLine(line) }} />
            );
        }
    });

    flushList(); // Add any remaining list items

    return elements;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const jsxElements = parseMarkdownToJsx(content);
  return <div className="space-y-3">{jsxElements}</div>;
};