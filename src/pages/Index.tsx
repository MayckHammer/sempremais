import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import sempreFundo from '@/assets/sempre-fundo.webp';
import GlowCard from '@/components/GlowCard';
import logoSempreText from '@/assets/logo-sempre-text.png';

export default function Index() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    const dashboardPath = user.role === 'provider' ? '/prestador' : '/cliente';
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${sempreFundo})` }}
    >
      {/* Logo — animated entrance */}
      <motion.div
        className="pt-28 flex items-center justify-center pl-8"
        initial={{ opacity: 0, scale: 0.7, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={logoSempreText}
          alt="Sempre+ Assistências e Benefícios"
          className="w-72 sm:w-96 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] brightness-0 invert"
          initial={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 0px rgba(255,255,255,0))' }}
          animate={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(255,255,255,0.3))' }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions — staggered entrance */}
      <div className="w-full flex flex-col items-center gap-4 pb-16 px-8">
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
        >
          <Link to="/cadastro/cliente" className="block w-full">
            <motion.button
              className="w-full py-4 rounded-2xl bg-white/90 backdrop-blur-md text-foreground font-display font-bold text-base shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/40 relative overflow-hidden group"
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Preciso de Assistência</span>
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
        >
          <Link to="/login/cliente" className="block w-full">
            <GlowCard
              glowColor="207 78 55"
              backgroundColor="rgba(255,255,255,0.15)"
              borderRadius={16}
              glowRadius={50}
              glowIntensity={1.5}
              coneSpread={30}
              animated
              colors={['#1a6fb5', '#3b9fe0', '#d4a853']}
            >
              <div className="w-full py-4 text-center font-display font-bold text-base text-foreground">
                Sou Cliente - Entrar
              </div>
            </GlowCard>
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-3 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Link to="/login/prestador" className="group relative">
            <motion.span
              className="text-primary text-sm font-semibold tracking-wide"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              Sou Prestador
            </motion.span>
            <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300 ease-out" />
          </Link>
          <Link to="/cadastro/prestador" className="group relative">
            <motion.span
              className="text-primary/70 text-sm font-medium tracking-wide"
              whileHover={{ scale: 1.05, color: 'hsl(207, 78%, 38%)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              Quero me Cadastrar
            </motion.span>
            <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-primary/70 group-hover:w-full transition-all duration-300 ease-out" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
