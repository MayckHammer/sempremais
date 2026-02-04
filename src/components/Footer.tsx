import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="relative py-6 sm:py-8 px-4 border-t border-border overflow-hidden">
      {/* Logo como Marca d'Água no Canto Direito */}
      <div className="absolute inset-y-0 right-4 sm:right-8 flex items-center pointer-events-none">
        <img 
          src={logo} 
          alt="" 
          className="w-24 h-24 sm:w-36 sm:h-36 object-contain opacity-10"
        />
      </div>
      
      <div className="max-w-6xl mx-auto text-center text-muted-foreground relative z-10">
        <p className="text-xs sm:text-sm">© 2024 Mi Rebok - Guincho e Assistência 24h</p>
      </div>
    </footer>
  );
}
