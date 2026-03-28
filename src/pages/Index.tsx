import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import sempreFundo from '@/assets/sempre-fundo.webp';
import GlowCard from '@/components/GlowCard';
import logoSempreText from '@/assets/logo-sempre-text.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth';
import { toast } from 'sonner';
import { Instagram } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const dashboardPath = user.role === 'provider' ? '/prestador' : '/cliente';
    return <Navigate to={dashboardPath} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password, 'client');
      toast.success('Login realizado com sucesso!');
      navigate('/cliente');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${sempreFundo})` }}
    >
      {/* Logo */}
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

      <div className="flex-1" />

      {/* Bottom area */}
      <div className="w-full flex flex-col items-center gap-4 pb-16 px-8">
        <AnimatePresence mode="wait">
          {showLogin ? (
            <motion.div
              key="login-card"
              className="w-full max-w-xs"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlowCard
                glowColor="207 78 38"
                backgroundColor="rgba(255,255,255,0.9)"
                borderRadius={24}
                glowRadius={25}
                glowIntensity={0.4}
                coneSpread={20}
                fillOpacity={0.15}
                animated
                colors={['#1a6fb5', '#4da8e8', '#ffffff']}
              >
                <div className="w-full p-6">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/80 border-border/50 h-11 rounded-xl"
                    />
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white/80 border-border/50 h-11 rounded-xl"
                    />

                    <div className="text-right">
                      <button
                        type="button"
                        className="text-xs text-primary/70 hover:text-primary transition-colors"
                      >
                        Esqueci a senha
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full gradient-primary h-11 rounded-xl font-display font-bold btn-glow shadow-premium"
                    >
                      {submitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>

                  {/* Social icons */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <a
                      href="#"
                      className="w-11 h-11 rounded-xl bg-white/80 border border-border/30 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                      aria-label="WhatsApp"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-11 h-11 rounded-xl bg-white/80 border border-border/30 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} className="text-pink-500" />
                    </a>
                    <a
                      href="#"
                      className="w-11 h-11 rounded-xl bg-white/80 border border-border/30 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                      aria-label="Facebook"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2"/>
                      </svg>
                    </a>
                  </div>

                  {/* Back link */}
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="w-full mt-4 text-center text-xs text-primary/70 hover:text-primary transition-colors"
                  >
                    ← Voltar
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          ) : (
            <motion.div
              key="main-buttons"
              className="w-full flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
              >
                <Link to="/assistencia" className="block w-full">
                  <GlowCard
                    glowColor="207 78 38"
                    backgroundColor="rgba(255,255,255,0.9)"
                    borderRadius={16}
                    glowRadius={25}
                    glowIntensity={0.4}
                    coneSpread={20}
                    fillOpacity={0.15}
                    animated
                    colors={['#1a6fb5', '#4da8e8', '#ffffff']}
                  >
                    <div className="w-full py-4 text-center font-display font-bold text-base text-foreground">
                      Preciso de Assistência
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>

              <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
              >
                <div onClick={() => setShowLogin(true)} className="block w-full cursor-pointer">
                  <GlowCard
                    glowColor="207 78 38"
                    backgroundColor="rgba(255,255,255,0.9)"
                    borderRadius={16}
                    glowRadius={25}
                    glowIntensity={0.4}
                    coneSpread={20}
                    fillOpacity={0.15}
                    animated
                    colors={['#1a6fb5', '#4da8e8', '#ffffff']}
                  >
                    <div className="w-full py-4 text-center font-display font-bold text-base text-foreground">
                      Sou Cliente - Entrar
                    </div>
                  </GlowCard>
                </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
