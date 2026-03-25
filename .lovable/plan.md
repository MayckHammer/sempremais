

# Corrigir Background e Logo do Hero

## Problemas identificados

1. **Logo aparece como retângulo branco** — a imagem `logo-sempre.png` com `filter: brightness(0) invert(1)` pode estar sendo renderizada como um bloco branco se o PNG não tiver transparência adequada, ou a imagem pode não estar carregando
2. **Símbolo S quase invisível no fundo** — opacidade 0.12 e 0.07 são muito baixas, especialmente em mobile (390px) onde o SVG fica pequeno
3. **Gradiente de fade branco (35%)** cobre boa parte do conteúdo na parte inferior

## Alterações

### 1. Aumentar visibilidade dos símbolos S decorativos (`SempreBackground.tsx`)

- Aumentar opacidade da camada principal de `0.12` para `0.18`
- Aumentar opacidade da camada secundária de `0.07` para `0.12`
- Ajustar posicionamento para mobile: camada principal mais centralizada (`right: -10%` em vez de `-20%`)
- Reduzir o fade branco inferior de `35%` para `20%` para não cobrir tanto

### 2. Corrigir exibição da logo (`Index.tsx`)

- Verificar se o filtro CSS está causando o retângulo branco — se a logo `logo-sempre.png` tem fundo branco (não transparente), o `brightness(0) invert(1)` transforma tudo em branco
- Solução: usar a logo sem filtro se já tiver cores adequadas, ou usar `logo-watermark.png` / `logo-alt.png` se for uma versão branca da logo

### 3. Ajustar card do hero

- Alterar o card de `bg-white/15` para `bg-white/20` para melhor contraste e legibilidade

## Detalhes Técnicos

| Parâmetro | Antes | Depois |
|-----------|-------|--------|
| Opacidade S grande | 0.12 | 0.18 |
| Opacidade S pequeno | 0.07 | 0.12 |
| Posição S grande (right) | -20% | -10% |
| Fade branco (height) | 35% | 20% |
| Card hero bg | white/15 | white/20 |
| Logo filter | brightness(0) invert(1) | Verificar alternativas nos assets |

