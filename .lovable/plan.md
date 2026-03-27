

# Reposicionar Logo — Alinhada ao Quadro Amarelo

## Problema
A logo está centralizada verticalmente no `flex-1` (metade da tela), mas na referência ela deve ficar mais acima — aproximadamente no topo do terço superior, onde o quadro amarelo indica (~20-25% do topo da tela).

## Alteração

**Arquivo:** `src/pages/Index.tsx` (linha 20)

Trocar o container da logo de `flex-1 flex items-center justify-center pt-16` para posicionamento fixo no topo, usando `pt-24` (ou similar) sem `flex-1`, para que a logo fique na posição do quadro amarelo — parte superior da tela, abaixo da área azul do background.

A seção de botões mantém `mt-auto` para ficar na parte inferior, e a logo fica com posição absoluta ou padding-top fixo no topo.

```tsx
{/* Logo — posição fixa no topo */}
<div className="pt-28 flex items-center justify-center">
  <img ... />
</div>

{/* Spacer para empurrar botões para baixo */}
<div className="flex-1" />

{/* Actions — lower section (sem mudanças) */}
```

