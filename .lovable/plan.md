

# Redesign do Background Hero com Curva em "S" Branca

## O que será feito

Redesenhar o SVG do hero para criar uma faixa branca em forma de "S" que serpenteia entre a área azul (esquerda) e a área cinza (direita), seguindo o mesmo conceito visual do "S" da logo. O desenho amarelo do usuário mostra claramente o caminho: a curva branca entra pela esquerda no topo, curva para a direita no meio, e volta para a esquerda embaixo — criando a separação orgânica entre azul e cinza.

## Alteração

**Arquivo: `src/pages/Index.tsx`** (linhas 38-42)

Substituir os 2 paths atuais por 3 camadas:
1. **Fundo azul** (lado esquerdo) — path que cobre a metade esquerda com curva S
2. **Fundo cinza** (lado direito) — path que cobre a metade direita com curva S oposta
3. **Espaço branco** entre eles — criado naturalmente pelo gap entre os dois paths, mostrando o fundo branco da página

O SVG será redesenhado com curvas Bézier que formam um "S" fluido, onde:
- No topo, o azul domina ~70% da largura
- No meio, as cores se cruzam com a curva S branca passando pelo centro
- Na base, o cinza domina mais à direita e o azul à esquerda

A curva branca terá uma largura visível (~30-40px no viewBox) para ser percebida como elemento de design, não apenas uma linha divisória.

## Detalhes Técnicos

- ViewBox mantido em `0 0 400 500`
- Curvas Bézier cúbicas (`C`) para suavidade
- Sem alteração no conteúdo (logo, card, botões)
- O fundo da `<section>` será `bg-white` para que o espaço entre os paths apareça branco

