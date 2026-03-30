import { useState, useEffect } from 'react';
import { Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportChatWindow } from './SupportChatWindow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveTicket, setHasActiveTicket] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkActiveTicket = async () => {
      const { data } = await supabase
        .from('support_tickets')
        .select('id')
        .eq('client_id', user.id)
        .in('status', ['agent_handling', 'analysis', 'human_handling'])
        .limit(1);
      setHasActiveTicket(!!data && data.length > 0);
    };

    checkActiveTicket();

    const channel = supabase
      .channel('ticket-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets',
        filter: `client_id=eq.${user.id}`,
      }, () => checkActiveTicket())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <>
      {isOpen && <SupportChatWindow onClose={() => setIsOpen(false)} />}

      <AnimatePresence mode="wait">
        <motion.button
          key={isOpen ? 'close' : 'open'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full transition-all duration-300 active:scale-95 ${
            isOpen
              ? 'w-12 h-12 justify-center bg-card/90 backdrop-blur-xl border border-border shadow-premium'
              : 'pl-4 pr-3 py-3 bg-card/80 backdrop-blur-xl border border-primary/20 shadow-[0_0_20px_-5px_hsl(var(--glow)/0.25)] hover:shadow-[0_0_30px_-5px_hsl(var(--glow)/0.4)]'
          }`}
          aria-label={isOpen ? 'Fechar suporte' : 'Abrir suporte'}
        >
          {isOpen ? (
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.div>
          ) : (
            <>
              <span className="text-xs font-display font-bold text-foreground">Suporte</span>
              <div className="relative">
                <Headphones className="w-5 h-5 text-primary" />
                {hasActiveTicket && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
                )}
              </div>
            </>
          )}
        </motion.button>
      </AnimatePresence>
    </>
  );
}
