import { getSupabaseClient } from './supabase';
import { toCamel, toCamelList, toSnake } from './caseConvert';

/**
 * Gera um conjunto padrão de operações (list/get/create/update/remove) para
 * uma tabela multi-tenant. Cada service específico usa isso como base e
 * adiciona por cima as regras de negócio próprias (checagem de conflito de
 * horário, decremento de sessão, etc.) — nada aqui decide regra de negócio,
 * só encapsula o acesso ao Supabase.
 */
export function createTenantCrud<T extends { id?: string }>(table: string) {
  function client() {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
    return supabase;
  }

  return {
    async list(
      tenantId: string,
      opts?: { orderBy?: string; ascending?: boolean; includeDeleted?: boolean }
    ): Promise<T[]> {
      let query = client().from(table).select('*').eq('tenant_id', tenantId);
      if (!opts?.includeDeleted) query = query.is('deleted_at', null);
      if (opts?.orderBy) query = query.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await query;
      if (error) throw error;
      return toCamelList<T>(data);
    },

    async get(id: string): Promise<T | null> {
      const { data, error } = await client().from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return toCamel<T>(data);
    },

    async create(tenantId: string, payload: Partial<T>): Promise<T> {
      const row = toSnake(payload as Record<string, any>);
      delete row.id;
      row.tenant_id = tenantId;
      const { data, error } = await client().from(table).insert(row).select().single();
      if (error) throw error;
      return toCamel<T>(data) as T;
    },

    async update(id: string, payload: Partial<T>): Promise<T> {
      const row = toSnake(payload as Record<string, any>);
      delete row.id;
      delete row.tenant_id;
      const { data, error } = await client().from(table).update(row).eq('id', id).select().single();
      if (error) throw error;
      return toCamel<T>(data) as T;
    },

    /** Soft-delete por padrão (seta deleted_at). Passe hard: true para apagar de vez. */
    async remove(id: string, opts?: { hard?: boolean }): Promise<void> {
      if (opts?.hard) {
        const { error } = await client().from(table).delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await client().from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
      }
    },
  };
}
