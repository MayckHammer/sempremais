import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'client' | 'provider';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  phone?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        role,
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    role: (roleData?.role as UserRole) || 'client',
    fullName: profile?.full_name || '',
    phone: profile?.phone || undefined,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  return (data?.role as UserRole) || null;
}
