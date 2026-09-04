import { getSupabaseClient } from '../lib/supabase';
import { createTenantCrud } from '../lib/tenantCrud';
import { toCamelList } from '../lib/caseConvert';
import type { Patient } from '../types';

const crud = createTenantCrud<Patient>('patients');

export const patientService = {
  list: (tenantId: string) => crud.list(tenantId, { orderBy: 'name', ascending: true }),
  get: crud.get,
  create: crud.create,
  update: crud.update,
  remove: crud.remove,

  async search(tenantId: string, query: string): Promise<Patient[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,cpf.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return toCamelList<Patient>(data);
  },
};
