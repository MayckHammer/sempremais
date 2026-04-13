

# Route Guards + Lazy Loading + ProtectedRoute

## Resumo

Criar o componente `ProtectedRoute` e refatorar `App.tsx` para adicionar proteção de rotas por role e lazy loading de todas as páginas.

## Etapas

### 1. Criar `src/components/ProtectedRoute.tsx`

Componente que:
- Exibe loading spinner enquanto `AuthContext` resolve a sessão
- Redireciona para login se não autenticado (preservando `location` no state)
- Verifica `user.roles[]` (array multi-role) contra `allowedRoles`
- Se role não permitido, redireciona para a home do role ativo do usuário
- Renderiza `<Outlet />` se tudo OK

### 2. Refatorar `src/App.tsx`

- Trocar todos os imports estáticos por `lazy()`
- Envolver as rotas em `<Suspense fallback={null}>`
- Agrupar rotas `/cliente/*` em `<ProtectedRoute allowedRoles={["client"]}>`
- Agrupar rota `/prestador` em `<ProtectedRoute allowedRoles={["provider"]}>`
- Agrupar rotas `/admin/*` em `<ProtectedRoute allowedRoles={["admin"]}>`
- Manter rotas públicas (`/`, `/assistencia`, auth pages) sem proteção
- Adicionar `staleTime: 5min` e `retry: 1` no QueryClient

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/ProtectedRoute.tsx` | Criar |
| `src/App.tsx` | Reescrever |

