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

    const systemPrompt = [
      "You are a senior plant pathologist and botanist with deep expertise in agricultural diagnostics across cereals, vegetables, fruits, legumes, and ornamentals.",
      "Carefully examine leaf shape, venation, color gradients, lesion morphology (margins, halos, concentric rings, powdery/fuzzy growth), distribution (interveinal, marginal, tip, scattered), and any signs of pests, nutrient deficiency or environmental stress.",
      "Cross-reference visual cues with PlantVillage/CABI knowledge to pick the most probable plant species and disease (or confirm it is healthy).",
      "Be confident but calibrated: confidence and healthScore must be 0–100 percentages (NOT 0–1 fractions). If the image is ambiguous, lower confidence accordingly and reflect that in symptoms.",
      "Provide at least 4 visualCues that justify your conclusion (each with cue, description, location, confidence 0–100, supports).",
      "If the plant is healthy, set isHealthy=true, disease='Healthy', severity='None', spreadRisk='Low', affectedArea=0, and healthScore≥85.",
      "ALWAYS call the return_diagnosis tool — never reply in plain text.",
    ].join(" ");

    const buildPayload = (model: string) => ({
      model,
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
    });

    const MODELS = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-pro"];
    let response: Response | null = null;
    let lastErr = "";
    let usedModel = "";
    for (const m of MODELS) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(m)),
      });
      if (r.ok) { response = r; usedModel = m; break; }
      lastErr = await r.text();
      console.warn(`[analyze-plant] model ${m} failed (${r.status}): ${lastErr}`);
      if (r.status === 429 || r.status === 402) {
        return new Response(JSON.stringify({ error: r.status === 429 ? "Rate limit exceeded. Please try again in a moment." : "AI credits exhausted. Add credits in Lovable workspace settings." }), {
          status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    if (!response) {
      return new Response(JSON.stringify({ error: `All AI models failed. Last error: ${lastErr}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[analyze-plant] used model: ${usedModel}`);

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
    analysis._model = usedModel;

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