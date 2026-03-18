export function Footer() {
  return (
    <footer className="bg-primary py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="font-display font-bold text-primary-foreground text-sm sm:text-base">SEMPRE</p>
        <p className="text-primary-foreground/70 text-[10px] sm:text-xs mt-1">
          Assistências e Benefícios © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
