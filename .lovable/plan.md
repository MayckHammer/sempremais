

# Implementar SempreBackground com símbolo "S" vetorizado

## Resumo

Criar o componente `SempreBackground.tsx` com o símbolo "S" da marca vetorizado em SVG como elemento decorativo de fundo, e aplicá-lo na hero section da página inicial substituindo o background atual de curvas SVG.

## Alterações

### 1. Criar `src/components/SempreBackground.tsx`

Componente TypeScript com:
- SVG vetorizado do "S" (paths azul `#2B6CB8` e cinza `#5A6472`)
- Gradiente de fundo azul (`linear-gradient 160deg`)
- Instância grande do S no canto superior direito (opacity 0.12, rotacionado -10deg)
- Instância menor no canto inferior esquerdo (opacity 0.07, rotacionado 15deg)
- Gradiente de fade branco na parte inferior (35% da altura)
- Aceita `children` como prop para envolver conteúdo

### 2. Atualizar `src/pages/Index.tsx` (hero section, linhas 36-93)

- Importar `SempreBackground`
- Substituir a `<section>` do hero (que tem o SVG de curvas atual) por `<SempreBackground>` envolvendo o conteúdo existente (logo, card com botões)
- Manter todo o conteúdo interno (logo animada, card "Guincho e Assistência 24h", botões)
- Remover os paths SVG antigos das curvas em S

## Detalhes Técnicos

- Converter o JSX do Claude para TSX com tipagem (`children: React.ReactNode`)
- Usar inline styles conforme o componente original para manter fidelidade visual
- O gradiente de fade na parte inferior garante transição suave para as seções seguintes

