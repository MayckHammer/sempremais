

# Separação visual entre mapa e painel de formulário

## Problema
O mapa e o painel de preenchimento têm tonalidades muito parecidas, dificultando a distinção visual entre as duas áreas.

## Solução
Adicionar o glow neon azul na borda superior do painel de formulário (o container `rounded-t-3xl`), criando uma linha de luz que separa visualmente o mapa do formulário. Isso reforça a identidade visual do projeto e cria profundidade.

## Mudança

### Editar `src/pages/RequestService.tsx` (linha 200)
Atualizar as classes do painel inferior para incluir borda azul neon e sombra glow:

```tsx
// DE
<div className="bg-card rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-5 pt-6 pb-8 relative z-10">

// PARA
<div className="bg-card rounded-t-3xl border-t border-x border-blue-500/30 shadow-[0_-4px_30px_rgba(59,130,246,0.3),0_-8px_50px_rgba(30,64,175,0.2)] px-5 pt-6 pb-8 relative z-10">
```

Resultado: uma linha de luz azul neon na borda superior do painel + sombra glow azul que se projeta sobre o mapa, criando separação clara e efeito de profundidade 3D consistente com o estilo já aplicado no mapa da home.

