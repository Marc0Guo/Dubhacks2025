// AWS Tutor Cloudflare Worker - Thin proxy with CORS
const API_BASE = "https://cwbklernoj.execute-api.us-east-1.amazonaws.com/default";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, x-requested-with",
    "Access-Control-Max-Age": "86400"
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204, 
        headers: cors(url.origin) 
      });
    }
    
    // Build upstream URL
    const upstream = new URL(API_BASE);
    upstream.pathname += url.pathname;  // /default + incoming path
    upstream.search = url.search;
    
    // Prepare headers (remove host to avoid conflicts)
    const headers = new Headers(request.headers);
    headers.delete("host");
    
    try {
      // Forward request to Lambda
      const resp = await fetch(upstream, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
        redirect: "follow"
      });
      
      // Create response with CORS headers
      const out = new Response(resp.body, resp);
      const corsHeaders = cors(url.origin);
      
      for (const [key, value] of Object.entries(corsHeaders)) {
        out.headers.set(key, value);
      }
      
      // Add some debugging headers
      out.headers.set("X-AWS-Tutor-Proxy", "cloudflare-worker");
      out.headers.set("X-Upstream-URL", upstream.toString());
      
      return out;
      
    } catch (error) {
      console.error("Worker error:", error);
      
      return new Response(JSON.stringify({
        error: "Proxy Error",
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 502,
        headers: {
          "content-type": "application/json",
          ...cors(url.origin)
        }
      });
    }
  }
};
