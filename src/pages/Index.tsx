import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Truck, Key, Circle, RotateCcw, Package, MapPin, ArrowRight, Handshake, Shield, Clock, Star, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import logoSempre from '@/assets/logo-sempre.png';
import SempreBackground from '@/components/SempreBackground';

export default function Index() {
  const { user } = useAuth();

  const services = [
    { icon: Truck, title: 'Reboque', color: 'bg-primary/15 text-primary' },
    { icon: Key, title: 'Chaveiro', color: 'bg-secondary/15 text-secondary' },
    { icon: Circle, title: 'Borracheiro', color: 'bg-primary/15 text-primary' },
    { icon: RotateCcw, title: 'Destombamento', color: 'bg-secondary/15 text-secondary' },
    { icon: Package, title: 'Frete', color: 'bg-primary/15 text-primary' },
    { icon: Handshake, title: 'Permuta', color: 'bg-secondary/15 text-secondary' },
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

      {/* Hero Section */}
      <SempreBackground>
        <div className="px-4 pt-8 sm:pt-16 pb-12 sm:pb-20 max-w-4xl mx-auto text-center">
          <motion.img
            src={logoSempre}
            alt="Sempre+ Assistências e Benefícios"
            className="mx-auto mb-8 sm:mb-12 w-64 sm:w-80 md:w-96 object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />

          <motion.div
            className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 shadow-2xl mx-auto max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-white font-display text-lg sm:text-2xl font-bold mb-3">
              Guincho e Assistência 24h
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6">
              Conectamos você aos melhores prestadores da sua região com agilidade e segurança.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={user ? (user.role === 'client' ? '/cliente' : '/prestador') : '/cadastro/cliente'}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-xl w-full font-display font-bold">
                  {user ? 'Minha Área' : 'Preciso de Ajuda'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              {!user && (
                <Link to="/cadastro/prestador">
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl w-full font-display font-bold">
                    Sou Prestador
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </SempreBackground>

      {/* Destaques - Horizontal scroll circles */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Destaques</h2>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center gap-2 min-w-[72px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center shadow-sm border border-border">
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Descubra Parceiros - Map placeholder */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-1">Descubra Parceiros</h2>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Venha conferir!</p>
          <motion.div
            className="rounded-2xl overflow-hidden border border-border shadow-sm bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative h-48 sm:h-72 bg-muted flex items-center justify-center">
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
      <section className="py-8 sm:py-12 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Nossos Serviços</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-background border border-border hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${service.color}`}>
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground text-center">{service.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="gradient-primary rounded-3xl p-8 sm:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-xl sm:text-3xl font-bold text-white mb-3">Pronto para começar?</h2>
            <p className="text-white/80 text-sm sm:text-base mb-6">
              Cadastre-se e tenha acesso a assistência 24h e troca de serviços via permuta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login/cliente">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-xl font-display font-bold w-full sm:w-auto">
                  Entrar como Cliente
                </Button>
              </Link>
              <Link to="/login/prestador">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl font-display font-bold w-full sm:w-auto">
                  Entrar como Prestador
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
