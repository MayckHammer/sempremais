

# Corrigir sobreposição SB Badge + Redesign do botão de chat

## Problema
O botão do chat de suporte (fixed bottom-4 right-4) sobrepõe o badge dos SB's (fixed bottom-6 right-6). Ambos disputam o canto inferior direito.

## Solução

### 1. Mover SBBadge para o lado esquerdo (`src/components/SBBadge.tsx`)
- Mudar posicionamento de `right-6` para `left-6`
- Manter `bottom-6` e o efeito shimmer
- Ajustar o data-position top para `left-4` em vez de `right-4`

### 2. Redesign premium do botão de chat (`src/components/SupportChat.tsx`)
Substituir o botão genérico (círculo azul com ícone MessageCircle) por um design diferenciado:

- **Formato**: Pílula arredondada com micro-label "Suporte" ao lado do ícone (não apenas um círculo)
- **Visual**: Glassmorphism (`backdrop-blur-xl`) + borda com glow neon azul sutil (`border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.25)]`)
- **Ícone**: Usar `Headphones` em vez de `MessageCircle` — menos genérico, mais "atendimento premium"
- **Animação de entrada**: `motion.button` com spring animation ao montar
- **Estado aberto**: Transição suave para ícone X com rotação
- **Indicador de atividade**: Pulsing dot verde quando o chat tem ticket ativo (breathing animation via CSS)
- **Posição**: `fixed bottom-4 right-4` (mantém, já que SBBadge vai para a esquerda)

### 3. Corrigir o runtime error (`src/pages/ClientDashboard.tsx`)
O erro "SupportChat is not defined" indica que o import pode estar quebrado. Verificar e corrigir o import do componente.

## Seção técnica

**SBBadge** — troca `right-6` → `left-6` e `right-4` → `left-4` no data-position top.

**SupportChat** — estrutura do novo botão:
```tsx
<motion.button
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
  className="fixed bottom-4 right-4 z-50 flex items-center gap-2 
    bg-card/80 backdrop-blur-xl border border-blue-500/30 
    shadow-[0_0_20px_rgba(59,130,246,0.25)] 
    rounded-full pl-4 pr-3 py-3 
    hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] 
    active:scale-95 transition-all"
>
  <span className="text-xs font-display font-bold text-foreground">Suporte</span>
  <div className="relative">
    <Headphones className="w-5 h-5 text-primary" />
    {/* pulsing dot */}
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
  </div>
</motion.button>
```

Quando aberto, troca para ícone X com `AnimatePresence` + rotação.

**Arquivos editados**: `SBBadge.tsx`, `SupportChat.tsx`, `ClientDashboard.tsx` (fix import)

