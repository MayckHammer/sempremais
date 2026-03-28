import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Users, Wrench, ClipboardList, Coins, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque', chaveiro: 'Chaveiro', borracheiro: 'Borracheiro',
  destombamento: 'Destombamento', frete_pequeno: 'Frete Pequeno', frete_grande: 'Frete Grande',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-gold/15 text-gold' },
  accepted: { label: 'Aceito', color: 'bg-primary/15 text-primary' },
  in_progress: { label: 'Em Andamento', color: 'bg-glow/15 text-glow' },
  completed: { label: 'Concluído', color: 'bg-primary/15 text-primary' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/15 text-destructive' },
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, providers: 0, requests: 0, pendingProviders: 0, sbsIssued: 0, completed: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [clientsRes, providersRes, requestsRes, walletsRes, pendingRes, recentRes] = await Promise.all([
      supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      supabase.from('service_requests').select('id', { count: 'exact', head: true }),
      supabase.from('sb_transactions').select('amount').eq('type', 'earned'),
      supabase.from('providers').select('id, user_id, created_at, services').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    // Fetch profiles for pending providers
    let enrichedPending: any[] = [];
    if (pendingRes.data && pendingRes.data.length > 0) {
      const userIds = pendingRes.data.map((p: any) => p.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      enrichedPending = pendingRes.data.map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) }));
    }

    const totalSBs = walletsRes.data?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
    const completedCount = recentRes.data?.filter((r: any) => r.status === 'completed').length || 0;

    setStats({
      clients: clientsRes.count || 0,
      providers: providersRes.count || 0,
      requests: requestsRes.count || 0,
      pendingProviders: pendingRes.data?.length || 0,
      sbsIssued: totalSBs,
      completed: completedCount,
    });
    setRecentRequests(recentRes.data || []);
    setPendingProviders(enrichedPending);
    setLoading(false);
  };

  const handleApprove = async (providerId: string) => {
    const { error } = await supabase.from('providers').update({ is_approved: true }).eq('id', providerId);
    if (error) toast.error('Erro ao aprovar');
    else { toast.success('Prestador aprovado!'); fetchDashboardData(); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  const kpis = [
    { label: 'Clientes', value: stats.clients, icon: Users, color: 'text-primary' },
    { label: 'Prestadores', value: stats.providers, icon: Wrench, color: 'text-glow' },
    { label: 'Solicitações', value: stats.requests, icon: ClipboardList, color: 'text-foreground' },
    { label: 'SBs Emitidos', value: stats.sbsIssued, icon: Coins, color: 'text-gold' },
    { label: 'Aprovações Pendentes', value: stats.pendingProviders, icon: Clock, color: 'text-gold' },
    { label: 'Concluídas', value: stats.completed, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-semibold">{kpi.label}</span>
                </div>
                <p className={`text-2xl font-display font-extrabold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Providers */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" /> Prestadores Aguardando Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingProviders.length > 0 ? pendingProviders.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-sm font-display font-bold text-foreground">{p.profile?.full_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {p.services?.map((s: string) => serviceLabels[s] || s).join(', ') || 'Sem serviços'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button onClick={() => handleApprove(p.id)} size="sm" className="h-7 px-3 text-xs gradient-primary font-display font-bold btn-glow rounded-lg">
                    <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                  </Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6 font-body">Nenhum prestador pendente</p>
            )}
            {stats.pendingProviders > 0 && (
              <Button variant="ghost" className="w-full text-xs text-primary font-display" onClick={() => navigate('/admin/providers')}>
                Ver todos →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> Solicitações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRequests.length > 0 ? recentRequests.map((r: any) => {
              const st = statusLabels[r.status] || { label: r.status, color: 'bg-muted text-muted-foreground' };
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold text-foreground truncate">
                      {serviceLabels[r.service_type] || r.service_type} — {r.client_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {new Date(r.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className={`${st.color} text-[10px] font-semibold shrink-0`}>{st.label}</Badge>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-6 font-body">Nenhuma solicitação</p>
            )}
            <Button variant="ghost" className="w-full text-xs text-primary font-display" onClick={() => navigate('/admin/requests')}>
              Ver todas →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
