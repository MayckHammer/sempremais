

## Plan: Corrigir acesso após aprovação de cliente

### Problema
Quando o admin clica "Aprovar", o `is_approved` é atualizado no banco, mas o cliente continua vendo a tela "Aguardando aprovação" porque:
1. O `AuthUser` cached no contexto não é atualizado — o cliente precisa fazer logout/login para ver a mudança
2. A tela `PendingApproval` não tem mecanismo de polling para verificar se foi aprovado

### Solução

**1. `src/components/PendingApproval.tsx`** — Adicionar polling automático
- A cada 10 segundos, consultar `profiles.is_approved` no banco
- Quando `is_approved = true`, chamar `refreshUser()` do AuthContext para atualizar o estado
- O `ProtectedRoute` automaticamente libera o acesso quando `user.isApproved` muda para `true`
- Adicionar botão "Verificar status" para check manual

**2. `src/pages/admin/AdminClients.tsx`** — Remover o `as any` do update
- O cast `as any` indica problema de tipos; usar tipagem correta

### Arquivos
| Arquivo | Ação |
|---------|------|
| `src/components/PendingApproval.tsx` | Adicionar polling + botão de verificação manual |
| `src/pages/admin/AdminClients.tsx` | Limpar tipagem do update |

### Fluxo corrigido
```text
Admin aprova → DB atualizado
                ↓
Cliente na tela PendingApproval
  → polling 10s verifica is_approved
  → is_approved = true → refreshUser()
  → ProtectedRoute libera → redireciona ao dashboard
```

