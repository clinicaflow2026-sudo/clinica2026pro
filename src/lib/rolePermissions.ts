import { AppView, UserRole } from '../types';

export interface RoleMenuPermissions {
  allowedViews: AppView[];
  canViewFinancial: boolean;
  canManageFinancial: boolean;
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canEmitReceiptsAndPDFs: boolean;
  canViewReports: boolean;
  canManageCadastros: boolean;
  canSendInternalMessages: boolean;
  canManageSettings: boolean;
  canManageTheme: boolean;
  canManageAccessControl: boolean;
  canDeleteRecords: boolean;
  canDirectChatProf: boolean;
}

export type TenantRolePermissions = Record<UserRole, RoleMenuPermissions>;

export const DEFAULT_ROLE_PERMISSIONS: TenantRolePermissions = {
  superadmin: {
    allowedViews: [
      'dashboard',
      'calendar',
      'patients',
      'medical_records',
      'financial',
      'cadastros',
      'reports',
      'chat',
      'patient_portal',
      'superadmin',
      'landing',
      'settings',
    ],
    canViewFinancial: true,
    canManageFinancial: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canEmitReceiptsAndPDFs: true,
    canViewReports: true,
    canManageCadastros: true,
    canSendInternalMessages: true,
    canManageSettings: true,
    canManageTheme: true,
    canManageAccessControl: true,
    canDeleteRecords: true,
    canDirectChatProf: true,
  },
  admin: {
    allowedViews: [
      'dashboard',
      'calendar',
      'patients',
      'medical_records',
      'financial',
      'cadastros',
      'reports',
      'chat',
      'patient_portal',
      'landing',
      'settings',
    ],
    canViewFinancial: true,
    canManageFinancial: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canEmitReceiptsAndPDFs: true,
    canViewReports: true,
    canManageCadastros: true,
    canSendInternalMessages: true,
    canManageSettings: true,
    canManageTheme: true,
    canManageAccessControl: true,
    canDeleteRecords: true,
    canDirectChatProf: true,
  },
  professional: {
    allowedViews: [
      'dashboard',
      'calendar',
      'patients',
      'medical_records',
      'reports',
      'chat',
      'patient_portal',
    ],
    canViewFinancial: false,
    canManageFinancial: false,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canEmitReceiptsAndPDFs: true,
    canViewReports: true,
    canManageCadastros: false,
    canSendInternalMessages: true,
    canManageSettings: false,
    canManageTheme: false,
    canManageAccessControl: false,
    canDeleteRecords: false,
    canDirectChatProf: true,
  },
  secretary: {
    allowedViews: [
      'dashboard',
      'calendar',
      'patients',
      'financial',
      'chat',
      'patient_portal',
    ],
    canViewFinancial: true,
    canManageFinancial: false,
    canViewMedicalRecords: false,
    canEditMedicalRecords: false,
    canEmitReceiptsAndPDFs: true,
    canViewReports: false,
    canManageCadastros: false,
    canSendInternalMessages: true,
    canManageSettings: false,
    canManageTheme: false,
    canManageAccessControl: false,
    canDeleteRecords: false,
    canDirectChatProf: true,
  },
  patient: {
    allowedViews: ['patient_portal'],
    canViewFinancial: false,
    canManageFinancial: false,
    canViewMedicalRecords: false,
    canEditMedicalRecords: false,
    canEmitReceiptsAndPDFs: false,
    canViewReports: false,
    canManageCadastros: false,
    canSendInternalMessages: false,
    canManageSettings: false,
    canManageTheme: false,
    canManageAccessControl: false,
    canDeleteRecords: false,
    canDirectChatProf: false,
  },
};

export const MENU_DEFINITIONS: {
  id: AppView;
  label: string;
  category: string;
  description: string;
}[] = [
  { id: 'dashboard', label: 'Dashboard & Indicadores', category: 'Visão Geral', description: 'Métricas de atendimento, ocupação de agenda e alertas' },
  { id: 'calendar', label: 'Agenda Central', category: 'Atendimento', description: 'Visualização diária, semanal e mensal de consultas' },
  { id: 'patients', label: 'Gestão de Pacientes', category: 'Atendimento', description: 'Cadastro completo, anamnese e histórico' },
  { id: 'medical_records', label: 'Prontuários & Evoluções', category: 'Clínico', description: 'Evoluções SOAP com assinatura digital e avaliações' },
  { id: 'financial', label: 'Módulo Financeiro', category: 'Gestão', description: 'Fluxo de caixa, recebimentos, despesas e DRE' },
  { id: 'cadastros', label: 'Cadastros & Parametrização', category: 'Gestão', description: 'Salas, convênios, procedimentos e profissionais' },
  { id: 'reports', label: 'Relatórios & BI', category: 'Gestão', description: 'Demonstrativos e análises de desempenho' },
  { id: 'chat', label: 'Mensagens Internas', category: 'Comunicação', description: 'Chat em tempo real entre recepção e profissionais' },
  { id: 'patient_portal', label: 'App do Paciente (PWA)', category: 'Paciente', description: 'Visão do aplicativo do paciente' },
  { id: 'settings', label: 'Configurações & Tema', category: 'Administração', description: 'Personalização visual, dados da clínica e acessos' },
  { id: 'superadmin', label: 'SuperAdmin Layer', category: 'Multi-Tenant', description: 'Gestão de todas as clínicas e licenças' },
  { id: 'landing', label: 'Landing Page Comercial', category: 'Comercial', description: 'Página de apresentação dos planos' },
];

export function isViewAllowedForRole(
  role: UserRole,
  view: AppView,
  customPermissions?: Partial<TenantRolePermissions>
): boolean {
  if (role === 'superadmin') return true;
  const roleConfig = customPermissions?.[role] || DEFAULT_ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.allowedViews.includes(view);
}

export function hasPermission(
  role: UserRole,
  permission: keyof RoleMenuPermissions,
  customPermissions?: Partial<TenantRolePermissions>
): boolean {
  if (role === 'superadmin') return true;
  const roleConfig = customPermissions?.[role] || DEFAULT_ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return !!roleConfig[permission];
}
