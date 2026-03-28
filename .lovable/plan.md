

# Perfil do Cliente + Planos de Assinatura

## O que será feito

1. **Tabela `subscription_plans`** no banco para armazenar os planos (nome, preço, descrição, features). Admin terá controle total via RLS. Valores iniciais: Básico R$49,90 e Premium R$69,90.

2. **Coluna `current_plan_id`** na tabela `profiles` para vincular o plano atual do cliente.

3. **Icone de perfil** no header do ClientHome (canto superior direito, substituindo o `<div className="w-10" />` placeholder) — um avatar circular clicável que navega para `/cliente/perfil`.

4. **Página `/cliente/perfil`** (nova) com:
   - Dados pessoais do cadastro (nome, CPF, telefone, email, endereço, veículo) — somente leitura
   - Seção "Meu Plano" mostrando plano atual e opção de upgrade
   - Cards dos planos disponíveis com preços vindos do banco

5. **Módulo admin de Planos** — nova rota `/admin/plans` no AdminLayout para CRUD dos planos (nome, preço, descrição). Acessível pela sidebar admin.

## Mudanças no banco (migrations)

```sql
-- Tabela de planos de assinatura
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0.00,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Todos podem ver planos ativos
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (is_active = true);

-- Admin gerencia planos
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Inserir planos iniciais
INSERT INTO public.subscription_plans (name, price, description, features, sort_order) VALUES
  ('Básico', 49.90, 'Plano básico de assistência', '{"Assistência 24h","Reboque até 100km","Socorro mecânico"}', 1),
  ('Premium', 69.90, 'Plano completo com benefícios extras', '{"Assistência 24h","Reboque ilimitado","Socorro mecânico","Carro reserva","Chaveiro","Troca de pneu"}', 2);

-- Coluna de plano no perfil
ALTER TABLE public.profiles ADD COLUMN current_plan_id uuid REFERENCES public.subscription_plans(id);
```

## Arquivos novos/alterados

| Arquivo | Ação |
|---------|------|
| `src/pages/ClientProfile.tsx` | **Novo** — página de perfil com dados + planos |
| `src/components/ClientHome.tsx` | Adicionar icone avatar no header (direita) |
| `src/App.tsx` | Adicionar rota `/cliente/perfil` |
| `src/pages/admin/AdminPlans.tsx` | **Novo** — CRUD de planos para admin |
| `src/pages/admin/AdminLayout.tsx` | Adicionar link "Planos" na sidebar |

## Detalhes técnicos

- O avatar no header usa o icone `UserCircle` do lucide com `onClick={() => navigate('/cliente/perfil')}`
- ClientProfile busca dados de `profiles` e `subscription_plans` via Supabase
- AdminPlans permite editar nome, preço, descrição, features e ativar/desativar planos
- Upgrade de plano atualiza `profiles.current_plan_id`

