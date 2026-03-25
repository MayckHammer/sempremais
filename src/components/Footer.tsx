import logoSempre from '@/assets/logo-sempre.png';

export function Footer() {
  return (
    <footer className="bg-primary py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
        <img src={logoSempre} alt="Sempre+" className="h-10 sm:h-12 object-contain mb-2" style={{ filter: 'brightness(0) invert(1)' }} />
        <p className="text-primary-foreground/70 text-[10px] sm:text-xs">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
