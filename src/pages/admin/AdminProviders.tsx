import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wrench, Search, CheckCircle, XCircle, Star } from 'lucide-react';

const serviceLabels: Record<string, string> = {
  reboque: 'Reboque', chaveiro: 'Chaveiro', borracheiro: 'Borracheiro',
  destombamento: 'Destombamento', frete_pequeno: 'Frete Pequeno', frete_grande: 'Frete Grande',
};

interface ProviderRow {
  id: string;
  user_id: string;
  is_approved: boolean;
  total_jobs: number;
  average_rating: number;
  services: string[];
  address: string | null;
  created_at: string;
  profile?: { full_name: string; phone: string | null };
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    setLoading(true);
    const { data } = await supabase.from('providers').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setProviders(data.map(p => ({ ...p, profile: profileMap.get(p.user_id) as any })));
    } else {
      setProviders([]);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('providers').update({ is_approved: true }).eq('id', id);
    if (error) toast.error('Erro ao aprovar');
    else { toast.success('Prestador aprovado!'); fetchProviders(); }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('providers').update({ is_approved: false }).eq('id', id);
    if (error) toast.error('Erro ao rejeitar');
    else { toast.success('Aprovação revogada'); fetchProviders(); }
  };

  const filtered = providers.filter(p => {
    const matchesSearch = p.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'approved' && p.is_approved) || (statusFilter === 'pending' && !p.is_approved);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-glow" />
          <h2 className="text-lg font-display font-extrabold text-foreground">Prestadores ({providers.length})</h2>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 rounded-lg bg-muted/50 border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg bg-muted/50 border-border text-sm" />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display font-semibold text-xs">Nome</TableHead>
                <TableHead className="font-display font-semibold text-xs">Serviços</TableHead>
                <TableHead className="font-display font-semibold text-xs">Status</TableHead>
                <TableHead className="font-display font-semibold text-xs">Avaliação</TableHead>
                <TableHead className="font-display font-semibold text-xs">Jobs</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cadastro</TableHead>
                <TableHead className="font-display font-semibold text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((p) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">{p.profile?.full_name || 'Sem nome'}</p>
                      {p.profile?.phone && <p className="text-[10px] text-muted-foreground">{p.profile.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.services.map(s => (
                        <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{serviceLabels[s] || s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={p.is_approved ? 'bg-primary/15 text-primary text-[10px]' : 'bg-gold/15 text-gold text-[10px]'}>
                      {p.is_approved ? 'Aprovado' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-foreground">
                      <Star className="w-3 h-3 text-gold fill-gold" /> {Number(p.average_rating).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">{p.total_jobs}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-body">{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    {!p.is_approved ? (
                      <Button onClick={() => handleApprove(p.id)} size="sm" className="h-7 px-3 text-xs gradient-primary font-display font-bold btn-glow rounded-lg">
                        <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                      </Button>
                    ) : (
                      <Button onClick={() => handleReject(p.id)} variant="outline" size="sm" className="h-7 px-3 text-xs rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">
                        <XCircle className="w-3 h-3 mr-1" /> Revogar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10 font-body">
                    Nenhum prestador encontrado
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
