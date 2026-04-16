
O slider "Taxa de resgate" está desabilitado quando a categoria selecionada não é "custom" (linha ~190 em `AdminCalculator.tsx` tem `disabled={!isCustom}` e `opacity: isCustom ? 1 : 0.6`). Isso impede o ajuste manual quando uma categoria pré-definida está selecionada.

## Plano: Tornar o slider "Taxa de resgate" sempre funcional

### Alteração em `src/pages/admin/AdminCalculator.tsx`

1. **Remover o bloqueio do slider** — Tirar a propriedade `disabled={!isCustom}` e o `opacity` condicional do container do slider de taxa de resgate, deixando-o sempre interativo (100% opacidade).

2. **Manter sincronização inteligente com a categoria** — Quando o usuário escolhe uma categoria pré-definida, a taxa continua sendo atualizada automaticamente para o valor sugerido (comportamento atual de `handleCategoryChange`). Mas a partir daí o usuário pode mover o slider livremente para ajustar manualmente, sem precisar trocar para "Taxa personalizada".

3. **Remover variável `isCustom` se não for mais usada** — Após retirar a lógica de bloqueio, a variável `isCustom` torna-se desnecessária e será removida para manter o código limpo.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminCalculator.tsx` | Remover `disabled` e `opacity` condicional do slider de taxa; remover `isCustom` |
