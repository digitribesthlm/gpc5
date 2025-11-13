
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface EmbedInstructionsProps {
  apiHost: string;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-dark-900/80 p-4 rounded-lg border border-dark-700 font-mono text-sm text-gray-300">
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-dark-700/50 hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
        aria-label="Copy code to clipboard"
      >
        <ClipboardIcon className="w-5 h-5" />
      </button>
      <pre><code>{code}</code></pre>
      {copied && <span className="absolute bottom-2 right-2 text-xs text-green-400 animate-fadeIn">Copied!</span>}
    </div>
  );
};

export const EmbedInstructions: React.FC<EmbedInstructionsProps> = ({ apiHost }) => {
  if (!apiHost) return null;

  const divCode = `<div id="root" 
     data-api-host="${apiHost}" 
     data-widget-mode="embedded"
     data-page-context="Technical SEO: Crawl Budget Optimization"
     data-persona-clues='{"Tech": 2, "Advanced": 1, "Innovation": 1, "Efficiency-Focused": 3}'>
</div>`;

  const explanation = `
Your server-side code (e.g., PHP in WordPress) should dynamically populate these attributes for each article. The widget reads them on page load to update the user's profile.

**Note:** On this simulator page, the article list remains visible for testing. When embedded on your live site with \`data-widget-mode="embedded"\`, only the AI recommendation box will appear.
`;

  return (
    <div className="bg-dark-800/50 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-dark-700/50 text-left animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100 text-center">How to Embed on Your Site</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Step 1: Add Widget Scripts</h3>
          <p className="text-gray-400 mb-3 text-sm">First, ensure your site loads the widget's built JS and CSS files. For WordPress, this is typically done via an 'enqueue' function in \`functions.php\`.</p>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Step 2: Place and Configure the HTML Snippet</h3>
          <p className="text-gray-400 mb-3 text-sm">Place this \`div\` in your template where the widget should appear. Your website's backend must dynamically fill in the \`data-page-context\` and \`data-persona-clues\` for the current page.</p>
          <CodeBlock code={divCode} />
          <p className="text-gray-400 mt-3 text-xs whitespace-pre-wrap">{explanation}</p>
        </div>
      </div>
    </div>
  );
};
