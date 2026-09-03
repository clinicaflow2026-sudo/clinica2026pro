import { SubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  profissional: {
    id: 'profissional',
    name: 'Plano Profissional',
    description: 'Ideal para profissionais autônomos e consultórios individuais.',
    priceMonthly: 97,
    priceAnnualMonthly: 79,
    maxPatients: 1000,
    maxMonthlyAppointments: 2000,
    maxProfessionals: 1,
    maxUnits: 1,
    maxAdminUsers: 3,
    patientAppIncluded: true,
    financialManagerIncluded: false,
    financialManagerAddonPrice: 49,
    additionalProfessionalPrice: 39,
    features: [
      '1.000 Pacientes cadastrados',
      '2.000 Atendimentos / mês',
      '1 Profissional incluso',
      'Até 3 Usuários Administrativos',
      'App do Paciente Incluso (PWA)',
      'Prontuário com Assinatura Digital',
      'Sincronização com Google Agenda',
      'Gestor Financeiro (+R$49/mês opcional)',
    ],
  },
  equipe: {
    id: 'equipe',
    name: 'Plano Equipe',
    description: 'Perfeito para clínicas em expansão e estúdios de pilates.',
    priceMonthly: 197,
    priceAnnualMonthly: 159,
    maxPatients: 5000,
    maxMonthlyAppointments: 10000,
    maxProfessionals: 5,
    maxUnits: 1,
    maxAdminUsers: 999,
    patientAppIncluded: true,
    financialManagerIncluded: false,
    financialManagerAddonPrice: 49,
    additionalProfessionalPrice: 39,
    features: [
      '5.000 Pacientes cadastrados',
      '10.000 Atendimentos / mês',
      '5 Profissionais inclusos',
      'Usuários Administrativos Ilimitados',
      'App do Paciente Incluso (PWA)',
      'Prontuário com Assinatura Digital',
      'Sincronização com Google Agenda',
      'Repasses & Comissões de Profissionais',
      'Gestor Financeiro (+R$49/mês opcional)',
    ],
  },
  clinica: {
    id: 'clinica',
    name: 'Plano Clínica',
    description: 'Para clínicas consolidadas com gestão financeira completa inclusa.',
    priceMonthly: 347,
    priceAnnualMonthly: 279,
    maxPatients: 20000,
    maxMonthlyAppointments: 999999,
    maxProfessionals: 20,
    maxUnits: 1,
    maxAdminUsers: 999,
    patientAppIncluded: true,
    financialManagerIncluded: true,
    financialManagerAddonPrice: 0,
    additionalProfessionalPrice: 35,
    features: [
      '20.000 Pacientes cadastrados',
      'Atendimentos Mensais Ilimitados',
      '20 Profissionais inclusos',
      'Usuários Administrativos Ilimitados',
      'App do Paciente Incluso (PWA)',
      'Gestor Financeiro Completo Incluso',
      'Emissão de Boletos e NF-e',
      'Backup Individual por Tenant',
      'Suporte Prioritário VIP',
    ],
  },
};

// Brazilian National Holidays List (Feriados Nacionais e Faculdades)
export const BRAZILIAN_HOLIDAYS_2025_2026: Record<string, string> = {
  '01-01': 'Confraternização Universal (Ano Novo)',
  '03-03': 'Carnaval',
  '03-04': 'Carnaval',
  '04-18': 'Sexta-feira Santa',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '06-19': 'Corpus Christi',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '10-13': 'Dia do Fisioterapeuta e Terapeuta Ocupacional',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia Nacional de Zumbi e da Consciência Negra',
  '12-25': 'Natal',
};

export function getHolidayInfo(dateString: string): string | null {
  if (!dateString) return null;
  // dateString is YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length < 3) return null;
  const monthDay = `${parts[1]}-${parts[2]}`;
  return BRAZILIAN_HOLIDAYS_2025_2026[monthDay] || null;
}

export function isWeekend(dateString: string): boolean {
  if (!dateString) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
}

// Generate simple deterministic SHA-256 style hash for license keys
export function generateLicenseHash(tenantId: string, planId: string, expiry: string): string {
  const seed = `${tenantId}::${planId}::${expiry}::CLINICFLOW_PRO_SECRET_SALT_2025`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CFP-${planId.substring(0, 3).toUpperCase()}-${hex}-${randomSuffix}`;
}

export const DEFAULT_CHAT_SETTINGS = {
  soundEnabled: true,
  pushEnabled: true,
  allowAllPostOnMural: true,
  allowReceptionDirectProf: true,
  autoMarkAsRead: true,
  customTemplates: [
    {
      id: 'tmpl-1',
      title: '🚨 Chegada de Paciente',
      text: '🚨 [Recepção] O paciente {paciente} já chegou e aguarda na recepção para o atendimento.',
      category: 'patient_arrival' as const,
    },
    {
      id: 'tmpl-2',
      title: '✅ Sala Liberada',
      text: '✅ [Consultório] Sala higienizada e liberada para o próximo atendimento.',
      category: 'room_ready' as const,
    },
    {
      id: 'tmpl-3',
      title: '⏳ Aviso de Atraso',
      text: '⏳ [Recepção] O paciente {paciente} avisou que terá um atraso estimado de 10 a 15 minutos.',
      category: 'general' as const,
    },
    {
      id: 'tmpl-4',
      title: '📅 Encaixe de Urgência',
      text: '📅 [Recepção] Temos um paciente com queixa aguda solicitando encaixe prioritário para hoje.',
      category: 'urgent' as const,
    },
    {
      id: 'tmpl-5',
      title: '📋 Solicitação de Prontuário / Exames',
      text: '📋 [Clínica] Favor verificar e atualizar a evolução clínica / anexar laudo no prontuário.',
      category: 'notice' as const,
    },
  ],
};
