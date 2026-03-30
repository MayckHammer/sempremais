import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Bot, User, Headphones, Hand, RotateCcw, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_type: 'client' | 'agent' | 'human_agent';
  sender_id: string | null;
  content: string;
  metadata: any;
  created_at: string;
}

export default function AdminTicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [clientName, setClientName] = useState('Cliente');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  };

  // Load ticket and messages
  useEffect(() => {
    if (!ticketId) return;
    const load = async () => {
      const { data: t } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (t) {
        setTicket(t);
        // Get client name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', t.client_id)
          .single();
        if (profile) setClientName(profile.full_name);
      }

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs as unknown as ChatMessage[]);
      scrollToBottom();
    };
    load();
  }, [ticketId]);

  // Realtime
  useEffect(() => {
    if (!ticketId) return;

    const msgChannel = supabase
      .channel(`admin-msgs-${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        const newMsg = payload.new as unknown as ChatMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      })
      .subscribe();

    const ticketChannel = supabase
      .channel(`admin-ticket-${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets',
        filter: `id=eq.${ticketId}`,
      }, (payload) => {
        setTicket(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [ticketId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const updateStatus = async (status: string) => {
    if (!ticketId) return;
    const updateData: any = { status };
    if (status === 'human_handling') updateData.assigned_agent_id = user?.id;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

    await supabase.from('support_tickets').update(updateData).eq('id', ticketId);

    // Notify in chat
    const notifyMessages: Record<string, string> = {
      human_handling: '👤 Um atendente assumiu o atendimento.',
      agent_handling: '🤖 O atendimento foi devolvido ao agente virtual.',
      resolved: '✅ O atendimento foi encerrado. Obrigado!',
    };
    if (notifyMessages[status]) {
      await supabase.from('chat_messages').insert({
        ticket_id: ticketId,
        sender_type: 'human_agent',
        sender_id: user?.id,
        content: notifyMessages[status],
        metadata: { system_message: true },
      });
    }

    toast.success(`Status atualizado para ${status}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || !ticketId || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    await supabase.from('chat_messages').insert({
      ticket_id: ticketId,
      sender_type: 'human_agent',
      sender_id: user?.id,
      content: text,
    });

    setSending(false);
  };

  const senderIcon = (type: string) => {
    if (type === 'agent') return <Bot className="w-4 h-4 text-primary" />;
    if (type === 'human_agent') return <Headphones className="w-4 h-4 text-amber-400" />;
    return <User className="w-4 h-4 text-foreground" />;
  };

  const senderLabel = (type: string) => {
    if (type === 'agent') return 'Agente IA';
    if (type === 'human_agent') return 'Atendente';
    return clientName;
  };

  const statusColors: Record<string, string> = {
    agent_handling: 'bg-emerald-500/20 text-emerald-400',
    analysis: 'bg-amber-500/20 text-amber-400',
    human_handling: 'bg-red-500/20 text-red-400',
    resolved: 'bg-muted text-muted-foreground',
    closed: 'bg-muted text-muted-foreground',
  };

  if (!ticket) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/support')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary font-bold mr-1">#{String((ticket as any).ticket_number || 0).padStart(5, '0')}</span>
            <span className="font-display font-bold text-foreground">{clientName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[ticket.status] || ''}`}>
              {ticket.status}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Aberto em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {ticket.status !== 'human_handling' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus('human_handling')} className="text-xs gap-1">
              <Hand className="w-3 h-3" /> Assumir
            </Button>
          )}
          {ticket.status === 'human_handling' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus('agent_handling')} className="text-xs gap-1">
              <RotateCcw className="w-3 h-3" /> Devolver ao Agente
            </Button>
          )}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button size="sm" variant="outline" onClick={() => updateStatus('resolved')} className="text-xs gap-1">
              <CheckCircle className="w-3 h-3" /> Encerrar
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender_type === 'client' ? 'flex-row-reverse' : ''}`}>
              <div className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-1">
                {senderIcon(msg.sender_type)}
              </div>
              <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                msg.sender_type === 'client'
                  ? 'bg-primary/10 border border-primary/20 text-foreground'
                  : msg.sender_type === 'human_agent'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-foreground'
                  : 'bg-muted text-foreground'
              }`}>
                <span className="text-[10px] font-semibold text-muted-foreground block mb-1">{senderLabel(msg.sender_type)}</span>
                <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <span className="text-[10px] opacity-50 mt-1 block">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input - only when human handling */}
        {ticket.status === 'human_handling' && (
          <div className="p-3 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Responder como atendente..."
                disabled={sending}
                className="text-sm h-9"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!input.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
