
-- Enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('agent_handling', 'analysis', 'human_handling', 'resolved', 'closed');

-- Enum for message sender type
CREATE TYPE public.sender_type AS ENUM ('client', 'agent', 'human_agent');

-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  status ticket_status NOT NULL DEFAULT 'agent_handling',
  assigned_agent_id uuid,
  summary text,
  trigger_words text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type sender_type NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_chat_messages_ticket_id ON public.chat_messages(ticket_id);

-- Updated_at trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS: support_tickets
CREATE POLICY "Clients can view own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id AND has_role(auth.uid(), 'client'));

CREATE POLICY "Clients can update own tickets"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all tickets"
  ON public.support_tickets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS: chat_messages
CREATE POLICY "Clients can view messages of own tickets"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (ticket_id IN (SELECT id FROM public.support_tickets WHERE client_id = auth.uid()));

CREATE POLICY "Clients can insert messages in own tickets"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_type = 'client'
    AND sender_id = auth.uid()
    AND ticket_id IN (SELECT id FROM public.support_tickets WHERE client_id = auth.uid())
  );

CREATE POLICY "Admins can manage all messages"
  ON public.chat_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
