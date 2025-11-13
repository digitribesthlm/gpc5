
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Wait until the browser has finished parsing the document.
// This ensures that the <div id="root"></div> element is available
// before we try to mount the React app to it.
document.addEventListener('DOMContentLoaded', () => {
  // The widget mounts to a <div id="root"></div> element.
  // For cross-domain embedding (e.g., in WordPress), this element should also have
  // a 'data-api-host' attribute pointing to the widget's backend server.
  // Example: <div id="root" data-api-host="https://reco.digigrowth.se"></div>
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("DigiGen Widget Error: Could not find the root element with id='root'. Please ensure this div exists on the page.");
    return; // Exit gracefully if the element is missing.
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});