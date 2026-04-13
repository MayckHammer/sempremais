import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, CheckCircle2, Clock, Building2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface ClientRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  cpf: string | null;
  city: string | null;
  state: string | null;
  client_segment: string | null;
  company_name: string | null;
  is_approved: boolean;
  created_at: string;
}

const SEGMENT_LABELS: Record<string, { label: string; color: string }> = {
  b2b: { label: 'Empresário', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  b2c: { label: 'Funcionário', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  b2c_open: { label: 'Público', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400' },
};

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data: clientRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
    if (!clientRoles || clientRoles.length === 0) { setClients([]); setLoading(false); return; }

    const userIds = clientRoles.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, cpf, city, state, client_segment, company_name, is_approved, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });
    setClients((profiles || []) as ClientRow[]);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true } as any).eq('user_id', userId);
    if (error) {
      toast.error('Erro ao aprovar cliente');
      return;
    }
    toast.success('Cliente aprovado!');
    setClients(prev => prev.map(c => c.user_id === userId ? { ...c, is_approved: true } : c));
  };

  const filtered = clients.filter(c => {
    const matchesSearch = !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf?.includes(search) ||
      c.phone?.includes(search) ||
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase());

    const matchesSegment = segmentFilter === 'all' || c.client_segment === segmentFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && c.is_approved) ||
      (statusFilter === 'pending' && !c.is_approved);

    return matchesSearch && matchesSegment && matchesStatus;
  });

  const pendingCount = clients.filter(c => !c.is_approved).length;

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-extrabold text-foreground">
            Clientes ({clients.length})
          </h2>
          {pendingCount > 0 && (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg bg-muted/50 border-border text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'b2b', label: '🏢 Empresário' },
            { key: 'b2c', label: '👥 Funcionário' },
            { key: 'b2c_open', label: '🌐 Público' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setSegmentFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                segmentFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-2">
          {[
            { key: 'all', label: 'Todos status' },
            { key: 'pending', label: '⏳ Pendentes' },
            { key: 'approved', label: '✅ Aprovados' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display font-semibold text-xs">Nome</TableHead>
                <TableHead className="font-display font-semibold text-xs">Segmento</TableHead>
                <TableHead className="font-display font-semibold text-xs">Empresa</TableHead>
                <TableHead className="font-display font-semibold text-xs">Telefone</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cidade</TableHead>
                <TableHead className="font-display font-semibold text-xs">Status</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cadastro</TableHead>
                <TableHead className="font-display font-semibold text-xs w-24">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((c) => {
                const seg = SEGMENT_LABELS[c.client_segment || ''];
                return (
                  <TableRow key={c.user_id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-display font-semibold text-sm text-foreground">{c.full_name || '—'}</TableCell>
                    <TableCell>
                      {seg ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${seg.color}`}>
                          {seg.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-body">{c.company_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-body">{c.phone || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-body">{c.city ? `${c.city}/${c.state}` : '—'}</TableCell>
                    <TableCell>
                      {c.is_approved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-body">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {!c.is_approved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(c.user_id)}
                          className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Aprovar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10 font-body">
                    Nenhum cliente encontrado
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
