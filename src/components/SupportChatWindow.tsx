import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, Bot, User, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function SenderAvatar({ type }: { type: string }) {
  if (type === 'agent') {
    return (
      <div className="relative shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-card status-pulse" />
      </div>
    );
  }
  if (type === 'human_agent') {
    return (
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-400/10 flex items-center justify-center ring-1 ring-amber-500/20">
        <Headphones className="w-3.5 h-3.5 text-amber-400" />
      </div>
    );
  }
  return (
    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-1 ring-primary/10">
      <User className="w-3.5 h-3.5 text-foreground/70" />
    </div>
  );
}

export function SupportChatWindow({ onClose }: SupportChatWindowProps) {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [ticketStatus, setTicketStatus] = useState<string>('agent_handling');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('ticket_id', existing[0].id)
          .order('created_at', { ascending: true });
        if (msgs) setMessages(msgs as unknown as ChatMessage[]);
      } else {
        const { data: newTicket } = await supabase
          .from('support_tickets')
          .insert({ client_id: user.id })
          .select()
          .single();
        if (newTicket) {
          setTicketId(newTicket.id);
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
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        const newMsg = payload.new as unknown as ChatMessage;
        if (newMsg.sender_type !== 'client') {
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          scrollToBottom();
        }
      })
      .subscribe();

    const ticketChannel = supabase
      .channel(`ticket-status-${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'support_tickets',
        filter: `id=eq.${ticketId}`,
      }, (payload) => setTicketStatus((payload.new as any).status))
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

    const tempId = crypto.randomUUID();
    const clientMsg: ChatMessage = {
      id: tempId, ticket_id: ticketId, sender_type: 'client',
      sender_id: user?.id || null, content: text, metadata: {},
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
          ticket_id: ticketId, message: text, client_name: user?.fullName || '',
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erro ao enviar mensagem');
      }

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && resp.body) {
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
              if (content) { accumulated += content; setStreamingText(accumulated); }
            } catch { /* partial JSON */ }
          }
        }
        setStreamingText('');
      } else {
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

  const statusConfig = {
    agent_handling: { text: 'Online', dot: 'bg-emerald-400' },
    analysis: { text: 'Analisando', dot: 'bg-amber-400' },
    human_handling: { text: 'Atendente', dot: 'bg-primary' },
    resolved: { text: 'Resolvido', dot: 'bg-muted-foreground' },
    closed: { text: 'Encerrado', dot: 'bg-muted-foreground' },
  }[ticketStatus] || { text: ticketStatus, dot: 'bg-muted-foreground' };

  const isClosed = ticketStatus === 'resolved' || ticketStatus === 'closed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="fixed bottom-20 right-4 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] rounded-2xl z-50 overflow-hidden flex flex-col
        bg-card/95 backdrop-blur-xl
        border border-border/60
        shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.15),0_4px_16px_-4px_rgba(0,0,0,0.2)]"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-gradient-to-r from-card via-card to-primary/[0.03]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center ring-1 ring-primary/15">
              <Bot className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${statusConfig.dot} ring-2 ring-card status-pulse`} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-foreground leading-tight">Sempre+</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              <span className="text-[10px] text-muted-foreground font-medium">{statusConfig.text}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isClient = msg.sender_type === 'client';
            const isHuman = msg.sender_type === 'human_agent';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i > messages.length - 3 ? 0.05 : 0 }}
                className={`flex gap-2 ${isClient ? 'flex-row-reverse' : ''}`}
              >
                {!isClient && <SenderAvatar type={msg.sender_type} />}

                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    isClient
                      ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.25)]'
                      : isHuman
                      ? 'rounded-2xl rounded-bl-md bg-amber-500/[0.08] border border-amber-500/15 text-foreground'
                      : 'rounded-2xl rounded-bl-md bg-muted/60 backdrop-blur-sm border border-border/30 text-foreground'
                  }`}
                >
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <span className={`text-[9px] mt-1.5 block ${isClient ? 'text-primary-foreground/50 text-right' : 'text-muted-foreground/60'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isClient && <SenderAvatar type="client" />}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Streaming */}
        {streamingText && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <SenderAvatar type="agent" />
            <div className="max-w-[78%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] leading-relaxed bg-muted/60 backdrop-blur-sm border border-border/30 text-foreground">
              <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
              <motion.span
                className="inline-block w-[2px] h-3.5 bg-primary/70 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isLoading && !streamingText && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <SenderAvatar type="agent" />
            <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-muted/60 backdrop-blur-sm border border-border/30">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Human handoff banner */}
        {ticketStatus === 'human_handling' && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 py-2 px-3 mx-auto w-fit rounded-full bg-amber-500/[0.08] border border-amber-500/15 text-amber-400 text-[11px] font-medium"
          >
            <Headphones className="w-3 h-3" />
            Um atendente entrou na conversa
          </motion.div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="px-3 py-3 border-t border-border/40 bg-card/80">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isClosed ? 'Atendimento encerrado' : 'Escreva sua mensagem...'}
            disabled={isLoading || isClosed}
            className="flex-1 h-10 px-4 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all disabled:opacity-40"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading || isClosed}
            whileTap={{ scale: 0.92 }}
            className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_16px_hsl(var(--primary)/0.35)] transition-all duration-200"
          >
            <Send className="w-4 h-4 -rotate-45" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
