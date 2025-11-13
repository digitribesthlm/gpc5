
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
     data-widget-mode="embedded">
</div>`;

  const scriptCode = `<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.digiGenWidget && typeof window.digiGenWidget.trackPageView === 'function') {
    // ---- Replace with your page's dynamic data ----
    const articleContext = "Technical SEO: Crawl Budget Optimization";
    const personaClues = { Tech: 2, Advanced: 1, Innovation: 1, 'Efficiency-Focused': 3 };
    // ---------------------------------------------
    
    window.digiGenWidget.trackPageView(articleContext, personaClues);
  }
});
</script>`;

  return (
    <div className="bg-dark-800/50 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-dark-700/50 text-left animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100 text-center">How to Embed on Your Site</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Step 1: Add the Widget's Script and HTML</h3>
          <p className="text-gray-400 mb-3 text-sm">First, add your widget's built JS and CSS files to your site (e.g., via a WordPress `functions.php` file). Then, place this `div` in your HTML template where you want the recommendation widget to appear (e.g., in a sidebar).</p>
          <CodeBlock code={divCode} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Step 2: Track Page Views</h3>
          <p className="text-gray-400 mb-3 text-sm">On your article pages, add this script. It tells the widget what article the user is currently reading, which allows the AI to generate a personalized suggestion. You must dynamically replace `articleContext` and `personaClues` with the data for each specific article.</p>
          <CodeBlock code={scriptCode} />
        </div>
      </div>
    </div>
  );
};
