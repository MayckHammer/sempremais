import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, DollarSign } from 'lucide-react';

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque (Guincho)',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

interface PricingRow {
  id: string;
  service_type: string;
  subscriber_price: number;
  non_subscriber_price: number;
}

export default function AdminPricingTab() {
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    const { data } = await supabase.from('service_pricing').select('*');
    if (data) setPricing(data as unknown as PricingRow[]);
    setLoading(false);
  };

  const handlePriceChange = (id: string, field: 'subscriber_price' | 'non_subscriber_price', value: string) => {
    const numValue = parseFloat(value) || 0;
    setPricing(prev => prev.map(p => p.id === id ? { ...p, [field]: numValue } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const row of pricing) {
        const { error } = await supabase
          .from('service_pricing')
          .update({
            subscriber_price: row.subscriber_price,
            non_subscriber_price: row.non_subscriber_price,
          })
          .eq('id', row.id);
        if (error) throw error;
      }
      toast.success('Preços atualizados com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar preços: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-primary" /> Tabela de Preços
        </h3>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gradient-primary h-8 text-xs font-display font-bold btn-glow rounded-lg">
          <Save className="w-3.5 h-3.5 mr-1" /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs text-muted-foreground font-display font-semibold px-1">
        <span>Serviço</span>
        <span className="text-center">Assinante (R$)</span>
        <span className="text-center">Avulso (R$)</span>
      </div>

      {pricing.map((row) => (
        <Card key={row.id} className="bg-card border-border shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-xs font-display font-semibold text-foreground truncate">
                {serviceLabels[row.service_type] || row.service_type}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={row.subscriber_price}
                onChange={(e) => handlePriceChange(row.id, 'subscriber_price', e.target.value)}
                className="h-8 text-xs text-center rounded-lg bg-muted/50 border-border"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={row.non_subscriber_price}
                onChange={(e) => handlePriceChange(row.id, 'non_subscriber_price', e.target.value)}
                className="h-8 text-xs text-center rounded-lg bg-muted/50 border-border"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
