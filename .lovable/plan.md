

# Efeito Glow Mais Sutil

## Alterações

**Arquivo: `src/pages/Index.tsx`** — Reduzir os parâmetros de intensidade nos dois GlowCards:

- `glowIntensity`: 1.5 → 0.6
- `glowRadius`: 50 → 25
- `coneSpread`: 30 → 20
- `fillOpacity`: adicionar com valor 0.15 (padrão atual é 0.5)

Isso reduz o brilho, o alcance e a largura do cone de luz, tornando o efeito elegante mas discreto.

