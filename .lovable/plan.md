

## Plan: Segmentação de Clientes — B2B, B2C e Público Aberto

### Resumo

Adicionar um campo `client_segment` na tabela `profiles` para diferenciar clientes em 3 categorias. Modificar o fluxo de cadastro para que o usuário escolha seu tipo antes de preencher os dados. Adicionar aprovação administrativa com mensagem "em até 24h".

### Segmentos

| Segmento | Label no app | Descrição |
|----------|-------------|-----------|
| `b2b` | Empresário / Parceiro | Empresários que fazem negócios entre si na rede |
| `b2c` | Funcionário de empresa | Funcionários de empresas parceiras da Sempre+ |
| `b2c_open` | Público aberto | Pessoas sem vínculo, que chegam via tráfego pago/orgânico |

### Mudanças no banco de dados

1. **Migration**: adicionar coluna `client_segment` (text, nullable, default null) e `is_approved` (boolean, default false) na tabela `profiles`
2. O `handle_new_user` trigger já cria o profile — o segment será salvo via metadata do signup e atualizado no profile após criação

### Mudanças na UI

**1. Tela inicial (Index.tsx)** — "Quero me Cadastrar"
- Ao clicar, em vez de ir direto para `/cadastro/cliente`, abrir uma tela/modal de seleção com 3 cards:
  - "Sou Empresário" (B2B) — ícone Building2 — redireciona para `/cadastro/cliente?tipo=empresario`
  - "Sou Funcionário de empresa parceira" (B2C) — ícone Users — redireciona para `/cadastro/cliente?tipo=funcionario`
  - "Público Geral" — ícone UserPlus — redireciona para `/cadastro/cliente?tipo=publico`

**2. Cadastro de cliente (ClientSignup.tsx)**
- Ler o `?tipo=` da URL para pré-selecionar o segmento
- Mostrar um badge/indicador no topo do formulário com o tipo selecionado
- Para B2B: adicionar campo "Nome da empresa" e "CNPJ da empresa"
- Para B2C: adicionar campo "Empresa onde trabalha" e "Matrícula/ID funcional" (opcional)
- Para Público: formulário atual sem campos extras
- Salvar o segmento no metadata do signup e atualizar na tabela `profiles`
- Após cadastro, mostrar toast: "Cadastro recebido! Em até 24 horas sua conta será aprovada."

**3. Login (Index.tsx — "Sou Cliente, Entrar")**
- Login continua igual (email + senha) — o sistema identifica o segmento pelo `client_segment` salvo no profile
- Após login, se `is_approved = false`, mostrar tela de "Aguardando aprovação" com mensagem "Seu cadastro está em análise. Em até 24h sua conta será aprovada."
- Se `is_approved = true`, redireciona normalmente para `/cliente`

**4. Painel Admin (AdminClients.tsx)**
- Adicionar coluna "Segmento" e "Status" na listagem de clientes
- Adicionar botão "Aprovar" para clientes pendentes
- Filtro por segmento (B2B / B2C / Público)

### Arquivos a modificar/criar

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar — `ALTER TABLE profiles ADD COLUMN client_segment text, ADD COLUMN is_approved boolean DEFAULT false` |
| `src/pages/Index.tsx` | Modificar — "Quero me Cadastrar" abre seleção de tipo |
| `src/pages/auth/ClientSignup.tsx` | Modificar — campos condicionais por segmento + mensagem 24h |
| `src/lib/auth.ts` | Modificar — incluir `client_segment` no SignUpExtraData e salvar no profile |
| `src/contexts/AuthContext.tsx` | Modificar — incluir `is_approved` no AuthUser |
| `src/components/ProtectedRoute.tsx` | Modificar — verificar `is_approved` e mostrar tela de espera |
| `src/pages/admin/AdminClients.tsx` | Modificar — adicionar coluna segmento, filtro e botão aprovar |
| `src/components/PendingApproval.tsx` | Criar — tela "Aguardando aprovação" |

### Fluxo resumido

```text
[Quero me Cadastrar]
       |
  ┌────┴────────────────┐
  │  Escolha seu perfil  │
  │                      │
  │  🏢 Empresário       │
  │  👥 Funcionário      │
  │  🌐 Público geral   │
  └──────────────────────┘
       |
  [Formulário de cadastro]
  (campos extras por tipo)
       |
  "Em até 24h seu cadastro será aprovado"
       |
  [Admin aprova] → is_approved = true
       |
  [Login funciona normalmente]
```

