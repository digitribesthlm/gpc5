
import { GoogleGenAI, Type } from "@google/genai";

// Use Vercel's Edge Runtime for speed and efficiency
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const mainDomain = process.env.MAIN_DOMAIN || '*';

  // Handle CORS preflight request for security
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': mainDomain,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY or GEMINI_API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const { history, dominantPersona, availableArticleTitles } = await req.json();

    const historyString = history.length > 1 ? `They have previously read articles about: ${history.slice(0, -1).map((h: string) => `"${h}"`).join(', ')}.` : '';
    const lastClicked = history[history.length - 1];
    const prompt = `
      You are an expert marketing copywriter for "DigiGen".
      **User's Inferred Persona:** "${dominantPersona}"
      **User's Reading History:**
      ${historyString}
      Their most recent article was about: "${lastClicked}".
      **Available Articles to Suggest From:**
      [${availableArticleTitles.join(', ')}]
      **Your Task:**
      1. Analyze the persona and history.
      2. Choose the single most relevant article from the list.
      3. Write a short, persuasive hook (the 'reason') that speaks to their persona.
      4. You MUST return a JSON object that strictly follows the provided schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT, properties: { suggestion: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['title', 'reason'] } }, required: ['suggestion']
        }
      }
    });
    
    const jsonText = response.text.trim();

    return new Response(jsonText, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': mainDomain },
    });

  } catch (error) {
    console.error('[API_GENERATE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: 'Failed to generate suggestion.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': mainDomain },
    });
  }
}