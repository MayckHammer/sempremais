

## Plano: Adicionar Calculadora SB$ no painel Admin

### Visão geral
Adicionar a calculadora de spread SB$ como uma nova aba/página no painel administrativo, replicando exatamente os elementos do HTML enviado: hero com 3 conceitos, fluxo da transação, simulador interativo (sliders), tabela de categorias e nota informativa.

### 1. Nova rota e item de menu
- Adicionar `/admin/calculator` em `src/App.tsx` (dentro do `AdminLayout`).
- Adicionar item "Calculadora SB$" em `src/pages/admin/AdminLayout.tsx` (`navItems`) com ícone `Calculator` (lucide).

### 2. Nova página `src/pages/admin/AdminCalculator.tsx`
Componente React que replica todos os elementos do HTML:

**Estado React** (substitui o `<script>` vanilla):
- `category` (string), `price` (number), `sb` (number), `rate` (number)
- Cálculos derivados: `internal`, `discount`, `finalPrice`, `pct`, `spread`, `feeVal`, `totalProfit`, `marginPct`

**Seções** (na ordem):
1. **Hero card** (fundo navy `#0D1F3C`, borda gold `#C9A227`) com título "Calculadora de Spread SB$" + 3 concept cards: Valor facial interno (1 SB$ = R$1,00), Poder de compra real (R$0,60), Spread retido (R$0,40/SB$).
2. **Fluxo da transação** (4 passos com setas): Valor interno → Cliente usa SB$ → Taxa aplicada → Spread retido (último em destaque dourado).
3. **Simulador interativo** (grid 2 colunas → 1 no mobile):
   - Card de parâmetros: select de categoria (8 opções + custom), 3 sliders (preço R$50–3000, SB$ 10–800, taxa 30–90%) + caixa explicativa dinâmica.
   - Card de resultado: lista de 8 linhas chave-valor + profit-box gradient navy com lucro total + margem %.
4. **Tabela** de 8 categorias com badges coloridos (taxa, 100 SB$ vale, spread, limite, lógica).
5. **Nota** laranja explicando o split parceiro/Sempre+.

### 3. Estilo
Usar Tailwind diretamente com as cores do HTML original (navy, gold, blue, teal, etc.) inline via classes arbitrárias `bg-[#0D1F3C]` etc., para manter fidelidade visual ao mockup. Componentes shadcn `Card`, `Slider`, `Select`, `Badge` quando aplicável; sliders nativos `<input type="range">` para preservar visual exato (thumb colorido azul/teal/gold).

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminCalculator.tsx` | Novo — página completa da calculadora |
| `src/pages/admin/AdminLayout.tsx` | Adicionar item de menu "Calculadora SB$" |
| `src/App.tsx` | Adicionar rota `/admin/calculator` |

