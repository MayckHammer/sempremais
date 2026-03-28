

# Fluxo de Assistência Avulsa + Pré-arquitetura de Preços e SB's

## Contexto
Atualmente "Preciso de Assistência" leva ao cadastro de cliente. O novo fluxo deve levar diretamente a uma tela de solicitação de serviço (estilo Uber/99) sem acesso aos benefícios de assinante (carrossel, destaques, parceiros). Também preparar a estrutura de preços e moeda digital SB's.

## 1. Banco de Dados - Novas tabelas e colunas

### Tabela `service_pricing` (preços por serviço)
- `id`, `service_type` (enum), `subscriber_price` (decimal, default 0), `non_subscriber_price` (decimal, default 0), `created_at`, `updated_at`
- Uma linha por tipo de serviço (6 linhas iniciais com R$0,00)

### Tabela `sb_wallets` (carteira de SB's)
- `id`, `user_id` (ref auth.users), `balance` (decimal, default 0), `created_at`, `updated_at`

### Tabela `sb_transactions` (histórico de SB's)
- `id`, `user_id`, `amount` (decimal), `type` (enum: 'earned', 'spent'), `description`, `reference_id` (nullable - id da solicitação), `created_at`

### Coluna em `service_requests`
- Adicionar `price` (decimal, nullable, default null) - valor cobrado
- Adicionar `is_subscriber` (boolean, default false) - se era assinante no momento
- RLS: permitir insert sem autenticação para usuários guest (com validação)

## 2. Nova página `/assistencia` - Solicitação Avulsa

Criar `src/pages/GuestRequestService.tsx`:
- Layout igual ao `RequestService.tsx` (mapa + painel inferior estilo Uber)
- Campos adicionais: **Nome** e **Telefone** (já que pode não ter conta)
- Ao selecionar o tipo de serviço, mostrar o **preço não-assinante** buscado de `service_pricing`
- Card de preço visível: "Valor: R$ 0,00" (placeholder)
- Banner sutil: "Seja assinante e pague menos! Ganhe SB's a cada serviço"
- Não requer login para visualizar, mas pede cadastro rápido (nome + telefone + email) antes de confirmar
- Após envio, redireciona para tela de acompanhamento

## 3. Atualizar `RequestService.tsx` (assinantes)

- Buscar preço de `service_pricing` com `subscriber_price` ao selecionar serviço
- Mostrar card de preço: "Valor: R$ 0,00" e "Você ganhará X SB's"
- Salvar `price` e `is_subscriber: true` no insert

## 4. Atualizar `Index.tsx`

- Mudar link de "Preciso de Assistência": de `/cadastro/cliente` para `/assistencia`

## 5. Rota em `App.tsx`

- Adicionar `<Route path="/assistencia" element={<GuestRequestService />} />`

## 6. Painel Admin - Gestão de Preços (preparação)

- Adicionar aba "Preços" no `AdminDashboard.tsx` com tabela editável dos 6 serviços mostrando preço assinante vs não-assinante (inputs editáveis, salvando em `service_pricing`)

## Arquivos afetados
- **Criar:** `src/pages/GuestRequestService.tsx`
- **Editar:** `src/pages/Index.tsx`, `src/App.tsx`, `src/pages/RequestService.tsx`, `src/pages/AdminDashboard.tsx`
- **Migração:** criar tabelas `service_pricing`, `sb_wallets`, `sb_transactions` + colunas em `service_requests`

