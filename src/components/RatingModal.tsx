import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  providerName: string;
  onSubmit: (rating: number) => Promise<void>;
}

export function RatingModal({ open, onClose, providerName, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(rating);
      setRating(0);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong border-border max-w-sm mx-4 sm:mx-auto rounded-2xl shadow-elevated">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-foreground text-center font-display font-extrabold tracking-tight">
            Avalie o Atendimento
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-center text-muted-foreground text-sm mb-3 sm:mb-4 font-body">{providerName}</p>
        
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-all duration-200 p-1 hover:scale-110"
            >
              <Star
                className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-gold fill-gold'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full gradient-primary h-10 sm:h-11 text-sm font-display font-bold btn-glow rounded-xl shadow-premium"
          disabled={rating === 0 || loading}
        >
          {loading ? 'Enviando...' : 'Confirmar Avaliação'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
