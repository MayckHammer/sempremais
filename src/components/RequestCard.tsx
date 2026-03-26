import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Key, Circle, RotateCcw, Package, MapPin, Phone, Car, Star } from 'lucide-react';
import { GlassContainer } from '@/components/GlassContainer';

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
  reboque: Truck, chaveiro: Key, borracheiro: Circle,
  destombamento: RotateCcw, frete_pequeno: Package, frete_grande: Package,
};

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque', chaveiro: 'Chaveiro', borracheiro: 'Borracheiro',
  destombamento: 'Destombamento', frete_pequeno: 'Frete Pequeno', frete_grande: 'Frete Grande',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-gold/15 text-gold', label: 'Aguardando' },
  accepted: { color: 'bg-primary/15 text-primary', label: 'Aceito' },
  in_progress: { color: 'bg-glow/15 text-glow', label: 'Em Andamento' },
  completed: { color: 'bg-primary/15 text-primary', label: 'Concluído' },
  cancelled: { color: 'bg-destructive/15 text-destructive', label: 'Cancelado' },
};

export function RequestCard({
  serviceType, status, clientName, clientPhone,
  vehicleInfo, description, address, providerName,
  rating, createdAt, onAccept, onDecline, onComplete, onRate, showActions,
}: RequestCardProps) {
  const Icon = serviceIcons[serviceType] || Truck;
  const formattedDate = new Date(createdAt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const statusInfo = statusConfig[status] || { color: 'bg-muted text-muted-foreground', label: status };

  return (
    <GlassContainer cornerRadius={16} blurAmount={0.1} saturation={120} displacementScale={48}>
    <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/50 accent-bar hover:shadow-premium transition-all duration-300 bg-card/30 ${showActions === 'available' ? 'glow-pulse' : ''}`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2 pl-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-glow/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-foreground capitalize text-sm sm:text-base truncate">
              {serviceLabels[serviceType] || serviceType}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body">{formattedDate}</p>
          </div>
        </div>
        <Badge className={`${statusInfo.color} text-[10px] sm:text-xs flex-shrink-0 font-semibold`}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 pl-2">
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 font-body">📋 {description}</p>
        )}
        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 font-body">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{clientName} • {clientPhone}</span>
        </p>
        {vehicleInfo && (
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 font-body">
            <Car className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{vehicleInfo}</span>
          </p>
        )}
        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 font-body">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </p>
        {providerName && (
          <p className="text-[10px] sm:text-xs text-muted-foreground font-body">👤 Prestador: {providerName}</p>
        )}
      </div>

      {rating && rating > 0 && (
        <div className="flex items-center gap-0.5 text-gold mb-2 sm:mb-3 pl-2">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
          ))}
        </div>
      )}

      {showActions === 'available' && (
        <div className="flex gap-2 pl-2">
          <Button onClick={onAccept} className="flex-1 gradient-primary h-9 sm:h-10 text-sm font-display font-bold btn-glow rounded-xl">
            ✓ Aceitar
          </Button>
          <Button onClick={onDecline} variant="secondary" className="px-3 sm:px-4 h-9 sm:h-10 rounded-xl">
            ✗
          </Button>
        </div>
      )}

      {showActions === 'provider' && status === 'accepted' && (
        <div className="pl-2">
          <Button onClick={onComplete} className="w-full gradient-primary h-9 sm:h-10 text-sm font-display font-bold btn-glow rounded-xl">
            ✓ Marcar como Concluído
          </Button>
        </div>
      )}

      {showActions === 'client' && status === 'completed' && !rating && (
        <div className="pl-2">
          <Button onClick={onRate} variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground h-9 sm:h-10 text-sm font-display font-bold rounded-xl">
            ⭐ Avaliar atendimento
          </Button>
        </div>
      )}
    </div>
    </GlassContainer>
  );
}
