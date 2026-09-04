import { getSupabaseClient } from '../lib/supabase';
import { createTenantCrud } from '../lib/tenantCrud';
import { toCamelList } from '../lib/caseConvert';
import type { Appointment } from '../types';

const crud = createTenantCrud<Appointment>('appointments');

export const appointmentService = {
  list: (tenantId: string) => crud.list(tenantId, { orderBy: 'date', ascending: false }),
  get: crud.get,
  update: crud.update,
  remove: crud.remove,

  async listByRange(tenantId: string, startDate: string, endDate: string): Promise<Appointment[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    return toCamelList<Appointment>(data);
  },

  /**
   * Verifica se já existe outro agendamento no mesmo profissional (ou na
   * mesma sala, se informada) que colida de horário no mesmo dia.
   * Chame antes de create/update para evitar choque de agenda — a UI decide
   * o que fazer com o resultado (bloquear, avisar, permitir mesmo assim).
   */
  async hasConflict(params: {
    tenantId: string;
    date: string;
    startTime: string;
    endTime: string;
    professionalId: string;
    roomId?: string | null;
    excludeAppointmentId?: string;
  }): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');

    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, room_id, professional_id')
      .eq('tenant_id', params.tenantId)
      .eq('date', params.date)
      .is('deleted_at', null)
      .neq('status', 'canceled')
      .lt('start_time', params.endTime)
      .gt('end_time', params.startTime);

    if (params.excludeAppointmentId) query = query.neq('id', params.excludeAppointmentId);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).some(
      (row: any) => row.professional_id === params.professionalId || (params.roomId && row.room_id === params.roomId)
    );
  },

  async create(tenantId: string, payload: Partial<Appointment>): Promise<Appointment> {
    const conflict = await appointmentService.hasConflict({
      tenantId,
      date: payload.date!,
      startTime: payload.startTime!,
      endTime: payload.endTime!,
      professionalId: payload.professionalId!,
      roomId: payload.roomId,
    });
    if (conflict) {
      throw new Error('Já existe um agendamento nesse horário para este profissional ou sala.');
    }
    return crud.create(tenantId, payload);
  },

  /** Marca como concluído — o decremento de sessão do pacote roda automaticamente via trigger no banco. */
  async complete(id: string): Promise<Appointment> {
    return crud.update(id, { status: 'completed' } as Partial<Appointment>);
  },

  async cancel(id: string): Promise<Appointment> {
    return crud.update(id, { status: 'canceled' } as Partial<Appointment>);
  },
};
