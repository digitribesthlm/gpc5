
import { GoogleGenAI, Type } from "@google/genai";

// Use Vercel's Edge Runtime for speed and efficiency
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const mainDomainEnv = process.env.MAIN_DOMAIN;
  const supDomainEnv = process.env.SUPDOMAIN;

  // Construct allowed origins. Support both www and non-www versions.
  const getAllowedOrigins = () => {
    const origins = [];
    if (mainDomainEnv && mainDomainEnv.trim()) {
      const domain = mainDomainEnv.trim();
      origins.push(`https://${domain}`);
      // Also support www version if not already included
      if (!domain.startsWith('www.')) {
        origins.push(`https://www.${domain}`);
      } else {
        // If www is in the env, also support non-www
        origins.push(`https://${domain.replace('www.', '')}`);
      }
    }
    if (supDomainEnv && supDomainEnv.trim()) {
      origins.push(`https://${supDomainEnv.trim()}`);
    }
    return origins;
  }
  
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = req.headers.get('origin') || '';
  const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : (allowedOrigins[0] || '*');

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight request for security
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('[API_GENERATE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: 'Failed to generate suggestion.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
