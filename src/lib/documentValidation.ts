/**
 * Utilitários de Validação e Formatação de Documentos Brasileiros (CPF e CNPJ)
 * Implementação matemática oficial de verificação de dígitos (Módulo 11 da Receita Federal).
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function cleanDocument(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Validação algorítmica completa de CPF (Cadastro de Pessoas Físicas)
 * @param cpf Número de CPF formatado ou apenas dígitos
 * @returns Objeto com resultado booleano e mensagem explicativa
 */
export function validateCPF(cpf: string): { isValid: boolean; message?: string } {
  const clean = cleanDocument(cpf);

  if (!clean) {
    return { isValid: false, message: 'CPF é obrigatório.' };
  }

  if (clean.length !== 11) {
    return { isValid: false, message: `CPF incompleto (${clean.length}/11 dígitos).` };
  }

  // Elimina CPFs conhecidos inválidos com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) {
    return { isValid: false, message: 'CPF inválido (dígitos repetidos).' };
  }

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit1 = rest >= 10 ? 0 : rest;

  if (digit1 !== parseInt(clean.charAt(9), 10)) {
    return { isValid: false, message: 'CPF inválido (dígito verificador incorreto).' };
  }

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rest = 11 - (sum % 11);
  let digit2 = rest >= 10 ? 0 : rest;

  if (digit2 !== parseInt(clean.charAt(10), 10)) {
    return { isValid: false, message: 'CPF inválido (dígito verificador incorreto).' };
  }

  return { isValid: true };
}

/**
 * Validação algorítmica completa de CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * @param cnpj Número de CNPJ formatado ou apenas dígitos
 * @returns Objeto com resultado booleano e mensagem explicativa
 */
export function validateCNPJ(cnpj: string): { isValid: boolean; message?: string } {
  const clean = cleanDocument(cnpj);

  if (!clean) {
    return { isValid: false, message: 'CNPJ é obrigatório.' };
  }

  if (clean.length !== 14) {
    return { isValid: false, message: `CNPJ incompleto (${clean.length}/14 dígitos).` };
  }

  // Elimina CNPJs conhecidos inválidos com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(clean)) {
    return { isValid: false, message: 'CNPJ inválido (dígitos repetidos).' };
  }

  // Validação do 1º dígito verificador
  let length = clean.length - 2;
  let numbers = clean.substring(0, length);
  let digits = clean.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) {
    return { isValid: false, message: 'CNPJ inválido (1º dígito verificador incorreto).' };
  }

  // Validação do 2º dígito verificador
  length = length + 1;
  numbers = clean.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) {
    return { isValid: false, message: 'CNPJ inválido (2º dígito verificador incorreto).' };
  }

  return { isValid: true };
}

/**
 * Formata progressivamente um CPF (000.000.000-00) enquanto o usuário digita
 */
export function formatCPF(value: string): string {
  const clean = cleanDocument(value).slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

/**
 * Formata progressivamente um CNPJ (00.000.000/0000-00) enquanto o usuário digita
 */
export function formatCNPJ(value: string): string {
  const clean = cleanDocument(value).slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * Formata automaticamente de acordo com o tamanho do documento (CPF ou CNPJ)
 */
export function formatCPFOrCNPJ(value: string): string {
  const clean = cleanDocument(value);
  if (clean.length <= 11) {
    return formatCPF(clean);
  }
  return formatCNPJ(clean);
}

/**
 * Gera um CPF válido matematicamente para fins de testes rápidos / demonstração
 */
export function generateValidSampleCPF(): string {
  const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  
  // 1º dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (10 - i);
  }
  let rest = 11 - (sum % 11);
  const d1 = rest >= 10 ? 0 : rest;
  randomDigits.push(d1);

  // 2º dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += randomDigits[i] * (11 - i);
  }
  rest = 11 - (sum % 11);
  const d2 = rest >= 10 ? 0 : rest;
  randomDigits.push(d2);

  return formatCPF(randomDigits.join(''));
}

/**
 * Gera um CNPJ válido matematicamente para fins de testes rápidos / demonstração
 */
export function generateValidSampleCNPJ(): string {
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 9));
  // Filial 0001
  base.push(0, 0, 0, 1);

  // 1º dígito
  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += base[i] * pos--;
    if (pos < 2) pos = 9;
  }
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  base.push(d1);

  // 2º dígito
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += base[i] * pos--;
    if (pos < 2) pos = 9;
  }
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  base.push(d2);

  return formatCNPJ(base.join(''));
}
