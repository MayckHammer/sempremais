import { useEffect, useRef, useState } from 'react';
import { Clock, LogOut, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import logoSempre from '@/assets/logo-sempre.png';

export function PendingApproval() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkApproval = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('is_approved')
      .eq('user_id', user.id)
      .single();

    if (data?.is_approved) {
      await refreshUser();
    }
  };

  // Poll every 10s
  useEffect(() => {
    intervalRef.current = setInterval(checkApproval, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const handleManualCheck = async () => {
    setChecking(true);
    await checkApproval();
    setChecking(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <img src={logoSempre} alt="Sempre+" className="mx-auto h-16 object-contain" />

        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-xl font-extrabold text-foreground">
            Cadastro em análise
          </h1>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            Seu cadastro foi recebido com sucesso! Nossa equipe está analisando seus dados.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 justify-center mb-1">
            <Mail className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Em até 24 horas
            </span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            Sua conta será aprovada e você receberá uma notificação. Obrigado pela paciência!
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleManualCheck}
          disabled={checking}
          className="w-full rounded-xl h-11"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Verificar status
        </Button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full rounded-xl h-11 text-muted-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
