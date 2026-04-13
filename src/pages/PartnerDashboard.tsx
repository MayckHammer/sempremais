import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins, TrendingUp, Users, Package, ArrowUpRight, ArrowDownLeft,
  Plus, Star, ChevronRight, BarChart2, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface PartnerStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  txCount: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string | null;
  created_at: string;
}

const formatSB = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (h < 24) return `${h}h atrás`;
  return `${days}d atrás`;
};

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<PartnerStats>({ balance: 0, totalEarned: 0, totalSpent: 0, txCount: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [walletRes, txRes] = await Promise.all([
        supabase.from('sb_wallets').select('balance').eq('user_id', user.id).single(),
        supabase.from('sb_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      ]);
      const txs = (txRes.data ?? []) as Transaction[];
      setStats({
        balance: (walletRes.data as any)?.balance ?? 0,
        totalEarned: txs.filter(t => t.type === 'earned').reduce((s, t) => s + t.amount, 0),
        totalSpent: txs.filter(t => t.type === 'spent').reduce((s, t) => s + t.amount, 0),
        txCount: txs.length,
      });
      setTransactions(txs);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Até logo!' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top section */}
      <div className="bg-primary">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/3" />

        <div className="relative z-10 px-5 pt-14 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-primary-foreground/70 text-sm">Portal do Parceiro</p>
              <p className="text-primary-foreground font-bold text-lg">Sempre+</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/parceiro/configuracoes')}
                className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Settings className="w-4 h-4 text-primary-foreground" />
              </button>
              <button
                onClick={handleSignOut}
                className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <LogOut className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Balance hero */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-primary-foreground/60" />
              <span className="text-xs text-primary-foreground/60">Saldo disponível</span>
            </div>
            {loading ? (
              <div className="w-36 h-10 rounded-xl bg-primary-foreground/10 animate-pulse" />
            ) : (
              <p className="text-4xl font-extrabold text-primary-foreground tracking-tight">{formatSB(stats.balance)} SB$</p>
            )}
            <p className="text-xs text-primary-foreground/40 mt-1">≈ R$ {formatSB(stats.balance)} em serviços</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5">
          {(['overview', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
                activeTab === tab
                  ? 'bg-background text-foreground'
                  : 'text-primary-foreground/60 hover:text-primary-foreground'
              }`}
            >
              {tab === 'overview' ? 'Visão geral' : 'Transações'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'SB$ recebido', value: formatSB(stats.totalEarned), icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
                { label: 'SB$ utilizado', value: formatSB(stats.totalSpent), icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950' },
                { label: 'Transações', value: String(stats.txCount), icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
                { label: 'Avaliação', value: '4.8 ★', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-lg font-bold text-foreground">{loading ? '—' : value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Ações</h3>
              <div className="space-y-2">
                {[
                  { icon: Plus, label: 'Criar nova oferta', desc: 'Publique um serviço ou produto na rede', action: () => navigate('/parceiro/ofertas/nova') },
                  { icon: Users, label: 'Ver clientes da rede', desc: 'Associados que podem contratar você', action: () => {} },
                  { icon: Package, label: 'Minhas ofertas ativas', desc: 'Gerencie o que você oferece em SB$', action: () => {} },
                  { icon: TrendingUp, label: 'Relatório de permutas', desc: 'Histórico completo de transações B2B', action: () => {} },
                ].map(({ icon: Icon, label, desc, action }) => (
                  <button key={label} onClick={action} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent transactions preview */}
            {transactions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">Últimas movimentações</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs text-primary hover:underline">Ver todas</button>
                </div>
                <div className="space-y-2">
                  {transactions.slice(0, 3).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        tx.type === 'earned' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950'
                      }`}>
                        {tx.type === 'earned'
                          ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                          : <ArrowUpRight className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description ?? (tx.type === 'earned' ? 'SB$ recebido' : 'SB$ utilizado')}</p>
                        <p className="text-[11px] text-muted-foreground">{timeAgo(tx.created_at)}</p>
                      </div>
                      <p className={`text-sm font-bold ${tx.type === 'earned' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{formatSB(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />)
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <Coins className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Sem transações ainda</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Suas movimentações SB$ aparecerão aqui</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'earned' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-rose-50 dark:bg-rose-950'
                  }`}>
                    {tx.type === 'earned'
                      ? <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                      : <ArrowUpRight className="w-5 h-5 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.description ?? (tx.type === 'earned' ? 'SB$ recebido' : 'SB$ utilizado')}</p>
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
