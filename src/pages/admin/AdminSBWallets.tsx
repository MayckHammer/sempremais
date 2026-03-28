import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Coins, Search, Plus, Minus } from 'lucide-react';

interface WalletRow {
  id: string;
  user_id: string;
  balance: number;
  profile?: { full_name: string; phone: string | null };
}

export default function AdminSBWallets() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletRow | null>(null);
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'earned' | 'spent'>('earned');
  const [txDescription, setTxDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [walletsRes, txRes] = await Promise.all([
      supabase.from('sb_wallets').select('*'),
      supabase.from('sb_transactions').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (walletsRes.data && walletsRes.data.length > 0) {
      const userIds = walletsRes.data.map(w => w.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setWallets(walletsRes.data.map(w => ({ ...w, profile: profileMap.get(w.user_id) as any })));
    } else {
      setWallets([]);
    }

    setTransactions(txRes.data || []);
    setLoading(false);
  };

  const openCreditDebit = (wallet: WalletRow) => {
    setSelectedWallet(wallet);
    setTxAmount('');
    setTxType('earned');
    setTxDescription('');
    setModalOpen(true);
  };

  const handleTransaction = async () => {
    if (!selectedWallet || !txAmount) return;
    setSubmitting(true);

    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Valor inválido'); setSubmitting(false); return; }

    // Insert transaction
    const { error: txError } = await supabase.from('sb_transactions').insert({
      user_id: selectedWallet.user_id,
      amount,
      type: txType,
      description: txDescription || (txType === 'earned' ? 'Crédito manual (admin)' : 'Débito manual (admin)'),
    });

    if (txError) { toast.error('Erro ao registrar transação'); setSubmitting(false); return; }

    // Update wallet balance
    const newBalance = txType === 'earned'
      ? selectedWallet.balance + amount
      : Math.max(0, selectedWallet.balance - amount);

    const { error: walletError } = await supabase.from('sb_wallets').update({ balance: newBalance }).eq('id', selectedWallet.id);

    if (walletError) { toast.error('Erro ao atualizar saldo'); } else {
      toast.success(`SBs ${txType === 'earned' ? 'creditados' : 'debitados'} com sucesso!`);
    }

    setModalOpen(false);
    setSubmitting(false);
    fetchData();
  };

  const filtered = wallets.filter(w =>
    w.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.profile?.phone?.includes(search)
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-xl shimmer" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Wallets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-display font-extrabold text-foreground">Carteiras SBs ({wallets.length})</h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg bg-muted/50 border-border text-sm" />
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-display font-semibold text-xs">Usuário</TableHead>
                  <TableHead className="font-display font-semibold text-xs">Telefone</TableHead>
                  <TableHead className="font-display font-semibold text-xs">Saldo SBs</TableHead>
                  <TableHead className="font-display font-semibold text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? filtered.map((w) => (
                  <TableRow key={w.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-display font-semibold text-sm text-foreground">{w.profile?.full_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-body">{w.profile?.phone || '—'}</TableCell>
                    <TableCell>
                      <span className="font-display font-extrabold text-gold">{Number(w.balance).toFixed(0)} SBs</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => openCreditDebit(w)} size="sm" variant="outline"
                        className="h-7 px-3 text-xs rounded-lg border-gold/30 text-gold hover:bg-gold/10 font-display font-bold">
                        <Coins className="w-3 h-3 mr-1" /> Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10 font-body">
                      Nenhuma carteira encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display font-bold">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display font-semibold text-xs">Tipo</TableHead>
                <TableHead className="font-display font-semibold text-xs">Valor</TableHead>
                <TableHead className="font-display font-semibold text-xs">Descrição</TableHead>
                <TableHead className="font-display font-semibold text-xs">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-border">
                  <TableCell>
                    <Badge className={tx.type === 'earned' ? 'bg-primary/15 text-primary text-[10px]' : 'bg-destructive/15 text-destructive text-[10px]'}>
                      {tx.type === 'earned' ? <><Plus className="w-3 h-3 mr-0.5" /> Crédito</> : <><Minus className="w-3 h-3 mr-0.5" /> Débito</>}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-display font-bold text-sm text-foreground">{Number(tx.amount).toFixed(0)} SBs</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-body">{tx.description || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-body">
                    {new Date(tx.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Credit/Debit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Gerenciar SBs — {selectedWallet?.profile?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center">
              <span className="text-2xl font-display font-extrabold text-gold">{Number(selectedWallet?.balance || 0).toFixed(0)} SBs</span>
              <p className="text-xs text-muted-foreground">Saldo atual</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-display font-semibold">Tipo</Label>
              <Select value={txType} onValueChange={(v) => setTxType(v as 'earned' | 'spent')}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned">Creditar (adicionar)</SelectItem>
                  <SelectItem value="spent">Debitar (remover)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-display font-semibold">Quantidade de SBs</Label>
              <Input type="number" min="1" value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                className="h-9 rounded-lg" placeholder="Ex: 10" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-display font-semibold">Descrição (opcional)</Label>
              <Input value={txDescription} onChange={(e) => setTxDescription(e.target.value)}
                className="h-9 rounded-lg" placeholder="Motivo da transação" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-lg">Cancelar</Button>
            <Button onClick={handleTransaction} disabled={submitting} className="gradient-primary font-display font-bold btn-glow rounded-lg">
              {submitting ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
