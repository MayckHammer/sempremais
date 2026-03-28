

# Tela de Acompanhamento do Prestador (Tracking)

## Objetivo
Após o cliente enviar a solicitação e um prestador aceitar, exibir uma tela de rastreamento em tempo real mostrando: rota do prestador até o cliente, distância e tempo estimado de chegada (ETA).

## Fluxo
1. Cliente envia solicitação → navega para `/cliente/acompanhar/:requestId`
2. Página escuta mudanças em tempo real na `service_requests` (status, provider_id)
3. Enquanto `status = pending`: mostra tela de "Aguardando prestador..."
4. Quando `status = accepted`: busca localização do prestador na tabela `providers` (latitude/longitude) e exibe mapa com rota, distância e ETA
5. Prestador atualiza localização a cada 10s via Realtime

## Alterações

### 1. Criar `src/pages/TrackingService.tsx`
- Recebe `requestId` via URL params
- Subscreve ao Realtime do Supabase para a `service_requests` onde `id = requestId`
- Estados: "Aguardando prestador" (pending) → "Prestador a caminho" (accepted/in_progress)
- Mapa full-screen com iframe Google Maps Directions mostrando rota entre prestador e cliente
- Painel inferior com: nome do prestador, ETA estimado, distância, botão de contato (telefone)
- Calcula distância/tempo usando a fórmula Haversine (client-side) como estimativa, já que a API Directions requer billing

### 2. Atualizar `src/pages/RequestService.tsx`
- Após inserir a solicitação com sucesso, navegar para `/cliente/acompanhar/{id}` em vez de `/cliente`
- Capturar o `id` retornado do insert com `.select('id').single()`

### 3. Atualizar `src/App.tsx`
- Adicionar rota `/cliente/acompanhar/:requestId` → `TrackingService`

### 4. Habilitar Realtime na tabela `service_requests`
- Migration SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;`

### Layout da tela de tracking
- Mapa full-screen de fundo (iframe com directions entre 2 pontos)
- Painel inferior `rounded-t-3xl` com:
  - Avatar/ícone do prestador + nome
  - Distância em km
  - Tempo estimado (calculado via Haversine, ~40km/h média urbana)
  - Botão "Ligar" para contato via telefone
  - Status da solicitação (badge)

### Arquivos afetados
- `src/pages/TrackingService.tsx` (novo)
- `src/pages/RequestService.tsx` (redirect após submit)
- `src/App.tsx` (nova rota)
- Migration SQL (realtime)

