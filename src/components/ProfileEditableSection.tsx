import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, X, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FieldConfig {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

interface ProfileEditableSectionProps {
  userId: string;
  fields: FieldConfig[];
  values: Record<string, string | null | undefined>;
  onSave: (updated: Record<string, string | null>) => void;
  renderView: () => React.ReactNode;
}

export default function ProfileEditableSection({
  userId,
  fields,
  values,
  onSave,
  renderView,
}: ProfileEditableSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const startEditing = () => {
    const initial: Record<string, string> = {};
    fields.forEach(f => {
      initial[f.key] = values[f.key] || '';
    });
    setForm(initial);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setForm({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, string | null> = {};
      fields.forEach(f => {
        const val = form[f.key]?.trim();
        updateData[f.key] = val || null;
      });

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      onSave(updateData);
      setEditing(false);
      toast.success('Dados atualizados com sucesso!');
    } catch {
      toast.error('Erro ao salvar dados.');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={startEditing}
            className="h-7 px-2 text-xs text-primary hover:text-primary/80 gap-1"
          >
            <Pencil className="w-3 h-3" /> Editar
          </Button>
        </div>
        {renderView()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.key} className="space-y-1">
          <Label className="text-xs text-muted-foreground font-body">{f.label}</Label>
          <Input
            type={f.type || 'text'}
            value={form[f.key] || ''}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder || f.label}
            maxLength={f.maxLength || 100}
            className="h-9 rounded-xl text-sm font-body"
          />
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="flex-1 h-9 rounded-xl font-display font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Salvar
        </Button>
        <Button
          onClick={cancel}
          disabled={saving}
          variant="outline"
          size="sm"
          className="h-9 rounded-xl font-display font-bold text-xs gap-1"
        >
          <X className="w-3 h-3" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
