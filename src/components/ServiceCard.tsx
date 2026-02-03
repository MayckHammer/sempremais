import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
  onClick: () => void;
}

export function ServiceCard({ icon: Icon, title, description, colorClass, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "service-card gradient-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border",
        "hover:border-primary/50 text-center group transition-all duration-300",
        "active:scale-95 sm:hover:-translate-y-1"
      )}
    >
      <div className={cn(
        "w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl flex items-center justify-center",
        "transition-colors",
        colorClass
      )}>
        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground block">{title}</span>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">{description}</p>
    </button>
  );
}
