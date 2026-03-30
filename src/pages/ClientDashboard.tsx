import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientHome } from '@/components/ClientHome';
import { useAuth } from '@/contexts/AuthContext';
import { setPreferredUserRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupportChat } from '@/components/SupportChat';

interface Provider {
  id: string;
  user_id: string;
  services: string[];
  average_rating: number;
  total_jobs: number;
  accepted_jobs: number;
  is_available: boolean;
  profiles?: { full_name: string };
}

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  client_name: string;
  client_phone: string;
  vehicle_info: string | null;
  description: string | null;
  address: string;
  rating: number | null;
  created_at: string;
  provider_id: string | null;
  providers?: { profiles?: { full_name: string } };
}

export default function ClientDashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState({ address: 'Detectando localização...', lat: -23.5505, lng: -46.6333 });
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login/cliente');
      return;
    }

    if (!user.roles.includes('client')) {
      navigate(user.roles.includes('provider') ? '/prestador' : '/');
      return;
    }

    if (user.role !== 'client') {
      setPreferredUserRole('client');
      void refreshUser();
    }
  }, [user, authLoading, navigate, refreshUser]);

  useEffect(() => {
    if (user) {
      detectLocation();
      fetchProviders();
    }
  }, [user]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
          toast.success('Localização atualizada!');
        },
        () => {
          setLocation(prev => ({ ...prev, address: 'São Paulo, SP (Localização padrão)' }));
        }
      );
    }
  };

  const fetchProviders = async () => {
    const { data } = await supabase
      .from('providers')
      .select(`*, profiles:user_id (full_name)`)
      .eq('is_approved', true)
      .eq('is_available', true)
      .order('average_rating', { ascending: false })
      .limit(10);
    if (data) setProviders(data as unknown as Provider[]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <>
      <ClientHome location={location} providers={providers} />
      <SupportChat />
    </>
  );
}
