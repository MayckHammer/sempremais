

# Auto-play no Carrossel de Destaques

## Alterações em `src/pages/Index.tsx`

### `HighlightsCarousel` — adicionar auto-play com Embla plugin

1. **Instalar plugin**: Adicionar `embla-carousel-autoplay` ao `package.json`
2. **Importar e configurar** o plugin no componente `HighlightsCarousel`:
   - `Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })`
   - `stopOnMouseEnter: true` — pausa ao passar o cursor (desktop)
   - `stopOnInteraction: false` — retoma após swipe (touch)
3. **Passar o plugin** via prop `plugins={[autoplayPlugin]}` no `<Carousel>`

O swipe touch já funciona nativamente no Embla — não precisa de configuração extra.

```text
Carousel
  plugins={[Autoplay({ delay: 3000, stopOnMouseEnter: true })]}
  opts={{ align: 'start', loop: true }}
```

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionar `embla-carousel-autoplay` |
| `src/pages/Index.tsx` | Importar Autoplay plugin e passar ao Carousel |

