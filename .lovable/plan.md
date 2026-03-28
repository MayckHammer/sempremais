

# Redesign do Perfil do Cliente — UX/UI Melhorado

## Mudanças

### `src/pages/ClientProfile.tsx` — Reescrita do layout

**Header + Avatar:**
- Manter header azul com curva orgânica e seta de voltar
- Abaixo do avatar (icone do boneco), colocar:
  - **Nome em negrito** (`font-bold text-lg`)
  - **Cidade - UF** em texto normal/leve abaixo (`font-normal text-sm text-primary-foreground/70`)

**Seções colapsáveis (Accordion):**
- Substituir os 3 cards fixos (Dados Pessoais, Endereço, Veículo) por um `Accordion` do Radix (já existe em `src/components/ui/accordion.tsx`)
- Cada seção vira um `AccordionItem` com icone + título no trigger
- Conteúdo expande/colapsa ao clicar
- Visual: fundo `bg-card`, bordas arredondadas, sem borda entre items — cada item como card separado com `rounded-2xl` e gap entre eles

**Seção "Meu Plano":**
- Permanece como está (cards de planos com upgrade), apenas abaixo do accordion

### Estrutura visual resultante

```text
┌─────────────────────────┐
│  ←  Meu Perfil          │  header azul
│                         │
│        (👤)             │  avatar
│    João da Silva        │  nome bold
│   São Paulo - SP        │  cidade normal
│  ╲_______________╱      │  curva
├─────────────────────────┤
│ ▸ 👤 Dados Pessoais     │  accordion (fechado)
├─────────────────────────┤
│ ▸ 📍 Endereço           │  accordion (fechado)
├─────────────────────────┤
│ ▸ 🚗 Veículo            │  accordion (fechado)
├─────────────────────────┤
│ 👑 Meu Plano            │
│ ┌─ Básico R$49,90 ────┐ │
│ └─────────────────────┘ │
│ ┌─ Premium R$69,90 ───┐ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Detalhes técnicos
- Importar `Accordion, AccordionItem, AccordionTrigger, AccordionContent` de `@/components/ui/accordion`
- Usar `type="multiple"` para permitir abrir várias seções ao mesmo tempo
- Estilizar cada `AccordionItem` com `bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden` e remover a `border-b` padrão
- Manter a função `InfoRow` existente dentro do conteúdo de cada accordion
- Manter animações `motion` no container geral

