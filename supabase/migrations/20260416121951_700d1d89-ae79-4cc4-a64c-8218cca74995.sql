CREATE TABLE public.physical_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
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