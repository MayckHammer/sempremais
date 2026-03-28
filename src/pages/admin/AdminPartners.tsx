import { Handshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminPartners() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Handshake className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-extrabold text-foreground">Parceiros</h2>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            Módulo de gestão de parceiros em desenvolvimento.
          </p>
          <p className="text-xs text-muted-foreground/60 font-body mt-1">
            Em breve: cadastro, gerenciamento e acompanhamento de parceiros da plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
