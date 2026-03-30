import { useState, useEffect } from 'react';
import { Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportChatWindow } from './SupportChatWindow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  useEffect(() => {
    if (expanded && !isOpen) {
      const timer = setTimeout(() => setExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [expanded, isOpen]);

  const handleClick = () => {
    if (isOpen) {
      setIsOpen(false);
      setExpanded(false);
    } else if (!expanded) {
      setExpanded(true);
    } else {
      setIsOpen(true);
      setExpanded(false);
    }
  };

  return (
    <>
      {isOpen && <SupportChatWindow onClose={() => { setIsOpen(false); setExpanded(false); }} />}

      <motion.button
        layout
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 bg-foreground/50 backdrop-blur-md text-background rounded-full shadow-elevated hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden ${
          isOpen ? 'w-12 h-12' : expanded ? 'px-4 py-3' : 'w-12 h-12'
        }`}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        aria-label={isOpen ? 'Fechar suporte' : 'Abrir suporte'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="headphones"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative shrink-0"
            >
              <Headphones className="w-5 h-5" />
              {hasActiveTicket && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {expanded && !isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-display font-bold whitespace-nowrap overflow-hidden"
            >
              Suporte
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
