

## Plan: Ajustar cartão físico — remover plano, adicionar toggle de dados e aviso de suporte

### Alterações no `src/components/PhysicalCardSection.tsx`

**1. Remover o badge do plano** — Deletar o bloco "Plan badge" (linhas 189-192) que exibe `{planName}` no cartão. Remover também o state `planName` e a query de `subscription_plans` já que não será mais usado.

**2. Adicionar toggle de visualização dos dados** — Novo state `showDetails` (default `false`). Quando `false`, número do cartão e nome ficam totalmente mascarados. Ícone de olho (Eye/EyeOff do Lucide) ao lado do título "Cartão Físico" para alternar visibilidade.

**3. Adicionar aviso de perda/bloqueio** — Abaixo dos botões de ação, inserir um banner informativo com ícone de alerta (ShieldAlert) dizendo: "Em caso de perda ou bloqueio do cartão físico, entre em contato com o suporte na página inicial do app."

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/PhysicalCardSection.tsx` | Remover plano, adicionar eye toggle, adicionar aviso de suporte |

