

# Botão GPS no campo de origem

## Resumo
Adicionar um botão com ícone de "mira/crosshair" à direita do campo de origem que, ao ser clicado, obtém a localização GPS atual do usuário e atualiza o endereço e coordenadas do mapa.

## Mudanças

### Editar `src/pages/RequestService.tsx`
- Importar `Crosshair` (ou `LocateFixed`) do `lucide-react`
- Criar função `handleUseCurrentLocation` que chama `navigator.geolocation.getCurrentPosition`, atualiza `coords` e faz reverse geocoding (igual ao `useEffect` existente) para preencher `originAddress`
- Adicionar estado `gpsLoading` para mostrar feedback durante a obtenção
- No bloco `{/* Origin */}`, adicionar um botão absoluto à direita do input (`right-2`) com o ícone, que chama `handleUseCurrentLocation`
- Ajustar `className` do `PlacesAutocomplete` para `pr-12` para não sobrepor o botão

