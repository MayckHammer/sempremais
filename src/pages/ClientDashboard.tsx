import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceCard } from '@/components/ServiceCard';
import { ProviderCard } from '@/components/ProviderCard';
import { RequestCard } from '@/components/RequestCard';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { RatingModal } from '@/components/RatingModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { setPreferredUserRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Truck, Key, Circle, RotateCcw, Package, RefreshCw, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassContainer } from '@/components/GlassContainer';

interface Provider {
  id: string;
  user_id: string;
  services: string[];
  average_rating: number;
  total_jobs: number;
  accepted_jobs: number;
  is_available: boolean;
  profiles?: { full_name: string };
}

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
  providers?: { profiles?: { full_name: string } };
}

export default function ClientDashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState({ address: 'Detectando localização...', lat: -23.5505, lng: -46.6333 });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingRequest, setRatingRequest] = useState<ServiceRequest | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login/cliente');
      return;
    }

    if (!user.roles.includes('client')) {
      navigate(user.roles.includes('provider') ? '/prestador' : '/');
      return;
    }

    if (user.role !== 'client') {
      setPreferredUserRole('client');
      void refreshUser();
    }
  }, [user, authLoading, navigate, refreshUser]);

  useEffect(() => {
    if (user) {
      detectLocation();
      fetchProviders();
      fetchRequests();
      
      const channel = supabase
        .channel('client-requests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'service_requests', filter: `client_id=eq.${user.id}` },
          () => { fetchRequests(); }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const detectLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
          setLoadingLocation(false);
          toast.success('Localização atualizada!');
        },
        () => {
          setLocation({ ...location, address: 'São Paulo, SP (Localização padrão)' });
          setLoadingLocation(false);
        }
      );
    } else {
      setLocation({ ...location, address: 'Geolocalização não disponível' });
      setLoadingLocation(false);
    }
  };

  const fetchProviders = async () => {
    const { data } = await supabase
      .from('providers')
      .select(`*, profiles:user_id (full_name)`)
      .eq('is_approved', true)
      .eq('is_available', true)
      .order('average_rating', { ascending: false })
      .limit(10);
    if (data) setProviders(data as unknown as Provider[]);
  };

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('service_requests')
      .select(`*, providers:provider_id ( profiles:user_id (full_name) )`)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setRequests(data as unknown as ServiceRequest[]);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (data: {
    clientName: string; clientPhone: string; vehicleInfo: string; description: string;
  }) => {
    if (!user || !selectedService) return;
    const { error } = await supabase.from('service_requests').insert([{
      client_id: user.id, service_type: selectedService as any,
      client_name: data.clientName, client_phone: data.clientPhone,
      vehicle_info: data.vehicleInfo || null, description: data.description,
      latitude: location.lat, longitude: location.lng, address: location.address,
    }]);
    if (error) toast.error('Erro ao enviar solicitação');
    else { toast.success('Solicitação enviada com sucesso!'); fetchRequests(); }
  };

  const handleRateRequest = (request: ServiceRequest) => {
    setRatingRequest(request);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!ratingRequest) return;
    const { error } = await supabase.from('service_requests').update({ rating }).eq('id', ratingRequest.id);
    if (error) toast.error('Erro ao enviar avaliação');
    else { toast.success('Obrigado pela avaliação!'); fetchRequests(); }
  };

  const services = [
    { id: 'reboque', icon: Truck, title: 'Reboque', description: 'Transporte de veículos', colorClass: 'from-primary/20 to-glow/10 text-primary group-hover:from-primary/30 group-hover:to-glow/20' },
    { id: 'chaveiro', icon: Key, title: 'Chaveiro', description: 'Abertura de veículos', colorClass: 'from-primary/15 to-primary/5 text-primary group-hover:from-primary/25 group-hover:to-primary/15' },
    { id: 'borracheiro', icon: Circle, title: 'Borracheiro', description: 'Troca de pneus', colorClass: 'from-accent/20 to-accent/5 text-accent group-hover:from-accent/30 group-hover:to-accent/15' },
    { id: 'destombamento', icon: RotateCcw, title: 'Destombamento', description: 'Veículos tombados', colorClass: 'from-destructive/15 to-destructive/5 text-destructive group-hover:from-destructive/25 group-hover:to-destructive/10' },
    { id: 'frete_pequeno', icon: Package, title: 'Frete', description: 'Pequenos e grandes', colorClass: 'from-secondary/20 to-secondary/5 text-secondary group-hover:from-secondary/30 group-hover:to-secondary/15' },
  ];

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
        {/* Location Bar */}
        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassContainer cornerRadius={16} blurAmount={0.1} saturation={120} displacementScale={48}>
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-premium bg-card/30 border border-border/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-glow/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 font-body">Sua localização</p>
                <p className="text-xs sm:text-sm font-display font-semibold text-foreground truncate">{location.address}</p>
              </div>
              <Button
                onClick={detectLocation}
                variant="secondary"
                size="sm"
                disabled={loadingLocation}
                className="rounded-xl h-8 sm:h-9 px-2 sm:px-3 text-xs font-display font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loadingLocation ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Atualizar</span>
              </Button>
          </div>
          </GlassContainer>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-display font-extrabold mb-3 sm:mb-4 text-foreground tracking-tight">Selecione o Serviço</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  colorClass={service.colorClass}
                  onClick={() => handleServiceSelect(service.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Providers */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-display font-extrabold text-foreground tracking-tight">Prestadores Próximos</h2>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline font-body">Ordenados por avaliação</span>
          </div>
          <div className="grid gap-2 sm:gap-3">
            {providers.length > 0 ? (
              providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <ProviderCard
                    name={provider.profiles?.full_name || 'Prestador'}
                    rating={Number(provider.average_rating)}
                    totalJobs={provider.total_jobs}
                    services={provider.services || []}
                    acceptRate={provider.total_jobs > 0 ? Math.round((provider.accepted_jobs / provider.total_jobs) * 100) : 0}
                    rank={index + 1}
                    isAvailable={provider.is_available}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm font-body">
                <p>Nenhum prestador disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* My Requests */}
        <div className="pb-6">
          <h2 className="text-base sm:text-lg font-display font-extrabold mb-3 sm:mb-4 text-foreground tracking-tight">Minhas Solicitações</h2>
          <div className="space-y-2 sm:space-y-3">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
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
                    providerName={request.providers?.profiles?.full_name}
                    rating={request.rating || undefined}
                    createdAt={request.created_at}
                    showActions="client"
                    onRate={() => handleRateRequest(request)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Clipboard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-muted/50" />
                <p className="text-sm font-body">Nenhuma solicitação ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceRequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        serviceType={selectedService || ''}
        serviceTitle=""
        location={location}
        onSubmit={handleSubmitRequest}
      />

      <RatingModal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        providerName={ratingRequest?.providers?.profiles?.full_name || 'Prestador'}
        onSubmit={handleSubmitRating}
      />

      <Footer />
    </div>
  );
}
