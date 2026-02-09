import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "summarize") {
      systemPrompt = `You are a concise summarizer. Create a brief 1-2 sentence summary that captures the key insight or main point. Be direct and informative. Do not use phrases like "This note discusses" - just state the key points directly.`;
      userPrompt = `Summarize this knowledge item:\n\nTitle: ${title}\n\nContent: ${content}`;
    } else if (action === "auto-tag") {
      systemPrompt = `You are a knowledge categorization expert. Analyze content and suggest 2-5 relevant, lowercase tags that categorize the topic. Return ONLY a JSON array of tag strings, nothing else. Example: ["javascript", "react", "hooks"]`;
      userPrompt = `Suggest tags for this knowledge item:\n\nTitle: ${title}\n\nContent: ${content}`;
    } else if (action === "query") {
      systemPrompt = `You are a helpful knowledge assistant. Answer questions based on the provided knowledge items. Be concise and cite which items your answer draws from.`;
      userPrompt = content;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'summarize', 'auto-tag', or 'query'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    // Parse tags if it's an auto-tag action
    if (action === "auto-tag") {
      try {
        // Try to extract JSON array from the response
        const jsonMatch = result.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const tags = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ tags }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Fallback: split by comma if no JSON array found
        const tags = result.split(',').map((t: string) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''));
        return new Response(
          JSON.stringify({ tags: tags.filter(Boolean).slice(0, 5) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ tags: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI process error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
