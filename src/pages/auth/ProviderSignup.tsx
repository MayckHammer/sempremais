import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, User, Truck, MapPin, Clock,
  CheckCircle2, Loader2, Shield, Phone, Mail, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { signUp, SignUpExtraData } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

type ServiceType = 'reboque' | 'chaveiro' | 'borracheiro' | 'destombamento' | 'frete_pequeno' | 'frete_grande';

const SERVICE_OPTIONS: { key: ServiceType; label: string; icon: string; desc: string }[] = [
  { key: 'reboque', label: 'Reboque / Guincho', icon: '🚛', desc: 'Transporte de veículos' },
  { key: 'chaveiro', label: 'Chaveiro Automotivo', icon: '🔑', desc: 'Abertura e cópias de chaves' },
  { key: 'borracheiro', label: 'Borracheiro', icon: '🔧', desc: 'Pneus e aro' },
  { key: 'destombamento', label: 'Destombamento', icon: '🏗️', desc: 'Veículos tombados ou atolados' },
  { key: 'frete_pequeno', label: 'Frete Pequeno', icon: '📦', desc: 'Cargas leves até 500kg' },
  { key: 'frete_grande', label: 'Frete Grande', icon: '🚚', desc: 'Cargas pesadas acima de 500kg' },
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  services: ServiceType[];
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  cep: string;
  city: string;
  state: string;
  coverageRadius: string;
  available24h: boolean;
  acceptTerms: boolean;
}

const INITIAL: FormData = {
  fullName: '', email: '', password: '', phone: '', cpf: '',
  services: [], vehicleType: '', vehiclePlate: '', vehicleModel: '',
  cep: '', city: '', state: '', coverageRadius: '50',
  available24h: false, acceptTerms: false,
};

const VEHICLE_TYPES = ['Carro', 'Moto', 'Van', 'Caminhão leve', 'Caminhão pesado', 'Guincho simples', 'Guincho plataforma'];

export default function ProviderSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleService = (svc: ServiceType) =>
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc],
    }));

  const handleSubmit = async () => {
    if (!form.acceptTerms) {
      toast({ title: 'Aceite os termos para continuar', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const extra: SignUpExtraData = {
        cep: form.cep,
        city: form.city,
        state: form.state,
        vehicle_model: form.vehicleModel,
        vehicle_plate: form.vehiclePlate,
      };
      await signUp(form.email, form.password, 'provider', form.fullName, form.phone, extra);
      toast({
        title: '✅ Cadastro realizado!',
        description: 'Seu perfil está em análise. Entraremos em contato em até 24h.',
      });
      navigate('/login/prestador');
    } catch (err: any) {
      toast({ title: 'Erro no cadastro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Dados' },
    { num: 2, label: 'Serviços' },
    { num: 3, label: 'Veículo' },
    { num: 4, label: 'Área' },
  ];

  const canAdvance: Record<number, boolean> = {
    1: !!(form.fullName && form.email && form.password && form.phone),
    2: form.services.length > 0,
    3: !!(form.vehicleType && form.vehiclePlate),
    4: !!(form.city && form.state && form.acceptTerms),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 pt-14 pb-10 px-5 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-40px] left-[-30px] w-[150px] h-[150px] rounded-full bg-white/5" />

        <button
          onClick={() => step > 1 ? setStep(s => (s - 1) as Step) : navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Seja um prestador</h1>
            <p className="text-white/60 text-sm">Assistência veicular 24h — Sempre+</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mt-6">
          {steps.map(({ num, label }) => (
            <div key={num} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === num ? 'bg-white text-emerald-700'
                  : step > num ? 'bg-emerald-400 text-white'
                  : 'bg-white/20 text-white/50'
              }`}>
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              <span className="text-[10px] text-white/60 hidden sm:inline">{label}</span>
              {num < 4 && <div className={`w-6 h-0.5 ${step > num ? 'bg-emerald-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-6">
        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-foreground">Dados pessoais</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Nome completo *</Label>
                  <Input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="Seu nome completo" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">CPF</Label>
                  <Input value={form.cpf} onChange={e => set('cpf', e.target.value)}
                    placeholder="000.000.000-00" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email *
                  </Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="seu@email.com" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Senha *
                  </Label>
                  <Input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Phone className="w-3 h-3" /> WhatsApp *
                  </Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="(34) 99999-9999" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-foreground">Serviços que você oferece</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Selecione um ou mais serviços</p>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map(({ key, label, icon, desc }) => (
                  <button key={key} onClick={() => toggleService(key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      form.services.includes(key)
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-border bg-muted/30 hover:border-emerald-500/30'
                    }`}>
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 border-border">
                      {form.services.includes(key) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-foreground">Dados do veículo</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo de veículo *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {VEHICLE_TYPES.map(vt => (
                      <button key={vt} onClick={() => set('vehicleType', vt)}
                        className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                          form.vehicleType === vt
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-emerald-500/30'
                        }`}>
                        {vt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Placa do veículo *</Label>
                  <Input value={form.vehiclePlate} onChange={e => set('vehiclePlate', e.target.value.toUpperCase())}
                    placeholder="ABC-1234 ou ABC1D23" maxLength={8}
                    className="rounded-xl h-12 bg-muted/50 border-border uppercase" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Modelo</Label>
                  <Input value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)}
                    placeholder="Ex: Volkswagen Gol 2020" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-foreground">Área de atendimento</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">CEP</Label>
                  <Input value={form.cep} onChange={e => set('cep', e.target.value)}
                    placeholder="38400-000" maxLength={9} className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Cidade *</Label>
                    <Input value={form.city} onChange={e => set('city', e.target.value)}
                      placeholder="Uberlândia" className="rounded-xl h-12 bg-muted/50 border-border" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Estado *</Label>
                    <Input value={form.state} onChange={e => set('state', e.target.value.toUpperCase())}
                      placeholder="MG" maxLength={2} className="rounded-xl h-12 bg-muted/50 border-border uppercase" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Raio de cobertura: {form.coverageRadius}km
                  </Label>
                  <input type="range" min="10" max="300" value={form.coverageRadius}
                    onChange={e => set('coverageRadius', e.target.value)}
                    className="w-full accent-emerald-600" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>10km</span><span>150km</span><span>300km</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Disponível 24h</p>
                      <p className="text-xs text-muted-foreground">Receber chamados à noite e fins de semana</p>
                    </div>
                  </div>
                  <Switch checked={form.available24h} onCheckedChange={v => set('available24h', v)} />
                </div>

                <button onClick={() => set('acceptTerms', !form.acceptTerms)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                    form.acceptTerms ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-muted/30'
                  }`}>
                  <div className="w-5 h-5 rounded border-2 border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    {form.acceptTerms && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Concordo com os <span className="text-primary font-medium">Termos de uso</span> e{' '}
                    <span className="text-primary font-medium">Política de privacidade</span> da Sempre+.
                    Confirmo que meus dados são verídicos.
                  </p>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6">
          {step < 4 ? (
            <Button onClick={() => setStep(s => (s + 1) as Step)}
              className="w-full rounded-2xl h-13 font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white shadow-lg shadow-emerald-500/25"
              size="lg"
              disabled={!canAdvance[step]}>
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canAdvance[4]}
              className="w-full rounded-2xl h-13 font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 text-white shadow-lg shadow-emerald-500/25"
              size="lg">
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cadastrando...</>
                : '✅ Finalizar cadastro'}
            </Button>
          )}
          {step === 1 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Já tem conta?{' '}
              <button onClick={() => navigate('/login/prestador')} className="text-emerald-600 hover:underline font-medium">
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
