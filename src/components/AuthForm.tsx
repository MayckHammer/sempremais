import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';
import { signUp, signIn } from '@/lib/auth';
import logoSempre from '@/assets/logo-sempre.png';
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'login' | 'signup';
  role: 'client' | 'provider';
}

export function AuthForm({ type, role }: AuthFormProps) {
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!authLoading && user) {
    const destination = user.roles.includes(role)
      ? (role === 'client' ? '/cliente' : '/prestador')
      : (user.role === 'client' ? '/cliente' : '/prestador');
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'signup') {
        await signUp(email, password, role, fullName, phone);
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
        navigate(`/login/${role === 'client' ? 'cliente' : 'prestador'}`);
      } else {
        await signIn(email, password, role);
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
      {/* Large hero with diagonal shapes */}
      <div className="relative overflow-hidden flex-1 min-h-[340px]">
        <div className="absolute inset-0">
          <svg viewBox="0 0 400 500" className="absolute w-full h-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0,0 L0,500 C60,440 100,360 90,280 C75,180 180,120 400,90 L400,0 Z" fill="hsl(207 78% 38%)" />
            <path d="M400,0 L400,500 C360,460 310,380 330,280 C350,180 270,120 220,90 L400,0 Z" fill="hsl(220 5% 46%)" opacity="0.88" />
          </svg>
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px'
          }} />
        </div>

        {/* Centered logo */}
        <div className="relative z-10 flex items-center justify-center h-full px-6 py-16">
          <Link to="/">
            <img
              src={logoSempre}
              alt="Sempre+ Assistências e Benefícios"
              className="h-24 sm:h-28 object-contain drop-shadow-2xl"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </div>
      </div>

      {/* Floating card */}
      <div className="relative z-20 -mt-16 px-5 pb-6">
        <div className="w-full max-w-sm mx-auto bg-card rounded-3xl shadow-elevated border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome Completo"
                  required
                  className="bg-surface border-border h-12 rounded-xl text-sm"
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefone/WhatsApp"
                  className="bg-surface border-border h-12 rounded-xl text-sm"
                />
              </>
            )}

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="bg-surface border-border h-12 rounded-xl text-sm"
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="bg-surface border-border h-12 rounded-xl text-sm"
            />

            {type === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-primary hover:underline font-body">
                  Esqueci a senha
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary h-12 rounded-xl font-display font-bold btn-glow shadow-premium text-base"
              disabled={loading}
            >
              {loading ? 'Carregando...' : type === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {/* Social icons */}
          {type === 'login' && (
            <div className="flex items-center justify-center gap-4 mt-5">
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366]" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#E4405F]" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2]" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          )}

          {/* Links */}
          <div className="mt-4 text-center text-sm text-muted-foreground font-body">
            {type === 'login' ? (
              <>
                Não tem conta?{' '}
                <Link to={`/cadastro/${role === 'client' ? 'cliente' : 'prestador'}`} className="text-primary hover:underline font-semibold">
                  Cadastre-se
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link to={`/login/${role === 'client' ? 'cliente' : 'prestador'}`} className="text-primary hover:underline font-semibold">
                  Entrar
                </Link>
              </>
            )}
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors">
              ← Voltar
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
