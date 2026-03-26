import logoSempre from '@/assets/logo-sempre.png';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary py-8 sm:py-10 px-4">
      {/* Subtle mesh */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-64 h-64 rounded-full bg-glow/20 -top-32 -left-16 blur-3xl" />
        <div className="absolute w-48 h-48 rounded-full bg-gold/10 -bottom-20 right-10 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
        <img src={logoSempre} alt="Sempre+" className="h-10 sm:h-12 object-contain mb-3" style={{ filter: 'brightness(0) invert(1)' }} />
        <p className="text-primary-foreground/50 text-[10px] sm:text-xs font-body tracking-wide">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
