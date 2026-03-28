
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

-- Trigger updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
