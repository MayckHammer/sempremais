import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Footer } from '@/components/Footer';
import { signUp, signIn } from '@/lib/auth';
import logoSempre from '@/assets/logo-sempre.png';
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'login' | 'signup';
  role: 'client' | 'provider';
}

export function AuthForm({ type, role }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roleLabels = {
    client: 'Cliente',
    provider: 'Prestador',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'signup') {
        await signUp(email, password, role, fullName, phone);
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
        navigate(`/login/${role === 'client' ? 'cliente' : 'prestador'}`);
      } else {
        await signIn(email, password);
        toast.success('Login realizado com sucesso!');
        navigate(role === 'client' ? '/cliente' : '/prestador');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* S-Curve Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary" />
          <img
            src={logoSSymbol}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
            style={{ objectPosition: 'center 30%' }}
          />
        </div>
        <div className="relative z-10 text-center pt-10 pb-16 sm:pt-14 sm:pb-20 px-4">
          <Link to="/">
            <img src={logoSempre} alt="Sempre+ Assistências e Benefícios" className="mx-auto h-16 sm:h-20 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-8 sm:-mt-10 relative z-20">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {type === 'login' ? 'Entrar' : 'Criar Conta'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{roleLabels[role]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {type === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="bg-muted border-border h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-muted border-border h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-muted border-border h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-muted border-border h-11 rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 gradient-primary h-11 rounded-xl font-display font-bold" disabled={loading}>
                {loading ? 'Carregando...' : type === 'login' ? 'Entrar' : 'Criar Conta'}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {type === 'login' ? (
              <>
                Não tem conta?{' '}
                <Link to={`/cadastro/${role === 'client' ? 'cliente' : 'prestador'}`} className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link to={`/login/${role === 'client' ? 'cliente' : 'prestador'}`} className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </>
            )}
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
