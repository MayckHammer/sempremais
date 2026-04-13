import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, Sparkles, ShoppingBag, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string | null;
  created_at: string;
}

interface Wallet {
  balance: number;
}

const formatSB = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
};

export default function ClientWallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [walletRes, txRes] = await Promise.all([
        supabase.from('sb_wallets').select('balance').eq('user_id', user.id).single(),
        supabase
          .from('sb_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (walletRes.data) setWallet(walletRes.data as Wallet);
      if (txRes.data) setTransactions(txRes.data as Transaction[]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const earned = transactions.filter(t => t.type === 'earned').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-primary pt-14 pb-28 px-5 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] rounded-full bg-primary-foreground/5" />
        <div className="absolute top-[40%] right-[20%] w-[100px] h-[100px] rounded-full bg-primary-foreground/5" />

        <button
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-primary-foreground/70" />
            <span className="text-primary-foreground/70 text-sm font-medium">Saldo SB$</span>
          </div>

          {loading ? (
            <div className="w-32 h-10 rounded-xl bg-primary-foreground/10 animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-primary-foreground tracking-tight">
                {formatSB(wallet?.balance ?? 0)}
              </span>
              <span className="text-lg font-bold text-primary-foreground/60">SB$</span>
            </div>
          )}

          <p className="text-primary-foreground/50 text-xs mt-2">1 SB$ = R$ 1,00 em serviços parceiros</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Recebido</p>
                <p className="text-sm font-bold text-primary-foreground">{formatSB(earned)} SB$</p>
              </div>
            </div>

            <div className="w-px h-8 bg-primary-foreground/10" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-400/20 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Utilizado</p>
                <p className="text-sm font-bold text-primary-foreground">{formatSB(spent)} SB$</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content card — overlaps header */}
      <div className="relative -mt-16 px-4 pb-8">
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl p-5 space-y-6">
          {/* Quick actions */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Ações rápidas</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShoppingBag, label: 'Usar SB$', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
                { icon: Zap, label: 'Comprar SB$', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
                { icon: Sparkles, label: 'Parceiros', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
              ].map(({ icon: Icon, label, color }) => (
                <button key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SB$ info banner */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Como usar seus SB$</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Use em qualquer parceiro credenciado da rede Sempre+. 1 SB$ = R$ 1,00 em serviços ou produtos.
                </p>
                <button className="text-xs text-primary font-medium mt-2 hover:underline flex items-center gap-1">
                  Ver parceiros disponíveis <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Histórico</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-[10px]">Últimas transações</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Coins className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhuma transação ainda</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Suas movimentações SB$ aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'earned' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950'
                    }`}>
                      {tx.type === 'earned'
                        ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        : <ArrowUpRight className="w-5 h-5 text-rose-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {tx.description || (tx.type === 'earned' ? 'SB$ recebido' : 'SB$ utilizado')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{timeAgo(tx.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === 'earned' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{formatSB(tx.amount)} SB$
                      </p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tx.type === 'earned' ? 'Crédito' : 'Débito'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <Button variant="outline" className="w-full rounded-2xl h-12 border-border/60" onClick={() => navigate('/parceiro')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Explorar rede de parceiros
          </Button>
        </div>
      </div>
    </div>
  );
}
