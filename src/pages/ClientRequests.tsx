import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RequestCard } from '@/components/RequestCard';
import { RatingModal } from '@/components/RatingModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SBBadge } from '@/components/SBBadge';

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

export default function ClientRequests() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [ratingRequest, setRatingRequest] = useState<ServiceRequest | null>(null);
  const [providerName, setProviderName] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login/cliente'); return; }
    fetchRequests();

    const channel = supabase
      .channel('client-requests-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `client_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, authLoading]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const handleOpenRating = async (request: ServiceRequest) => {
    if (request.provider_id) {
      const { data: provider } = await supabase.from('providers').select('user_id').eq('id', request.provider_id).single();
      if (provider) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', provider.user_id).single();
        setProviderName(profile?.full_name || 'Prestador');
      }
    }
    setRatingRequest(request);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!ratingRequest) return;
    const { error } = await supabase
      .from('service_requests')
      .update({ rating })
      .eq('id', ratingRequest.id);
    if (error) { toast.error('Erro ao enviar avaliação'); throw error; }
    toast.success('Avaliação enviada com sucesso!');
    fetchRequests();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/cliente')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground tracking-tight">Minhas Solicitações</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-2 sm:space-y-3">
          {requests.length > 0 ? requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <RequestCard
                id={request.id}
                serviceType={request.service_type}
                status={request.status}
                clientName={request.client_name}
                clientPhone={request.client_phone}
                vehicleInfo={request.vehicle_info || undefined}
                description={request.description || undefined}
                address={request.address}
                rating={request.rating || undefined}
                createdAt={request.created_at}
                showActions="client"
                onRate={() => handleOpenRating(request)}
              />
            </motion.div>
          )) : (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-muted/50" />
              <p className="text-sm font-body">Nenhuma solicitação ainda</p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      <RatingModal
        open={!!ratingRequest}
        onClose={() => setRatingRequest(null)}
        providerName={providerName}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}
