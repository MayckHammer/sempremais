import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import sempreFundo from '@/assets/sempre-fundo.webp';
import logoSempreText from '@/assets/logo-sempre-text.png';

export default function Index() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    const dashboardPath = user.role === 'provider' ? '/prestador' : '/cliente';
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${sempreFundo})` }}
    >
      {/* Logo area — upper third */}
      <div className="flex-1 flex items-center justify-center pt-16">
        <img
          src={logoSempreText}
          alt="Sempre+ Assistências e Benefícios"
          className="w-64 sm:w-80 object-contain drop-shadow-lg"
        />
      </div>

      {/* Actions — lower section */}
      <div className="w-full flex flex-col items-center gap-4 pb-16 px-8">
        <Link to="/cadastro/cliente" className="w-full max-w-xs">
          <button className="w-full py-4 rounded-2xl bg-white/90 backdrop-blur-sm text-foreground font-display font-bold text-base shadow-lg hover:bg-white transition-colors">
            Preciso de Assistência
          </button>
        </Link>

        <Link to="/login/cliente" className="w-full max-w-xs">
          <button className="w-full py-4 rounded-2xl bg-white/90 backdrop-blur-sm text-foreground font-display font-bold text-base shadow-lg hover:bg-white transition-colors">
            Sou Cliente - Entrar
          </button>
        </Link>

        <div className="flex flex-col items-center gap-2 mt-2">
          <Link
            to="/login/prestador"
            className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Sou Prestador
          </Link>
          <Link
            to="/cadastro/prestador"
            className="text-primary/80 text-sm font-medium hover:text-primary transition-colors"
          >
            Quero me Cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}
