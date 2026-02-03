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
  frete_pequeno: 'Frete P.',
  frete_grande: 'Frete G.',
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
    <div className="gradient-card backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border hover:border-primary/30 transition-all">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold text-primary-foreground">
            {name.charAt(0)}
          </div>
          {rank && rank <= 3 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-background">
              {rank}º
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{name}</h3>
            {isAvailable ? (
              <Badge variant="secondary" className="bg-accent/20 text-accent text-[10px] sm:text-xs px-1.5 sm:px-2">
                Disponível
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] sm:text-xs px-1.5 sm:px-2">
                Ocupado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
            <span className="text-yellow-400 flex items-center gap-0.5 sm:gap-1">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{totalJobs} serv.</span>
            {distance !== undefined && (
              <span className="text-muted-foreground">{distance.toFixed(1)}km</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
            {services.slice(0, 3).map((service) => (
              <Badge key={service} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                {serviceLabels[service] || service}
              </Badge>
            ))}
            {services.length > 3 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                +{services.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Aceitação</p>
          <p className="text-base sm:text-lg font-bold text-accent">{acceptRate}%</p>
        </div>
      </div>
    </div>
  );
}
