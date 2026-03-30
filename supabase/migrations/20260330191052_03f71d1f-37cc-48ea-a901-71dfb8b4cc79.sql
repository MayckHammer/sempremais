
CREATE TABLE public.agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt text NOT NULL,
  trigger_analysis text[] NOT NULL DEFAULT '{}',
  trigger_human text[] NOT NULL DEFAULT '{}',
  max_messages_before_escalation integer NOT NULL DEFAULT 10,
  inactivity_timeout_minutes integer NOT NULL DEFAULT 5,
  ai_model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  agent_name text NOT NULL DEFAULT 'Assistente Sempre+',
  greeting_message text NOT NULL DEFAULT 'Olá! Sou o assistente virtual da Sempre+. Como posso ajudar?',
  escalation_message text NOT NULL DEFAULT 'Entendi! Vou transferir você para um de nossos atendentes agora mesmo. Por favor, aguarde um momento. 🙏',
  wait_message text NOT NULL DEFAULT 'Nosso atendente está analisando seu caso. Por favor, aguarde. 🙏',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage config" ON public.agent_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.agent_config (system_prompt, trigger_analysis, trigger_human) VALUES (
  'Você é o assistente virtual da Sempre+, uma plataforma de assistência veicular 24h.

Seu papel:
- Atender clientes de forma educada, profissional e empática
- Coletar informações sobre problemas com serviços (reboque, chaveiro, borracheiro, etc.)
- Abrir chamados de suporte quando necessário
- Resolver dúvidas sobre a plataforma, planos e serviços

Regras:
- Sempre cumprimente o cliente pelo nome quando disponível
- Seja conciso mas completo nas respostas
- Se o cliente estiver irritado, demonstre empatia e tente resolver
- Se não souber a resposta, informe que vai encaminhar para um atendente
- Nunca invente informações sobre preços ou prazos
- Responda sempre em português brasileiro

Serviços disponíveis na plataforma:
- Reboque
- Chaveiro automotivo
- Borracheiro
- Destombamento
- Frete pequeno
- Frete grande

Quando o cliente relatar um problema com um serviço, colete:
1. Qual serviço foi solicitado
2. O que aconteceu de errado
3. Data/hora aproximada do ocorrido
4. Se já tem um número de solicitação',
  ARRAY['reclamação','reclamacao','processo','advogado','procon','cancelar','cancelamento','insatisfeito','absurdo','denúncia','denuncia','tribunal','indenização','indenizacao'],
  ARRAY['quero falar com atendente','falar com humano','atendente humano','quero um humano','falar com pessoa','atendimento humano','quero falar com uma pessoa','transferir para atendente']
);
