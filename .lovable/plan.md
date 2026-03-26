

# Upgrade Visual: Design Premium para SEMPRE+

## Direção Estética

**Luxury Automotive meets Organic Flow** — design premium com curvas fluidas inspiradas no logo S+, texturas de profundidade, micro-animações sofisticadas e tipografia expressiva. O projeto já tem uma identidade forte (azul/cinza/branco, curva S); vamos elevar cada elemento para um nível senior.

---

## Alterações

### 1. Tipografia Distintiva

Substituir Inter/Montserrat por fontes com mais personalidade:
- **Títulos**: `Plus Jakarta Sans` (geométrica, moderna, peso 800 para impacto)
- **Corpo**: `DM Sans` (ótima legibilidade, caracteres únicos)
- Atualizar import no `index.css` e classes utilitárias

### 2. Paleta Refinada com Novos Acentos

Adicionar CSS variables para profundidade:
- `--glow`: tom azul luminoso para efeitos de brilho (`207 90% 55%`)
- `--surface`: camada intermediária entre card e background
- `--gold`: acento dourado para ratings/destaques (`42 87% 55%`)
- Gradientes mesh com múltiplas camadas em seções-chave

### 3. Texturas e Fundos com Profundidade

- **Noise texture**: adicionar SVG noise sutil como overlay em seções (via CSS `background-image` com data URI)
- **Gradient mesh**: fundos com `radial-gradient` em camadas sobrepostas nas seções Destaques, Serviços e CTA
- **Glass morphism aprimorado**: cards com `backdrop-blur-xl`, bordas com gradiente e sombras coloridas

### 4. Animações Avançadas

- **Stagger refinado**: animações de entrada com `animation-delay` crescente (0.1s, 0.2s...) nos cards de serviço e destaques
- **Scroll-triggered parallax**: logo do hero com efeito parallax via Framer Motion `useScroll`
- **Hover states premium**: cards com `transform: translateY(-8px) + scale(1.02)`, sombra colorida expandindo, ícone com rotação sutil
- **Micro-interações**: botões com efeito de ripple, loading states com skeleton shimmer customizado
- **CTA pulsante**: botão principal com glow animado atrás

### 5. Layout com Composição Inesperada

**Hero (Index.tsx)**:
- Logo com drop-shadow colorido e efeito de brilho pulsante atrás
- Card flutuante com rotação sutil (1-2deg) e sombra projetada assimétrica
- Badge "24h" com glow animado no canto do card

**Destaques**:
- Círculos com borda gradiente animada (conic-gradient rotativo)
- Texto com tracking mais aberto para sofisticação

**Serviços**:
- Grid com cards em tamanhos variados (1 card destaque maior + 5 menores)
- Ícones com fundo gradiente ao invés de cor sólida
- Efeito de "reveal" sequencial ao entrar no viewport

**CTA Final**:
- Fundo com gradient mesh (3+ gradientes radiais sobrepostos)
- Partículas/dots decorativos com animação flutuante
- Tipografia com text-shadow para profundidade

### 6. Dashboards (Cliente e Prestador)

- Cards de stats com borda gradiente esquerda (accent bar)
- Transições suaves entre estados (pending → accepted → completed)
- Empty states com ilustrações SVG inline ao invés de ícones genéricos
- Request cards com timeline visual lateral

### 7. Auth Forms

- Fundo com gradient mesh sutil atrás do card
- Inputs com transição de borda suave no focus (border-color + glow)
- Botão submit com gradiente animado (background-position shift)

---

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Novas fonts, CSS variables, utilities (noise, glow, mesh), animações |
| `tailwind.config.ts` | Novas cores, keyframes, animation classes |
| `src/pages/Index.tsx` | Layout assimétrico, parallax, stagger animations, texturas |
| `src/components/Header.tsx` | Glassmorphism, transições premium |
| `src/components/Footer.tsx` | Gradient mesh background, layout refinado |
| `src/components/AuthForm.tsx` | Inputs com glow, gradiente animado no botão |
| `src/pages/ClientDashboard.tsx` | Cards com accent bar, animações de entrada |
| `src/pages/ProviderDashboard.tsx` | Stats cards premium, timeline visual |
| `src/components/ServiceCard.tsx` | Hover avançado, ícone gradiente |
| `src/components/RequestCard.tsx` | Timeline lateral, transições de status |
| `src/components/ProviderCard.tsx` | Rating com cor gold, layout refinado |

