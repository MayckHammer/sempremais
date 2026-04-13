

# Atualizar chat-agent com consciência de urgência

## Resumo

Substituir o conteúdo de `supabase/functions/chat-agent/index.ts` pela versão que inclui contexto de urgência do acionamento vinculado ao ticket, adaptando tom do agente IA e forçando escalação automática para casos críticos.

## O que muda

1. **Nova função `loadUrgencyContext`** — busca `service_requests.urgency` via `ticket.service_request_id`
2. **Instruções de tom por urgência** — bloco `URGENCY_INSTRUCTIONS` com regras específicas para critical/high/medium/low/pending
3. **`buildUrgencyBlock`** — injeta dados do acionamento (serviço, veículo, local, horário) + instrução de tom no system prompt
4. **Escalação forçada** — `shouldForceEscalation`: se urgência = critical e cliente enviou 2+ mensagens, escala para human_handling automaticamente
5. **Metadados enriquecidos** — cada resposta do agente salva `urgency_context` no campo metadata

## Arquivo

| Arquivo | Ação |
|---|---|
| `supabase/functions/chat-agent/index.ts` | Reescrever com versão urgency-aware |

## Após deploy

Testar via `deploy_edge_functions` + verificar logs.

