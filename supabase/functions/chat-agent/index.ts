import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_TRIGGER_ANALYSIS = [
  "reclamação", "reclamacao", "processo", "advogado", "procon",
  "cancelar", "cancelamento", "insatisfeito", "absurdo", "denúncia",
  "denuncia", "tribunal", "indenização", "indenizacao",
];

const DEFAULT_TRIGGER_HUMAN = [
  "quero falar com atendente", "falar com humano", "atendente humano",
  "quero um humano", "falar com pessoa", "atendimento humano",
  "quero falar com uma pessoa", "transferir para atendente",
];

const DEFAULT_SYSTEM_PROMPT = `Você é o assistente virtual da Sempre+, uma plataforma de assistência veicular 24h.

Seu papel:
- Atender clientes de forma educada, profissional e empática
- Coletar informações sobre problemas com serviços (reboque, chaveiro, borracheiro, etc.)
- Abrir chamados de suporte quando necessário
- Resolver dúvidas sobre a plataforma, planos e serviços

Regras:
- Sempre cumprimente o cliente pelo nome quando disponível
- Seja conciso mas completo nas respostas
- Se o cliente estiver irritado, demonstre empatia e tente resolver
- Se não souber a resposta, informe que vai encaminhar para um atendente
- Nunca invente informações sobre preços ou prazos
- Responda sempre em português brasileiro

Serviços disponíveis na plataforma:
- Reboque
- Chaveiro automotivo
- Borracheiro
- Destombamento
- Frete pequeno
- Frete grande

Quando o cliente relatar um problema com um serviço, colete:
1. Qual serviço foi solicitado
2. O que aconteceu de errado
3. Data/hora aproximada do ocorrido
4. Se já tem um número de solicitação`;

async function loadConfig(supabase: any) {
  const { data } = await supabase
    .from("agent_config")
    .select("*")
    .limit(1)
    .single();

  if (!data) {
    return {
      system_prompt: DEFAULT_SYSTEM_PROMPT,
      trigger_analysis: DEFAULT_TRIGGER_ANALYSIS,
      trigger_human: DEFAULT_TRIGGER_HUMAN,
      max_messages_before_escalation: 10,
      inactivity_timeout_minutes: 5,
      ai_model: "google/gemini-3-flash-preview",
      escalation_message: "Entendi! Vou transferir você para um de nossos atendentes agora mesmo. Por favor, aguarde um momento. 🙏",
      wait_message: "Nosso atendente está analisando seu caso. Por favor, aguarde. 🙏",
    };
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_id, message, client_name } = await req.json();

    if (!ticket_id || !message) {
      return new Response(JSON.stringify({ error: "ticket_id and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load dynamic config
    const config = await loadConfig(supabase);

    // Check ticket status
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If ticket is not in agent_handling
    if (ticket.status !== "agent_handling") {
      // Save client message first
      await supabase.from("chat_messages").insert({
        ticket_id,
        sender_type: "client",
        sender_id: ticket.client_id,
        content: message,
      });

      if (ticket.status === "human_handling") {
        const { data: lastHumanMsg } = await supabase
          .from("chat_messages")
          .select("created_at")
          .eq("ticket_id", ticket_id)
          .eq("sender_type", "human_agent")
          .order("created_at", { ascending: false })
          .limit(1);

        const timeoutMs = (config.inactivity_timeout_minutes || 5) * 60 * 1000;
        const cutoff = new Date(Date.now() - timeoutMs);
        const lastMsgTime = lastHumanMsg?.[0]?.created_at
          ? new Date(lastHumanMsg[0].created_at)
          : null;

        if (!lastMsgTime || lastMsgTime < cutoff) {
          const waitMessage = config.wait_message;
          await supabase.from("chat_messages").insert({
            ticket_id,
            sender_type: "agent",
            content: waitMessage,
            metadata: { auto_response: true },
          });
          return new Response(JSON.stringify({ message: waitMessage, status: ticket.status }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ message: null, status: ticket.status }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // analysis or other states
      const waitMessage = "Um atendente irá te atender em breve. Por favor, aguarde.";
      await supabase.from("chat_messages").insert({
        ticket_id,
        sender_type: "agent",
        content: waitMessage,
        metadata: { auto_response: true },
      });
      return new Response(JSON.stringify({ message: waitMessage, status: ticket.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save client message
    await supabase.from("chat_messages").insert({
      ticket_id,
      sender_type: "client",
      sender_id: ticket.client_id,
      content: message,
    });

    // Check for trigger words using dynamic config
    const lowerMessage = message.toLowerCase();
    const triggerAnalysis = config.trigger_analysis || DEFAULT_TRIGGER_ANALYSIS;
    const triggerHuman = config.trigger_human || DEFAULT_TRIGGER_HUMAN;

    const foundAnalysisTriggers = triggerAnalysis.filter((w: string) => lowerMessage.includes(w));
    const foundHumanTriggers = triggerHuman.filter((w: string) => lowerMessage.includes(w));

    if (foundHumanTriggers.length > 0) {
      await supabase
        .from("support_tickets")
        .update({
          status: "human_handling",
          trigger_words: [...(ticket.trigger_words || []), ...foundHumanTriggers],
        })
        .eq("id", ticket_id);

      const escalationMsg = config.escalation_message;
      await supabase.from("chat_messages").insert({
        ticket_id,
        sender_type: "agent",
        content: escalationMsg,
        metadata: { escalation: "human_handling", triggers: foundHumanTriggers },
      });

      return new Response(JSON.stringify({ message: escalationMsg, status: "human_handling" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (foundAnalysisTriggers.length > 0) {
      await supabase
        .from("support_tickets")
        .update({
          status: "analysis",
          trigger_words: [...(ticket.trigger_words || []), ...foundAnalysisTriggers],
        })
        .eq("id", ticket_id);
    }

    // Count messages to check escalation limit
    const maxMessages = config.max_messages_before_escalation || 10;
    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("ticket_id", ticket_id)
      .eq("sender_type", "client");

    if ((count || 0) >= maxMessages && ticket.status === "agent_handling") {
      await supabase
        .from("support_tickets")
        .update({ status: "analysis" })
        .eq("id", ticket_id);
    }

    // Load chat history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true })
      .limit(50);

    const messages = (history || []).map((m: any) => ({
      role: m.sender_type === "client" ? "user" : "assistant",
      content: m.content,
    }));

    messages.push({ role: "user", content: message });

    const systemPrompt = config.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const systemWithContext = client_name
      ? `${systemPrompt}\n\nO cliente se chama ${client_name}.`
      : systemPrompt;

    const aiModel = config.ai_model || "google/gemini-3-flash-preview";

    // Call Lovable AI Gateway with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [{ role: "system", content: systemWithContext }, ...messages],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Erro ao processar resposta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response back and collect full text
    const reader = aiResponse.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ") || line.trim() === "") continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                break;
              }
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(new TextEncoder().encode(`data: ${jsonStr}\n\n`));
                }
              } catch { /* skip partial */ }
            }
          }

          if (fullResponse) {
            await supabase.from("chat_messages").insert({
              ticket_id,
              sender_type: "agent",
              content: fullResponse,
              metadata: foundAnalysisTriggers.length > 0
                ? { triggers_detected: foundAnalysisTriggers }
                : {},
            });
          }

          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
