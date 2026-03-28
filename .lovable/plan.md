

# Área Administrativa Completa - Dashboard Profissional Desktop

## Contexto
O admin atual é básico: 3 abas (Prestadores, Solicitações, Preços) com layout mobile. Precisamos de um painel completo, otimizado para desktop, com sidebar de navegação e módulos para gerenciar todas as áreas da plataforma. O acesso será via rota oculta `/admin` com login dedicado via URL secreta.

## Acesso Seguro e Invisível

- **Rota de login admin**: `/admin/login` — página simples e discreta (sem links no app público)
- O admin acessa digitando diretamente a URL no navegador
- Nenhum link para `/admin` aparece em nenhuma tela do app (Index, ClientHome, ProviderDashboard)
- Após login, redireciona para `/admin`
- **Credenciais**: o email `mayckhammer@gmail.com` já precisa ter a role `admin` no banco — será adicionada via migração/insert

## Estrutura do Dashboard Admin (Desktop-first)

Layout com **sidebar fixa à esquerda** + **área de conteúdo principal** usando o componente Sidebar do shadcn.

### Sidebar de Navegação
```text
┌──────────────────┐
│  SEMPRE+ ADMIN   │
│                  │
│  📊 Dashboard    │
│  👥 Clientes     │
│  🔧 Prestadores  │
│  🤝 Parceiros    │
│  📋 Solicitações │
│  💰 Preços       │
│  🪙 Carteira SBs │
│  ⚙️ Configurações│
│                  │
│  ─────────────── │
│  🚪 Sair         │
└──────────────────┘
```

### Módulos/Páginas

1. **Dashboard (Home)**
   - Cards de KPIs: total clientes, prestadores, solicitações, SBs emitidos, receita estimada
   - Gráfico de solicitações por período (últimos 30 dias)
   - Solicitações recentes (últimas 10)
   - Prestadores aguardando aprovação (quick actions)

2. **Clientes**
   - Tabela com todos os clientes (nome, email, telefone, CPF, cidade, veículo, data cadastro)
   - Busca e filtros
   - Ver detalhes do cliente (perfil completo, histórico de solicitações, saldo SBs)
   - Ações: editar dados, ver solicitações, gerenciar carteira SBs

3. **Prestadores**
   - Tabela com todos os prestadores (nome, serviços, status aprovação, rating, jobs)
   - Aprovar/rejeitar com um clique
   - Ver detalhes: perfil, histórico de atendimentos, avaliações
   - Filtros por serviço, status, avaliação

4. **Solicitações**
   - Tabela completa de todas as service_requests
   - Filtros por status, tipo de serviço, data, prestador, cliente
   - Ver detalhes: timeline do serviço, cliente, prestador, avaliação
   - Ações: cancelar, reatribuir

5. **Preços** (já existe, será integrado na nova estrutura)

6. **Carteira SBs**
   - Saldo de todos os clientes
   - Histórico global de transações
   - Ações: creditar/debitar SBs manualmente para qualquer cliente

7. **Configurações**
   - Placeholder para futuras configurações (notificações, regras de negócio)

## Arquivos

### Criar
- **`src/pages/admin/AdminLayout.tsx`** — Layout com SidebarProvider + Sidebar + Outlet
- **`src/pages/admin/AdminHome.tsx`** — Dashboard com KPIs e resumos
- **`src/pages/admin/AdminClients.tsx`** — Gestão de clientes
- **`src/pages/admin/AdminProviders.tsx`** — Gestão de prestadores (migrar lógica existente)
- **`src/pages/admin/AdminRequests.tsx`** — Gestão de solicitações
- **`src/pages/admin/AdminSBWallets.tsx`** — Gestão de carteiras SBs
- **`src/pages/admin/AdminSettings.tsx`** — Configurações
- **`src/pages/admin/AdminLogin.tsx`** — Tela de login admin (URL secreta)

### Editar
- **`src/App.tsx`** — Reestruturar rotas admin com nested routes (`/admin/*`)
- **`src/pages/AdminDashboard.tsx`** — Remover (substituído pela nova estrutura)

### Banco de dados
- **Insert**: Adicionar role `admin` ao usuário `mayckhammer@gmail.com` na tabela `user_roles`

## Design
- Otimizado para desktop (min-width 1024px)
- Sidebar escura (bg-sidebar) com ícones e labels
- Tabelas com componente `Table` do shadcn
- Cards com métricas animadas (framer-motion)
- Cores consistentes com o branding (primary, gold, etc.)

## Segurança
- Todas as queries já estão protegidas por RLS (admin tem policy ALL em todas as tabelas)
- Guard de rota verifica `user.roles.includes('admin')` antes de renderizar
- Login admin usa o mesmo `signIn` mas com `preferredRole: 'admin'`

