import { getSupabaseClient } from '../lib/supabase';
import { toCamel, toSnake } from '../lib/caseConvert';
import type { Tenant } from '../types';

/**
 * Só a atualização do próprio tenant — a RLS já garante que um admin só
 * consegue alterar o tenant_id que bate com o próprio profile (ou qualquer
 * um, se for superadmin). Não tem create/delete aqui de propósito: criar
 * tenant passa pela função `provision_tenant` (Fase 2), e apagar clínica
 * não é uma operação de auto-serviço.
 */
export const tenantService = {
  async update(tenantId: string, changes: Partial<Tenant>): Promise<Tenant> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const row = toSnake(changes as Record<string, any>);
    delete row.id;
    const { data, error } = await supabase.from('tenants').update(row).eq('id', tenantId).select().single();
    if (error) throw error;
    return toCamel<Tenant>(data) as Tenant;
  },
};
