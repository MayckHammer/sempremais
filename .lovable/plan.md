

# Geolocation Watch para Prestador

## O que será feito
Quando o prestador aceitar uma solicitação (`handleAcceptRequest`), iniciar `navigator.geolocation.watchPosition` para enviar suas coordenadas em tempo real para a tabela `providers` (campos `latitude`/`longitude`). Parar o watch quando o serviço for concluído ou o componente desmontar.

## Alterações em `src/pages/ProviderDashboard.tsx`

### 1. Adicionar ref para watchId
```tsx
const watchIdRef = useRef<number | null>(null);
```

### 2. Criar função `startLocationTracking`
- Usa `navigator.geolocation.watchPosition` com `enableHighAccuracy: true`
- A cada atualização, faz `supabase.from('providers').update({ latitude, longitude })` no registro do prestador
- Throttle de ~10s para não sobrecarregar (comparar timestamp da última atualização)

### 3. Criar função `stopLocationTracking`
- Chama `navigator.geolocation.clearWatch(watchIdRef.current)`
- Limpa o ref

### 4. Integrar no fluxo
- Em `handleAcceptRequest`: após aceitar com sucesso, chamar `startLocationTracking()`
- Em `handleCompleteRequest`: após concluir com sucesso, chamar `stopLocationTracking()`
- No `useEffect` cleanup (unmount): chamar `stopLocationTracking()`
- Ao montar, verificar se há jobs `accepted`/`in_progress` e retomar tracking automaticamente

### 5. Indicador visual
- Mostrar um pequeno badge/ícone pulsante no dashboard quando o tracking está ativo

## Arquivo afetado
- `src/pages/ProviderDashboard.tsx`

