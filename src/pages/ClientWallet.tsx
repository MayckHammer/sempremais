import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Info, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { SBBadge } from '@/components/SBBadge';
import logoSempre from '@/assets/logo-sempre.png';

interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string | null;
  created_at: string;
}

export default function ClientWallet() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login/cliente'); return; }

    const fetchData = async () => {
      const [walletRes, txRes] = await Promise.all([
        supabase.from('sb_wallets').select('balance').eq('user_id', user.id).maybeSingle(),
        supabase.from('sb_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (walletRes.data) setBalance(Number(walletRes.data.balance));
      if (txRes.data) setTransactions(txRes.data as Transaction[]);
    };

    fetchData();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary pt-14 pb-8 px-4 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl" onClick={() => navigate('/cliente')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img src={logoSempre} alt="Sempre+" className="h-9 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="w-10" />
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-6 bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-6 border border-primary-foreground/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-primary-foreground/70" />
            <span className="text-primary-foreground/70 text-sm font-body">Minha Carteira</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-extrabold text-primary-foreground">
              {String(Math.floor(balance)).padStart(2, '0')}
            </span>
            <span className="text-lg font-display font-bold text-primary-foreground/80">SB's</span>
          </div>
          <p className="text-primary-foreground/50 text-xs font-body mt-1">Sempre Benefícios</p>
        </motion.div>
      </div>

      {/* Curve */}
      <svg className="w-full -mt-1" viewBox="0 0 390 30" preserveAspectRatio="none" style={{ height: '30px' }}>
        <path d="M0,30 L0,0 Q195,35 390,0 L390,30 Z" fill="hsl(var(--background))" />
      </svg>

      {/* Content */}
      <div className="flex-1 px-4 pb-8 space-y-6 -mt-2">
        {/* Como funciona */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">Como funciona</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground font-body">
            <p>• A cada serviço concluído como assinante, você ganha <strong className="text-accent">SB's</strong></p>
            <p>• Use seus SB's como desconto em serviços futuros</p>
            <p>• Quanto mais usar, mais SB's acumula!</p>
            <p>• Os valores de geração e troca serão definidos em breve</p>
          </div>
        </motion.div>

        {/* Histórico */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="font-display font-extrabold text-base text-foreground mb-3">Histórico</h3>

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'earned' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {tx.type === 'earned' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground truncate">
                      {tx.description || (tx.type === 'earned' ? 'SB\'s recebidos' : 'SB\'s utilizados')}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`font-display font-bold text-sm ${tx.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'earned' ? '+' : '-'}{Math.floor(tx.amount)} SB's
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-body">Nenhuma transação ainda</p>
              <p className="text-xs text-muted-foreground/70 font-body mt-1">Utilize os serviços para ganhar SB's!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
