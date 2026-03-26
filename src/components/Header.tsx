import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { LogOut, User, Building2, Menu } from 'lucide-react';
import logoSempre from '@/assets/logo-sempre.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMemo, useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const availableRoles = useMemo(() => user?.roles ?? (user ? [user.role] : []), [user]);
  const hasClientAccess = availableRoles.includes('client');
  const hasProviderAccess = availableRoles.includes('provider');

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const MobileMenu = () => (
    <div className="flex flex-col gap-2 p-4">
      {user ? (
        <>
          {hasClientAccess && (
            <Link to="/cliente" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                <User className="w-5 h-5 mr-3 text-primary" />
                Área do Cliente
              </Button>
            </Link>
          )}
          {hasProviderAccess && (
            <Link to="/prestador" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                <Building2 className="w-5 h-5 mr-3 text-primary" />
                Painel Prestador
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start rounded-xl hover:bg-destructive/5">
            <LogOut className="w-5 h-5 mr-3 text-muted-foreground" />
            Sair
          </Button>
        </>
      ) : (
        <>
          <Link to="/login/cliente" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
              <User className="w-5 h-5 mr-3" />
              Entrar como Cliente
            </Button>
          </Link>
          <Link to="/login/prestador" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full justify-start border-primary/20 text-primary rounded-xl">
              <Building2 className="w-5 h-5 mr-3" />
              Entrar como Prestador
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-primary/95 backdrop-blur-xl text-primary-foreground sticky top-0 z-40 border-b border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src={logoSempre}
              alt="Sempre+ Assistências e Benefícios"
              className="h-8 sm:h-10 object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5">
              {user ? (
                <>
                  {hasClientAccess && (
                    <Link to="/cliente">
                      <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10 font-display font-semibold">
                        <User className="w-4 h-4 mr-2" />
                        Cliente
                      </Button>
                    </Link>
                  )}
                  {hasProviderAccess && (
                    <Link to="/prestador">
                      <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10 font-display font-semibold">
                        <Building2 className="w-4 h-4 mr-2" />
                        Prestador
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
                    <Button variant="ghost" size="sm" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10 font-display font-semibold">
                      <User className="w-4 h-4 mr-2" />
                      Cliente
                    </Button>
                  </Link>
                  <Link to="/login/prestador">
                    <Button variant="outline" size="sm" className="rounded-xl border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 font-display font-semibold">
                      <Building2 className="w-4 h-4 mr-2" />
                      Prestador
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 glass-strong border-border">
                <div className="flex items-center gap-3 mb-6 pt-4">
                  <img src={logoSempre} alt="Sempre+" className="h-8 object-contain" />
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
