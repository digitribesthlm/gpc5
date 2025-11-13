
interface SuggestionPayload {
  suggestion: {
    title: string;
    reason: string;
  };
}

// CRITICAL FIX: Define the absolute base URL for your Vercel API routes.
// This ensures that API calls work correctly even when the widget is embedded
// on a different domain (like your WordPress site).
const API_BASE_URL = 'https://reco.digigrowth.se';


export async function generateSuggestion(history: string[], dominantPersona: string, availableArticleTitles: string[]): Promise<SuggestionPayload> {
  
  // Call our secure Vercel API route using the absolute URL
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

  // Call our secure webhook handler API route using the absolute URL
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