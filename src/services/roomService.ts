import { getSupabaseClient } from '../lib/supabase';
import { createTenantCrud } from '../lib/tenantCrud';
import { toCamel } from '../lib/caseConvert';
import type { Room } from '../types';

const crud = createTenantCrud<Room>('rooms');

export const roomService = {
  list: (tenantId: string) => crud.list(tenantId, { orderBy: 'name', ascending: true }),
  get: crud.get,
  create: crud.create,
  update: crud.update,
  remove: crud.remove,

  /** Inicia um atendimento: ocupa a sala com os dados de quem está sendo atendido. */
  async startOccupancy(
    roomId: string,
    occupant: {
      patientId: string;
      patientName: string;
      professionalId: string;
      professionalName: string;
      procedureName?: string;
      modality?: string;
      durationMinutes?: number;
    }
  ): Promise<Room> {
    const startedAt = new Date().toISOString();
    const estimatedEndTime = occupant.durationMinutes
      ? new Date(Date.now() + occupant.durationMinutes * 60000).toISOString()
      : undefined;
    return crud.update(roomId, {
      status: 'in_use',
      currentOccupant: { ...occupant, startedAt, estimatedEndTime },
    } as Partial<Room>);
  },

  /** Libera a sala (fim de atendimento). */
  async release(roomId: string, nextStatus: Room['status'] = 'available'): Promise<Room> {
    return crud.update(roomId, { status: nextStatus, currentOccupant: null } as Partial<Room>);
  },

  async setStatus(roomId: string, status: Room['status']): Promise<Room> {
    return crud.update(roomId, { status } as Partial<Room>);
  },

  /**
   * Escuta mudanças em tempo real nas salas do tenant (mapa de ocupação
   * atualizando ao vivo em todas as telas abertas). Retorna uma função de
   * cleanup — chame no useEffect de retorno / unmount do componente.
   */
  subscribeToRooms(tenantId: string, onChange: (room: Room) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`rooms-tenant-${tenantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          const row = (payload.new && Object.keys(payload.new).length ? payload.new : payload.old) as any;
          const mapped = toCamel<Room>(row);
          if (mapped) onChange(mapped);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
