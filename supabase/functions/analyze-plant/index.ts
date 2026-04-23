import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const aiPayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural plant pathologist. Analyze the plant/leaf image and identify the plant species and any diseases visible. Always call the report_diagnosis tool with your findings. Be specific - identify the actual plant (rice, wheat, tomato, apple, etc.) and the actual disease (early blight, leaf rust, bacterial spot, etc.) when visible. Estimate severity based on visible damage. ALWAYS provide 3-6 visualCues — concrete visual evidence (leaf shape, venation, lesions, color patterns, spore presence, margin shape) that justify your plant and disease identification."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Diagnose this plant. Identify the species and any diseases. Provide treatment and prevention." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
          ]
        }
      ],
      tools: [{
        type: "function",
        function: {
          name: "report_diagnosis",
          description: "Report the plant diagnosis with structured findings",
          parameters: {
            type: "object",
            properties: {
              plantName: { type: "string", description: "Common name of plant/crop e.g. 'Tomato', 'Apple', 'Rice'" },
              scientificName: { type: "string", description: "Scientific Latin name" },
              disease: { type: "string", description: "Disease name, or 'Healthy' if no disease" },
              diseaseScientific: { type: "string", description: "Pathogen scientific name or 'N/A'" },
              confidence: { type: "number", description: "Confidence 0-100" },
              severity: { type: "string", enum: ["None", "Mild", "Moderate", "Severe"] },
              healthScore: { type: "number", description: "Overall plant health 0-100" },
              isHealthy: { type: "boolean" },
              symptoms: { type: "array", items: { type: "string" } },
              treatment: { type: "array", items: { type: "string" } },
              prevention: { type: "array", items: { type: "string" } },
              affectedArea: { type: "number", description: "Estimated % of leaf area affected, 0-100" },
              spreadRisk: { type: "string", enum: ["Low", "Medium", "High"] },
              visualCues: {
                type: "array",
                description: "List of specific visual features in the image that drove the diagnosis. Each cue must include what was observed, where on the leaf/plant, and how confident you are it's that feature (0-100).",
                items: {
                  type: "object",
                  properties: {
                    cue: { type: "string", description: "Short name e.g. 'Concentric brown lesions'" },
                    description: { type: "string", description: "1 sentence explaining the visual evidence" },
                    location: { type: "string", description: "Where on plant e.g. 'Lower leaf surface', 'Leaf margins'" },
                    confidence: { type: "number", description: "Confidence in this cue 0-100" },
                    supports: { type: "string", enum: ["plant", "disease", "both"], description: "Whether this cue supports plant ID, disease ID, or both" },
                  },
                  required: ["cue", "description", "location", "confidence", "supports"],
                  additionalProperties: false,
                },
              },
            },
            required: ["plantName", "disease", "confidence", "severity", "isHealthy", "symptoms", "treatment", "prevention", "healthScore", "affectedArea", "spreadRisk", "visualCues"],
            additionalProperties: false,
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "report_diagnosis" } }
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
      console.error("AI gateway error", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed", detail: errText.slice(0, 200) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let analysis: any = null;

    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("tool args parse fail", e);
      }
    }

    if (!analysis) {
      // Fallback: try to parse text content
      const content = data.choices?.[0]?.message?.content || "";
      try {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) analysis = JSON.parse(m[0]);
      } catch { /* ignore */ }
    }

    if (!analysis) {
      analysis = {
        plantName: "Unknown",
        scientificName: "N/A",
        disease: "Could not analyze",
        diseaseScientific: "N/A",
        confidence: 0,
        severity: "None",
        isHealthy: false,
        healthScore: 0,
        affectedArea: 0,
        spreadRisk: "Low",
        symptoms: ["Image could not be analyzed clearly"],
        treatment: ["Please upload a clearer close-up photo of the leaf"],
        prevention: [],
        visualCues: [],
      };
    }
    if (!analysis.visualCues) analysis.visualCues = [];
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-plant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
