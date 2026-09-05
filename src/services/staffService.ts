import { getSupabaseClient } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export const staffService = {
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
};
