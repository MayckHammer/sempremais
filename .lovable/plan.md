

# Loop Infinito no Efeito Glow dos Botões

## Objetivo
Fazer o efeito de sweep (luz percorrendo a borda) rodar em loop infinito, sem necessidade de interação do cursor.

## Alteração

**Arquivo:** `src/components/GlowCard.tsx`

Refatorar o `useEffect` da animação (linhas 126-144) para que, ao terminar o ciclo de sweep, ele reinicie automaticamente. A abordagem:

1. Extrair a lógica de animação para uma função `runSweep(card, onEnd)`.
2. No `onEnd` do último `animateValue`, chamar `runSweep` novamente (recursão via callback), criando o loop infinito.
3. Adicionar um pequeno delay (~500ms) entre ciclos para respiração visual.
4. Manter a classe `sweep-active` permanentemente enquanto o loop estiver ativo.
5. Usar um `useRef` para controlar cancelamento (cleanup do `useEffect`), evitando memory leaks.

### Detalhes técnicos

```tsx
useEffect(() => {
  if (!animated || !cardRef.current) return;
  const card = cardRef.current;
  let cancelled = false;

  function runSweep() {
    if (cancelled) return;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);
    
    // Fade in edge proximity
    animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', String(v)) });
    // Rotate angle (first half)
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
      card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    }});
    // Rotate angle (second half)
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
      card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    }});
    // Fade out + restart
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => card.style.setProperty('--edge-proximity', String(v)),
      onEnd: () => {
        if (!cancelled) setTimeout(runSweep, 500);
      },
    });
  }

  runSweep();
  return () => { cancelled = true; card.classList.remove('sweep-active'); };
}, [animated]);
```

Nenhum outro arquivo precisa ser alterado. Os dois botões no `Index.tsx` já passam `animated`, então ambos terão o loop.

