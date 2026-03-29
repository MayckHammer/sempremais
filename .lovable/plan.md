

# Mapa Interativo em Tempo Real (estilo Uber/99)

## Resumo
Substituir iframes estáticos pelo Google Maps JavaScript API com marcadores em tempo real, rota desenhada e ETA real.

## Mudanças

### 1. Instalar `@react-google-maps/api`

### 2. Criar `src/components/LiveMap.tsx`
- Componente reutilizável com `useJsApiLoader` (key: `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`, libraries: `['places']`)
- Props: `clientLat`, `clientLng`, `providerLat?`, `providerLng?`, `showRoute?`, `onEtaUpdate?`
- `GoogleMap` com zoom 15, centralizado no cliente
- Marcador cliente (pin azul/verde fixo)
- Marcador prestador (pin vermelho, atualiza posição com animação suave via `useEffect` + interpolação)
- Quando ambas posições existirem e `showRoute=true`: usar `DirectionsService` para calcular rota e renderizar com `DirectionsRenderer`
- `fitBounds` automático quando há dois marcadores
- Callback `onEtaUpdate(minutes, distanceKm)` com dados da Directions API
- Recalcular rota a cada mudança de posição do prestador (com debounce de 5s para não exceder quota)

### 3. Atualizar `src/pages/RequestService.tsx`
- Remover iframe
- Importar e usar `<LiveMap clientLat={coords.lat} clientLng={coords.lng} />` no lugar

### 4. Atualizar `src/pages/TrackingService.tsx`
- Remover iframe e função `haversineDistance`
- Usar `<LiveMap>` com props do cliente e prestador
- `showRoute={true}` quando prestador tem localização
- Usar callback `onEtaUpdate` para atualizar distância e ETA no painel inferior (substituindo cálculo haversine)
- Manter Supabase Realtime subscriptions como estão

### 5. Verificar `src/pages/ProviderDashboard.tsx`
- Confirmar que `enableHighAccuracy: true` já está no `getCurrentPosition` e `watchPosition`

## Nota importante
A API key precisa ter **Maps JavaScript API** e **Directions API** habilitadas no Google Cloud Console. Se não estiverem, o mapa não carregará.

