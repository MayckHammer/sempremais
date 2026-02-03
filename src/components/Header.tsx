import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { LogOut, User, Building2 } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Mi Rebok" 
              className="w-14 h-14 rounded-2xl object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Mi Rebok</h1>
              <p className="text-xs text-muted-foreground">Serviços de Guincho e Assistência 24h</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full status-pulse"></span>
              <span className="text-xs text-accent font-medium">Online 24h</span>
            </div>

            {user ? (
              <>
                {user.role === 'client' && (
                  <Link to="/cliente">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <User className="w-5 h-5 text-primary" />
                    </Button>
                  </Link>
                )}
                {user.role === 'provider' && (
                  <Link to="/prestador">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Building2 className="w-5 h-5 text-primary" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-xl">
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login/cliente">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <User className="w-4 h-4 mr-2" />
                    Cliente
                  </Button>
                </Link>
                <Link to="/login/prestador">
                  <Button variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Building2 className="w-4 h-4 mr-2" />
                    Prestador
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
