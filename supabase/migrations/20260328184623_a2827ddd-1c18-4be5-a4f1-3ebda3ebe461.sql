
-- Create sb_transaction_type enum
CREATE TYPE public.sb_transaction_type AS ENUM ('earned', 'spent');

-- Create service_pricing table
CREATE TABLE public.service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type service_type UNIQUE NOT NULL,
  subscriber_price decimal(10,2) NOT NULL DEFAULT 0.00,
  non_subscriber_price decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed initial pricing rows
INSERT INTO public.service_pricing (service_type, subscriber_price, non_subscriber_price) VALUES
  ('reboque', 0.00, 0.00),
  ('chaveiro', 0.00, 0.00),
  ('borracheiro', 0.00, 0.00),
  ('destombamento', 0.00, 0.00),
  ('frete_pequeno', 0.00, 0.00),
  ('frete_grande', 0.00, 0.00);

-- RLS for service_pricing
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing" ON public.service_pricing FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing" ON public.service_pricing FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create sb_wallets table
CREATE TABLE public.sb_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance decimal(12,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sb_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.sb_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage wallets" ON public.sb_wallets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create sb_transactions table
CREATE TABLE public.sb_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount decimal(12,2) NOT NULL,
  type sb_transaction_type NOT NULL,
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sb_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.sb_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage transactions" ON public.sb_transactions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add columns to service_requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS price decimal(10,2) DEFAULT NULL;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS is_subscriber boolean NOT NULL DEFAULT false;

-- Updated_at triggers
CREATE TRIGGER update_service_pricing_updated_at BEFORE UPDATE ON public.service_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sb_wallets_updated_at BEFORE UPDATE ON public.sb_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
