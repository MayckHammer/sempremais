import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Coins, Car } from 'lucide-react';
import { SBBadge } from '@/components/SBBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PricingRow {
  service_type: string;
  subscriber_price: number;
  non_subscriber_price: number;
}

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque (Guincho)',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

export default function RequestService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState('');
  const [originAddress, setOriginAddress] = useState('Obtendo localização...');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [coords, setCoords] = useState({ lat: -23.55, lng: -46.63 });
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  useEffect(() => {
    // Fetch pricing
    supabase.from('service_pricing').select('*').then(({ data }) => {
      if (data) setPricing(data as unknown as PricingRow[]);
    });

    // Pre-fill vehicle data from profile
    if (user) {
      supabase.from('profiles').select('vehicle_brand, vehicle_model, vehicle_year').eq('user_id', user.id).single().then(({ data }) => {
        if (data) {
          if (data.vehicle_brand) setVehicleBrand(data.vehicle_brand);
          if (data.vehicle_model) setVehicleModel(data.vehicle_model);
          if (data.vehicle_year) setVehicleYear(data.vehicle_year);
        }
      });
    }

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

  useEffect(() => {
    if (serviceType && pricing.length > 0) {
      const found = pricing.find(p => p.service_type === serviceType);
      setSelectedPrice(found ? Number(found.subscriber_price) : null);
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
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .single();

      const vehicleInfo = vehicleType
        ? `${vehicleType}${vehicleBrand ? ` - ${vehicleBrand}` : ''}${vehicleModel ? ` ${vehicleModel}` : ''}${vehicleYear ? ` ${vehicleYear}` : ''}`
        : null;

      const { data: inserted, error } = await supabase.from('service_requests').insert({
        client_id: user.id,
        client_name: profile?.full_name || 'Cliente',
        client_phone: profile?.phone || '',
        service_type: serviceType as any,
        address: originAddress,
        latitude: coords.lat,
        longitude: coords.lng,
        description: `Destino: ${destinationAddress}`,
        price: selectedPrice ?? 0,
        is_subscriber: true,
        vehicle_info: vehicleInfo,
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
      <div className="bg-card rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-5 pt-6 pb-8 relative z-10">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-2" />

        <div className="space-y-3 overflow-y-auto max-h-[65vh] pr-1">
          {/* Service type */}
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="rounded-xl h-12 border-border bg-muted/50">
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

          {/* Vehicle type */}
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger className="rounded-xl h-12 border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Tipo de veículo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {['Automóvel', 'Motocicleta', 'Picape', 'Caminhão', 'Outros'].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand + Model */}
          <div className="flex gap-3">
            <Input
              value={vehicleBrand}
              onChange={(e) => setVehicleBrand(e.target.value)}
              placeholder="Marca"
              className="rounded-xl h-12 border-border bg-muted/50"
            />
            <Input
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="Modelo"
              className="rounded-xl h-12 border-border bg-muted/50"
            />
          </div>

          {/* Year */}
          <Input
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            placeholder="Ano"
            className="rounded-xl h-12 border-border bg-muted/50"
          />

          {/* Price + SB's display */}
          {selectedPrice !== null && (
            <div className="bg-muted/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-body">Valor assinante</span>
                <p className="text-lg font-display font-extrabold text-foreground">
                  R$ {selectedPrice.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-display font-bold">Você ganhará SB's</span>
              </div>
            </div>
          )}

          {/* Origin */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="Localização atual"
              className="pl-10 rounded-xl h-12 border-border bg-muted/50"
            />
          </div>

          {/* Destination */}
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-foreground" />
            <Input
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="Localização de destino"
              className="pl-10 rounded-xl h-12 border-border bg-muted/50"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl h-14 text-lg font-display font-bold shadow-premium"
          >
            {loading ? 'Enviando...' : 'Solicitar'}
          </Button>
        </div>
      </div>
      <SBBadge position="top" />
    </div>
  );
}
