import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { SupportChatWindow } from './SupportChatWindow';

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <SupportChatWindow onClose={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
        aria-label={isOpen ? 'Fechar suporte' : 'Abrir suporte'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}
