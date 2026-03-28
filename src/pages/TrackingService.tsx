import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { SBBadge } from '@/components/SBBadge';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const statusLabels: Record<string, string> = {
  pending: 'Aguardando',
  accepted: 'Aceito',
  in_progress: 'A caminho',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function TrackingService() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial request
  useEffect(() => {
    if (!requestId) return;
    const fetchRequest = async () => {
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (data) setRequest(data);
      setLoading(false);
    };
    fetchRequest();
  }, [requestId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!requestId) return;
    const channel = supabase
      .channel(`tracking-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => setRequest(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // Fetch provider info when provider_id changes
  useEffect(() => {
    if (!request?.provider_id) return;
    const fetchProvider = async () => {
      const { data: prov } = await supabase
        .from('providers')
        .select('*')
        .eq('id', request.provider_id)
        .single();
      if (prov) {
        setProvider(prov);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('user_id', prov.user_id)
          .single();
        if (profile) setProviderProfile(profile);
      }
    };
    fetchProvider();
  }, [request?.provider_id]);

  // Subscribe to provider location updates
  useEffect(() => {
    if (!provider?.id) return;
    const channel = supabase
      .channel(`provider-loc-${provider.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'providers',
          filter: `id=eq.${provider.id}`,
        },
        (payload) => {
          setProvider((prev: any) => ({
            ...prev,
            latitude: (payload.new as any).latitude,
            longitude: (payload.new as any).longitude,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [provider?.id]);

  const isPending = !request || request.status === 'pending';
  const hasProviderLocation = provider?.latitude && provider?.longitude;
  const clientLat = request?.latitude ?? -23.55;
  const clientLng = request?.longitude ?? -46.63;

  const distance = hasProviderLocation
    ? haversineDistance(provider.latitude, provider.longitude, clientLat, clientLng)
    : null;
  const etaMinutes = distance ? Math.max(1, Math.round((distance / 40) * 60)) : null;

  const mapSrc = hasProviderLocation
    ? `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${provider.latitude},${provider.longitude}&destination=${clientLat},${clientLng}&mode=driving`
    : `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${clientLat},${clientLng}&zoom=15`;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative bg-muted">
      {/* Map */}
      <div className="flex-1 relative">
        <iframe
          title="Mapa de rastreamento"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          src={mapSrc}
        />
        <button
          onClick={() => navigate('/cliente')}
          className="absolute top-12 left-4 z-10 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="bg-card rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-5 pt-6 pb-8 space-y-4 relative z-10">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-2" />

        {isPending ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-lg font-display font-semibold text-foreground">
              Aguardando prestador...
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Estamos buscando o prestador mais próximo para atender sua solicitação.
            </p>
          </div>
        ) : (
          <>
            {/* Provider info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground">
                  {providerProfile?.full_name || 'Prestador'}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs"
                >
                  {statusLabels[request?.status] || request?.status}
                </Badge>
              </div>
            </div>

            {/* Distance & ETA */}
            <div className="flex gap-4">
              <div className="flex-1 bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                <Navigation className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-semibold text-foreground">
                    {distance ? `${distance.toFixed(1)} km` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo estimado</p>
                  <p className="font-semibold text-foreground">
                    {etaMinutes ? `${etaMinutes} min` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Call button */}
            {providerProfile?.phone && (
              <Button
                asChild
                className="w-full rounded-2xl h-14 text-lg font-display font-bold shadow-premium"
              >
                <a href={`tel:${providerProfile.phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Ligar para o prestador
                </a>
              </Button>
            )}
          </>
        )}
      </div>
      <SBBadge position="top" />
    </div>
  );
}
