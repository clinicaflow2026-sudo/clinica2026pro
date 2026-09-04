import { createTenantCrud } from '../lib/tenantCrud';
import type { ClinicTask } from '../types';

const crud = createTenantCrud<ClinicTask>('clinic_tasks');

export const taskService = {
  list: (tenantId: string) => crud.list(tenantId, { orderBy: 'due_date', ascending: true }),
  create: crud.create,
  update: crud.update,
  remove: (id: string) => crud.remove(id, { hard: true }), // tarefa concluída não precisa de soft-delete/histórico

  async toggle(id: string, completed: boolean): Promise<ClinicTask> {
    return crud.update(id, { completed } as Partial<ClinicTask>);
  },
};
