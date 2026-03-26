

# Substituir Logo por Versão Sem Símbolo (Somente Texto)

## Resumo

O usuário enviou a logo com fundo transparente (`sempre_logo_sem_fundo-2.png`). Ele quer que somente a parte de **texto** da logo ("SEMPRE+ Assistências e Benefícios") apareça centralizada na página hero — **sem o símbolo S** à esquerda.

## Problema

A logo enviada contém tanto o símbolo S quanto o texto. Para separar, precisamos recortar a imagem programaticamente ou usar a logo completa e o usuário pode fornecer uma versão só com texto.

## Abordagem

1. **Copiar a nova logo** (com fundo transparente) para `src/assets/logo-sempre.png`, substituindo a anterior
2. **No Hero (`src/pages/Index.tsx`)**: usar a logo centralizada — como a imagem tem fundo transparente, ficará melhor sobre o background SVG
3. **Recortar o símbolo**: usar CSS `object-position` e `object-fit` com `clip-path` ou criar a versão texto via código — porém o mais limpo é recortar via script

Como o símbolo ocupa aproximadamente os primeiros 25-30% da largura da imagem, podemos usar `clip-path: inset(0 0 0 28%)` para esconder o símbolo e mostrar só o texto.

## Alterações

### 1. Copiar nova logo transparente
- Copiar `user-uploads://sempre_logo_sem_fundo-2.png` → `src/assets/logo-sempre.png`

### 2. `src/pages/Index.tsx` — Hero
- Na `<motion.img>` da logo (linha 63-70), adicionar `style={{ clipPath: 'inset(0 0 0 28%)' }}` para cortar o símbolo S e exibir apenas o texto "SEMPRE+ Assistências e Benefícios"
- Manter centralização e animações existentes

### 3. Header e Footer
- Atualizar para usar a nova logo transparente (já importam de `logo-sempre.png`)
- No Header (fundo azul): manter `filter: brightness(0) invert(1)` — agora com transparência ficará mais limpo
- No Footer: mesmo tratamento

