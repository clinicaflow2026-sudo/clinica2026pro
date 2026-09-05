import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import type { Tenant, UserProfile, UserRole } from '../types';

export interface AuthProfile {
  profile: UserProfile;
  tenant: Tenant;
}

function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    cpf: row.cpf ?? undefined,
    status: row.status,
    professionalId: row.professional_id ?? undefined,
    patientId: row.patient_id ?? undefined,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
  };
}

function mapTenantRow(row: any): Tenant {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.trade_name,
    cnpj: row.cnpj,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    slug: row.slug,
    logoUrl: row.logo_url ?? undefined,
    logoIcon: row.logo_icon ?? undefined,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color ?? undefined,
    accentColor: row.accent_color ?? undefined,
    themePreset: row.theme_preset ?? undefined,
    darkMode: row.dark_mode ?? undefined,
    postalCode: row.postal_code ?? undefined,
    customDomain: row.custom_domain ?? undefined,
    planId: row.plan_id,
    financialManagerActive: row.financial_manager_active,
    additionalProfessionalsCount: row.additional_professionals_count,
    trialEndsAt: row.trial_ends_at,
    isTrialActive: row.subscription_status === 'trial' && new Date(row.trial_ends_at) > new Date(),
    subscriptionStatus: row.subscription_status,
    licenseKey: row.license_key ?? undefined,
    welcomeMessage: row.welcome_message,
    rolePermissions: row.role_permissions ?? undefined,
    patientPortalSettings: row.patient_portal_settings ?? undefined,
    createdAt: row.created_at,
  };
}

/** Retorna a sessão atual (ou null se não houver ninguém logado). */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Erro ao obter sessão:', error.message);
    return null;
  }
  return data.session;
}

/** Assina mudanças de sessão (login/logout/refresh de token). */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  const supabase = getSupabaseClient();
  if (!supabase) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase não está configurado. Verifique as variáveis de ambiente.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase não está configurado.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  });
  if (error) return { error: error.message };
  return {};
}

/**
 * Cadastro self-service: cria o usuário no Supabase Auth e, se a sessão já
 * vier ativa (confirmação de e-mail desligada no projeto), provisiona o
 * tenant + profile de admin na sequência via RPC.
 * Se o projeto exigir confirmação de e-mail, `needsEmailConfirmation` volta
 * true e o provisionamento só roda no primeiro login, após a confirmação.
 */
export async function signUpAndCreateTenant(params: {
  tenantName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
}): Promise<{ error?: string; needsEmailConfirmation?: boolean }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase não está configurado. Verifique as variáveis de ambiente.' };

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error) return { error: error.message };

  if (!data.session) {
    // Confirmação de e-mail está ativa no projeto: o provisionamento roda
    // depois, na primeira vez que ensureProfileProvisioned() for chamado
    // (ver AuthContext, disparado após o primeiro login bem-sucedido).
    return { needsEmailConfirmation: true };
  }

  const provisionError = await provisionTenant(params.tenantName, params.slug, params.adminName);
  if (provisionError) return { error: provisionError };
  return {};
}

async function provisionTenant(tenantName: string, slug: string, adminName: string): Promise<string | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return 'Supabase não está configurado.';
  const { error } = await supabase.rpc('provision_tenant', {
    p_tenant_name: tenantName,
    p_slug: slug,
    p_admin_name: adminName,
  });
  if (error) return error.message;
  return undefined;
}

/**
 * Busca profile + tenant do usuário logado. Se o usuário acabou de
 * confirmar o e-mail de um cadastro pendente e ainda não tem profile,
 * quem chamou deve tratar `null` mandando-o de volta para completar o
 * cadastro (não deveria acontecer no fluxo normal, só em contas órfãs).
 */
export async function fetchAuthProfile(): Promise<AuthProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profileRow) {
    console.error('fetchAuthProfile: falha ao buscar profile', profileError?.message || 'nenhuma linha encontrada para este usuário');
    return null;
  }

  const { data: tenantRow, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profileRow.tenant_id)
    .maybeSingle();

  if (tenantError || !tenantRow) {
    console.error('fetchAuthProfile: falha ao buscar tenant', tenantError?.message || `tenant_id ${profileRow.tenant_id} não encontrado`);
    return null;
  }

  return { profile: mapProfileRow(profileRow), tenant: mapTenantRow(tenantRow) };
}
