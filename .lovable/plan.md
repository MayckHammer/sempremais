

# Atualizar LiveMap.tsx com versão avançada

## Resumo
Substituir o `LiveMap.tsx` atual pela versão completa que o usuário forneceu, com ícones SVG customizados, animação suave do prestador, estilo minimalista do mapa e suporte a tráfego.

## Mudanças

### 1. Reescrever `src/components/LiveMap.tsx`
- Substituir todo o conteúdo pela versão colada pelo usuário
- Inclui: `useSmoothMarker` hook, ícones SVG, `MAP_STYLE`, `trafficModel`, `loadError` handling, `className` prop
- Libraries muda de `['places']` para `['geometry']`
- `showRoute` default muda de `false` para `true`

### 2. Verificar compatibilidade nos consumidores
- **`RequestService.tsx`**: usa `<LiveMap clientLat clientLng />` — compatível (não passa `showRoute`, default muda para `true` mas sem provider não faz diferença)
- **`TrackingService.tsx`**: usa `providerLat`, `providerLng`, `showRoute`, `onEtaUpdate` — a interface muda `providerLat/Lng` de `number | null` para `number | undefined`, mas o componente já recebe `undefined` quando não há provider, então é compatível
- Export: a nova versão tem `export function LiveMap` + `export default LiveMap` — compatível com ambos os imports existentes

Nenhuma alteração necessária nos consumidores.

