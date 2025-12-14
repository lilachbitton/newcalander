export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // 1. Setup CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();
    const { targetUrl, method = 'POST', headers = {}, body: data } = body;

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing targetUrl' }), { status: 400 });
    }

    console.log(`Proxying to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method,
      headers: {
        ...headers,
        // Override host to avoid Vercel/Origami conflicts
        'Host': new URL(targetUrl).host,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseText = await response.text();

    // Try to parse JSON, if fails return text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If response starts with <html, it's an error page (Login/404)
      if (responseText.trim().toLowerCase().startsWith('<html')) {
         return new Response(JSON.stringify({ 
             error: 'HTML Response', 
             details: 'התקבל דף HTML במקום מידע. בדוק את כתובת ה-API והמפתח. ייתכן והמערכת מפנה לדף התחברות.' 
         }), { 
             status: 200, // Return 200 to handle in client
             headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
         });
      }
      responseData = { text: responseText };
    }

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}