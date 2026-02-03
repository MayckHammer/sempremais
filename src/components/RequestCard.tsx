import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Key, Circle, RotateCcw, Package, MapPin, Phone, Car, Star } from 'lucide-react';

interface RequestCardProps {
  id: string;
  serviceType: string;
  status: string;
  clientName: string;
  clientPhone: string;
  vehicleInfo?: string;
  description?: string;
  address: string;
  providerName?: string;
  rating?: number;
  createdAt: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
  onRate?: () => void;
  showActions?: 'client' | 'provider' | 'available';
}

const serviceIcons: Record<string, typeof Truck> = {
  reboque: Truck,
  chaveiro: Key,
  borracheiro: Circle,
  destombamento: RotateCcw,
  frete_pequeno: Package,
  frete_grande: Package,
};

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  accepted: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-accent/20 text-accent',
  cancelled: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  pending: 'Aguardando',
  accepted: 'Aceito',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function RequestCard({
  serviceType,
  status,
  clientName,
  clientPhone,
  vehicleInfo,
  description,
  address,
  providerName,
  rating,
  createdAt,
  onAccept,
  onDecline,
  onComplete,
  onRate,
  showActions,
}: RequestCardProps) {
  const Icon = serviceIcons[serviceType] || Truck;
  const formattedDate = new Date(createdAt).toLocaleString('pt-BR');

  return (
    <div className={`gradient-card backdrop-blur rounded-2xl p-4 border border-border ${showActions === 'available' ? 'pulse-ring' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground capitalize">
              {serviceLabels[serviceType] || serviceType}
            </h3>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <Badge className={statusColors[status]}>
          {statusLabels[status] || status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {description && (
          <p className="text-sm text-muted-foreground">📋 {description}</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" /> {clientName} • {clientPhone}
        </p>
        {vehicleInfo && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Car className="w-3 h-3" /> {vehicleInfo}
          </p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {address}
        </p>
        {providerName && (
          <p className="text-xs text-muted-foreground">👤 Prestador: {providerName}</p>
        )}
      </div>

      {rating && rating > 0 && (
        <div className="flex items-center gap-1 text-yellow-400 mb-3">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      )}

      {showActions === 'available' && (
        <div className="flex gap-2">
          <Button onClick={onAccept} className="flex-1 gradient-primary">
            ✓ Aceitar
          </Button>
          <Button onClick={onDecline} variant="secondary" className="px-4">
            ✗
          </Button>
        </div>
      )}

      {showActions === 'provider' && status === 'accepted' && (
        <Button onClick={onComplete} className="w-full gradient-primary">
          ✓ Marcar como Concluído
        </Button>
      )}

      {showActions === 'client' && status === 'completed' && !rating && (
        <Button onClick={onRate} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          ⭐ Avaliar atendimento
        </Button>
      )}
    </div>
  );
}
