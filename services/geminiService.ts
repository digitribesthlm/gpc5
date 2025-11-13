
interface SuggestionPayload {
  suggestion: {
    title: string;
    reason: string;
  };
}

// By using a relative path, we avoid hardcoding the API host.
// This makes the widget more portable. For cross-domain embedding,
// the main site's server should be configured to proxy requests 
// from /api/* to the Vercel deployment hosting this widget's API.
const API_BASE_URL = '';


export async function generateSuggestion(history: string[], dominantPersona: string, availableArticleTitles: string[]): Promise<SuggestionPayload> {
  
  // Call our secure Vercel API route.
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
