import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search } from 'lucide-react';

interface ClientRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  cpf: string | null;
  city: string | null;
  state: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  created_at: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    // Get all client user_ids
    const { data: clientRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
    if (!clientRoles || clientRoles.length === 0) { setClients([]); setLoading(false); return; }

    const userIds = clientRoles.map(r => r.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds).order('created_at', { ascending: false });
    setClients((profiles || []) as ClientRow[]);
    setLoading(false);
  };

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf?.includes(search) ||
    c.phone?.includes(search) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-extrabold text-foreground">Clientes ({clients.length})</h2>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg bg-muted/50 border-border text-sm"
          />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display font-semibold text-xs">Nome</TableHead>
                <TableHead className="font-display font-semibold text-xs">Telefone</TableHead>
                <TableHead className="font-display font-semibold text-xs">CPF</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cidade</TableHead>
                <TableHead className="font-display font-semibold text-xs">Veículo</TableHead>
                <TableHead className="font-display font-semibold text-xs">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((c) => (
                <TableRow key={c.user_id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-display font-semibold text-sm text-foreground">{c.full_name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">{c.phone || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">{c.cpf || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">{c.city ? `${c.city}/${c.state}` : '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">
                    {c.vehicle_brand ? `${c.vehicle_brand} ${c.vehicle_model || ''} ${c.vehicle_plate ? `(${c.vehicle_plate})` : ''}` : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-body">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10 font-body">
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
