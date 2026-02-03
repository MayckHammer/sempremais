import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Truck, Key, Circle, RotateCcw, Package, Shield, Clock, Star } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Index() {
  const services = [
    { icon: Truck, title: 'Reboque', description: 'Transporte seguro de veículos' },
    { icon: Key, title: 'Chaveiro', description: 'Abertura 24h' },
    { icon: Circle, title: 'Borracheiro', description: 'Troca de pneus' },
    { icon: RotateCcw, title: 'Destombamento', description: 'Resgate especializado' },
    { icon: Package, title: 'Frete', description: 'Pequenos e grandes' },
  ];

  const features = [
    { icon: Clock, title: '24 Horas', description: 'Atendimento dia e noite' },
    { icon: Shield, title: 'Segurança', description: 'Prestadores verificados' },
    { icon: Star, title: 'Qualidade', description: 'Avaliações reais' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <img src={logo} alt="Mi Rebok" className="w-40 h-40 sm:w-56 sm:h-56 mx-auto mb-6 sm:mb-8 object-contain" />
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Guincho e Assistência{' '}
            <span className="text-primary">24 Horas</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Conectamos você aos melhores prestadores da sua região.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/cadastro/cliente" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl w-full">
                Preciso de Ajuda
              </Button>
            </Link>
            <Link to="/cadastro/prestador" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full">
                Sou Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 sm:py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">Nossos Serviços</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="gradient-card p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-border text-center hover:border-primary/50 transition-all active:scale-95 sm:hover:-translate-y-1"
              >
                <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <service.icon className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-base mb-0.5 sm:mb-1">{service.title}</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">Por que Mi Rebok?</h2>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                </div>
                <h3 className="text-sm sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-[10px] sm:text-base text-muted-foreground hidden sm:block">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Pronto para começar?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
            Cadastre-se e tenha acesso aos melhores prestadores.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/login/cliente" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary rounded-xl w-full h-11 sm:h-12 text-sm sm:text-base">
                Entrar como Cliente
              </Button>
            </Link>
            <Link to="/login/prestador" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full h-11 sm:h-12 text-sm sm:text-base">
                Entrar como Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">© 2024 Mi Rebok - Guincho e Assistência 24h</p>
        </div>
      </footer>
    </div>
  );
}
