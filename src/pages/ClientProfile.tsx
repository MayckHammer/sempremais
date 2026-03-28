import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, MapPin, Car, Crown, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
  sort_order: number;
}

interface ProfileData {
  full_name: string;
  cpf: string | null;
  phone: string | null;
  birth_date: string | null;
  cep: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  vehicle_year: string | null;
  vehicle_color: string | null;
  current_plan_id: string | null;
}

export default function ClientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login/cliente'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [profileRes, plansRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('subscription_plans').select('*').order('sort_order'),
      ]);

      if (profileRes.data) setProfile(profileRes.data as unknown as ProfileData);
      if (plansRes.data) setPlans(plansRes.data as unknown as Plan[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user || upgrading) return;
    setUpgrading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_plan_id: planId })
        .eq('user_id', user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, current_plan_id: planId } : prev);
      toast.success('Plano atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar plano.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  const currentPlan = plans.find(p => p.id === profile?.current_plan_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary pt-14 pb-20 px-4 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cliente')}
            className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-primary-foreground font-display font-bold text-lg">Meu Perfil</h1>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mt-4 relative z-10">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/40 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <p className="text-center text-primary-foreground font-display font-bold text-lg mt-2 relative z-10">
          {profile?.full_name}
        </p>

        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 390 40"
          preserveAspectRatio="none"
          style={{ height: '40px' }}
        >
          <path d="M0,40 L0,0 Q195,45 390,0 L390,40 Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      <div className="px-4 -mt-4 pb-8 space-y-5">
        {/* Dados Pessoais */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-3"
        >
          <h2 className="font-display font-extrabold text-sm text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm font-body">
            <InfoRow label="CPF" value={profile?.cpf} />
            <InfoRow label="Telefone" value={profile?.phone} icon={<Phone className="w-3.5 h-3.5" />} />
            <InfoRow label="Data de Nascimento" value={profile?.birth_date ? new Date(profile.birth_date + 'T12:00:00').toLocaleDateString('pt-BR') : null} />
          </div>
        </motion.div>

        {/* Endereço */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-3"
        >
          <h2 className="font-display font-extrabold text-sm text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Endereço
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm font-body">
            <InfoRow label="CEP" value={profile?.cep} />
            <InfoRow label="Rua" value={profile?.street ? `${profile.street}${profile.street_number ? `, ${profile.street_number}` : ''}` : null} />
            <InfoRow label="Complemento" value={profile?.complement} />
            <InfoRow label="Bairro" value={profile?.neighborhood} />
            <InfoRow label="Cidade" value={profile?.city ? `${profile.city}${profile.state ? ` - ${profile.state}` : ''}` : null} />
          </div>
        </motion.div>

        {/* Veículo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-3"
        >
          <h2 className="font-display font-extrabold text-sm text-foreground flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" /> Veículo
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm font-body">
            <InfoRow label="Marca" value={profile?.vehicle_brand} />
            <InfoRow label="Modelo" value={profile?.vehicle_model} />
            <InfoRow label="Placa" value={profile?.vehicle_plate} />
            <InfoRow label="Ano" value={profile?.vehicle_year} />
            <InfoRow label="Cor" value={profile?.vehicle_color} />
          </div>
        </motion.div>

        {/* Meu Plano */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display font-extrabold text-base text-foreground flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-primary" /> Meu Plano
          </h2>

          <div className="space-y-3">
            {plans.map((plan, i) => {
              const isCurrentPlan = plan.id === profile?.current_plan_id;
              const isPremium = i === plans.length - 1;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-4 transition-all ${
                    isCurrentPlan
                      ? 'border-primary bg-primary/5 shadow-md'
                      : isPremium
                        ? 'border-accent/60 bg-accent/5'
                        : 'border-border/60 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isPremium && <Star className="w-4 h-4 text-accent fill-accent" />}
                      <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                      {isCurrentPlan && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                          ATUAL
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-display font-extrabold text-foreground">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-muted-foreground font-body">/mês</span>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-muted-foreground font-body mb-3">{plan.description}</p>
                  )}

                  <ul className="space-y-1.5 mb-3">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs font-body text-foreground">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={upgrading}
                      className={`w-full rounded-xl h-10 font-display font-bold text-sm ${
                        isPremium
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {isPremium ? 'Fazer Upgrade' : 'Selecionar Plano'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className="text-foreground font-medium">{value || '—'}</span>
    </div>
  );
}
