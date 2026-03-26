import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Truck, Key, Circle, RotateCcw, Package, MapPin, ArrowRight, Handshake, Shield, Clock, Star, Phone } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Autoplay from 'embla-carousel-autoplay';
import UnicornScene from 'unicornstudio-react';
import logoSempre from '@/assets/logo-sempre.png';
import logoSempreText from '@/assets/logo-sempre-text.png';

type HighlightItem = { icon: React.ElementType; label: string };

function HighlightsCarousel({ highlights }: { highlights: HighlightItem[] }) {
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => { api.off('select', onSelect); };
  }, [api, onSelect]);

  return (
    <div>
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        opts={{ align: 'start', loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {highlights.map((item, index) => (
            <CarouselItem key={item.label} className="basis-1/3 sm:basis-1/6 pl-2">
              <motion.div
                className="flex flex-col items-center gap-2.5"
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card flex items-center justify-center shadow-premium border-gradient conic-border">
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground text-center tracking-wide uppercase">{item.label}</span>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  const services = [
    { icon: Truck, title: 'Reboque', desc: 'Transporte veicular' },
    { icon: Key, title: 'Chaveiro', desc: 'Abertura e cópia' },
    { icon: Circle, title: 'Borracheiro', desc: 'Pneus e calibragem' },
    { icon: RotateCcw, title: 'Destombamento', desc: 'Veículos tombados' },
    { icon: Package, title: 'Frete', desc: 'Pequeno e grande' },
    { icon: Handshake, title: 'Permuta', desc: 'Troca de serviços' },
  ];

  const highlights = [
    { icon: Clock, label: '24 Horas' },
    { icon: Shield, label: 'Segurança' },
    { icon: Star, label: 'Qualidade' },
    { icon: Handshake, label: 'Permuta' },
    { icon: MapPin, label: 'Localização' },
    { icon: Phone, label: 'Suporte' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden unicorn-container">
          <UnicornScene
            projectId="95VHuHaMwQgzQ7FNBU4u"
            width="100%"
            height="100%"
            scale={1}
            dpi={isMobile ? 1 : 1.5}
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.5/dist/unicornStudio.umd.js"
          />
        </div>

        <div className="relative z-10 px-4 pt-8 sm:pt-16 pb-12 sm:pb-20 max-w-4xl mx-auto text-center">
          <motion.div style={{ y: logoY }} className="relative">
            {/* Glow backdrop behind logo */}
            <motion.div
              className="absolute inset-0 mx-auto w-72 sm:w-96 md:w-[28rem] h-20 sm:h-28 top-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-40"
              style={{ background: 'radial-gradient(ellipse, hsl(207 78% 55% / 0.6), hsl(207 78% 38% / 0.3), transparent)' }}
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src={logoSempreText}
              alt="Sempre+ Assistências e Benefícios"
              className="relative mx-auto mb-8 sm:mb-12 w-56 sm:w-72 md:w-96 object-contain"
              style={{
                filter: 'drop-shadow(0 4px 20px hsla(207, 78%, 30%, 0.35)) drop-shadow(0 1px 3px hsla(0, 0%, 0%, 0.15))',
              }}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>

          <motion.div
            style={{ y: cardY }}
            className="relative"
          >
            <motion.div
              className="relative bg-secondary/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 shadow-elevated mx-auto max-w-lg"
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 24h badge */}
              <motion.div
                className="absolute -top-3 -right-3 w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-pulse"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              >
                <span className="text-primary-foreground font-display font-extrabold text-xs">24h</span>
              </motion.div>

              <h2 className="text-primary-foreground font-display text-lg sm:text-2xl font-extrabold mb-3 tracking-tight">
                Guincho e Assistência 24h
              </h2>
              <p className="text-primary-foreground/75 text-sm sm:text-base mb-6 font-body leading-relaxed">
                Conectamos você aos melhores prestadores da sua região com agilidade e segurança.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={user ? (user.role === 'client' ? '/cliente' : '/prestador') : '/cadastro/cliente'}>
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl w-full font-display font-bold btn-glow shadow-premium">
                    {user ? 'Minha Área' : 'Preciso de Ajuda'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/cadastro/prestador">
                    <Button size="lg" variant="outline" className="text-muted-foreground border-primary shadow-sm">
                      Sou Prestador
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Destaques */}
      <section className="py-10 sm:py-14 px-4 gradient-mesh relative noise-overlay">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-lg sm:text-2xl font-extrabold text-foreground mb-6 sm:mb-8 tracking-tight">Destaques</h2>
          <HighlightsCarousel highlights={highlights} />
        </div>
      </section>

      {/* Descubra Parceiros */}
      <section className="py-10 sm:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-lg sm:text-2xl font-extrabold text-foreground mb-1 tracking-tight">Descubra Parceiros</h2>
          <p className="text-sm text-muted-foreground mb-5 sm:mb-7 font-body">Venha conferir!</p>
          <motion.div
            className="rounded-2xl overflow-hidden border border-border shadow-premium bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative h-48 sm:h-72 bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d30000!2d-46.6334!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbr!4v1"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de parceiros"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10 sm:py-14 px-4 gradient-mesh relative noise-overlay">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-lg sm:text-2xl font-extrabold text-foreground mb-5 sm:mb-8 tracking-tight">Nossos Serviços</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-premium
                  hover:shadow-elevated hover:border-primary/20 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-primary/15 to-glow/10 group-hover:from-primary/25 group-hover:to-glow/20
                  transition-all duration-300">
                  <service.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:rotate-[-6deg] transition-transform duration-300" />
                </div>
                <div className="text-center">
                  <span className="text-sm sm:text-base font-display font-bold text-foreground block">{service.title}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-body mt-0.5 block">{service.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="gradient-mesh-cta rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden noise-overlay"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Floating dots */}
            <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-primary-foreground/20 float" />
            <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-gold/30 float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-10 left-20 w-1 h-1 rounded-full bg-primary-foreground/15 float" style={{ animationDelay: '2s' }} />

            <div className="relative z-10">
              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-primary-foreground mb-3 tracking-tight"
                style={{ textShadow: '0 2px 12px hsla(207, 78%, 20%, 0.3)' }}
              >
                Pronto para começar?
              </h2>
              <p className="text-primary-foreground/75 text-sm sm:text-base mb-8 font-body leading-relaxed max-w-md mx-auto">
                Cadastre-se e tenha acesso a assistência 24h e troca de serviços via permuta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login/cliente">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl font-display font-bold w-full sm:w-auto shadow-premium btn-glow">
                    Entrar como Cliente
                  </Button>
                </Link>
                <Link to="/login/prestador">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl font-display font-bold w-full sm:w-auto">
                    Entrar como Prestador
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
