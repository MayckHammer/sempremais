import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { LogOut, User, Building2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import logo from '@/assets/logo.png';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const MobileMenu = () => (
    <div className="flex flex-col gap-4 p-4">
      {user ? (
        <>
          {user.role === 'client' && (
            <Link to="/cliente" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-5 h-5 mr-3 text-primary" />
                Minha Área
              </Button>
            </Link>
          )}
          {user.role === 'provider' && (
            <Link to="/prestador" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="w-5 h-5 mr-3 text-primary" />
                Painel Prestador
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-3 text-muted-foreground" />
            Sair
          </Button>
        </>
      ) : (
        <>
          <Link to="/login/cliente" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <User className="w-5 h-5 mr-3" />
              Entrar como Cliente
            </Button>
          </Link>
          <Link to="/login/prestador" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full justify-start border-primary text-primary">
              <Building2 className="w-5 h-5 mr-3" />
              Entrar como Prestador
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-4">
            <img 
              src={logo} 
              alt="Mi Rebok" 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-contain -my-2"
            />
            <div>
              <h1 className="text-base sm:text-xl font-bold text-primary">Mi Rebok</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Guincho e Assistência 24h</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full status-pulse"></span>
              <span className="text-xs text-accent font-medium">Online 24h</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
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
                <>
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
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-border">
                <div className="flex items-center gap-3 mb-6 pt-4">
                  <img src={logo} alt="Mi Rebok" className="w-10 h-10 rounded-xl object-contain" />
                  <span className="font-bold text-primary">Mi Rebok</span>
                </div>
                <MobileMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
