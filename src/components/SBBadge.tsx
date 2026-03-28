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
      className="flex items-center gap-1.5 bg-accent/20 hover:bg-accent/30 transition-colors rounded-full px-3 py-1.5"
    >
      <Coins className="w-4 h-4 text-accent" />
      <span className="text-xs font-display font-bold text-accent">
        {String(Math.floor(balance)).padStart(2, '0')} SB's
      </span>
    </button>
  );
}
