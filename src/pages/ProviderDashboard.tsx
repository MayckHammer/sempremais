import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RequestCard } from '@/components/RequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { setPreferredUserRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Inbox, CheckCircle, Star, Trophy, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ServiceRequest {
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
}

interface ProviderData {
  id: string;
  total_jobs: number;
  accepted_jobs: number;
  average_rating: number;
  is_approved: boolean;
}

export default function ProviderDashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([]);
  const [myJobs, setMyJobs] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login/prestador');
      return;
    }

    if (!user.roles.includes('provider')) {
      navigate(user.roles.includes('client') ? '/cliente' : '/');
      return;
    }

    if (user.role !== 'provider') {
      setPreferredUserRole('provider');
      void refreshUser();
    }
  }, [user, authLoading, navigate, refreshUser]);

  useEffect(() => {
    if (user) {
      fetchProviderData();
      fetchAvailableRequests();
    }
  }, [user]);

  useEffect(() => {
    if (providerData) {
      fetchMyJobs();

      const channel = supabase
        .channel('provider-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' },
          () => { fetchAvailableRequests(); fetchMyJobs(); }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [providerData]);

  const fetchProviderData = async () => {
    if (!user) return;
    const { data } = await supabase.from('providers').select('*').eq('user_id', user.id).single();
    if (data) setProviderData(data);
  };

  const fetchAvailableRequests = async () => {
    const { data } = await supabase.from('service_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (data) setAvailableRequests(data);
  };

  const fetchMyJobs = async () => {
    if (!user || !providerData) return;
    const { data } = await supabase.from('service_requests').select('*').eq('provider_id', providerData.id).in('status', ['accepted', 'in_progress', 'completed']).order('created_at', { ascending: false });
    if (data) setMyJobs(data);
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!providerData) return;
    const { error } = await supabase.from('service_requests').update({ provider_id: providerData.id, status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', requestId);
    if (error) toast.error('Erro ao aceitar solicitação');
    else { toast.success('Solicitação aceita!'); fetchAvailableRequests(); fetchMyJobs(); fetchProviderData(); }
  };

  const handleDeclineRequest = (requestId: string) => {
    toast.info('Solicitação recusada');
    setAvailableRequests(availableRequests.filter(r => r.id !== requestId));
  };

  const handleCompleteRequest = async (requestId: string) => {
    const { error } = await supabase.from('service_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', requestId);
    if (error) toast.error('Erro ao concluir serviço');
    else { toast.success('Serviço concluído!'); fetchMyJobs(); fetchProviderData(); }
  };

  const acceptRate = providerData && providerData.total_jobs > 0
    ? Math.round((providerData.accepted_jobs / providerData.total_jobs) * 100)
    : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  if (!providerData?.is_approved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-primary/15 rounded-2xl flex items-center justify-center glow-primary">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-foreground mb-3 sm:mb-4 tracking-tight">Aguardando Aprovação</h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4 font-body leading-relaxed">
              Seu cadastro está em análise. Você será notificado quando for aprovado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Serviços', value: providerData?.total_jobs || 0, colorClass: 'text-foreground' },
    { label: 'Aceitação', value: `${acceptRate}%`, colorClass: 'text-primary' },
    { label: 'Avaliação', value: Number(providerData?.average_rating || 0).toFixed(1), colorClass: 'text-gold', icon: Star },
    { label: 'Ranking', value: providerData && providerData.total_jobs > 5 ? '#3' : '-', colorClass: 'text-secondary', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Provider Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="bg-card border-border shadow-premium accent-bar hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-3 sm:p-4 pl-5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 font-body">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-display font-extrabold ${stat.colorClass} flex items-center gap-0.5 sm:gap-1`}>
                    {stat.icon && <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Available Requests */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-display font-extrabold mb-3 sm:mb-4 text-foreground tracking-tight">Solicitações Disponíveis</h2>
          <div className="space-y-2 sm:space-y-3">
            {availableRequests.length > 0 ? (
              availableRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <RequestCard
                    id={request.id} serviceType={request.service_type} status={request.status}
                    clientName={request.client_name} clientPhone={request.client_phone}
                    vehicleInfo={request.vehicle_info || undefined} description={request.description || undefined}
                    address={request.address} createdAt={request.created_at} showActions="available"
                    onAccept={() => handleAcceptRequest(request.id)} onDecline={() => handleDeclineRequest(request.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Inbox className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-muted/50" />
                <p className="text-sm font-body">Nenhuma solicitação disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* My Jobs */}
        <div className="pb-6">
          <h2 className="text-base sm:text-lg font-display font-extrabold mb-3 sm:mb-4 text-foreground tracking-tight">Meus Atendimentos</h2>
          <div className="space-y-2 sm:space-y-3">
            {myJobs.length > 0 ? (
              myJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <RequestCard
                    id={job.id} serviceType={job.service_type} status={job.status}
                    clientName={job.client_name} clientPhone={job.client_phone}
                    vehicleInfo={job.vehicle_info || undefined} description={job.description || undefined}
                    address={job.address} rating={job.rating || undefined} createdAt={job.created_at}
                    showActions="provider" onComplete={() => handleCompleteRequest(job.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <p className="text-sm font-body">Nenhum atendimento em andamento</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
