import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp, signIn } from '@/lib/auth';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <Link to="/" className="flex justify-center mb-4">
            <img src={logo} alt="Mi Rebok" className="w-20 h-20 rounded-2xl object-contain" />
          </Link>
          <CardTitle className="text-2xl text-foreground">
            {type === 'login' ? 'Entrar' : 'Criar Conta'} - {roleLabels[role]}
          </CardTitle>
          <CardDescription>
            {type === 'login'
              ? `Acesse sua conta de ${roleLabels[role].toLowerCase()}`
              : `Cadastre-se como ${roleLabels[role].toLowerCase()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-muted border-border"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-muted border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-muted border-border"
              />
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Carregando...' : type === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {type === 'login' ? (
              <>
                Não tem conta?{' '}
                <Link
                  to={`/cadastro/${role === 'client' ? 'cliente' : 'prestador'}`}
                  className="text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link
                  to={`/login/${role === 'client' ? 'cliente' : 'prestador'}`}
                  className="text-primary hover:underline"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Voltar para o início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
