import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function SBBadge({ position = 'bottom' }: { position?: 'bottom' | 'top' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('sb_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setBalance(Number(data.balance));
    };
    fetchBalance();
  }, [user]);

  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => setExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  if (!user) return null;

  const handleClick = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      navigate('/cliente/carteira');
    }
  };

  const isTop = position === 'top';

  return (
    <motion.button
      layout
      onClick={handleClick}
      className={`fixed z-50 flex items-center justify-center gap-2 bg-foreground/50 backdrop-blur-md text-background rounded-full shadow-elevated hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden ${
        isTop ? 'top-4 left-4' : 'bottom-6 left-6'
      } ${expanded ? 'px-4 py-3' : 'w-12 h-12'}`}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      aria-label="SB's"
    >
      <Coins className="w-5 h-5 text-gold shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-display font-bold whitespace-nowrap overflow-hidden"
          >
            {String(Math.floor(balance)).padStart(2, '0')} SB's
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
