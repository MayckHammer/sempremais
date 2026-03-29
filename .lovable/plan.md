

# Sombra 3D azul neon no container do mapa

## Resumo
Adicionar uma sombra estilizada com tonalidade azul escuro neon atrás do container do mapa na seção "Descubra Prestadores", criando um efeito de profundidade 3D.

## Mudança

### Editar `src/components/ClientHome.tsx` (linha 277)
Substituir a classe do container do mapa para incluir uma sombra personalizada azul neon:

```tsx
// DE
<div className="rounded-3xl overflow-hidden shadow-premium border border-border/40 bg-card">

// PARA
<div className="rounded-3xl overflow-hidden border border-blue-500/30 bg-card shadow-[0_4px_30px_rgba(59,130,246,0.35),0_8px_60px_rgba(30,64,175,0.25)]">
```

A sombra combina duas camadas:
- Uma camada próxima com azul primário (`blue-500`) para brilho
- Uma camada mais distante com azul escuro (`blue-800`) para profundidade

Resultado: efeito "glow" neon azul escuro que sugere 3D, alinhado com a identidade visual do projeto.

