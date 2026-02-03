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
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground text-center">
            Avalie o Atendimento
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-center text-muted-foreground mb-4">{providerName}</p>
        
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-colors"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full gradient-primary"
          disabled={rating === 0 || loading}
        >
          {loading ? 'Enviando...' : 'Confirmar Avaliação'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
