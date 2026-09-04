import { getSupabaseClient } from '../lib/supabase';
import { toCamel, toCamelList, toSnake } from '../lib/caseConvert';
import type { InternalMessage, ChatSettings } from '../types';

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não está configurado.');
  return supabase;
}

export const chatService = {
  async listRecent(tenantId: string, limit = 200): Promise<InternalMessage[]> {
    const { data, error } = await client()
      .from('internal_messages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return toCamelList<InternalMessage>(data).reverse();
  },

  async send(tenantId: string, payload: Partial<InternalMessage>): Promise<InternalMessage> {
    const row = toSnake(payload as Record<string, any>);
    delete row.id;
    row.tenant_id = tenantId;
    const { data, error } = await client().from('internal_messages').insert(row).select().single();
    if (error) throw error;
    return toCamel<InternalMessage>(data) as InternalMessage;
  },

  /** Atalho para o aviso de chegada de paciente na recepção. */
  async sendPatientArrival(
    tenantId: string,
    params: {
      senderId: string;
      senderName: string;
      senderRole: InternalMessage['senderRole'];
      recipientId: string; // id do profissional, ou 'all'
      patientId: string;
      patientName: string;
      content?: string;
    }
  ): Promise<InternalMessage> {
    return chatService.send(tenantId, {
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      recipientId: params.recipientId,
      category: 'patient_arrival',
      patientId: params.patientId,
      patientName: params.patientName,
      content: params.content ?? `${params.patientName} chegou e está aguardando.`,
    } as Partial<InternalMessage>);
  },

  async markAsRead(messageId: string): Promise<void> {
    const { error } = await client().from('internal_messages').update({ read: true }).eq('id', messageId);
    if (error) throw error;
  },

  /** Escuta novas mensagens do tenant em tempo real (chat interno). */
  subscribeToMessages(tenantId: string, onNewMessage: (message: InternalMessage) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`chat-tenant-${tenantId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'internal_messages', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          const mapped = toCamel<InternalMessage>(payload.new as any);
          if (mapped) onNewMessage(mapped);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getSettings(tenantId: string): Promise<ChatSettings | null> {
    const { data, error } = await client().from('chat_settings').select('*').eq('tenant_id', tenantId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const mapped = toCamel<any>(data)!;
    delete mapped.tenantId;
    delete mapped.updatedAt;
    return mapped as ChatSettings;
  },

  async upsertSettings(tenantId: string, settings: Partial<ChatSettings>): Promise<ChatSettings> {
    const row = toSnake(settings as Record<string, any>);
    row.tenant_id = tenantId;
    row.updated_at = new Date().toISOString();
    const { data, error } = await client().from('chat_settings').upsert(row, { onConflict: 'tenant_id' }).select().single();
    if (error) throw error;
    const mapped = toCamel<any>(data)!;
    delete mapped.tenantId;
    delete mapped.updatedAt;
    return mapped as ChatSettings;
  },
};
