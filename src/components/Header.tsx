import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { LogOut, User, Building2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

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
    <div className="flex flex-col gap-3 p-4">
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
    <header className="bg-primary text-primary-foreground sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg sm:text-xl font-black tracking-tight">SEMPRE</span>
            <span className="text-[10px] sm:text-xs font-display opacity-80 hidden xs:block">Assistências e Benefícios</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {user.role === 'client' && (
                    <Link to="/cliente">
                      <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                        <User className="w-4 h-4 mr-2" />
                        Minha Área
                      </Button>
                    </Link>
                  )}
                  {user.role === 'provider' && (
                    <Link to="/prestador">
                      <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                        <Building2 className="w-4 h-4 mr-2" />
                        Painel
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login/cliente">
                    <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                      <User className="w-4 h-4 mr-2" />
                      Cliente
                    </Button>
                  </Link>
                  <Link to="/login/prestador">
                    <Button variant="outline" size="sm" className="rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
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
                <Button variant="ghost" size="icon" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-border">
                <div className="flex items-center gap-3 mb-6 pt-4">
                  <span className="font-display font-black text-primary text-lg">SEMPRE</span>
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
