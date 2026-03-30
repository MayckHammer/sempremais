import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, Bot, User, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_type: 'client' | 'agent' | 'human_agent';
  sender_id: string | null;
  content: string;
  metadata: any;
  created_at: string;
}

interface SupportChatWindowProps {
  onClose: () => void;
}

export function SupportChatWindow({ onClose }: SupportChatWindowProps) {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<string>('agent_handling');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  // Create or resume ticket
  useEffect(() => {
    if (!user) return;
    const initTicket = async () => {
      // Check for open ticket
      const { data: existing } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('client_id', user.id)
        .in('status', ['agent_handling', 'analysis', 'human_handling'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        setTicketId(existing[0].id);
        setTicketStatus(existing[0].status);
        // Load messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('ticket_id', existing[0].id)
          .order('created_at', { ascending: true });
        if (msgs) setMessages(msgs as unknown as ChatMessage[]);
      } else {
        // Create new ticket
        const { data: newTicket } = await supabase
          .from('support_tickets')
          .insert({ client_id: user.id })
          .select()
          .single();
        if (newTicket) {
          setTicketId(newTicket.id);
          // Welcome message from agent
          const welcomeMsg = `Olá${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋 Sou o assistente virtual da Sempre+. Como posso te ajudar hoje?`;
          const { data: welcomeData } = await supabase
            .from('chat_messages')
            .insert({
              ticket_id: newTicket.id,
              sender_type: 'agent',
              content: welcomeMsg,
              metadata: { auto_response: true },
            })
            .select()
            .single();
          if (welcomeData) setMessages([welcomeData as unknown as ChatMessage]);
        }
      }
      scrollToBottom();
    };
    initTicket();
  }, [user, scrollToBottom]);

  // Realtime subscriptions
  useEffect(() => {
    if (!ticketId) return;

    const msgChannel = supabase
      .channel(`chat-msgs-${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        const newMsg = payload.new as unknown as ChatMessage;
        // Only add if not from client (client messages are added optimistically)
        if (newMsg.sender_type !== 'client') {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      })
      .subscribe();

    const ticketChannel = supabase
      .channel(`ticket-status-${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets',
        filter: `id=eq.${ticketId}`,
      }, (payload) => {
        const updated = payload.new as any;
        setTicketStatus(updated.status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [ticketId, scrollToBottom]);

  useEffect(() => { scrollToBottom(); }, [messages, streamingText, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || !ticketId || isLoading) return;
    const text = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    // Optimistically add client message
    const tempId = crypto.randomUUID();
    const clientMsg: ChatMessage = {
      id: tempId,
      ticket_id: ticketId,
      sender_type: 'client',
      sender_id: user?.id || null,
      content: text,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, clientMsg]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-agent`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          message: text,
          client_name: user?.fullName || '',
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erro ao enviar mensagem');
      }

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && resp.body) {
        // Streaming response
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (!line.startsWith('data: ') || line.trim() === '') continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setStreamingText(accumulated);
              }
            } catch { /* partial JSON */ }
          }
        }
        setStreamingText('');
        // The real message will arrive via Realtime
      } else {
        // Non-streaming JSON response (escalation, etc.)
        const data = await resp.json();
        if (data.status) setTicketStatus(data.status);
      }
    } catch (e) {
      console.error('Send error:', e);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const statusLabel = {
    agent_handling: { text: 'Agente IA', color: 'bg-emerald-500/20 text-emerald-400' },
    analysis: { text: 'Em análise', color: 'bg-amber-500/20 text-amber-400' },
    human_handling: { text: 'Atendente', color: 'bg-primary/20 text-primary' },
    resolved: { text: 'Resolvido', color: 'bg-muted text-muted-foreground' },
    closed: { text: 'Encerrado', color: 'bg-muted text-muted-foreground' },
  }[ticketStatus] || { text: ticketStatus, color: 'bg-muted text-muted-foreground' };

  const senderIcon = (type: string) => {
    if (type === 'agent') return <Bot className="w-4 h-4 text-primary" />;
    if (type === 'human_agent') return <Headphones className="w-4 h-4 text-amber-400" />;
    return <User className="w-4 h-4 text-foreground" />;
  };

  return (
    <div className="fixed bottom-20 right-4 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">Suporte Sempre+</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusLabel.color}`}>
            {statusLabel.text}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender_type === 'client' ? 'flex-row-reverse' : ''}`}
          >
            <div className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-1">
              {senderIcon(msg.sender_type)}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.sender_type === 'client'
                  ? 'bg-primary text-primary-foreground'
                  : msg.sender_type === 'human_agent'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <span className="text-[10px] opacity-50 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {streamingText && (
          <div className="flex gap-2">
            <div className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm bg-muted text-foreground">
              <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingText && (
          <div className="flex gap-2">
            <div className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="rounded-xl px-3 py-2 text-sm bg-muted text-muted-foreground">
              <span className="animate-pulse">Digitando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              ticketStatus === 'resolved' || ticketStatus === 'closed'
                ? 'Atendimento encerrado'
                : 'Digite sua mensagem...'
            }
            disabled={isLoading || ticketStatus === 'resolved' || ticketStatus === 'closed'}
            className="text-sm h-9"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!input.trim() || isLoading || ticketStatus === 'resolved' || ticketStatus === 'closed'}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
