import AdminPricingTab from '@/components/AdminPricingTab';
import { DollarSign } from 'lucide-react';

export default function AdminPricing() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-extrabold text-foreground">Tabela de Preços</h2>
      </div>
      <div className="max-w-2xl">
        <AdminPricingTab />
      </div>
    </div>
  );
}
