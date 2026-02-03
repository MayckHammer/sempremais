import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProviderCardProps {
  name: string;
  rating: number;
  totalJobs: number;
  distance?: number;
  services: string[];
  acceptRate: number;
  rank?: number;
  isAvailable: boolean;
}

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

export function ProviderCard({
  name,
  rating,
  totalJobs,
  distance,
  services,
  acceptRate,
  rank,
  isAvailable,
}: ProviderCardProps) {
  return (
    <div className="gradient-card backdrop-blur rounded-2xl p-4 border border-border hover:border-primary/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-xl font-bold text-primary-foreground">
            {name.charAt(0)}
          </div>
          {rank && rank <= 3 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-background">
              {rank}º
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            {isAvailable ? (
              <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                Disponível
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                Ocupado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{totalJobs} serviços</span>
            {distance !== undefined && (
              <span className="text-muted-foreground">{distance.toFixed(1)}km</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {services.map((service) => (
              <Badge key={service} variant="outline" className="text-xs">
                {serviceLabels[service] || service}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Taxa de aceitação</p>
          <p className="text-lg font-bold text-accent">{acceptRate}%</p>
        </div>
      </div>
    </div>
  );
}
