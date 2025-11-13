
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Wait until the browser has finished parsing the document.
// This ensures that the <div id="root"></div> element is available
// before we try to mount the React app to it.
document.addEventListener('DOMContentLoaded', () => {
  // The widget mounts to a <div id="root"></div> element.
  // This element can be configured with data-* attributes:
  //
  // 1. `data-api-host`: (Required for embedding)
  //    The full URL to the widget's backend server.
  //    Example: data-api-host="https://reco.digigrowth.se"
  //
  // 2. `data-widget-mode`: (Optional, for embedding)
  //    Sets the UI mode. Use "embedded" to hide the simulator UI
  //    when the widget is live on your main site. Defaults to "simulator".
  //    Example: data-widget-mode="embedded"
  //
  // Full example for WordPress:
  // <div id="root" data-api-host="https://reco.digigrowth.se" data-widget-mode="embedded"></div>
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