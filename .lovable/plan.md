

# Número de Chamado para Tickets de Suporte

## Problema
Os tickets usam UUID como identificador, que não é legível para humanos. O cliente e admin precisam de um número sequencial curto (ex: `#00042`) para referência rápida e comunicação.

## Solução

### Fase 1 — Banco de Dados

Adicionar coluna `ticket_number` na tabela `support_tickets`:

```sql
ALTER TABLE public.support_tickets
ADD COLUMN ticket_number serial NOT NULL;

-- Índice único para garantir unicidade
CREATE UNIQUE INDEX idx_ticket_number ON public.support_tickets(ticket_number);
```

O `serial` gera automaticamente números sequenciais (1, 2, 3...) em cada novo ticket.

### Fase 2 — Exibir no Chat do Cliente (`SupportChatWindow.tsx`)

- Após criar ou retomar um ticket, exibir o número no header do chat: `Chamado #00042`
- Formatar com zero-pad de 5 dígitos para visual profissional

### Fase 3 — Exibir na Lista de Tickets Admin (`AdminSupport.tsx`)

- Adicionar `#00042` ao lado do nome do cliente em cada card da lista
- Permitir busca/localização rápida pelo número

### Fase 4 — Exibir no Detalhe do Ticket Admin (`AdminTicketDetail.tsx`)

- Mostrar `Chamado #00042` no header ao lado do nome do cliente
- Número visível e copiável para referência

### Fase 5 — Mensagem de boas-vindas com número

- Na criação do ticket no `SupportChatWindow`, incluir o número na mensagem de boas-vindas: "Seu chamado **#00042** foi aberto"

## Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar coluna `ticket_number serial` |
| `src/components/SupportChatWindow.tsx` | Exibir número no header + mensagem inicial |
| `src/pages/admin/AdminSupport.tsx` | Exibir número na lista de tickets |
| `src/pages/admin/AdminTicketDetail.tsx` | Exibir número no header do detalhe |

## Seção Técnica

- `serial` no Postgres cria auto-increment nativo, sem necessidade de lógica manual
- Formatação: `String(ticket.ticket_number).padStart(5, '0')` → `#00042`
- A coluna será populada automaticamente para novos tickets; tickets existentes receberão números retroativos baseados na ordem de criação

