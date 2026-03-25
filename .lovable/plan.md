

# Segmentar Logo em Duas Partes

## Entendimento

A logo será dividida em:
1. **Texto "SEMPRE+" com subtítulo** — ficará centralizado como logo principal (no hero, header, footer, auth)
2. **Símbolo "S" curvo** — será integrado como elemento de background no hero, substituindo/complementando as curvas SVG azul e cinza atuais, como mostra a segunda imagem de referência

## Alterações

### 1. Criar dois assets separados
- Salvar `sempre_logo_sem_fundo.png` (logo com fundo transparente) como `src/assets/logo-sempre.png` — substituindo a atual
- Criar um asset separado com apenas o símbolo "S" curvo: `src/assets/logo-s-symbol.png` — recortado ou isolado para uso como background

### 2. Hero (`src/pages/Index.tsx`)
- **Background**: Substituir os SVG paths das curvas azul/cinza pelo símbolo "S" da logo, posicionado como elemento decorativo de fundo (com opacidade reduzida ou em tamanho grande), mantendo as cores azul e cinza
- **Logo central**: Usar a logo completa (texto "SEMPRE+" com subtítulo) centralizada acima do card "Guincho e Assistência 24h", como já está
- O símbolo "S" ficará por trás, criando o efeito visual da segunda imagem — onde o S forma as curvas entre azul e cinza

### 3. Header, Footer, Auth
- Atualizar com a nova versão da logo sem fundo (`sempre_logo_sem_fundo.png`)
- Manter filtro de inversão para fundos escuros

### 4. Background do Hero — detalhe técnico
- Manter as duas áreas de cor (azul à esquerda, cinza à direita) via SVG ou divs
- Sobrepor o símbolo "S" como imagem posicionada absolutamente no centro/esquerda do hero, em tamanho grande, com opacidade sutil (~20-30%), criando a transição visual entre azul e cinza
- Alternativa: incorporar o formato do "S" diretamente nos paths SVG para que as curvas azul/cinza sigam exatamente o contorno do símbolo da marca

