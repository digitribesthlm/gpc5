
// A self-invoking function to determine the API base URL.
// It reads a 'data-api-host' attribute from the <div id="root"></div> element.
// This makes the widget configurable and avoids hardcoding the API domain,
// allowing it to be embedded on any site (like WordPress) while still
// correctly calling its own backend API.
const getApiBaseUrl = (): string => {
  // This code runs in the browser, so we can access the DOM.
  if (typeof document === 'undefined') {
    // Return empty string in non-browser environments (e.g., SSR)
    return '';
  }
  const rootElement = document.getElementById('root');
  const host = rootElement?.getAttribute('data-api-host');
  
  if (host) {
    // Remove trailing slash if present for consistency
    return host.endsWith('/') ? host.slice(0, -1) : host;
  }
  
  // A warning for developers if the attribute is missing during embedding.
  console.warn(
    "DigiGen Widget: `data-api-host` attribute not found on #root element. " +
    "API calls will be relative. This will likely fail if the widget is embedded on a different domain than its API."
  );

  return ''; // Fallback to relative paths
};

const API_BASE_URL = getApiBaseUrl();

interface SuggestionPayload {
  suggestion: {
    title: string;
    reason: string;
  };
}

export async function generateSuggestion(history: string[], dominantPersona: string, availableArticleTitles: string[]): Promise<SuggestionPayload> {
  
  // Call our secure Vercel API route using the dynamically determined base URL.
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, dominantPersona, availableArticleTitles }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
    console.error("API route error:", errorData);
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}


interface LeadPayload {
  email: string;
  suggestedArticle: string;
  hook: string;
  subscribedToNewsletter: boolean;
}

export async function submitLead(payload: LeadPayload): Promise<{ message: string }> {

  // Call our secure webhook handler API route.
  const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to submit form." }));
    console.error("Subscription API error:", errorData);
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}