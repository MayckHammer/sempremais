import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassContainer } from '@/components/GlassContainer';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
  onClick: () => void;
}

export function ServiceCard({ icon: Icon, title, description, colorClass, onClick }: ServiceCardProps) {
  return (
    <GlassContainer cornerRadius={16} blurAmount={0.1} saturation={120} displacementScale={48}>
      <button
        onClick={onClick}
        className={cn(
          "group w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50",
          "hover:border-primary/30 hover:shadow-elevated text-center transition-all duration-300",
          "active:scale-95 sm:hover:-translate-y-2 bg-card/30"
        )}
      >
        <div className={cn(
          "w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl flex items-center justify-center",
          "transition-all duration-300 bg-gradient-to-br",
          colorClass,
          "group-hover:scale-110 group-hover:rotate-[-4deg]"
        )}>
          <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <span className="text-xs sm:text-sm font-display font-bold text-foreground block">{title}</span>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block font-body">{description}</p>
      </button>
    </GlassContainer>
  );
}
