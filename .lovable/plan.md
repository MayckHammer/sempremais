

# Substituir Logo em Toda a Plataforma

## Resumo

Substituir o texto "SEMPRE" e a logo antiga pela nova logo oficial (PDF convertido para imagem) em todos os locais da plataforma: Header, Footer, Hero da página inicial, telas de autenticação e menu mobile.

---

## Alterações

### 1. Copiar a nova logo para o projeto

- Copiar `parsed-documents://...page_1.jpg` para `src/assets/logo-sempre.png` (substituindo a logo anterior)
- A logo tem fundo branco - será usada diretamente nos locais com fundo claro e com filtro de inversão/brilho nos fundos escuros

### 2. Header (`src/components/Header.tsx`)

- Substituir o texto "SEMPRE" + "Assistências e Benefícios" por `<img>` da logo
- Aplicar tamanho responsivo (~h-8 mobile, h-10 desktop)
- Aplicar filtro CSS `brightness(0) invert(1)` para tornar branca sobre fundo azul
- Fazer o mesmo no menu mobile (linha 125)

### 3. Footer (`src/components/Footer.tsx`)

- Substituir o texto "SEMPRE" por `<img>` da logo
- Aplicar filtro para versão branca sobre fundo azul
- Manter o texto de copyright abaixo

### 4. Hero - Página Inicial (`src/pages/Index.tsx`)

- A logo já está sendo usada como imagem (linha 46-51) - será atualizada automaticamente ao substituir o arquivo

### 5. Telas de Auth (`src/components/AuthForm.tsx`)

- Substituir o `<h1>SEMPRE</h1>` e `<p>Assistências e Benefícios</p>` por `<img>` da logo
- Aplicar filtro para versão branca sobre o fundo azul das curvas SVG

---

## Detalhes Técnicos

| Local | Fundo | Tratamento da Logo |
|-------|-------|-------------------|
| Header | Azul (primary) | `filter: brightness(0) invert(1)` |
| Footer | Azul (primary) | `filter: brightness(0) invert(1)` |
| Hero | Curvas azul/cinza | Logo original (já tem cores compatíveis) |
| AuthForm | Curvas azul/cinza | `filter: brightness(0) invert(1)` |
| Menu Mobile | Fundo card (claro) | Logo original sem filtro |

