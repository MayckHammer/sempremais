

# Substituir iframes do Google Maps pelo componente LiveMap

## Problema
O erro "This API is not activated on your API project" ocorre porque os `<iframe>` usam a **Maps Embed API**, que não está habilitada no projeto Google Cloud. O componente `LiveMap` (que usa a Maps JavaScript API) já funciona.

## Solução
Substituir os `<iframe>` restantes pelo componente `LiveMap` interativo, que já está funcionando no projeto.

## Mudanças

### 1. Editar `src/components/ClientHome.tsx`
- Importar `LiveMap`
- Substituir o bloco `<iframe>` (linhas 278-286) por `<LiveMap clientLat={location.lat} clientLng={location.lng} showRoute={false} />`

### 2. Editar `src/pages/GuestRequestService.tsx`
- Importar `LiveMap`
- Substituir o `<iframe>` pelo `<LiveMap>` com as coordenadas existentes

Duas edições simples, sem mudança de lógica.

