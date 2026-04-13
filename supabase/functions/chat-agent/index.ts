import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Defaults ────────────────────────────────────────────────────────────────

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

// ─── Instruções de tom por nível de urgência ─────────────────────────────────

const URGENCY_INSTRUCTIONS: Record<string, string> = {
  critical: `
⚠️ CONTEXTO DE URGÊNCIA: CRÍTICO
Este acionamento foi classificado como CRÍTICO pelo sistema.
O cliente pode estar em situação de risco (madrugada, rodovia, veículo pesado, etc.).
Instruções obrigatórias para esta conversa:
- Seja DIRETO e OBJETIVO. Não faça perguntas desnecessárias.
- Demonstre que está tratando isso como prioridade máxima.
- Colete apenas as informações essenciais para acionar o suporte.
- Se o problema não for resolvido em 2 mensagens, transfira para atendente humano.
- Use linguagem de urgência: "Estou priorizando seu caso agora", "Vou acionar imediatamente".
- NUNCA diga para o cliente "aguardar" sem dar um prazo concreto.`,

  high: `
🔴 CONTEXTO DE URGÊNCIA: ALTA
Este acionamento tem urgência ALTA.
Instruções para esta conversa:
- Priorize a resolução rápida, sem burocracia.
- Mostre agilidade nas respostas.
- Colete as informações necessárias de forma objetiva.
- Se não resolver em 3 mensagens, acione o suporte humano proativamente.`,

  medium: `
🟡 CONTEXTO DE URGÊNCIA: MÉDIA
Acionamento de urgência moderada.
Instruções para esta conversa:
- Atenda com agilidade e atenção.
- Colete todas as informações necessárias para o suporte.
- Resolva dentro do fluxo padrão.`,

  low: `
🟢 CONTEXTO DE URGÊNCIA: BAIXA
Acionamento de baixa urgência (serviço em horário comercial ou de baixo risco).
Instruções para esta conversa:
- Atenda de forma resolutiva e cordial.
- Pode fazer perguntas para entender bem o problema.
- Siga o fluxo padrão de atendimento.`,

  pending_analysis: `
⏳ CONTEXTO DE URGÊNCIA: em análise
A urgência deste acionamento ainda não foi classificada.
Colete as informações necessárias normalmente e trate com atenção padrão.`,
};

// ─── Carrega config do agente ─────────────────────────────────────────────────

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
      escalation_message:
        "Entendi! Vou transferir você para um de nossos atendentes agora mesmo. Por favor, aguarde um momento. 🙏",
      wait_message:
        "Nosso atendente está analisando seu caso. Por favor, aguarde. 🙏",
    };
  }
  return data;
}

// ─── Carrega contexto de urgência via service_request_id do ticket ────────────

async function loadUrgencyContext(
  supabase: any,
  ticket: any
): Promise<{ urgency: string | null; requestData: any | null }> {
  if (!ticket.service_request_id) {
    return { urgency: null, requestData: null };
  }

  const { data: request } = await supabase
    .from("service_requests")
    .select("urgency, service_type, description, address, created_at, vehicle_info")
    .eq("id", ticket.service_request_id)
    .single();

  if (!request) {
    return { urgency: null, requestData: null };
  }

  return {
    urgency: request.urgency ?? "pending_analysis",
    requestData: request,
  };
}

// ─── Monta bloco de contexto do acionamento para o system prompt ──────────────

function buildUrgencyBlock(urgency: string | null, requestData: any | null): string {
  if (!urgency || !requestData) return "";

  const urgencyInstruction = URGENCY_INSTRUCTIONS[urgency] ?? URGENCY_INSTRUCTIONS["pending_analysis"];

  const hour = new Date(requestData.created_at).getHours();
  const timeLabel =
    hour >= 0 && hour < 6 ? "madrugada"
    : hour >= 6 && hour < 12 ? "manhã"
    : hour >= 12 && hour < 18 ? "tarde"
    : "noite";

  return `
───────────────────────────────────────────
DADOS DO ACIONAMENTO VINCULADO A ESTE TICKET
- Serviço solicitado: ${requestData.service_type}
- Descrição: ${requestData.description || "não informada"}
- Veículo: ${requestData.vehicle_info || "não informado"}
- Local: ${requestData.address}
- Horário: ${timeLabel}
${urgencyInstruction}
───────────────────────────────────────────`;
}

// ─── Verifica se urgência crítica deve forçar escalação humana ────────────────

function shouldForceEscalation(urgency: string | null, messageCount: number): boolean {
  return urgency === "critical" && messageCount >= 2;
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_id, message, client_name } = await req.json();

    if (!ticket_id || !message) {
      return new Response(
        JSON.stringify({ error: "ticket_id and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Carrega config e ticket em paralelo
    const [config, ticketResult] = await Promise.all([
      loadConfig(supabase),
      supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticket_id)
        .single(),
    ]);

    const { data: ticket, error: ticketError } = ticketResult;

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ error: "Ticket not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Ticket fora do estado agent_handling ──────────────────────────────────
    if (ticket.status !== "agent_handling") {
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
          return new Response(
            JSON.stringify({ message: waitMessage, status: ticket.status }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ message: null, status: ticket.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const waitMessage = "Um atendente irá te atender em breve. Por favor, aguarde.";
      await supabase.from("chat_messages").insert({
        ticket_id,
        sender_type: "agent",
        content: waitMessage,
        metadata: { auto_response: true },
      });
      return new Response(
        JSON.stringify({ message: waitMessage, status: ticket.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Salva mensagem do cliente ─────────────────────────────────────────────
    await supabase.from("chat_messages").insert({
      ticket_id,
      sender_type: "client",
      sender_id: ticket.client_id,
      content: message,
    });

    // ── Carrega contexto de urgência do acionamento vinculado ─────────────────
    const { urgency, requestData } = await loadUrgencyContext(supabase, ticket);

    // ── Verifica trigger words ────────────────────────────────────────────────
    const lowerMessage = message.toLowerCase();
    const triggerAnalysis = config.trigger_analysis || DEFAULT_TRIGGER_ANALYSIS;
    const triggerHuman = config.trigger_human || DEFAULT_TRIGGER_HUMAN;

    const foundAnalysisTriggers = triggerAnalysis.filter((w: string) =>
      lowerMessage.includes(w)
    );
    const foundHumanTriggers = triggerHuman.filter((w: string) =>
      lowerMessage.includes(w)
    );

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

      return new Response(
        JSON.stringify({ message: escalationMsg, status: "human_handling" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // ── Contagem de mensagens do cliente ──────────────────────────────────────
    const { count: clientMessageCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("ticket_id", ticket_id)
      .eq("sender_type", "client");

    const totalClientMessages = clientMessageCount || 0;

    const maxMessages = config.max_messages_before_escalation || 10;
    if (totalClientMessages >= maxMessages && ticket.status === "agent_handling") {
      await supabase
        .from("support_tickets")
        .update({ status: "analysis" })
        .eq("id", ticket_id);
    }

    // ── Escalação forçada por urgência crítica ────────────────────────────────
    if (shouldForceEscalation(urgency, totalClientMessages)) {
      const criticalEscalationMsg =
        "⚠️ Seu acionamento é prioritário! Estou transferindo você agora para um atendente especializado que vai cuidar do seu caso imediatamente. Aguarde — você é a prioridade. 🚨";

      await supabase
        .from("support_tickets")
        .update({
          status: "human_handling",
          trigger_words: [...(ticket.trigger_words || []), "urgencia_critica_auto"],
        })
        .eq("id", ticket_id);

      await supabase.from("chat_messages").insert({
        ticket_id,
        sender_type: "agent",
        content: criticalEscalationMsg,
        metadata: { escalation: "human_handling", reason: "urgency_critical_auto" },
      });

      return new Response(
        JSON.stringify({ message: criticalEscalationMsg, status: "human_handling" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Monta histórico do chat ───────────────────────────────────────────────
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

    // ── Monta system prompt enriquecido com urgência ──────────────────────────
    const basePrompt = config.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const urgencyBlock = buildUrgencyBlock(urgency, requestData);

    let systemWithContext = `${basePrompt}${urgencyBlock}`;

    if (client_name) {
      systemWithContext += `\n\nO cliente se chama ${client_name}.`;
    }

    console.log(`[chat-agent] ticket=${ticket_id} urgency=${urgency ?? "none"} messages=${totalClientMessages}`);

    // ── Chama IA via Lovable Gateway com streaming ────────────────────────────
    const aiModel = config.ai_model || "google/gemini-3-flash-preview";

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Stream de resposta ────────────────────────────────────────────────────
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
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${jsonStr}\n\n`)
                  );
                }
              } catch {
                // skip partial chunks
              }
            }
          }

          if (fullResponse) {
            await supabase.from("chat_messages").insert({
              ticket_id,
              sender_type: "agent",
              content: fullResponse,
              metadata: {
                urgency_context: urgency ?? "none",
                ...(foundAnalysisTriggers.length > 0
                  ? { triggers_detected: foundAnalysisTriggers }
                  : {}),
              },
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
