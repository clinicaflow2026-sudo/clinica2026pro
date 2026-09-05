import { getSupabaseClient } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export const staffService = {
  async list(tenantId: string): Promise<UserProfile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { data, error } = await supabase.from('profiles').select('*').eq('tenant_id', tenantId).order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      professionalId: row.professional_id ?? undefined,
      patientId: row.patient_id ?? undefined,
      createdAt: row.created_at,
    }));
  },
  /**
   * Convida um funcionário de verdade: cria o login no Supabase Auth (envia
   * e-mail de convite) e o profile vinculado ao mesmo tenant de quem está
   * chamando. Só funciona se quem chamar for admin/superadmin — a Edge
   * Function confere isso de novo no servidor, não confia só na tela.
   */
  async inviteStaffUser(params: {
    name: string;
    email: string;
    role: UserRole;
    professionalId?: string;
    patientId?: string;
  }): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');

    const { data, error } = await supabase.functions.invoke('create-staff-user', {
      body: params,
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const row = data.profile;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      professionalId: row.professional_id ?? undefined,
      patientId: row.patient_id ?? undefined,
      createdAt: row.created_at,
    };
  },

  /**
   * Atualiza nome/perfil/vínculo de um usuário JÁ existente. Diferente do
   * convite, isso não passa pela Edge Function — é só um update na tabela
   * profiles, e a RLS (tenant_isolation) já garante que só dá pra alterar
   * alguém do próprio tenant.
   */
  async updateStaffProfile(
    id: string,
    changes: { name?: string; role?: UserRole; professionalId?: string; patientId?: string }
  ): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');

    const row: Record<string, any> = {};
    if (changes.name !== undefined) row.name = changes.name;
    if (changes.role !== undefined) row.role = changes.role;
    if (changes.professionalId !== undefined) row.professional_id = changes.professionalId || null;
    if (changes.patientId !== undefined) row.patient_id = changes.patientId || null;

    const { data, error } = await supabase.from('profiles').update(row).eq('id', id).select().single();
    if (error) throw error;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      professionalId: data.professional_id ?? undefined,
      patientId: data.patient_id ?? undefined,
      createdAt: data.created_at,
    };
  },
};
