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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure data URL prefix for the gateway
    const imageDataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const systemPrompt =
      "You are an expert plant pathologist. Analyze the provided leaf/plant image. Identify the plant and any disease present. Be specific and confident. Always call the return_diagnosis tool with your findings.";

    const aiPayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this plant image and return a structured diagnosis." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_diagnosis",
            description: "Return a structured plant diagnosis.",
            parameters: {
              type: "object",
              properties: {
                plantName: { type: "string" },
                scientificName: { type: "string" },
                disease: { type: "string" },
                confidence: { type: "number" },
                severity: { type: "string", enum: ["None", "Mild", "Moderate", "Severe"] },
                healthScore: { type: "number" },
                isHealthy: { type: "boolean" },
                symptoms: { type: "array", items: { type: "string" } },
                treatment: { type: "array", items: { type: "string" } },
                prevention: { type: "array", items: { type: "string" } },
                affectedArea: { type: "number" },
                spreadRisk: { type: "string", enum: ["Low", "Medium", "High"] },
                visualCues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      cue: { type: "string" },
                      description: { type: "string" },
                      location: { type: "string" },
                      confidence: { type: "number" },
                      supports: { type: "string", enum: ["plant", "disease", "both"] },
                    },
                    required: ["cue", "description", "location", "confidence", "supports"],
                    additionalProperties: false,
                  },
                },
              },
              required: [
                "plantName", "disease", "confidence", "severity", "healthScore",
                "isHealthy", "symptoms", "treatment", "prevention", "affectedArea",
                "spreadRisk", "visualCues",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_diagnosis" } },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (!argsStr) {
      console.error("No tool call returned:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "AI returned no structured diagnosis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis;
    try {
      analysis = JSON.parse(argsStr);
    } catch (parseErr) {
      console.error("Failed to parse tool args:", argsStr);
      return new Response(JSON.stringify({ error: "AI returned invalid data format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-plant error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});