import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'client' | 'provider';

const ACTIVE_ROLE_STORAGE_KEY = 'sempre-active-role';
const VALID_ROLES: UserRole[] = ['admin', 'client', 'provider'];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  fullName: string;
  phone?: string;
}

function isUserRole(value: string | null | undefined): value is UserRole {
  return !!value && VALID_ROLES.includes(value as UserRole);
}

function getRoleFromPath(): UserRole | null {
  if (typeof window === 'undefined') return null;

  if (window.location.pathname.includes('/prestador')) return 'provider';
  if (window.location.pathname.includes('/cliente')) return 'client';

  return null;
}

export function setPreferredUserRole(role: UserRole) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
}

export function clearPreferredUserRole() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
}

export function getPreferredUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null;

  const storedRole = window.sessionStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  return isUserRole(storedRole) ? storedRole : null;
}

function resolveActiveRole(roles: UserRole[]): UserRole {
  const routeRole = getRoleFromPath();
  if (routeRole && roles.includes(routeRole)) return routeRole;

  const preferredRole = getPreferredUserRole();
  if (preferredRole && roles.includes(preferredRole)) return preferredRole;

  if (roles.includes('client')) return 'client';
  if (roles.includes('provider')) return 'provider';
  if (roles.includes('admin')) return 'admin';

  return 'client';
}

export interface SignUpExtraData {
  cpf?: string;
  birth_date?: string;
  cep?: string;
  street?: string;
  street_number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_year?: string;
  vehicle_color?: string;
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  phone?: string,
  extraData?: SignUpExtraData
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
        ...extraData,
      },
    },
  });

  if (error) throw error;

  // Update profile with extra data if provided and user was created
  if (data.user && extraData) {
    const profileUpdate: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(extraData)) {
      if (value && value.trim()) {
        profileUpdate[key] = value;
      }
    }
    if (Object.keys(profileUpdate).length > 0) {
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', data.user.id);
    }
  }

  return data;
}

export async function signIn(email: string, password: string, preferredRole?: UserRole) {
  if (preferredRole) {
    setPreferredUserRole(preferredRole);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (preferredRole) {
      clearPreferredUserRole();
    }
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  clearPreferredUserRole();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = Array.from(
    new Set((rolesData ?? []).map(({ role }) => role).filter(isUserRole))
  );

  const resolvedRole = resolveActiveRole(roles);
  setPreferredUserRole(resolvedRole);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    role: resolvedRole,
    roles: roles.length > 0 ? roles : ['client'],
    fullName: profile?.full_name || '',
    phone: profile?.phone || undefined,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  const roles = (data ?? []).map(({ role }) => role).filter(isUserRole);
  return roles[0] || null;
}
