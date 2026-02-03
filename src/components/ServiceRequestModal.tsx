import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';

interface ServiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  serviceType: string;
  serviceTitle: string;
  location: { address: string; lat: number; lng: number };
  onSubmit: (data: {
    clientName: string;
    clientPhone: string;
    vehicleInfo: string;
    description: string;
  }) => Promise<void>;
}

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  destombamento: 'Destombamento',
  frete_pequeno: 'Frete Pequeno',
  frete_grande: 'Frete Grande',
};

export function ServiceRequestModal({
  open,
  onClose,
  serviceType,
  location,
  onSubmit,
}: ServiceRequestModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({ clientName, clientPhone, vehicleInfo, description });
      setClientName('');
      setClientPhone('');
      setVehicleInfo('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg mx-3 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-foreground">
            Solicitar {serviceLabels[serviceType] || serviceType}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="clientName" className="text-sm">Seu Nome</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
              className="bg-muted border-border h-10 sm:h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="clientPhone" className="text-sm">Telefone/WhatsApp</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              required
              className="bg-muted border-border h-10 sm:h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="vehicleInfo" className="text-sm">Informações do Veículo</Label>
            <Input
              id="vehicleInfo"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              placeholder="Ex: Honda Civic 2020 - Prata"
              className="bg-muted border-border h-10 sm:h-11 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm">Descrição do Problema</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema..."
              required
              className="bg-muted border-border resize-none text-sm min-h-[70px] sm:min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Local do atendimento</p>
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{location.address}</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary h-10 sm:h-11 text-sm" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
