

# Separar visualmente o mapa do container de informações com glow neon azul

## Resumo
Envolver toda a seção (mapa + info + botão) em um container com fundo card e padding, e manter o mapa com a sombra neon azul existente. Isso cria contraste entre o mapa (com glow) e o container pai (fundo sólido com bordas suaves).

## Mudanças

### Editar `src/components/ClientHome.tsx` (linhas 277-297)
- Envolver o bloco do mapa, informativo e botão em um `<div>` container com classes: `rounded-3xl bg-card/80 border border-border/40 p-4 space-y-4 shadow-premium`
- Manter o mapa interno com a sombra neon azul atual (`shadow-[0_4px_30px_rgba(59,130,246,0.35),...]` e `border-blue-500/30`)
- Isso cria duas camadas visuais: container externo neutro + mapa interno com glow neon

```text
┌─ Container externo (bg-card, shadow-premium) ─────┐
│                                                     │
│  ┌─ Mapa (border-blue-500, shadow neon azul) ────┐ │
│  │  LiveMap                                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  3 prestadores próximos                             │
│  Endereço...                                        │
│                                                     │
│  [ Solicitar Assistência ]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Resultado: o mapa se destaca com o glow neon azul dentro de um card neutro, criando profundidade e separação visual clara.

