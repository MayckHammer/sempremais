

# Acesso Secreto via "+" da Logo

## Problema
A logo é uma imagem única (`logo-sempre-text.png`), então nao da para colocar um click handler apenas no sinal de "+". Mas podemos simular isso com uma area clicavel invisivel posicionada sobre o "+" usando CSS absolute positioning.

## Solução

### `src/pages/Index.tsx`
- Envolver a logo em um container `relative`
- Adicionar um `<div>` invisivel com `position: absolute` posicionado exatamente sobre o sinal de "+" na logo
- Ao clicar nessa area, navegar para `/admin/login`
- O div sera totalmente transparente (`opacity-0`, sem cursor pointer) para permanecer invisivel
- Sem feedback visual ao hover para manter o segredo

### Detalhes técnicos
- O "+" aparece no canto superior direito do texto "SEMPRE" na logo
- Posicionar o hotspot: `absolute top-[15%] right-[18%] w-[15%] h-[30%]` (ajustar conforme necessário)
- `cursor-default` para não revelar que é clicável
- `navigate('/admin/login')` no onClick

