import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, MapPin, Tag, Coins, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { signUp } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  'Estética e Beleza', 'Alimentação', 'Saúde e Bem-estar', 'Educação',
  'Tecnologia', 'Serviços Automotivos', 'Turismo e Lazer', 'Moda e Vestuário',
  'Marketing e Design', 'Jurídico e Contábil', 'Construção e Reforma', 'Outros',
];

const SB_OPTIONS = [
  { value: 100, label: '100%', desc: 'Aceita somente SB$' },
  { value: 50, label: '50%', desc: 'Metade SB$, metade real' },
  { value: 25, label: '25%', desc: 'Até 25% em SB$' },
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  cnpj: string;
  category: string;
  description: string;
  city: string;
  state: string;
  sbAcceptance: number;
  planLevel: 'basic' | 'standard' | 'premium';
}

const INITIAL: FormData = {
  businessName: '', ownerName: '', email: '', password: '', phone: '', cnpj: '',
  category: '', description: '', city: '', state: '', sbAcceptance: 50, planLevel: 'standard',
};

const PLANS = [
  { key: 'basic' as const, label: 'Básico', price: 'R$99/mês', perks: ['Perfil na rede', 'Até 3 ofertas', 'Carteira SB$'] },
  { key: 'standard' as const, label: 'Standard', price: 'R$199/mês', perks: ['Tudo do Básico', 'Ofertas ilimitadas', 'Destaque regional', 'Relatórios'] },
  { key: 'premium' as const, label: 'Premium', price: 'R$299/mês', perks: ['Tudo do Standard', 'Destaque nacional', 'IA de matchmaking', 'API de integração'] },
];

export default function PartnerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signUp(form.email, form.password, 'client', form.ownerName, form.phone);
      toast({
        title: '🎉 Cadastro realizado!',
        description: 'Em breve nossa equipe entrará em contato para ativar seu perfil de parceiro.',
      });
      navigate('/login/cliente');
    } catch (err: any) {
      toast({ title: 'Erro no cadastro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Empresa' },
    { num: 2, label: 'Serviço' },
    { num: 3, label: 'SB$' },
    { num: 4, label: 'Plano' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2B6CB8] to-[#3b82f6] pt-14 pb-10 px-5 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />

        <button
          onClick={() => step > 1 ? setStep(s => (s - 1) as Step) : navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-2xl font-extrabold text-white">Seja um parceiro</h1>
        <p className="text-white/60 text-sm mt-1">Faça parte da rede Sempre+ e aceite SB$</p>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mt-6">
          {steps.map(({ num, label }) => (
            <div key={num} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === num ? 'bg-white text-[#2B6CB8]'
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

      {/* Form body */}
      <div className="px-5 py-6">
        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Dados da empresa</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Nome da empresa *</Label>
                  <Input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                    placeholder="Ex: Estúdio Beleza Total" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Nome do responsável *</Label>
                  <Input value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                    placeholder="Seu nome completo" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">CNPJ (opcional)</Label>
                  <Input value={form.cnpj} onChange={e => set('cnpj', e.target.value)}
                    placeholder="00.000.000/0001-00" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Email *</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="contato@empresa.com" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Senha *</Label>
                  <Input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">WhatsApp *</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="(34) 99999-9999" className="rounded-xl h-12 bg-muted/50 border-border" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Seu serviço</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Categoria *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => set('category', cat)}
                        className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                          form.category === cat
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Descrição do negócio *</Label>
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Descreva o que você oferece na rede Sempre+..."
                    className="rounded-xl bg-muted/50 border-border min-h-24 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Cidade *</Label>
                    <Input value={form.city} onChange={e => set('city', e.target.value)}
                      placeholder="Uberlândia" className="rounded-xl h-12 bg-muted/50 border-border" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Estado *</Label>
                    <Input value={form.state} onChange={e => set('state', e.target.value)}
                      placeholder="MG" maxLength={2} className="rounded-xl h-12 bg-muted/50 border-border" />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Configurar SB$</h2>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 mb-4">
                <p className="text-sm font-semibold text-foreground">O que é SB$?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  SB$ é a moeda interna da Sempre+. 1 SB$ = R$ 1,00 em serviços. Você define quanto aceita em SB$ e usa seu saldo para contratar outros parceiros da rede.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground block">Quanto você aceita em SB$? *</Label>
                {SB_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => set('sbAcceptance', opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      form.sbAcceptance === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:border-primary/30'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      form.sbAcceptance === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {opt.label}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{opt.label} em SB$</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    {form.sbAcceptance === opt.value && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Escolha seu plano</h2>
              </div>
              <div className="space-y-3">
                {PLANS.map(plan => (
                  <button key={plan.key} onClick={() => set('planLevel', plan.key)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      form.planLevel === plan.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:border-primary/30'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{plan.label}</span>
                        {plan.key === 'standard' && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Popular</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{plan.price}</span>
                        {form.planLevel === plan.key && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {plan.perks.map(perk => (
                        <div key={perk} className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-primary/60" />
                          <span className="text-xs text-muted-foreground">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer button */}
        <div className="pt-6">
          {step < 4 ? (
            <Button onClick={() => setStep(s => (s + 1) as Step)}
              className="w-full rounded-2xl h-13 font-semibold bg-gradient-to-r from-[#2B6CB8] to-[#3b82f6] border-0 text-white shadow-lg shadow-blue-500/25"
              size="lg"
              disabled={
                (step === 1 && (!form.businessName || !form.ownerName || !form.email || !form.password)) ||
                (step === 2 && (!form.category || !form.description || !form.city))
              }>
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}
              className="w-full rounded-2xl h-13 font-semibold bg-gradient-to-r from-[#2B6CB8] to-[#3b82f6] border-0 text-white shadow-lg shadow-blue-500/25"
              size="lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cadastrando...</> : '🎉 Finalizar cadastro'}
            </Button>
          )}

          {step === 1 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Já tem conta?{' '}
              <button onClick={() => navigate('/login/cliente')} className="text-primary hover:underline font-medium">
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
