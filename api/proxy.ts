export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // 1. Setup CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 2. Handle Preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 3. Check Method
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 4. Configuration
    const API_KEY = process.env.ORIGAMI_API_KEY;
    const DEFAULT_BASE_URL = 'https://razerstar.origami.ms/api/v1';
    const DEFAULT_COLLECTION_ID = 'e_90';

    // 5. Safe Body Parsing
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body is optional or invalid JSON, ignore
    }

    // Support dynamic configuration from client
    // Ensure no trailing slash for base URL
    const clientBaseUrl = body.baseUrl ? body.baseUrl.replace(/\/$/, '') : null;
    const targetBaseUrl = clientBaseUrl || DEFAULT_BASE_URL;
    const targetCollectionId = body.collectionId || DEFAULT_COLLECTION_ID;
    
    // Remove config params from the payload sent to Origami
    const { baseUrl, collectionId, ...filterParams } = body;

    // 6. Validate API Key
    if (!API_KEY) {
      console.error('Missing ORIGAMI_API_KEY env var');
      return new Response(JSON.stringify({ 
        error: 'Server Configuration Error',
        details: 'ORIGAMI_API_KEY is missing in Vercel settings.' 
      }), {
        status: 200, // Return 200 so the frontend can parse the JSON error
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 7. Call Origami API
    const origamiUrl = `${targetBaseUrl}/space/${targetCollectionId}/search`;
    
    console.log(`Proxying to: ${origamiUrl}`);

    const origamiResponse = await fetch(origamiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 1000,
        ...filterParams
      })
    });

    // 8. Robust Response Handling
    // Always read text first to avoid JSON parse errors on HTML responses (404 pages, etc)
    const responseText = await origamiResponse.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails, it's likely HTML or plain text error
      console.error('Failed to parse Origami response as JSON. Content preview:', responseText.substring(0, 500));
      return new Response(JSON.stringify({ 
        error: 'Invalid Response from Origami', 
        details: `Expected JSON but received ${origamiResponse.status} ${origamiResponse.statusText}. Content starts with: ${responseText.substring(0, 500)}...` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // If Origami returned a logical error (status not 2xx), wrap it
    if (!origamiResponse.ok) {
      return new Response(JSON.stringify({ 
        error: `Origami API Error (${origamiResponse.status})`, 
        details: data.message || JSON.stringify(data)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Success
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store',
        ...corsHeaders 
      },
    });

  } catch (error: any) {
    console.error('Proxy Fatal Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Proxy Fatal Error', 
      details: error.message || String(error)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}