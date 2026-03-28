

# Redirecionar usuários autenticados das páginas de login

## Problema
Após fazer login (na página inicial ou em `/login/cliente`), se o usuário acessar a rota de login novamente, a tela de login aparece em vez de redirecionar para o dashboard.

## Solução
Adicionar verificação de autenticação no `AuthForm.tsx` — se o usuário já estiver logado, redirecionar automaticamente para o dashboard correspondente.

## Alteração em `src/components/AuthForm.tsx`
- Importar `useAuth` do contexto de autenticação
- No início do componente, verificar se `user` existe e não está `loading`
- Se autenticado: redirecionar para `/cliente` (client) ou `/prestador` (provider) usando `Navigate`
- Isso cobre tanto `/login/cliente` quanto `/login/prestador`

## Arquivo afetado
- `src/components/AuthForm.tsx`

