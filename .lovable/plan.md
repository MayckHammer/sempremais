

# Painel de Configuração do Agente IA — Admin Settings

## Resumo
Transformar a página de Configurações (hoje placeholder) em um painel completo para gerenciar o agente de IA, com tudo editável pelo admin: system prompt, palavras-chave de escalação, limites de mensagens, timeout de inatividade e modelo de IA. Design premium alinhado com a identidade visual do app.

## Fase 1 — Banco de Dados

Criar tabela `agent_config` para persistir as configurações:

```sql
CREATE TABLE public.agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt text NOT NULL,
  trigger_analysis text[] NOT NULL DEFAULT '{}',
  trigger_human text[] NOT NULL DEFAULT '{}',
  max_messages_before_escalation integer NOT NULL DEFAULT 10,
  inactivity_timeout_minutes integer NOT NULL DEFAULT 5,
  ai_model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  agent_name text NOT NULL DEFAULT 'Assistente Sempre+',
  greeting_message text NOT NULL DEFAULT 'Olá! Sou o assistente virtual da Sempre+. Como posso ajudar?',
  escalation_message text NOT NULL DEFAULT 'Entendi! Vou transferir você para um de nossos atendentes agora mesmo. Por favor, aguarde um momento. 🙏',
  wait_message text NOT NULL DEFAULT 'Nosso atendente está analisando seu caso. Por favor, aguarde. 🙏',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- RLS: somente admin
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage config" ON public.agent_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Inserir config padrão com os valores atuais hardcoded
INSERT INTO public.agent_config (system_prompt, trigger_analysis, trigger_human) VALUES (
  'Você é o assistente virtual da Sempre+...', -- o prompt completo atual
  ARRAY['reclamação','reclamacao','processo','advogado','procon','cancelar','cancelamento','insatisfeito','absurdo','denúncia','denuncia','tribunal','indenização','indenizacao'],
  ARRAY['quero falar com atendente','falar com humano','atendente humano','quero um humano','falar com pessoa','atendimento humano','quero falar com uma pessoa','transferir para atendente']
);
```

## Fase 2 — Edge Function

Atualizar `supabase/functions/chat-agent/index.ts`:
- Remover constantes hardcoded (`TRIGGER_ANALYSIS`, `TRIGGER_HUMAN`, `SYSTEM_PROMPT`)
- No início de cada request, buscar config do banco: `SELECT * FROM agent_config LIMIT 1`
- Usar os valores dinâmicos: `config.system_prompt`, `config.trigger_analysis`, `config.trigger_human`, `config.max_messages_before_escalation`, `config.inactivity_timeout_minutes`, `config.ai_model`, `config.escalation_message`, `config.wait_message`
- Cache: como é edge function stateless, a query é leve (1 row)

## Fase 3 — UI Admin Settings

Criar `src/pages/admin/AdminSettings.tsx` com design premium:

**Layout com tabs verticais (sidebar-style):**
- Tab "Personalidade" — System prompt + nome do agente + mensagem de saudação
- Tab "Escalação" — Palavras-chave (analysis + human) com chips editáveis (adicionar/remover tags interativamente)
- Tab "Regras" — Max mensagens, timeout de inatividade, mensagens automáticas (escalação, espera)
- Tab "Modelo" — Seleção do modelo de IA com cards visuais mostrando nome e descrição

**Design diferenciado:**
- Header com ícone de cérebro/bot animado e gradiente mesh sutil
- Tabs laterais com ícones e indicador ativo com glow
- Campos de texto com syntax highlighting leve para o system prompt (textarea com monospace + line numbers)
- Chips de palavras-chave com animação de entrada/saída (framer-motion), botão "+" com micro-interação
- Cards de modelo de IA com visual distinto: borda glow no selecionado, ícone do provider, badge de velocidade/qualidade
- Botão "Salvar" fixo no rodapé com estado de loading animado e feedback visual de sucesso (toast + pulse verde)
- Indicador de "última atualização" com timestamp relativo

**Componentes visuais únicos:**
- Tag input customizado: campo onde o admin digita e aperta Enter para criar chip, cada chip tem X para remover, animação spring
- Prompt editor: textarea grande com contador de caracteres, preview colapsável do prompt formatado
- Slider visual para timeout e max mensagens com labels e valor atual destacado

## Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela `agent_config` + seed |
| `supabase/functions/chat-agent/index.ts` | Ler config do banco em vez de hardcoded |
| `src/pages/admin/AdminSettings.tsx` | Reescrever completamente com UI de configuração |

## Seção Técnica

- Tabela `agent_config` sempre terá exatamente 1 row (upsert no save)
- Edge function faz `SELECT * FROM agent_config LIMIT 1` com service role key
- Frontend usa `supabase.from('agent_config').select('*').limit(1).single()` para ler e `.upsert()` para salvar
- Modelos disponíveis para seleção: `google/gemini-3-flash-preview`, `google/gemini-2.5-flash`, `google/gemini-2.5-pro`, `openai/gpt-5-mini`, `openai/gpt-5`
- Framer-motion para animações de chips e transições de tab
- Deploy automático da edge function após edição

