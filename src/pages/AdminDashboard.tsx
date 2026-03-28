import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { setPreferredUserRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Users, FileText, CheckCircle, XCircle, Star, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProviderRow {
  id: string;
  user_id: string;
  is_approved: boolean;
  total_jobs: number;
  accepted_jobs: number;
  average_rating: number;
  created_at: string;
  address: string | null;
  services: string[];
  profile?: { full_name: string; phone: string | null };
}

interface RequestRow {
  id: string;
  service_type: string;
  status: string;
  client_name: string;
  client_phone: string;
  vehicle_info: string | null;
  description: string | null;
  address: string;
  rating: number | null;
  created_at: string;
  provider_id: string | null;
  provider?: { profile?: { full_name: string } };
}

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque', chaveiro: 'Chaveiro', borracheiro: 'Borracheiro',
  destombamento: 'Destombamento', frete_pequeno: 'Frete Pequeno', frete_grande: 'Frete Grande',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-gold/15 text-gold', label: 'Pendente' },
  accepted: { color: 'bg-primary/15 text-primary', label: 'Aceito' },
  in_progress: { color: 'bg-glow/15 text-glow', label: 'Em Andamento' },
  completed: { color: 'bg-primary/15 text-primary', label: 'Concluído' },
  cancelled: { color: 'bg-destructive/15 text-destructive', label: 'Cancelado' },
};

export default function AdminDashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login/cliente'); return; }
    if (!user.roles.includes('admin')) { navigate('/'); return; }
    if (user.role !== 'admin') {
      setPreferredUserRole('admin');
      void refreshUser();
    }
  }, [user, authLoading, navigate, refreshUser]);

  useEffect(() => {
    if (user?.roles.includes('admin')) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    const [providersRes, requestsRes] = await Promise.all([
      supabase.from('providers').select('*'),
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    if (providersRes.data) {
      // Fetch profiles for providers
      const userIds = providersRes.data.map(p => p.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const enriched = providersRes.data.map(p => ({
        ...p,
        profile: profileMap.get(p.user_id) as { full_name: string; phone: string | null } | undefined,
      }));
      setProviders(enriched);
    }

    if (requestsRes.data) {
      setRequests(requestsRes.data as unknown as RequestRow[]);
    }
    setLoadingData(false);
  };

  const handleApproveProvider = async (providerId: string) => {
    const { error } = await supabase.from('providers').update({ is_approved: true }).eq('id', providerId);
    if (error) toast.error('Erro ao aprovar prestador');
    else { toast.success('Prestador aprovado!'); fetchData(); }
  };

  const handleRejectProvider = async (providerId: string) => {
    const { error } = await supabase.from('providers').update({ is_approved: false }).eq('id', providerId);
    if (error) toast.error('Erro ao rejeitar prestador');
    else { toast.success('Prestador rejeitado'); fetchData(); }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  const pendingProviders = providers.filter(p => !p.is_approved);
  const approvedProviders = providers.filter(p => p.is_approved);

  const stats = [
    { label: 'Prestadores', value: providers.length, colorClass: 'text-primary', icon: Users },
    { label: 'Pendentes', value: pendingProviders.length, colorClass: 'text-gold', icon: Clock },
    { label: 'Solicitações', value: requests.length, colorClass: 'text-foreground', icon: FileText },
    { label: 'Concluídas', value: requests.filter(r => r.status === 'completed').length, colorClass: 'text-primary', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground tracking-tight">Painel Administrativo</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className="bg-card border-border shadow-premium accent-bar">
                <CardContent className="p-3 sm:p-4 pl-5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 font-body">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-display font-extrabold ${stat.colorClass} flex items-center gap-1`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="providers" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 rounded-xl bg-muted">
            <TabsTrigger value="providers" className="rounded-lg font-display font-semibold text-sm">Prestadores</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg font-display font-semibold text-sm">Solicitações</TabsTrigger>
          </TabsList>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-4">
            {pendingProviders.length > 0 && (
              <div>
                <h3 className="text-sm font-display font-bold text-gold mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Aguardando Aprovação ({pendingProviders.length})
                </h3>
                <div className="space-y-2">
                  {pendingProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} onApprove={handleApproveProvider} onReject={handleRejectProvider} isPending />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-display font-bold text-primary mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Aprovados ({approvedProviders.length})
              </h3>
              <div className="space-y-2">
                {approvedProviders.length > 0 ? approvedProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} onApprove={handleApproveProvider} onReject={handleRejectProvider} isPending={false} />
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-6 font-body">Nenhum prestador aprovado</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-2">
            {requests.length > 0 ? requests.map((request) => {
              const statusInfo = statusConfig[request.status] || { color: 'bg-muted text-muted-foreground', label: request.status };
              const formattedDate = new Date(request.created_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              });

              return (
                <motion.div key={request.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-card border-border shadow-sm hover:shadow-premium transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-display font-bold text-sm text-foreground">
                            {serviceLabels[request.service_type] || request.service_type}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-body">{formattedDate}</p>
                        </div>
                        <Badge className={`${statusInfo.color} text-[10px] sm:text-xs font-semibold`}>{statusInfo.label}</Badge>
                      </div>

                      <div className="space-y-1 text-[10px] sm:text-xs text-muted-foreground font-body">
                        <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {request.client_name} • {request.client_phone}</p>
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> <span className="truncate">{request.address}</span></p>
                        {request.description && <p>📋 {request.description}</p>}
                        {request.rating && (
                          <p className="flex items-center gap-0.5 text-gold">
                            {Array.from({ length: request.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-8 font-body">Nenhuma solicitação encontrada</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function ProviderCard({ provider, onApprove, onReject, isPending }: {
  provider: ProviderRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const formattedDate = new Date(provider.created_at).toLocaleDateString('pt-BR');

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-premium transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-display font-bold text-sm text-foreground">
              {provider.profile?.full_name || 'Sem nome'}
            </h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body">Cadastro: {formattedDate}</p>
          </div>
          <Badge className={isPending ? 'bg-gold/15 text-gold text-[10px] font-semibold' : 'bg-primary/15 text-primary text-[10px] font-semibold'}>
            {isPending ? 'Pendente' : 'Aprovado'}
          </Badge>
        </div>

        <div className="space-y-1 text-[10px] sm:text-xs text-muted-foreground font-body mb-3">
          {provider.profile?.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {provider.profile.phone}</p>}
          {provider.address && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {provider.address}</p>}
          <p>Serviços: {provider.total_jobs} | Avaliação: {Number(provider.average_rating).toFixed(1)} ⭐</p>
          {provider.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {provider.services.map(s => (
                <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{serviceLabels[s] || s}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isPending ? (
            <>
              <Button onClick={() => onApprove(provider.id)} className="flex-1 gradient-primary h-8 text-xs font-display font-bold btn-glow rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar
              </Button>
              <Button onClick={() => onReject(provider.id)} variant="outline" className="px-3 h-8 text-xs rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button onClick={() => onReject(provider.id)} variant="outline" className="h-8 text-xs rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">
              <XCircle className="w-3.5 h-3.5 mr-1" /> Revogar Aprovação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
