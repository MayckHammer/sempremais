

## Plan: Adicionar Cartão Físico na Carteira SB's

### Visão geral
Criar uma seção "Cartão Físico" dentro da página da carteira SB's, com um cartão visual premium estilo o da imagem (azul escuro metalizado, logo Sempre Benefícios, chip NFC, dados do associado). Incluir opções de emissão (R$ 19,90) e segunda via (R$ 32,00).

### 1. Migration — Tabela `physical_cards`

Criar tabela para rastrear emissão de cartões físicos:

```sql
CREATE TABLE public.physical_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, active, blocked
  issued_at timestamptz,
  is_replacement boolean DEFAULT false,
  amount_paid numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_number)
);

ALTER TABLE public.physical_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards"
ON public.physical_cards FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can request cards"
ON public.physical_cards FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cards"
ON public.physical_cards FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 2. Componente `PhysicalCardSection.tsx`

Novo componente com:
- **Cartão visual CSS-only** replicando a imagem: fundo gradiente azul escuro/metalizado, logo "SEMPRE BENEFÍCIOS", ícone chip + NFC, número do cartão mascarado (gerado), nome do associado, validade, e categoria do plano (Membro Premium/Plus/Essencial)
- Dados puxados do perfil do usuário (`full_name`, `current_plan_id`) e da tabela `physical_cards`
- **Estado sem cartão**: mostra preview do cartão + botão "Solicitar Cartão — R$ 19,90"
- **Estado com cartão ativo**: mostra o cartão com dados reais + botão "Solicitar 2ª Via — R$ 32,00"
- **Estado pendente**: mostra badge "Em produção" com status

### 3. Integração no `ClientWallet.tsx`

Inserir o `PhysicalCardSection` entre as ações rápidas e o banner informativo, como nova seção "Cartão Físico".

### Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela `physical_cards` com RLS |
| `src/components/PhysicalCardSection.tsx` | Novo componente do cartão visual + solicitação |
| `src/pages/ClientWallet.tsx` | Importar e renderizar `PhysicalCardSection` |

