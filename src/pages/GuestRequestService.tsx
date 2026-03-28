import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, User, Phone, Mail, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { signUp } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque (Guincho)',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

interface PricingRow {
  service_type: string;
  subscriber_price: number;
  non_subscriber_price: number;
}

export default function GuestRequestService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState('');
  const [originAddress, setOriginAddress] = useState('Obtendo localização...');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [coords, setCoords] = useState({ lat: -23.55, lng: -46.63 });
  const [loading, setLoading] = useState(false);

  // Guest fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Pricing
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchPricing();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            setOriginAddress(data.results[0].formatted_address);
          }
        } catch {
          setOriginAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      },
      () => setOriginAddress('Não foi possível obter localização')
    );
  }, []);

  const fetchPricing = async () => {
    const { data } = await supabase.from('service_pricing').select('*');
    if (data) setPricing(data as unknown as PricingRow[]);
  };

  useEffect(() => {
    if (serviceType && pricing.length > 0) {
      const found = pricing.find(p => p.service_type === serviceType);
      setSelectedPrice(found ? Number(found.non_subscriber_price) : null);
    } else {
      setSelectedPrice(null);
    }
  }, [serviceType, pricing]);

  const handleSubmit = async () => {
    if (!serviceType) {
      toast({ title: 'Selecione o tipo de serviço', variant: 'destructive' });
      return;
    }
    if (!destinationAddress.trim()) {
      toast({ title: 'Informe o destino', variant: 'destructive' });
      return;
    }
    if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
      toast({ title: 'Preencha nome, telefone e email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // If user is already logged in, use their session
      let clientId = user?.id;

      if (!clientId) {
        // Quick signup for guest
        const tempPassword = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const result = await signUp(guestEmail, tempPassword, 'client', guestName, guestPhone);
        if (!result.user) throw new Error('Erro ao criar conta');
        clientId = result.user.id;
      }

      const { data: inserted, error } = await supabase.from('service_requests').insert({
        client_id: clientId,
        client_name: guestName,
        client_phone: guestPhone,
        service_type: serviceType as any,
        address: originAddress,
        latitude: coords.lat,
        longitude: coords.lng,
        description: `Destino: ${destinationAddress}`,
        price: selectedPrice ?? 0,
        is_subscriber: false,
      }).select('id').single();

      if (error) throw error;

      toast({ title: 'Solicitação enviada com sucesso!' });
      navigate(`/cliente/acompanhar/${inserted.id}`);
    } catch (err: any) {
      toast({ title: 'Erro ao solicitar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col relative bg-muted">
      {/* Map background */}
      <div className="flex-1 relative">
        <iframe
          title="Mapa"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coords.lat},${coords.lng}&zoom=15`}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-10 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="bg-card rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-5 pt-5 pb-6 space-y-3 relative z-10 max-h-[70vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-1" />

        {/* Subscriber banner */}
        <button
          onClick={() => navigate('/cadastro/cliente')}
          className="bg-primary/10 rounded-xl px-3 py-2 flex items-center gap-2 w-full text-left hover:bg-primary/20 transition-colors"
        >
          <Coins className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-[11px] text-primary font-body font-medium">
            Seja assinante e pague menos! Ganhe <span className="font-bold">SB's</span> a cada serviço.
          </p>
        </button>

        {/* Service type */}
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger className="rounded-xl h-11 border-border bg-muted/50 text-sm">
            <SelectValue placeholder="Tipo de serviço" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(serviceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price display */}
        {selectedPrice !== null && (
          <div className="bg-muted/60 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-body">Valor do serviço</span>
            <span className="text-lg font-display font-extrabold text-foreground">
              R$ {selectedPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}

        {/* Guest info */}
        {!user && (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Seu nome"
                className="pl-10 rounded-xl h-11 border-border bg-muted/50 text-sm"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Telefone"
                className="pl-10 rounded-xl h-11 border-border bg-muted/50 text-sm"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email"
                className="pl-10 rounded-xl h-11 border-border bg-muted/50 text-sm"
              />
            </div>
          </>
        )}

        {/* Origin */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <Input
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            placeholder="Localização atual"
            className="pl-10 rounded-xl h-11 border-border bg-muted/50 text-sm"
          />
        </div>

        {/* Destination */}
        <div className="relative">
          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-foreground" />
          <Input
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Localização de destino"
            className="pl-10 rounded-xl h-11 border-border bg-muted/50 text-sm"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl h-14 text-lg font-display font-bold shadow-premium"
        >
          {loading ? 'Enviando...' : 'Solicitar Assistência'}
        </Button>
      </div>
    </div>
  );
}
