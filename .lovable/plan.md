

## Plan: Ativar auto-confirm de email

### Problema
Usuários cadastrados não conseguem fazer login porque o email não foi confirmado (`email_confirmed_at = null`). O sistema exige confirmação por email E aprovação do admin — redundante.

### Solução
Ativar auto-confirm de email no backend de autenticação usando a ferramenta `configure_auth`. Assim, ao se cadastrar, o email é confirmado automaticamente e o controle de acesso fica apenas na aprovação administrativa (que já funciona).

### Alteração
| Ação | Detalhe |
|------|---------|
| `configure_auth` | Ativar `auto_confirm_email: true` |

Nenhuma alteração de código necessária. Após ativar, os usuários já cadastrados (como `leandrocostari@gmail.com`) poderão fazer login normalmente assim que aprovados pelo admin.

