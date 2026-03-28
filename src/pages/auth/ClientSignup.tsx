import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Footer } from '@/components/Footer';
import { signUp } from '@/lib/auth';
import logoSempre from '@/assets/logo-sempre.png';
import { toast } from 'sonner';
import { User, MapPin, Car } from 'lucide-react';

interface FormData {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
  cep: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear: string;
  vehicleColor: string;
}

const initialForm: FormData = {
  fullName: '', cpf: '', birthDate: '', phone: '',
  email: '', password: '',
  cep: '', street: '', streetNumber: '', complement: '',
  neighborhood: '', city: '', state: '',
  vehicleBrand: '', vehicleModel: '', vehiclePlate: '',
  vehicleYear: '', vehicleColor: '',
};

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export default function ClientSignup() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const navigate = useNavigate();

  if (!authLoading && user) {
    return <Navigate to="/cliente" replace />;
  }

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCEPBlur = async () => {
    const cepDigits = form.cep.replace(/\D/g, '');
    if (cepDigits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch { /* ignore */ }
    finally { setCepLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.cpf.trim() || !form.birthDate || !form.phone.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, 'client', form.fullName, form.phone, {
        cpf: form.cpf.replace(/\D/g, ''),
        birth_date: form.birthDate,
        cep: form.cep.replace(/\D/g, ''),
        street: form.street,
        street_number: form.streetNumber,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        vehicle_brand: form.vehicleBrand,
        vehicle_model: form.vehicleModel,
        vehicle_plate: form.vehiclePlate,
        vehicle_year: form.vehicleYear,
        vehicle_color: form.vehicleColor,
      });
      toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
      navigate('/login/cliente');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-surface border-border h-11 rounded-xl input-glow transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* S-Curve Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <svg viewBox="0 0 400 300" className="absolute w-full h-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0,0 L0,300 C80,260 120,200 100,140 C80,80 200,50 400,40 L400,0 Z" fill="hsl(207 78% 38%)" />
            <path d="M400,0 L400,300 C350,280 300,230 320,170 C340,110 250,80 200,60 L400,0 Z" fill="hsl(220 5% 46%)" opacity="0.88" />
          </svg>
        </div>
        <div className="relative z-10 text-center pt-10 pb-16 sm:pt-14 sm:pb-20 px-4">
          <Link to="/">
            <img src={logoSempre} alt="Sempre+ Assistências e Benefícios" className="mx-auto h-16 sm:h-20 object-contain drop-shadow-2xl" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-8 sm:-mt-10 relative z-20 pb-8">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-elevated border border-border p-5 sm:p-7">
          <div className="text-center mb-5">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Cadastro de Associado
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Preencha seus dados para se tornar um associado Sempre+
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === Dados Pessoais === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">Dados Pessoais</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-display font-semibold">Nome Completo *</Label>
                  <Input id="fullName" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Seu nome completo" required className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cpf" className="text-xs font-display font-semibold">CPF *</Label>
                    <Input id="cpf" value={form.cpf} onChange={e => update('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" required className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-xs font-display font-semibold">Nascimento *</Label>
                    <Input id="birthDate" type="date" value={form.birthDate} onChange={e => update('birthDate', e.target.value)} required className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-display font-semibold">Telefone/WhatsApp *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={e => update('phone', formatPhone(e.target.value))} placeholder="(11) 99999-9999" required className={inputClass} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-display font-semibold">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" required className={inputClass} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-display font-semibold">Senha *</Label>
                  <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className={inputClass} />
                </div>
              </div>
            </div>

            {/* === Endereço === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">Endereço</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cep" className="text-xs font-display font-semibold">CEP</Label>
                    <Input id="cep" value={form.cep} onChange={e => update('cep', formatCEP(e.target.value))} onBlur={handleCEPBlur} placeholder="00000-000" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-display font-semibold">Estado</Label>
                    <Input id="state" value={form.state} onChange={e => update('state', e.target.value)} placeholder="SP" maxLength={2} disabled={cepLoading} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-xs font-display font-semibold">Rua</Label>
                  <Input id="street" value={form.street} onChange={e => update('street', e.target.value)} placeholder="Rua / Avenida" disabled={cepLoading} className={inputClass} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="streetNumber" className="text-xs font-display font-semibold">Nº</Label>
                    <Input id="streetNumber" value={form.streetNumber} onChange={e => update('streetNumber', e.target.value)} placeholder="123" className={inputClass} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="complement" className="text-xs font-display font-semibold">Complemento</Label>
                    <Input id="complement" value={form.complement} onChange={e => update('complement', e.target.value)} placeholder="Apto, Bloco..." className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="neighborhood" className="text-xs font-display font-semibold">Bairro</Label>
                    <Input id="neighborhood" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Bairro" disabled={cepLoading} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-display font-semibold">Cidade</Label>
                    <Input id="city" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Cidade" disabled={cepLoading} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* === Veículo === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">Veículo <span className="text-muted-foreground font-normal text-xs">(opcional)</span></h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleBrand" className="text-xs font-display font-semibold">Marca</Label>
                    <Input id="vehicleBrand" value={form.vehicleBrand} onChange={e => update('vehicleBrand', e.target.value)} placeholder="Ex: Fiat" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleModel" className="text-xs font-display font-semibold">Modelo</Label>
                    <Input id="vehicleModel" value={form.vehicleModel} onChange={e => update('vehicleModel', e.target.value)} placeholder="Ex: Uno" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehiclePlate" className="text-xs font-display font-semibold">Placa</Label>
                    <Input id="vehiclePlate" value={form.vehiclePlate} onChange={e => update('vehiclePlate', e.target.value.toUpperCase())} placeholder="ABC1D23" maxLength={7} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleYear" className="text-xs font-display font-semibold">Ano</Label>
                    <Input id="vehicleYear" value={form.vehicleYear} onChange={e => update('vehicleYear', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2024" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleColor" className="text-xs font-display font-semibold">Cor</Label>
                    <Input id="vehicleColor" value={form.vehicleColor} onChange={e => update('vehicleColor', e.target.value)} placeholder="Branco" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary h-12 rounded-xl font-display font-bold btn-glow shadow-premium text-base" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta de Associado'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground font-body">
            Já tem conta?{' '}
            <Link to="/login/cliente" className="text-primary hover:underline font-semibold">Entrar</Link>
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
