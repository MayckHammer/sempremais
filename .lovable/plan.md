

# Autocomplete de endereço no campo de destino

## Resumo
Adicionar autocomplete do Google Places API no campo "Localização de destino" da tela `/cliente/solicitar`, usando a biblioteca `@react-google-maps/api` que já está instalada (com `Autocomplete` component). O `places` library já está carregado no `LiveMap.tsx`.

## Mudanças

### 1. Criar componente `src/components/PlacesAutocomplete.tsx`
- Componente reutilizável que wrapa um `<Input>` com `google.maps.places.Autocomplete`
- Usa `useRef` + `useEffect` para inicializar o Autocomplete nativo no input
- Props: `value`, `onChange`, `onPlaceSelected(address, lat, lng)`, `placeholder`, `className`
- Restringe sugestões ao Brasil (`componentRestrictions: { country: 'br' }`)
- Verifica se `google.maps.places` está disponível antes de inicializar

### 2. Editar `src/pages/RequestService.tsx`
- Importar `PlacesAutocomplete`
- Substituir o `<Input>` do destino (linhas 249-254) pelo `<PlacesAutocomplete>`
- Adicionar estado `destinationCoords` para armazenar lat/lng do destino selecionado
- O `onPlaceSelected` atualiza `destinationAddress` e `destinationCoords`
- Opcionalmente incluir as coordenadas do destino no `description` ao submeter

### Detalhes técnicos
- O `places` library já é carregado no `LiveMap.tsx` (`LIBRARIES = ["geometry", "places"]`), então o `google.maps.places.Autocomplete` estará disponível quando o mapa carregar
- O componente aguarda `window.google?.maps?.places` estar disponível via polling ou callback
- Mantém o ícone `<Navigation>` à esquerda com `pl-10`

