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
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <img src={logo} alt="Mi Rebok" className="w-32 h-32 mx-auto mb-8 rounded-3xl object-contain" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Guincho e Assistência{' '}
            <span className="text-primary">24 Horas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conectamos você aos melhores prestadores da sua região. Rápido, seguro e com avaliações reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro/cliente">
              <Button size="lg" className="gradient-primary text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
                Preciso de Ajuda
              </Button>
            </Link>
            <Link to="/cadastro/prestador">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                Sou Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Nossos Serviços</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="gradient-card p-6 rounded-2xl border border-border text-center hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Por que escolher a Mi Rebok?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-8">
            Cadastre-se agora e tenha acesso aos melhores prestadores da região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login/cliente">
              <Button size="lg" className="gradient-primary rounded-xl w-full sm:w-auto">
                Entrar como Cliente
              </Button>
            </Link>
            <Link to="/login/prestador">
              <Button size="lg" variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                Entrar como Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2024 Mi Rebok - Serviços de Guincho e Assistência 24h</p>
        </div>
      </footer>
    </div>
  );
}
