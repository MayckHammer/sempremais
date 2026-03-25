

# Atualizar SVG do SempreBackground para corresponder à logo real

## Resumo

O símbolo "S+" enviado mostra curvas muito mais orgânicas e arredondadas do que o SVG atual (que é angular/geométrico). Vou redesenhar os paths SVG no `SempreBackground.tsx` para reproduzir fielmente o formato da logo: cantos arredondados externos, curva "S" fluida entre azul e cinza, e adicionar o símbolo "+" na parte cinza.

## Alteração

**Arquivo: `src/components/SempreBackground.tsx`**

Redesenhar os dois paths do `SempreSymbolSVG`:

1. **Path azul (esquerda)**: Cantos superiores-esquerdos e inferiores-esquerdos arredondados, borda direita formando a curva S orgânica (côncava no topo, convexa na base)
2. **Path cinza (direita)**: Cantos superiores-direitos e inferiores-direitos arredondados, borda esquerda espelhando a curva S com gap branco
3. **Símbolo "+"**: Adicionar um path branco com o "+" no canto superior direito da parte cinza

As curvas usarão Bézier cúbicas (`C`) para reproduzir o formato suave e orgânico da imagem de referência, substituindo as atuais quadráticas (`Q`) que produzem um resultado mais rígido.

## Detalhes Técnicos

- ViewBox mantido `0 0 500 500`
- Curvas Bézier cúbicas para suavidade
- Gap branco de ~40px entre os paths
- "+" branco via dois retângulos cruzados ou path único
- Sem alteração no layout/posicionamento das camadas decorativas

