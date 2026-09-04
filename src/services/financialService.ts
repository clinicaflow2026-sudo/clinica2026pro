import { getSupabaseClient } from '../lib/supabase';
import { createTenantCrud } from '../lib/tenantCrud';
import { toCamelList } from '../lib/caseConvert';
import type { FinancialEntry, Account, CostCenter, FinancialCategory, PaymentMethod } from '../types';

const entriesCrud = createTenantCrud<FinancialEntry>('financial_entries');

export const financialService = {
  // Lançamentos (contas a pagar/receber)
  listEntries: (tenantId: string) => entriesCrud.list(tenantId, { orderBy: 'due_date', ascending: false }),
  createEntry: entriesCrud.create,
  updateEntry: entriesCrud.update,
  removeEntry: entriesCrud.remove,

  async markAsPaid(entryId: string, paymentDate?: string): Promise<FinancialEntry> {
    return entriesCrud.update(entryId, {
      status: 'paid',
      paymentDate: paymentDate ?? new Date().toISOString().slice(0, 10),
    } as Partial<FinancialEntry>);
  },

  async listByDateRange(tenantId: string, startDate: string, endDate: string): Promise<FinancialEntry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { data, error } = await supabase
      .from('financial_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .gte('due_date', startDate)
      .lte('due_date', endDate);
    if (error) throw error;
    return toCamelList<FinancialEntry>(data);
  },

  /** Resumo do dia: entradas, saídas e saldo — usado no widget de faturamento diário do Dashboard. */
  async getDailySummary(
    tenantId: string,
    date: string
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number; entries: FinancialEntry[] }> {
    const entries = await financialService.listByDateRange(tenantId, date, date);
    const totalIncome = entries.filter((e) => e.type === 'income' && e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpense = entries.filter((e) => e.type === 'expense' && e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, entries };
  },

  // Cadastros auxiliares financeiros — reaproveitam a base genérica direto.
  accounts: createTenantCrud<Account>('accounts'),
  costCenters: createTenantCrud<CostCenter>('cost_centers'),
  categories: createTenantCrud<FinancialCategory>('financial_categories'),
  paymentMethods: createTenantCrud<PaymentMethod>('payment_methods'),
};
