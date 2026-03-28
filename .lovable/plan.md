

# Ajustar Posição do Banner e Tamanho do Mapa

## Problema
- O banner carrossel está posicionado alto demais (dentro da curva azul)
- O mapa ocupa muito espaço vertical, forçando scroll
- Tudo precisa caber em uma tela (844px viewport)

## Alterações em `src/components/ClientHome.tsx`

### 1. Mover o banner para a área branca
- Remover o posicionamento `absolute` do banner (linha 147)
- Colocar o carrossel como primeiro item dentro do container de conteúdo (`div` linha 174), antes da seção Destaques
- Reduzir o `pb-36` do header para `pb-16` já que o banner não precisa mais de espaço sobreposto
- Adicionar `margin-top: -2rem` no carrossel para que ele se sobreponha levemente à curva

### 2. Reduzir o mapa
- Diminuir altura do mapa de `h-52` para `h-32`

### 3. Compactar espaçamentos
- Reduzir `space-y-8` para `space-y-5` no container de conteúdo
- Reduzir `pt-6` para `pt-2`
- Reduzir altura do banner de `h-36` para `h-28`
- Reduzir `pb-8` para `pb-4`

Tudo cabe em 844px sem scroll.

