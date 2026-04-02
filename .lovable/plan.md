

# Configuração Admin da Classificação de Urgência com IA

## Resumo

Adicionar uma nova aba "Urgência" no painel de configurações do admin (AdminSettings.tsx) para gerenciar os parâmetros da classificação automática. A Edge Function `classify-urgency` passará a ler essas configurações do banco antes de classificar.

## Etapas

### 1. Migração — criar tabela `urgency_config`

Nova tabela com os parâmetros configuráveis:

```sql
CREATE TABLE public.urgency_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  ai_model text NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  classification_prompt text NOT NULL DEFAULT 'Classifique a urgência desta solicitação...',
  criteria_rules text NOT NULL DEFAULT 'Reboque e destombamento são mais urgentes...',
  fallback_urgency text NOT NULL DEFAULT 'medium',
  night_boost boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.urgency_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage urgency config"
  ON public.urgency_config FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.urgency_config (classification_prompt, criteria_rules) VALUES (...defaults from current edge function...);
```

Campos configuráveis:
- **is_enabled**: liga/desliga a classificação automática
- **ai_model**: modelo IA usado (seleção visual como no agente)
- **classification_prompt**: prompt de sistema para o classificador
- **criteria_rules**: critérios de classificação (editável como textarea)
- **fallback_urgency**: nível padrão quando a IA falha (low/medium/high/critical)
- **night_boost**: se horário noturno/madrugada aumenta urgência

### 2. Atualizar AdminSettings.tsx

- Adicionar nova aba "Urgência" (ícone `Zap` ou `AlertTriangle`) ao array `TABS`
- Carregar `urgency_config` junto com `agent_config` no useEffect
- Novo painel com:
  - **Switch** para ativar/desativar classificação
  - **Seleção de modelo IA** (mesma lista visual de cards)
  - **Textarea** para prompt de classificação
  - **Textarea** para critérios/regras
  - **Select** para fallback urgency (low/medium/high/critical)
  - **Switch** para night boost
- Salvar na tabela `urgency_config` junto com o botão existente

### 3. Atualizar Edge Function `classify-urgency`

- Antes de classificar, buscar configurações da tabela `urgency_config`
- Se `is_enabled = false`, definir urgência como `fallback_urgency` sem chamar IA
- Usar `ai_model` da config em vez de hardcoded
- Usar `classification_prompt` e `criteria_rules` da config no prompt
- Aplicar `night_boost` condicionalmente
- Usar `fallback_urgency` como fallback em caso de erro

### 4. Atualizar RequestService.tsx e GuestRequestService.tsx

- Nenhuma alteração necessária — a lógica fire-and-forget já existe, a Edge Function decide internamente se classifica ou não.

## Arquivos Afetados

- `supabase/migrations/` — nova migração para `urgency_config`
- `src/pages/admin/AdminSettings.tsx` — nova aba + formulário
- `supabase/functions/classify-urgency/index.ts` — ler config do banco

