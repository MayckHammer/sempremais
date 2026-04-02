
CREATE TABLE public.urgency_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  ai_model text NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  classification_prompt text NOT NULL DEFAULT 'Classifique a urgência desta solicitação de assistência veicular. Responda APENAS com o resultado da tool call.',
  criteria_rules text NOT NULL DEFAULT 'Reboque e destombamento são naturalmente mais urgentes. Madrugada aumenta a urgência. Caminhão ou veículo grande em rodovia = crítico. Chaveiro/borracheiro em horário comercial = baixo. Frete normalmente é baixo.',
  fallback_urgency text NOT NULL DEFAULT 'medium',
  night_boost boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.urgency_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage urgency config"
  ON public.urgency_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.urgency_config (classification_prompt, criteria_rules) VALUES (
  'Classifique a urgência desta solicitação de assistência veicular. Responda APENAS com o resultado da tool call.',
  'Reboque e destombamento são naturalmente mais urgentes. Madrugada aumenta a urgência. Caminhão ou veículo grande em rodovia = crítico. Chaveiro/borracheiro em horário comercial = baixo. Frete normalmente é baixo.'
);
