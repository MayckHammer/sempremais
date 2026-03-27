

# Rastreamento em Tempo Real com Google Maps

## Visão Geral

Implementar um sistema de rastreamento onde o cliente vê no mapa:
1. Sua própria localização
2. A localização do prestador em tempo real
3. A rota entre os dois
4. O tempo estimado de chegada (ETA)

## Abordagem Técnica

### API Key do Google Maps
- Será necessária uma **Google Maps API Key** com as APIs: Maps JavaScript, Directions, Geocoding
- Usar a biblioteca `@react-google-maps/api` para renderizar o mapa no React
- A key será armazenada como secret pública (`VITE_GOOGLE_MAPS_API_KEY`) no código

### Banco de Dados — Atualização de localização do prestador
- A tabela `providers` já possui `latitude` e `longitude`
- Ativar **realtime** na tabela `providers` para que o cliente receba atualizações de posição em tempo real
- O prestador enviará sua localização periodicamente (a cada 10s) via `navigator.geolocation.watchPosition`

### Componentes Novos

1. **`src/components/TrackingMap.tsx`** — Componente de mapa com:
   - Marcador do cliente (pin azul)
   - Marcador do prestador (pin laranja, atualizado em tempo real)
   - Rota entre os dois (polyline via Directions API)
   - Card com ETA estimado

2. **`src/components/TrackingPanel.tsx`** — Painel lateral/inferior com:
   - Nome do prestador
   - ETA em minutos
   - Status da viagem
   - Barra de progresso

### Fluxo

```text
Cliente solicita serviço → Prestador aceita
                            ↓
              Prestador ativa tracking (watchPosition)
                            ↓
              Localização salva no DB a cada 10s
                            ↓
              Cliente recebe via Realtime subscription
                            ↓
              Mapa atualiza marcador + rota + ETA
```

### Alterações por Arquivo

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionar `@react-google-maps/api` |
| DB Migration | `ALTER PUBLICATION supabase_realtime ADD TABLE providers` |
| `src/components/TrackingMap.tsx` | **Novo** — Mapa com marcadores, rota e ETA |
| `src/components/TrackingPanel.tsx` | **Novo** — Painel com info do prestador e ETA |
| `src/pages/ClientDashboard.tsx` | Mostrar mapa quando solicitação estiver `accepted` |
| `src/pages/ProviderDashboard.tsx` | Ativar `watchPosition` e enviar localização ao DB quando job ativo |

### Pré-requisito do Usuário

Você precisará de uma **Google Maps API Key** com as seguintes APIs habilitadas no Google Cloud Console:
- Maps JavaScript API
- Directions API

Posso guiá-lo na criação dessa chave passo a passo.

