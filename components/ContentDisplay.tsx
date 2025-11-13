
import React, { ReactNode } from 'react';

interface ContentDisplayProps {
  title: string;
  content: string;
  isHome: boolean;
  homeContent: ReactNode;
}

// Simple Markdown to React component renderer
const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').filter(line => line.trim() !== '').map((line, i) => {
    // Heading
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-3xl font-bold mb-4 text-gray-100">{line.substring(3)}</h2>;
    }
    // List item
    if (line.startsWith('* ')) {
      // Process bold syntax within list items
      const parts = line.substring(2).split(/(\*\*.*?\*\*)/g).filter(Boolean);
      return (
        <li key={i} className="mb-2 pl-2 flex items-start">
          <span className="text-primary-light mr-3 mt-1">&#8226;</span>
          <span>
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={j} className="text-gray-100 font-semibold">{part.slice(2, -2)}</strong> 
                : part
            )}
          </span>
        </li>
      );
    }
    // Paragraph with bold processing
    const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
      <p key={i} className="mb-4 text-gray-300 leading-relaxed">
        {parts.map((part, j) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={j} className="text-gray-100 font-semibold">{part.slice(2, -2)}</strong> 
            : part
        )}
      </p>
    );
  }).reduce((acc, el, i) => {
    // Group list items into a single <ul>
    if (el.type === 'li') {
      if (i > 0 && acc[acc.length - 1].type === 'ul') {
        acc[acc.length - 1].props.children.push(el);
      } else {
        acc.push(<ul key={`ul-${i}`} className="list-none mb-4">{[el]}</ul>);
      }
    } else {
      acc.push(el);
    }
    return acc;
  }, [] as React.ReactElement[]);
};


export const ContentDisplay: React.FC<ContentDisplayProps> = ({ title, content, isHome, homeContent }) => {
  const renderContent = () => {
    if (isHome) return homeContent;
    return renderMarkdown(content);
  };

  return (
    <div className="bg-dark-800/30 backdrop-blur-lg rounded-lg shadow-lg p-6 md:p-8 min-h-[60vh] flex flex-col border border-dark-700/50 transition-all duration-300">
      {!isHome && <h1 className="text-4xl font-bold text-gray-200 mb-6 pb-4 border-b border-dark-700/50 animate-fadeIn">{title}</h1>}
      <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-strong:text-gray-100 animate-fadeIn flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};