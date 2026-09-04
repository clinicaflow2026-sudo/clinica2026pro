/**
 * Conversão genérica entre snake_case (banco) e camelCase (app/types.ts).
 * Aplicada apenas nas chaves do nível raiz de cada linha — colunas jsonb
 * (ex: signature, address, attachments) são passadas adiante sem alteração,
 * porque já são gravadas/lidas no formato que o próprio frontend produziu.
 */
export function toCamel<T = any>(row: Record<string, any> | null | undefined): T | null {
  if (!row) return null;
  const out: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    out[camelKey] = row[key];
  }
  return out as T;
}

export function toCamelList<T = any>(rows: any[] | null | undefined): T[] {
  return (rows || []).map((r) => toCamel<T>(r)) as T[];
}

export function toSnake(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    out[snakeKey] = obj[key];
  }
  return out;
}
