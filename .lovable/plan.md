

# Mover Informativo de Prestadores para Fora do Mapa

## O que muda
Remover o overlay "0 prestadores próximos" de dentro do mapa e colocá-lo como um bloco informativo maior abaixo do mapa, seguido pelo botão "Solicitar Assistência".

## Alterações em `src/components/ClientHome.tsx`

### 1. Remover overlay interno do mapa (linhas 234-242)
Apagar o `div` absoluto que mostra o contador de prestadores dentro do iframe do mapa.

### 2. Adicionar informativo abaixo do mapa (após linha 244)
Criar um bloco com texto maior mostrando:
- Quantidade de prestadores próximos (fonte `text-base font-bold`)
- Endereço atual (fonte `text-sm text-muted-foreground`)

### 3. Mover botão para dentro da mesma section do mapa
O botão "Solicitar Assistência" virá logo após o informativo, ainda dentro da `motion.section` do mapa. Remover o `motion.div` separado do botão (linhas 247-259).

### Resultado visual
```text
┌──────────────────────┐
│      MAPA (iframe)   │
└──────────────────────┘
  0 prestadores próximos
  São Paulo, SP
┌──────────────────────┐
│ Solicitar Assistência│
└──────────────────────┘
```

### Arquivo afetado
- `src/components/ClientHome.tsx`

