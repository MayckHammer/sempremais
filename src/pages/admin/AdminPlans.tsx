import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Crown, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order');
    if (data) setPlans(data as unknown as Plan[]);
    setLoading(false);
  };

  const handleUpdate = async (plan: Plan) => {
    setSaving(plan.id);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: plan.name,
          price: plan.price,
          description: plan.description,
          features: plan.features,
          is_active: plan.is_active,
          sort_order: plan.sort_order,
        })
        .eq('id', plan.id);

      if (error) throw error;
      toast.success(`Plano "${plan.name}" salvo!`);
    } catch {
      toast.error('Erro ao salvar plano.');
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    const maxOrder = plans.reduce((max, p) => Math.max(max, p.sort_order), 0);
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({ name: 'Novo Plano', price: 0, features: [], sort_order: maxOrder + 1 })
      .select()
      .single();

    if (error) { toast.error('Erro ao criar plano.'); return; }
    if (data) {
      setPlans(prev => [...prev, data as unknown as Plan]);
      toast.success('Plano criado!');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir.'); return; }
    setPlans(prev => prev.filter(p => p.id !== id));
    toast.success('Plano excluído.');
  };

  const updateField = (id: string, field: keyof Plan, value: unknown) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-extrabold text-foreground">Planos de Assinatura</h2>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5 rounded-xl">
          <Plus className="w-4 h-4" /> Novo Plano
        </Button>
      </div>

      <div className="space-y-4 max-w-2xl">
        {plans.map(plan => (
          <div key={plan.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Input
                value={plan.name}
                onChange={e => updateField(plan.id, 'name', e.target.value)}
                className="font-display font-bold rounded-xl"
                placeholder="Nome do plano"
              />
              <div className="flex items-center gap-2 shrink-0">
                <Label htmlFor={`active-${plan.id}`} className="text-xs text-muted-foreground">Ativo</Label>
                <Switch
                  id={`active-${plan.id}`}
                  checked={plan.is_active}
                  onCheckedChange={v => updateField(plan.id, 'is_active', v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={plan.price}
                  onChange={e => updateField(plan.id, 'price', parseFloat(e.target.value) || 0)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ordem</Label>
                <Input
                  type="number"
                  value={plan.sort_order}
                  onChange={e => updateField(plan.id, 'sort_order', parseInt(e.target.value) || 0)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Textarea
                value={plan.description || ''}
                onChange={e => updateField(plan.id, 'description', e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Benefícios (um por linha)</Label>
              <Textarea
                value={plan.features.join('\n')}
                onChange={e => updateField(plan.id, 'features', e.target.value.split('\n').filter(Boolean))}
                className="rounded-xl resize-none"
                rows={4}
                placeholder="Assistência 24h&#10;Reboque até 100km"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(plan.id)}
                className="gap-1.5 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdate(plan)}
                disabled={saving === plan.id}
                className="gap-1.5 rounded-xl"
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
