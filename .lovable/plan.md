

# Atualizar chave da API do Google Maps

## Resumo
Substituir a chave antiga (`AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`) pela nova (`AIzaSyAS6DIG32UlzRqldOlMlIhooo7wSLwvPNQ`) em todos os 4 arquivos que a utilizam.

## Arquivos a alterar

1. **`src/components/LiveMap.tsx`** — constante `GOOGLE_MAPS_API_KEY`
2. **`src/pages/RequestService.tsx`** — URL de geocoding reverso
3. **`src/components/ClientHome.tsx`** — iframe embed do mapa
4. **`src/pages/GuestRequestService.tsx`** — URL de geocoding reverso + iframe embed

Todas as ocorrências serão substituídas pela nova chave. Nenhuma outra alteração necessária.

