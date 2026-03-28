

# Redesign do Client Dashboard — Estilo App Mobile

## Objetivo
Redesenhar o `ClientDashboard` para seguir exatamente o layout da imagem de referência: header com curva azul + hamburger menu, carrossel de banners no topo, seção "Destaques" com logos de parceiros em carrossel horizontal, e mapa de prestadores 24h na parte inferior.

## Alterações

### 1. Criar `src/components/ClientHome.tsx` — Novo layout principal
Componente dedicado para a "home" do cliente logado, contendo:

**Header curvo azul**: Fundo azul (primary) com curva orgânica na parte inferior (SVG ou clip-path), ícone de hamburger menu (Sheet existente) no canto superior esquerdo. Sem a barra retangular atual do Header.

**Carrossel de Banners (topo)**: Card arredondado cinza/branco dentro da curva azul, usando Embla Carousel (já instalado via `carousel.tsx`). Suporta até 4 banners. Placeholder cinza inicialmente, com estrutura pronta para imagens dinâmicas.

**Seção "Destaques"**: Título "Destaques" em bold, seguido de círculos com logos de empresas parceiras em carrossel horizontal auto-scroll (da direita para esquerda). Círculos com borda sutil e sombra, placeholders circulares cinza por enquanto.

**Seção "Descubra Parceiros"**: Subtítulo "Venha conferir!", card arredondado com mapa embutido mostrando prestadores 24h mais próximos. Usa iframe do Google Maps ou div placeholder com a localização do usuário.

### 2. Alterar `src/pages/ClientDashboard.tsx`
- Substituir o layout atual pela nova `ClientHome` como view padrão.
- Manter toda a lógica existente (fetch providers, requests, geolocation) mas reorganizar a apresentação.
- O menu hamburger abre o Sheet lateral com as opções existentes (Área do Cliente, Painel Prestador, Sair).
- As funcionalidades de solicitar serviço e ver solicitações ficam acessíveis via menu ou seção inferior.

### 3. Estilo visual
- Seguir a paleta azul/branco existente (primary `207 78% 38%`).
- Cards com `rounded-2xl` ou `rounded-3xl`, sombras suaves (`shadow-premium`).
- Animações de entrada com Framer Motion (staggered), consistente com a tela inicial.
- Mobile-first (390px viewport atual).

### Arquivos afetados
- `src/components/ClientHome.tsx` (novo)
- `src/pages/ClientDashboard.tsx` (refatorar)

