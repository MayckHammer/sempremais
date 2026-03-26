

# Corrigir ocultação do watermark UnicornStudio

## Problema

Os seletores CSS atuais são muito específicos e não estão atingindo o elemento correto do badge "Made with unicorn.studio". O badge aparece como um elemento flutuante na parte inferior da cena.

## Solução

Ampliar os seletores CSS em `src/index.css` para cobrir mais variações do watermark:

- Adicionar seletor para o container inteiro do último filho (não só o `a` dentro dele)
- Adicionar seletores por atributo `style` (posição fixed/absolute no bottom)
- Adicionar seletor genérico para qualquer elemento com texto "unicorn" via `div[style*="bottom"]`

### `src/index.css` — Substituir o bloco existente

```css
.unicorn-container [class*="watermark"],
.unicorn-container [class*="Watermark"],
.unicorn-container [class*="badge"],
.unicorn-container a[href*="unicorn.studio"],
.unicorn-container > div > div > div:last-child,
.unicorn-container > div > div:last-child > div:last-child,
.unicorn-container div[style*="bottom"] a,
.unicorn-container div[style*="position: fixed"],
.unicorn-container div[style*="position: absolute"][style*="bottom"] {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  height: 0 !important;
  overflow: hidden !important;
}
```

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Ampliar seletores CSS para ocultar watermark |

