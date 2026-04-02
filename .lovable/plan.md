

# Classificacao Automatica de Urgencia com IA

## Resumo

Quando uma solicitacao de servico e criada, uma Edge Function analisa os dados (tipo de servico, descricao, horario) e classifica a urgencia automaticamente em: **baixa**, **media**, **alta** ou **critica**. O admin ve a urgencia na tabela de solicitacoes com badges coloridos e pode filtrar por urgencia.

## Etapas

### 1. Migracaco — adicionar coluna `urgency` na tabela `service_requests`

```sql
ALTER TABLE public.service_requests 
ADD COLUMN urgency text DEFAULT 'pending_analysis';
```

Valores possiveis: `pending_analysis`, `low`, `medium`, `high`, `critical`.

### 2. Edge Function `classify-urgency`

Nova funcao que recebe o `request_id`, carrega os dados da solicitacao e chama Lovable AI para classificar a urgencia usando tool calling (structured output).

Criterios que a IA considera:
- Tipo de servico (reboque/destombamento = mais urgente por natureza)
- Descricao do cliente
- Horario (madrugada = mais urgente)
- Tipo de veiculo (caminhao em rodovia = critico)

Retorna um dos 4 niveis e salva direto no banco.

### 3. Chamar a classificacao apos criar solicitacao

No `RequestService.tsx` e `GuestRequestService.tsx`, apos o insert bem-sucedido, chamar `supabase.functions.invoke('classify-urgency', { body: { request_id } })` de forma assíncrona (fire-and-forget, sem bloquear o usuario).

### 4. Exibir urgencia no painel admin (`AdminRequests.tsx`)

- Nova coluna "Urgencia" na tabela com badges coloridos:
  - Baixa: verde
  - Media: amarelo
  - Alta: laranja
  - Critica: vermelho pulsante
  - Analisando: cinza com shimmer
- Novo filtro de urgencia no topo (dropdown)

## Detalhes Tecnicos

- **Modelo IA**: `google/gemini-2.5-flash-lite` (rapido e barato, classificacao simples)
- **Structured output** via tool calling para garantir resposta no formato correto (`low`/`medium`/`high`/`critical`)
- Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para update direto
- Chamada fire-and-forget no client para nao atrasar o fluxo do usuario
- Coluna `urgency` com default `pending_analysis` para requests existentes

