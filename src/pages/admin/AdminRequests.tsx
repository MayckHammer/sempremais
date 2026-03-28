import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, Search, MapPin, Star, Phone } from 'lucide-react';

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque', chaveiro: 'Chaveiro', borracheiro: 'Borracheiro',
  destombamento: 'Destombamento', frete_pequeno: 'Frete Pequeno', frete_grande: 'Frete Grande',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-gold/15 text-gold' },
  accepted: { label: 'Aceito', color: 'bg-primary/15 text-primary' },
  in_progress: { label: 'Em Andamento', color: 'bg-glow/15 text-glow' },
  completed: { label: 'Concluído', color: 'bg-primary/15 text-primary' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/15 text-destructive' },
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase()) ||
      r.client_phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesService = serviceFilter === 'all' || r.service_type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-extrabold text-foreground">Solicitações ({requests.length})</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 rounded-lg bg-muted/50 border-border text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {Object.entries(statusConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40 h-9 rounded-lg bg-muted/50 border-border text-sm">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos serviços</SelectItem>
              {Object.entries(serviceLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente, endereço..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg bg-muted/50 border-border text-sm" />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display font-semibold text-xs">Serviço</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cliente</TableHead>
                <TableHead className="font-display font-semibold text-xs">Endereço</TableHead>
                <TableHead className="font-display font-semibold text-xs">Status</TableHead>
                <TableHead className="font-display font-semibold text-xs">Preço</TableHead>
                <TableHead className="font-display font-semibold text-xs">Avaliação</TableHead>
                <TableHead className="font-display font-semibold text-xs">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((r) => {
                const st = statusConfig[r.status] || { label: r.status, color: 'bg-muted text-muted-foreground' };
                return (
                  <TableRow key={r.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-display font-semibold text-sm text-foreground">
                      {serviceLabels[r.service_type] || r.service_type}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-display font-medium text-foreground">{r.client_name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {r.client_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground font-body flex items-center gap-1 max-w-[200px] truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {r.address}
                      </p>
                    </TableCell>
                    <TableCell><Badge className={`${st.color} text-[10px] font-semibold`}>{st.label}</Badge></TableCell>
                    <TableCell className="text-sm text-foreground font-body">
                      {r.price ? `R$ ${Number(r.price).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>
                      {r.rating ? (
                        <span className="flex items-center gap-0.5 text-gold text-sm">
                          <Star className="w-3 h-3 fill-current" /> {r.rating}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-body">
                      {new Date(r.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10 font-body">
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
