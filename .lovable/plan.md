

# SBBadge Flutuante com Animação Premium

## O que será feito

1. **Reposicionar no header**: Colocar a logo centralizada no header (onde o SBBadge estava) e transformar o SBBadge em um ícone flutuante fixo na tela.

2. **SBBadge como ícone flutuante**:
   - Posição fixa no canto inferior direito (estilo FAB)
   - Cor preta com texto branco, tamanho maior (~56px)
   - Ícone de moeda + saldo "00 SB's"
   - Ao clicar, navega para `/cliente/carteira`

3. **Animação premium - "Shimmer sweep"**:
   - Um efeito de luz que percorre o botão em loop sutil (tipo laminado holográfico)
   - Implementado via pseudo-elemento com gradiente linear animado (CSS)
   - Frequência baixa (~3s por ciclo) para manter elegância sem distração
   - Combinado com uma leve sombra pulsante (glow-pulse) para dar profundidade

## Alterações

### `src/components/SBBadge.tsx`
- Mudar para `position: fixed`, `bottom-6 right-6`, `z-50`
- Fundo preto (`bg-foreground`), texto branco, border-radius circular
- Tamanho maior: ícone `w-5 h-5`, texto `text-sm`
- Adicionar classe CSS para efeito shimmer sweep

### `src/components/ClientHome.tsx`
- Remover `<SBBadge />` do header (linha 148)
- A logo já fica centralizada naturalmente com `justify-between` (menu esquerda, logo centro, espaço direita)
- Adicionar um `<div className="w-10" />` placeholder à direita para manter centralização da logo
- Renderizar `<SBBadge />` fora do header, no final do componente (flutuante)

### `src/index.css`
- Adicionar keyframe `shimmer-sweep`: gradiente diagonal branco translúcido que percorre o elemento da esquerda para direita em 3s

### Outras páginas com SBBadge
- `ClientRequests.tsx`: mover SBBadge para flutuante (mesmo padrão)

