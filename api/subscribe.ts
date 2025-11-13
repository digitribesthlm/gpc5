
// Use Vercel's Edge Runtime for speed and efficiency
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const mainDomain = process.env.MAIN_DOMAIN || '*';
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  // Handle CORS preflight request
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

  if (!webhookUrl) {
    console.error("N8N_WEBHOOK_URL is not set in Vercel environment variables.");
    return new Response(JSON.stringify({ error: 'Subscription service is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': mainDomain },
    });
  }

  try {
    const payload = await req.json();

    // Forward the payload to the n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!webhookResponse.ok) {
        throw new Error(`Webhook call failed with status: ${webhookResponse.status}`);
    }

    return new Response(JSON.stringify({ message: 'Success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': mainDomain },
    });

  } catch (error) {
    console.error('[API_SUBSCRIBE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: 'Failed to submit lead.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': mainDomain },
    });
  }
}