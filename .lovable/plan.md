

# Adicionar campos de veículo na tela Guest Request Service

## Problema
A tela `/assistencia` (GuestRequestService) não possui campos para descrever o veículo, diferente da tela de assinante que já os tem.

## Mudanças em `src/pages/GuestRequestService.tsx`

1. **Importar** `Car` de lucide-react
2. **Adicionar estados**: `vehicleType`, `vehicleBrand`, `vehicleModel`, `vehicleYear`
3. **Adicionar campos** após o select de serviço (antes do price display):
   - Select "Tipo de veículo" com ícone Car (Automóvel, Motocicleta, Picape, Caminhão, Outros)
   - Inputs Marca + Modelo lado a lado (`flex gap-3`)
   - Input Ano
4. **Incluir `vehicle_info`** no insert do `handleSubmit` — concatenar como `"Automóvel - Honda Civic 2020"`
5. Manter estilos consistentes: `rounded-xl h-11 border-border bg-muted/50 text-sm`

