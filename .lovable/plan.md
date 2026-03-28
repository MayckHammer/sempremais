

# Carteira SB's - Exibição Global + Página "Minha Carteira"

## O que será feito

1. **Componente global `SBBadge`** - badge compacto mostrando "00 SB's" visível no header de todas as páginas do cliente assinante (ClientHome, RequestService, ClientRequests, TrackingService)
2. **Nova página `/cliente/carteira`** - "Minha Carteira" com saldo, histórico de transações e explicação do programa
3. **Link no menu lateral** e no badge para acessar a carteira

## Fluxograma SB's

```text
┌─────────────────────────────────────────────────┐
│              GERAÇÃO DE SB's                     │
│                                                  │
│  Cliente solicita serviço                        │
│        ↓                                         │
│  Prestador conclui (status = completed)          │
│        ↓                                         │
│  Trigger/lógica verifica:                        │
│    - is_subscriber = true?                       │
│    - Serviço válido?                             │
│        ↓                                         │
│  Insere em sb_transactions (type: 'earned')      │
│  Atualiza sb_wallets.balance += X                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              GASTO DE SB's                       │
│                                                  │
│  Cliente escolhe usar SB's como desconto         │
│        ↓                                         │
│  Verifica saldo >= custo em SB's                 │
│        ↓                                         │
│  Insere em sb_transactions (type: 'spent')       │
│  Atualiza sb_wallets.balance -= X                │
│  Aplica desconto no service_request.price        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           VISUALIZAÇÃO (implementar agora)        │
│                                                  │
│  SBBadge (header) ← lê sb_wallets.balance        │
│       ↓ click                                    │
│  /cliente/carteira                               │
│    - Saldo atual                                 │
│    - Histórico (sb_transactions)                 │
│    - Como funciona (informativo)                 │
└─────────────────────────────────────────────────┘
```

## Arquivos

### Criar
- **`src/components/SBBadge.tsx`** - Badge compacto com ícone de moeda + "00 SB's", busca saldo de `sb_wallets`, link para `/cliente/carteira`
- **`src/pages/ClientWallet.tsx`** - Página da carteira: saldo grande, lista de transações de `sb_transactions`, seção informativa "Como funciona"

### Editar
- **`src/components/ClientHome.tsx`** - Adicionar `SBBadge` no header (ao lado do logo) + link "Minha Carteira" no menu lateral
- **`src/pages/RequestService.tsx`** - Adicionar `SBBadge` no topo
- **`src/pages/ClientRequests.tsx`** - Adicionar `SBBadge` no topo
- **`src/App.tsx`** - Adicionar rota `/cliente/carteira`

### Banco de dados
- Nenhuma migração necessária (tabelas `sb_wallets` e `sb_transactions` já existem)
- A criação automática da wallet ao cadastrar será implementada futuramente quando definir as regras de geração

## Detalhes técnicos
- `SBBadge` faz query em `sb_wallets` filtrando por `user_id = auth.uid()`. Se não existir registro, mostra "00 SB's"
- Página da carteira mostra transações ordenadas por `created_at DESC` com tipo (ganhou/gastou), valor e descrição
- Design consistente com o visual do app (rounded-2xl, cores primary, font-display)

