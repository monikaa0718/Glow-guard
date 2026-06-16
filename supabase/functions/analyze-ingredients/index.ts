import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ingredients, imageBase64, skinType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skinContext = skinType
      ? `\n\nThe user has ${skinType} skin. Tailor your safety assessments and descriptions to this skin type — highlight ingredients that may be particularly beneficial or problematic for ${skinType} skin.`
      : "";

    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert cosmetic chemist and dermatologist. Analyze cosmetic ingredients for safety.

For each ingredient, provide:
- name: the ingredient name
- safety: "safe", "caution", or "harmful"
- rating: 1-10 (10 = safest)
- description: brief explanation of what it does and any concerns

Also provide an overall_score (1-10) and a summary.${skinContext}

You MUST respond using the analyze_ingredients tool.`
      }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Extract the ingredient list from this product label image, then analyze each ingredient for safety." },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `Analyze these cosmetic ingredients for safety:\n\n${ingredients}`
      });
    }
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_ingredients",
              description: "Return structured analysis of cosmetic ingredients",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Overall safety score 1-10" },
                  summary: { type: "string", description: "Brief overall assessment" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        safety: { type: "string", enum: ["safe", "caution", "harmful"] },
                        rating: { type: "number" },
                        description: { type: "string" }
                      },
                      required: ["name", "safety", "rating", "description"]
                    }
                  }
                },
                required: ["overall_score", "summary", "ingredients"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_ingredients" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
