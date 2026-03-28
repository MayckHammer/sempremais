import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, MapPin, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { User, Building2, LogOut, Shield, FileText, Wallet } from 'lucide-react';
import { SBBadge } from '@/components/SBBadge';
import logoSempre from '@/assets/logo-sempre.png';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useMemo } from 'react';

interface ClientHomeProps {
  location: { address: string; lat: number; lng: number };
  providers: Array<{
    id: string;
    profiles?: { full_name: string };
    services: string[];
    average_rating: number;
    is_available: boolean;
    latitude?: number | null;
    longitude?: number | null;
  }>;
}

const banners = [
  { id: 1, title: 'Bem-vindo ao Sempre+', subtitle: 'Assistência 24h para você', bg: 'from-primary to-primary/80' },
  { id: 2, title: 'Novos Parceiros', subtitle: 'Confira as novidades', bg: 'from-primary/90 to-accent' },
  { id: 3, title: 'Reboque Grátis', subtitle: 'Na primeira solicitação', bg: 'from-primary/80 to-primary' },
  { id: 4, title: 'Indique e Ganhe', subtitle: 'Descontos exclusivos', bg: 'from-accent to-primary/90' },
];

const partners = [
  { id: 1, name: 'Parceiro 1', initials: 'P1' },
  { id: 2, name: 'Parceiro 2', initials: 'P2' },
  { id: 3, name: 'Parceiro 3', initials: 'P3' },
  { id: 4, name: 'Parceiro 4', initials: 'P4' },
  { id: 5, name: 'Parceiro 5', initials: 'P5' },
  { id: 6, name: 'Parceiro 6', initials: 'P6' },
  { id: 7, name: 'Parceiro 7', initials: 'P7' },
  { id: 8, name: 'Parceiro 8', initials: 'P8' },
];

export function ClientHome({ location, providers }: ClientHomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const availableRoles = useMemo(() => user?.roles ?? (user ? [user.role] : []), [user]);
  const hasClientAccess = availableRoles.includes('client');
  const hasProviderAccess = availableRoles.includes('provider');
  const hasAdminAccess = availableRoles.includes('admin');

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  // Auto-scroll highlights
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let lastTime = 0;
    const speed = 30; // pixels per second
    const scroll = (time: number) => {
      if (lastTime) {
        const delta = (time - lastTime) / 1000;
        el.scrollLeft += speed * delta;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      lastTime = time;
      animId = requestAnimationFrame(scroll);
    };
    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Curved Header */}
      <div className="relative">
        <div className="bg-primary pt-14 pb-16 px-4 relative overflow-hidden">
          {/* Menu + Logo */}
          <div className="flex items-center justify-between relative z-10">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 glass-strong border-border">
                <div className="flex items-center gap-3 mb-6 pt-4">
                  <img src={logoSempre} alt="Sempre+" className="h-10 object-contain" />
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {hasClientAccess && (
                    <Link to="/cliente" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                        <User className="w-5 h-5 mr-3 text-primary" /> Área do Cliente
                      </Button>
                    </Link>
                  )}
                  {hasProviderAccess && (
                    <Link to="/prestador" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                        <Building2 className="w-5 h-5 mr-3 text-primary" /> Painel Prestador
                      </Button>
                    </Link>
                  )}
                  <Link to="/cliente/solicitacoes" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                      <FileText className="w-5 h-5 mr-3 text-primary" /> Minhas Solicitações
                    </Button>
                  </Link>
                  <Link to="/cliente/carteira" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                      <Wallet className="w-5 h-5 mr-3 text-primary" /> Minha Carteira
                    </Button>
                  </Link>
                  {hasAdminAccess && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-primary/5">
                        <Shield className="w-5 h-5 mr-3 text-primary" /> Painel Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start rounded-xl hover:bg-destructive/5">
                    <LogOut className="w-5 h-5 mr-3 text-muted-foreground" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <img
              src={logoSempre}
              alt="Sempre+"
              className="h-9 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cliente/perfil')}
              className="bg-muted-foreground/30 hover:bg-muted-foreground/40 text-primary-foreground rounded-xl"
            >
              <User className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Curve SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 390 40"
          preserveAspectRatio="none"
          style={{ height: '40px' }}
        >
          <path
            d="M0,40 L0,0 Q195,45 390,0 L390,40 Z"
            fill="hsl(var(--background))"
          />
        </svg>

      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-8 pb-4 space-y-5">
        {/* Banner Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="-mt-8"
        >
          <Carousel
            opts={{ loop: true, align: 'center' }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className={`bg-gradient-to-r ${banner.bg} rounded-2xl p-6 h-28 flex flex-col justify-end shadow-premium`}>
                    <p className="text-primary-foreground/70 text-xs font-body">{banner.subtitle}</p>
                    <h3 className="text-primary-foreground font-display font-bold text-lg">{banner.title}</h3>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>

        {/* Destaques */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-extrabold text-base text-foreground">Parceiros</h2>
            <button className="text-xs text-primary font-semibold flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-hidden"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
          >
            {/* Duplicate for infinite scroll */}
            {[...partners, ...partners].map((partner, i) => (
              <div key={`${partner.id}-${i}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center">
                  <span className="text-sm font-display font-bold text-muted-foreground">{partner.initials}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-body truncate w-16 text-center">{partner.name}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Descubra Parceiros / Mapa */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-extrabold text-base text-foreground">Descubra Prestadores</h2>
              <p className="text-xs text-muted-foreground font-body">Venha conferir!</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>24h</span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-premium border border-border/40 bg-card">
            <div className="relative w-full h-32 bg-muted">
              <iframe
                title="Mapa de Prestadores"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.lat},${location.lng}&zoom=13`}
              />
            </div>
          </div>

          {/* Informativo de prestadores */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-base font-display font-bold text-foreground">
              {providers.length} prestador{providers.length !== 1 ? 'es' : ''} próximo{providers.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground font-body">{location.address}</p>
          </div>

          {/* Botão Solicitar Assistência */}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 text-lg font-display font-bold shadow-premium mt-4"
            onClick={() => navigate('/cliente/solicitar')}
          >
            Solicitar Assistência
          </Button>
        </motion.section>
      </div>

      <SBBadge />
    </div>
  );
}
