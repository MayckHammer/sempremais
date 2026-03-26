

# Efeito Lava Lamp no Background do Hero

## Conceito

Substituir o SVG estático das curvas azul/cinza por **blobs animados** que se movem organicamente como uma lâmpada de lava. Três bolhas grandes (azul, cinza, branca) flutuam lentamente pelo fundo, deformando-se e se sobrepondo com `mix-blend-mode` e `blur` para criar o efeito viscoso característico.

## Implementação

### `src/pages/Index.tsx` — Substituir o SVG por blobs animados

Trocar o bloco `<svg>` (linhas 44-54) por 4-5 `<motion.div>` absolutamente posicionados:

- **Blob azul** (`hsl(207 78% 38%)`): grande, ocupa ~60% da tela, animação de 20s movendo-se do canto inferior-esquerdo para cima-direita e voltando
- **Blob cinza** (`hsl(220 5% 46%)`): médio, ~45% da tela, animação de 25s em trajetória oposta
- **Blob branco** (`hsl(0 0% 100% / 0.7)`): médio, ~35%, serpenteia pelo centro criando a separação "S"
- **Blob azul claro** (glow): pequeno, ~25%, animação mais rápida (15s) para dar vida

Cada blob terá:
- `border-radius: 50%` com `filter: blur(40px)` para bordas suaves
- Framer Motion `animate` com keyframes de `x`, `y`, `scale` e `borderRadius` variando entre formas orgânicas
- `transition: { duration: 18-25s, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }`

### `src/index.css` — Adicionar classe utilitária

Adicionar `.lava-blob` com propriedades base para os blobs (blur, border-radius, position absolute).

## Exemplo de um blob

```tsx
<motion.div
  className="absolute w-[60vw] h-[60vw] rounded-full opacity-90"
  style={{ background: 'hsl(207 78% 38%)', filter: 'blur(60px)' }}
  animate={{
    x: ['-10%', '20%', '-5%'],
    y: ['-10%', '30%', '10%'],
    scale: [1, 1.2, 0.9, 1],
    borderRadius: ['40%', '60%', '50%']
  }}
  transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
/>
```

## Resultado Visual

As três cores da marca (azul, branco, cinza) flutuam organicamente pelo hero como bolhas de lava, mantendo a identidade visual mas com movimento hipnótico e premium.

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Substituir SVG estático por blobs animados com Framer Motion |
| `src/index.css` | Classe utilitária `.lava-blob` |

