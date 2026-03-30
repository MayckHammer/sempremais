

# Agente de Atendimento com Transbordo Humano

## Resumo
Implementar um sistema completo de chat com agente IA na área do cliente e painel de atendimento na área admin, com 3 estados de ticket: tratativa agente, análise e tratativa humana. Sem Obsidian — o conhecimento do agente fica no system prompt da edge function.

## Fases de Implementação

### Fase 1 — Banco de Dados (Migration)

Criar:
- **Enum `ticket_status`**: `agent_handling`, `analysis`, `human_handling`, `resolved`, `closed`
- **Tabela `support_tickets`**: `id`, `client_id` (uuid), `service_request_id` (uuid nullable), `status` (ticket_status default `agent_handling`), `assigned_agent_id` (uuid nullable), `summary` (text), `trigger_words` (text[]), `created_at`, `updated_at`, `resolved_at`
- **Tabela `chat_messages`**: `id`, `ticket_id` (ref support_tickets), `sender_type` enum (`client`, `agent`, `human_agent`), `sender_id` (uuid nullable), `content` (text), `metadata` (jsonb), `created_at`
- Habilitar Realtime em ambas as tabelas
- RLS: clientes veem apenas seus tickets/mensagens; admins veem tudo; clientes podem inserir mensagens nos seus tickets

### Fase 2 — Edge Function `chat-agent`

- Recebe `ticket_id` + mensagem do cliente
- Carrega histórico completo do chat via Supabase service role
- System prompt com personalidade Sempre+, regras de coleta de dados, palavras-gatilho para escalação
- Usa Lovable AI Gateway (`google/gemini-3-flash-preview`) com streaming SSE
- Salva resposta como `chat_messages` com `sender_type = 'agent'`
- Detecta palavras-gatilho (ex: "reclamação", "advogado", "procon", "quero falar com atendente") → atualiza status do ticket
- Detecta caso crítico → status `human_handling`

### Fase 3 — Chat do Cliente (UI)

- Componente `SupportChat` — botão flutuante no `ClientDashboard`
- Ao abrir, cria ticket automaticamente ou retoma ticket aberto
- Streaming de respostas do agente token por token
- Escuta Realtime para mensagens do atendente humano
- Indicador visual quando humano assume ("Um atendente entrou na conversa")
- Renderiza mensagens com `react-markdown`

### Fase 4 — Painel do Atendente (Admin)

- Nova rota `/admin/support` com item "Suporte" no sidebar do AdminLayout
- Lista de tickets com filtros por status (chips coloridos: verde=agente, amarelo=análise, vermelho=humano)
- Clique no ticket → visualização em tempo real da conversa (modo leitura com Realtime)
- Botão "Assumir Atendimento" → muda status para `human_handling`, pausa agente
- Campo de resposta para enviar mensagens como `human_agent`
- Botão "Devolver ao Agente" → volta status para `agent_handling`
- Botão "Encerrar" → status `resolved`

### Fase 5 — Lógica de Transbordo

Regras na edge function:
1. **Palavras-gatilho** (configuráveis no prompt): "reclamação", "processo", "advogado", "procon", "cancelar" → status `analysis`
2. **Solicitação explícita** ("quero falar com atendente", "falar com humano") → status `human_handling`
3. **Timeout** (agente não resolve em 10 mensagens) → status `analysis`
4. Quando status != `agent_handling`, edge function retorna mensagem padrão ("Um atendente irá te atender em breve")

## Arquivos Criados/Editados

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabelas, enums, RLS, Realtime |
| `supabase/functions/chat-agent/index.ts` | Edge function do agente |
| `src/components/SupportChat.tsx` | Chat flutuante do cliente |
| `src/components/SupportChatWindow.tsx` | Janela de conversa |
| `src/pages/admin/AdminSupport.tsx` | Painel de suporte admin |
| `src/pages/admin/AdminTicketDetail.tsx` | Detalhe do ticket com chat |
| `src/pages/admin/AdminLayout.tsx` | Adicionar item "Suporte" no sidebar |
| `src/App.tsx` | Adicionar rota `/admin/support` e `/admin/support/:ticketId` |

## Seção Técnica

- **Modelo**: `google/gemini-3-flash-preview` via Lovable AI Gateway (LOVABLE_API_KEY já configurada)
- **Streaming**: SSE da edge function → frontend parse line-by-line
- **Realtime**: `postgres_changes` em `chat_messages` e `support_tickets`
- **Enum `sender_type`**: criado como DB enum para type safety
- **Sem Obsidian**: conhecimento do agente embutido no system prompt da edge function, editável diretamente no código

