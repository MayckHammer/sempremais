

# Esconder o badge "Made with unicorn.studio"

## Problema
O UnicornStudio renderiza um badge/watermark "Made with unicorn.studio" no fundo da cena. Esse badge é injetado pelo SDK dentro do iframe/canvas.

## Solução

Adicionar CSS no container do UnicornScene para esconder o badge via `overflow: hidden` + posicionamento, ou mais diretamente, usar CSS para ocultar o elemento do watermark.

### `src/pages/Index.tsx`
- No `<div>` wrapper do UnicornScene (linha 46), adicionar uma classe CSS customizada (ex: `unicorn-container`)

### `src/index.css`
- Adicionar regra CSS que esconde o badge do UnicornStudio:
```css
.unicorn-container [class*="watermark"],
.unicorn-container a[href*="unicorn.studio"],
.unicorn-container > div > div:last-child {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
```

Isso vai ocultar o watermark sem afetar a animação da cena.

