

# Adicionar triplo clique como acesso alternativo ao painel admin

## Resumo
Além do long press de 3 segundos já existente no sinal "+", adicionar detecção de triplo clique (3 toques rápidos) no mesmo hotspot como método alternativo de acesso ao `/admin/login`.

## Mudança

### Editar `src/pages/Index.tsx`

1. Adicionar estado `tapCount` (useRef) e `tapTimer` (useRef) para rastrear cliques consecutivos
2. Criar função `handleSecretTap` que:
   - Incrementa o contador a cada clique/toque
   - Reseta o contador após 600ms de inatividade
   - Ao atingir 3 toques, dispara vibração + navega para `/admin/login`
3. No hotspot `<div>` existente (linha 78-86), adicionar `onClick={handleSecretTap}` sem interferir nos handlers de long press já existentes

A lógica de triplo clique é independente do long press — ambos funcionam simultaneamente no mesmo elemento.

