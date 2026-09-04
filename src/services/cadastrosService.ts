import { createTenantCrud } from '../lib/tenantCrud';
import type {
  Specialty,
  Professional,
  Procedure,
  HealthInsurance,
  Package,
  Product,
  ProductCategory,
  UnitOfMeasure,
  Supplier,
  Equipment,
  TechnicalAssistance,
} from '../types';

/**
 * CRUD genérico para as coleções de "Cadastros & Parametrização" que ainda
 * não tinham um service dedicado. Nada de regra de negócio especial aqui —
 * é só a base tenantCrud aplicada a cada tabela.
 * (rooms fica de fora: já tem roomService próprio, com regras de ocupação.
 *  users/tenants ficam de fora: criação de login depende de Supabase Auth,
 *  que não pode ser feita com a chave anon a partir do navegador.)
 */
export const cadastrosService = {
  specialties: createTenantCrud<Specialty>('specialties'),
  professionals: createTenantCrud<Professional>('professionals'),
  procedures: createTenantCrud<Procedure>('procedures'),
  healthInsurances: createTenantCrud<HealthInsurance>('health_insurances'),
  packages: createTenantCrud<Package>('packages'),
  products: createTenantCrud<Product>('products'),
  productCategories: createTenantCrud<ProductCategory>('product_categories'),
  unitsOfMeasure: createTenantCrud<UnitOfMeasure>('units_of_measure'),
  suppliers: createTenantCrud<Supplier>('suppliers'),
  equipment: createTenantCrud<Equipment>('equipment'),
  technicalAssistance: createTenantCrud<TechnicalAssistance>('technical_assistance'),
};

export type CadastroCollection = keyof typeof cadastrosService;

export function getCadastroService(collection: string) {
  return (cadastrosService as Record<string, ReturnType<typeof createTenantCrud> | undefined>)[collection] || null;
}
