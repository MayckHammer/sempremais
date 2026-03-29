

# Corrigir reverse geocoding usando Maps JavaScript API

## Problema
A API REST de Geocoding (`maps.googleapis.com/maps/api/geocode/json`) **não está ativada** no projeto Google Cloud. As requisições retornam `REQUEST_DENIED`. Por isso, o código cai no fallback e exibe coordenadas brutas (`-18.9720, -48.3500`).

## Solução
Substituir as chamadas `fetch` à API REST pelo `google.maps.Geocoder`, que faz parte da **Maps JavaScript API** (já ativada e funcionando). Isso não requer ativar nenhuma API adicional.

## Mudanças

### Editar `src/pages/RequestService.tsx`
- No `useEffect` inicial e na função `handleUseCurrentLocation`, substituir:
  ```typescript
  // DE (REST API - não ativada)
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=...`);
  const data = await res.json();
  if (data.results?.[0]) setOriginAddress(data.results[0].formatted_address);
  ```
  ```typescript
  // PARA (JavaScript API - já ativada)
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ location: { lat, lng } });
  if (response.results?.[0]) setOriginAddress(response.results[0].formatted_address);
  ```
- Aplicar a mesma mudança nos dois locais (useEffect e handleUseCurrentLocation)
- Adicionar polling/espera para `window.google?.maps` antes de geocodificar, caso o script ainda não tenha carregado

### Editar `src/pages/GuestRequestService.tsx`
- Mesma substituição do `fetch` por `google.maps.Geocoder` no `useEffect` inicial

Duas edições simples, sem nova dependência. Usa a API que já está funcionando.

