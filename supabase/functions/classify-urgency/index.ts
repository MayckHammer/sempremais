import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request, error } = await supabase
      .from("service_requests")
      .select("service_type, description, vehicle_info, created_at, address")
      .eq("id", request_id)
      .single();

    if (error || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hour = new Date(request.created_at).getHours();
    const timeContext = hour >= 0 && hour < 6 ? "madrugada (horário perigoso)" : 
                        hour >= 6 && hour < 12 ? "manhã" : 
                        hour >= 12 && hour < 18 ? "tarde" : "noite";

    const prompt = `Classifique a urgência desta solicitação de assistência veicular.

Dados:
- Tipo de serviço: ${request.service_type}
- Descrição: ${request.description || "Sem descrição"}
- Veículo: ${request.vehicle_info || "Não informado"}
- Endereço: ${request.address}
- Horário: ${timeContext}

Critérios:
- Reboque e destombamento são naturalmente mais urgentes
- Madrugada aumenta a urgência
- Caminhão ou veículo grande em rodovia = crítico
- Chaveiro/borracheiro em horário comercial = baixo
- Frete normalmente é baixo

Classifique como: low, medium, high ou critical.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Você é um classificador de urgência. Responda APENAS com o resultado da tool call." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify",
            description: "Classifica a urgência da solicitação",
            parameters: {
              type: "object",
              properties: {
                urgency: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                  description: "Nível de urgência",
                },
              },
              required: ["urgency"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify" } },
      }),
    });

    const aiData = await response.json();
    let urgency = "medium"; // fallback

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        if (["low", "medium", "high", "critical"].includes(args.urgency)) {
          urgency = args.urgency;
        }
      }
    } catch {
      console.error("Failed to parse AI response, using fallback:", aiData);
    }

    await supabase
      .from("service_requests")
      .update({ urgency })
      .eq("id", request_id);

    return new Response(JSON.stringify({ urgency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("classify-urgency error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
