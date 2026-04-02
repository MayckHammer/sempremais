import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Clock, AlertTriangle, Headphones, CheckCircle, Search } from 'lucide-react';

interface Ticket {
  id: string;
  client_id: string;
  status: string;
  summary: string | null;
  trigger_words: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_agent_id: string | null;
  profiles?: { full_name: string };
  message_count?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  agent_handling: { label: 'Agente IA', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: MessageCircle },
  analysis: { label: 'Em Análise', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
  human_handling: { label: 'Atendente', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Headphones },
  resolved: { label: 'Resolvido', color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle },
  closed: { label: 'Encerrado', color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle },
};

export default function AdminSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter as any);
    }

    const { data } = await query;
    if (data) {
      // Fetch profile names
      const clientIds = [...new Set(data.map((t: any) => t.client_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', clientIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));

      setTickets(
        data.map((t: any) => ({
          ...t,
          profiles: { full_name: profileMap.get(t.client_id) || 'Cliente' },
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  // Realtime for ticket updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'agent_handling', label: 'Agente IA' },
    { key: 'analysis', label: 'Em Análise' },
    { key: 'human_handling', label: 'Atendente' },
    { key: 'resolved', label: 'Resolvidos' },
  ];

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.trim().replace(/^#/, '');
    return tickets.filter(t => {
      const num = String((t as any).ticket_number || 0);
      const padded = num.padStart(5, '0');
      return num.includes(q) || padded.includes(q) || (t.profiles?.full_name || '').toLowerCase().includes(q.toLowerCase());
    });
  }, [tickets, search]);

  const counts = {
    all: tickets.length,
    agent_handling: tickets.filter(t => t.status === 'agent_handling').length,
    analysis: tickets.filter(t => t.status === 'analysis').length,
    human_handling: tickets.filter(t => t.status === 'human_handling').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-display font-bold text-foreground shrink-0">Suporte</h1>
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="#00001 ou nome..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {f.label} ({counts[f.key as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      {/* Tickets list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {search.trim() ? 'Nenhum ticket encontrado para essa busca' : 'Nenhum ticket encontrado'}
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.agent_handling;
            const StatusIcon = statusConf.icon;
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate(`/admin/support/${ticket.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-primary font-bold">
                          #{String((ticket as any).ticket_number || 0).padStart(5, '0')}
                        </span>
                        <span className="font-semibold text-sm text-foreground truncate">
                          {ticket.profiles?.full_name || 'Cliente'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>
                      {ticket.trigger_words && ticket.trigger_words.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {ticket.trigger_words.map((w, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
