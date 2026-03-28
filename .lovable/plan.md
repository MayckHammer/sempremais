

# Adicionar campos de veículo na tela de solicitação de assistência

## Problema
A tela `/assistencia` (RequestService) não possui campos para o cliente descrever o veículo. O usuário quer um select de tipo de veículo (Automóvel, Motocicleta, Picape, Caminhão, Outros) e campos de Marca, Modelo e Ano.

## Mudanças

### `src/pages/RequestService.tsx`

1. **Adicionar estados** para os novos campos:
   - `vehicleType` (select): Automóvel, Motocicleta, Picape, Caminhão, Outros
   - `vehicleBrand` (input): Marca
   - `vehicleModel` (input): Modelo
   - `vehicleYear` (input): Ano

2. **Adicionar campos no painel inferior**, entre o select de serviço e o campo de origem:
   - Select "Tipo de veículo" com ícone de carro
   - Inputs para Marca, Modelo e Ano (Marca e Modelo lado a lado, Ano abaixo ou junto)

3. **Tornar o painel scrollável** — com tantos campos, o painel precisa de `overflow-y-auto` e `max-h` para não ultrapassar a tela

4. **Incluir dados do veículo no submit** — concatenar no campo `vehicle_info` da tabela `service_requests`: ex. `"Automóvel - Honda Civic 2020"`

5. **Pré-carregar dados do perfil** — se o usuário já tem `vehicle_brand`, `vehicle_model`, `vehicle_year` no perfil, preencher automaticamente

### Layout do painel (mobile 390px)

```text
┌─────────────────────────────┐
│  ── drag handle ──          │
│  [Tipo de serviço      ▾]   │
│  [Tipo de veículo      ▾]   │
│  [Marca        ] [Modelo  ] │
│  [Ano                     ] │
│  💰 Valor assinante R$XX    │
│  📍 Localização atual       │
│  🧭 Localização de destino  │
│  [ Solicitar Assistência ]  │
└─────────────────────────────┘
```

### Detalhes técnicos
- Importar `Car` de lucide-react para ícone no select de veículo
- Usar o mesmo estilo `rounded-xl h-12 border-border bg-muted/50` dos campos existentes
- Marca e Modelo em `flex gap-3` lado a lado
- Adicionar `overflow-y-auto max-h-[65vh]` no painel inferior para scroll quando necessário
- No `handleSubmit`, montar `vehicle_info` como `"${vehicleType} - ${vehicleBrand} ${vehicleModel} ${vehicleYear}"`

