import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-auth",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { imageBase64 } = body as { imageBase64?: string };

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API Key is not configured in Supabase Secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean the base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // Prepare direct Gemini API Payload
    const aiPayload = {
      contents: [{
        parts: [
          { text: "You are an expert plant pathologist. Analyze this image. Identify the plant and any disease. ALWAYS output your response as a raw JSON object matching this structure: { \"plantName\": string, \"scientificName\": string, \"disease\": string, \"confidence\": number, \"severity\": \"None\"|\"Mild\"|\"Moderate\"|\"Severe\", \"healthScore\": number, \"isHealthy\": boolean, \"symptoms\": string[], \"treatment\": string[], \"prevention\": string[], \"affectedArea\": number, \"spreadRisk\": \"Low\"|\"Medium\"|\"High\", \"visualCues\": [{ \"cue\": string, \"description\": string, \"location\": string, \"confidence\": number, \"supports\": \"plant\"|\"disease\"|\"both\" }] }. Do not include markdown formatting or backticks." },
          { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
        ]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Parse the JSON from Gemini's text output
    let analysis;
    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : textResponse);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", textResponse);
      throw new Error("AI returned invalid data format");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-plant error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});