import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function SBBadge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

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

  if (!user) return null;

  return (
    <button
      onClick={() => navigate('/cliente/carteira')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-foreground text-background rounded-full px-5 py-3 shadow-elevated hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden sb-shimmer"
    >
      <Coins className="w-5 h-5 text-gold" />
      <span className="text-sm font-display font-bold">
        {String(Math.floor(balance)).padStart(2, '0')} SB's
      </span>
    </button>
  );
}
