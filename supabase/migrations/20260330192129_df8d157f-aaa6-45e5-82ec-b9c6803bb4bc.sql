ALTER TABLE public.support_tickets
ADD COLUMN ticket_number serial NOT NULL;

CREATE UNIQUE INDEX idx_ticket_number ON public.support_tickets(ticket_number);