import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  playChatStarted,
  playChatMessage,
  playAnalysisNeeded,
  playHumanEscalation,
  playCriticalUrgency,
} from '@/lib/adminSounds';
import { AlertTriangle, MessageSquare, Headphones, Siren, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminNotificationCenter() {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [unread, setUnread] = useState(0);
  const knownTickets = useRef(new Set<string>());
  const initialized = useRef(false);

  const playSound = useCallback(
    (fn: () => void) => {
      if (!muted) fn();
    },
    [muted]
  );

  useEffect(() => {
    // Load existing ticket IDs first to avoid alerting on old data
    const init = async () => {
      const { data } = await supabase
        .from('support_tickets')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(200);
      data?.forEach((t) => knownTickets.current.add(t.id));
      initialized.current = true;
    };
    init();

    // 1) Listen for new/updated support tickets
    const ticketChannel = supabase
      .channel('admin-tickets-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_tickets' },
        (payload) => {
          if (!initialized.current) return;
          const ticket = payload.new as any;
          knownTickets.current.add(ticket.id);
          setUnread((u) => u + 1);
          playSound(playChatStarted);
          toast(
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/admin/support/${ticket.id}`)}
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">Novo chat iniciado</p>
                <p className="text-xs text-muted-foreground">
                  Chamado #{ticket.ticket_number}
                </p>
              </div>
            </div>,
            { duration: 6000 }
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        (payload) => {
          if (!initialized.current) return;
          const ticket = payload.new as any;
          const old = payload.old as any;

          // Escalation to analysis
          if (old.status !== 'analysis' && ticket.status === 'analysis') {
            setUnread((u) => u + 1);
            playSound(playAnalysisNeeded);
            toast(
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/admin/support/${ticket.id}`)}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-yellow-500">
                    Chamado precisa de análise
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chamado #{ticket.ticket_number} — palavras-gatilho detectadas
                  </p>
                </div>
              </div>,
              { duration: 1000 }
            );
          }

          // Escalation to human handling — most urgent
          if (old.status !== 'human_handling' && ticket.status === 'human_handling') {
            setUnread((u) => u + 1);
            playSound(playHumanEscalation);
            toast(
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/admin/support/${ticket.id}`)}
              >
                <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center shrink-0 animate-pulse">
                  <Headphones className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-destructive">
                    ⚠️ Atendente humano necessário!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chamado #{ticket.ticket_number} — cliente solicita atendimento humano
                  </p>
                </div>
              </div>,
              { duration: 3000 }
            );
          }
        }
      )
      .subscribe();

    // 2) Listen for new chat messages (client messages only)
    const msgChannel = supabase
      .channel('admin-messages-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (!initialized.current) return;
          const msg = payload.new as any;
          if (msg.sender_type === 'client') {
            playSound(playChatMessage);
          }
        }
      )
      .subscribe();

    // 3) Listen for critical urgency on service requests
    const requestChannel = supabase
      .channel('admin-requests-notifications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'service_requests' },
        (payload) => {
          if (!initialized.current) return;
          const req = payload.new as any;
          const old = payload.old as any;

          if (old.urgency !== 'critical' && req.urgency === 'critical') {
            setUnread((u) => u + 1);
            playSound(playCriticalUrgency);
            toast(
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/admin/requests')}
              >
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 animate-pulse">
                  <Siren className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-destructive animate-pulse">
                    🚨 Solicitação CRÍTICA!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.client_name} — {req.service_type}
                  </p>
                </div>
              </div>,
              { duration: 20000 }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(requestChannel);
    };
  }, [navigate, playSound]);

  return (
    <div className="flex items-center gap-2">
      {/* Notification bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setUnread(0);
            navigate('/admin/support');
          }}
        >
          <Bell className="w-4 h-4" />
        </Button>
        {unread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[9px] bg-destructive text-destructive-foreground font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </Badge>
        )}
      </div>

      {/* Mute toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${muted ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
        onClick={() => setMuted(!muted)}
        title={muted ? 'Ativar sons' : 'Silenciar notificações'}
      >
        {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      </Button>
    </div>
  );
}
