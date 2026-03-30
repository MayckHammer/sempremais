

# Remover mensagem automática do agente em tickets com atendente humano

## Problema
Quando o ticket está em `human_handling`, toda mensagem do cliente recebe resposta automática imediata: "Você está sendo atendido por um de nossos atendentes. Aguarde a resposta." — isso é desnecessário e irritante quando o atendente já está ativo.

## Solução

### Editar `supabase/functions/chat-agent/index.ts`

Na lógica de `ticket.status !== "agent_handling"` (linhas 95-111):

1. **Para `human_handling`**: Apenas salvar a mensagem do cliente no banco (para o atendente ver em tempo real). **Não enviar nenhuma resposta automática.** Retornar status silenciosamente.

2. **Para `analysis`**: Manter a mensagem "Um atendente irá te atender em breve" — faz sentido neste estado.

3. **Mensagem de inatividade de 5 minutos**: Verificar o `created_at` da última mensagem de `human_agent` no ticket. Se a diferença for maior que 5 minutos (ou se nunca houve mensagem do atendente), aí sim enviar "Nosso atendente está analisando seu caso. Por favor, aguarde."

### Lógica simplificada

```
if status == "human_handling":
  salvar mensagem do cliente
  buscar última mensagem do human_agent
  se nunca houve OU última > 5 min atrás:
    enviar mensagem de aguarde
  senão:
    não enviar nada (silencioso)

if status == "analysis":
  salvar mensagem + enviar "atendente em breve"
```

## Seção técnica

- Editar apenas `supabase/functions/chat-agent/index.ts`, bloco linhas 94-111
- Adicionar query para buscar última mensagem `human_agent` do ticket
- Comparar timestamp com `Date.now() - 5 * 60 * 1000`
- Redeployar edge function automaticamente

