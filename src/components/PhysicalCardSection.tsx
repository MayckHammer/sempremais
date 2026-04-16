import { useEffect, useState } from 'react';
import { CreditCard, Wifi, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface PhysicalCard {
  id: string;
  card_number: string;
  status: string;
  is_replacement: boolean;
  amount_paid: number;
  created_at: string;
}

const generateCardNumber = () => {
  const segments = Array.from({ length: 4 }, () =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  return segments.join(' ');
};

const maskCardNumber = (num: string, show: boolean) => {
  if (show) return num;
  const parts = num.split(' ');
  if (parts.length < 4) return '•••• •••• •••• ••••';
  return `${parts[0]} •••• •••• ${parts[3]}`;
};

const getValidityDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 5);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
};

export function PhysicalCardSection() {
  const { user } = useAuth();
  const [card, setCard] = useState<PhysicalCard | null>(null);
  const [profileName, setProfileName] = useState('ASSOCIADO');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const [cardRes, profileRes] = await Promise.all([
        supabase
          .from('physical_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
      ]);

      if (cardRes.data && cardRes.data.length > 0) {
        setCard(cardRes.data[0] as unknown as PhysicalCard);
      }

      if (profileRes.data) {
        setProfileName(profileRes.data.full_name || 'ASSOCIADO');
      }
      setLoading(false);
    };

    fetch();
  }, [user]);

  const handleRequest = async (isReplacement: boolean) => {
    if (!user) return;
    setRequesting(true);

    const amount = isReplacement ? 32.0 : 19.9;
    const cardNumber = generateCardNumber();

    const { error } = await supabase.from('physical_cards').insert({
      user_id: user.id,
      card_number: cardNumber,
      is_replacement: isReplacement,
      amount_paid: amount,
    });

    if (error) {
      toast({ title: 'Erro ao solicitar cartão', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cartão solicitado!', description: `Valor: R$ ${amount.toFixed(2).replace('.', ',')}` });
      const { data } = await supabase
        .from('physical_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setCard(data[0] as unknown as PhysicalCard);
    }
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Cartão Físico</h3>
        <div className="h-52 rounded-2xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  const displayName = showDetails ? profileName : '•••••••••••';
  const displayNumber = card
    ? maskCardNumber(card.card_number, showDetails)
    : '•••• •••• •••• ••••';
  const isPending = card?.status === 'pending';
  const isActive = card?.status === 'active';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">Cartão Físico</h3>
          {card && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {isPending && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0 text-[10px]">
            Em produção
          </Badge>
        )}
        {isActive && (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 text-[10px]">
            Ativo
          </Badge>
        )}
      </div>

      {/* Card visual */}
      <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden select-none"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #132744 40%, #1a3a5c 70%, #0d2137 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(100,180,255,0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-white/60 uppercase">Sempre</p>
              <p className="text-base font-extrabold tracking-wide text-white -mt-0.5">BENEFÍCIOS</p>
            </div>
            <Wifi className="w-6 h-6 text-white/40 rotate-90" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300/80 to-amber-500/60 border border-amber-400/30" />
          </div>

          <p className="text-sm font-mono tracking-[0.15em] text-white/50">{displayNumber}</p>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-wider text-secondary">Nome do associado</p>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wide">{displayName}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-wider text-secondary">Validade</p>
              <p className="text-xs font-bold text-white/50">{showDetails ? getValidityDate() : '••/••'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!card ? (
        <Button
          className="w-full rounded-2xl h-12"
          onClick={() => handleRequest(false)}
          disabled={requesting}
        >
          {requesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
          Solicitar Cartão — R$ 19,90
        </Button>
      ) : isActive ? (
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 border-border/60"
          onClick={() => handleRequest(true)}
          disabled={requesting}
        >
          {requesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
          Solicitar 2ª Via — R$ 32,00
        </Button>
      ) : null}

      {/* Support notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/50 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30 p-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
          Em caso de perda ou bloqueio do cartão físico, entre em contato com o <span className="font-semibold">suporte na página inicial</span> do app.
        </p>
      </div>
    </div>
  );
}
