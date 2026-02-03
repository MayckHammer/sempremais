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
        "service-card gradient-card p-4 rounded-2xl border border-border",
        "hover:border-primary/50 text-center group transition-all duration-300",
        "hover:-translate-y-1"
      )}
    >
      <div className={cn(
        "w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center",
        "transition-colors",
        colorClass
      )}>
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </button>
  );
}
