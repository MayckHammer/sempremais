

# Flutuantes Compactos com Expansão em Dois Cliques

## Problema
Os dois botões flutuantes (SB's e Suporte) têm tamanhos diferentes e poluem visualmente a tela. O usuário quer uma interação mais limpa: ícone compacto → clique expande mostrando label → segundo clique executa a ação.

## Solução

### Comportamento dos dois flutuantes

**Estado 1 — Colapsado (padrão):** Ambos são círculos idênticos (48x48px) mostrando apenas o ícone:
- SB's: ícone de moedas (Coins) dourado
- Suporte: ícone de fone (Headphones) com bolinha verde de online

**Estado 2 — Expandido (1º clique):** O botão expande horizontalmente com animação spring (framer-motion), revelando o label:
- SB's: mostra `"00 SB's"` (o saldo)
- Suporte: mostra `"Suporte"`

**Estado 3 — Ação (2º clique, quando já expandido):**
- SB's: navega para `/cliente/carteira`
- Suporte: abre a janela de chat

**Auto-colapso:** Se expandido e sem interação por 3 segundos, volta ao estado colapsado.

### Posicionamento
- SB's: `fixed bottom-6 left-6` (mantém)
- Suporte: `fixed bottom-6 right-6` (mantém lado direito, ajusta para bottom-6 igual)
- Ambos com `z-50`, mesmo tamanho base, mesmo estilo de fundo (glassmorphism escuro)

### Estilo visual unificado
- Background: `bg-foreground/50 backdrop-blur-md` (mesmo estilo atual do SBBadge)
- Bordas: `rounded-full`
- Tamanho colapsado: `w-12 h-12`
- Tamanho expandido: animação de width com `layout` do framer-motion

### Arquivos editados

| Arquivo | Mudança |
|---------|---------|
| `src/components/SBBadge.tsx` | Adicionar estado `expanded`, lógica de dois cliques, animação de expansão, auto-colapso com timeout |
| `src/components/SupportChat.tsx` | Mesmo padrão: estado colapsado (só ícone) → expandido (label) → ação (abre chat). Quando chat aberto, botão vira X como já faz |

### Lógica (ambos componentes)

```
const [expanded, setExpanded] = useState(false);

onClick:
  if chat is open (support only) → close chat
  else if !expanded → setExpanded(true), start 3s timer
  else → execute action (navigate / open chat)

useEffect: when expanded, setTimeout 3s → setExpanded(false)
```

## Seção Técnica

- Usar `motion.button` com `layout` para animação fluida de largura
- `AnimatePresence` para o label aparecer/desaparecer
- Timer de 3s com cleanup no useEffect
- Prop `position` do SBBadge continua funcionando (top/bottom)
- Manter toda lógica de negócio (fetch balance, check ticket, realtime) intacta

