import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, AppView } from '../../types';
import {
  DEFAULT_ROLE_PERMISSIONS,
  MENU_DEFINITIONS,
  RoleMenuPermissions,
  TenantRolePermissions,
} from '../../lib/rolePermissions';
import {
  Shield,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  Users,
  Eye,
  Settings,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Check,
  Info,
} from 'lucide-react';

const ROLE_PROFILES: {
  id: UserRole;
  name: string;
  badge: string;
  description: string;
  recommendedFor: string;
}[] = [
  {
    id: 'admin',
    name: 'Administrador / Gestor',
    badge: 'Acesso Total',
    description: 'Gestores da clínica com autonomia para gerenciar dados, finanças, configurações e equipe.',
    recommendedFor: 'Proprietários, Diretores Clínicos e Gerentes Gerais',
  },
  {
    id: 'professional',
    name: 'Profissional de Saúde',
    badge: 'Foco Clínico',
    description: 'Fisioterapeutas, Médicos, Terapeutas e Instrutores. Acesso restrito aos prontuários e sua agenda.',
    recommendedFor: 'Profissionais clínicos, terapeutas e parceiros',
  },
  {
    id: 'secretary',
    name: 'Recepção / Secretária',
    badge: 'Atendimento & Caixa',
    description: 'Atendimento na recepção, marcação de consultas, cadastro de pacientes e emissão de recibos.',
    recommendedFor: 'Recepcionistas, secretárias e assistentes de atendimento',
  },
];

export const AccessControlTab: React.FC = () => {
  const { activeTenant, updateRolePermissions, resetRolePermissionsToDefault, currentUser, setCurrentUser, users } = useApp();
  const { primaryColor } = useTheme();

  const [selectedRole, setSelectedRole] = useState<UserRole>('professional');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const currentPermissions: TenantRolePermissions = {
    ...DEFAULT_ROLE_PERMISSIONS,
    ...(activeTenant.rolePermissions || {}),
  };

  const rolePerms = currentPermissions[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole];

  const handleToggleView = (viewId: AppView) => {
    const isCurrentlyAllowed = rolePerms.allowedViews.includes(viewId);
    let newAllowedViews: AppView[];

    if (isCurrentlyAllowed) {
      // Don't allow removing dashboard or patient portal if it's the only one
      newAllowedViews = rolePerms.allowedViews.filter((v) => v !== viewId);
    } else {
      newAllowedViews = [...rolePerms.allowedViews, viewId];
    }

    updateRolePermissions(selectedRole, {
      allowedViews: newAllowedViews,
    });
    triggerToast();
  };

  const handleTogglePermission = (permissionKey: keyof RoleMenuPermissions) => {
    const currentValue = !!rolePerms[permissionKey];
    updateRolePermissions(selectedRole, {
      [permissionKey]: !currentValue,
    });
    triggerToast();
  };

  const handleResetDefaults = () => {
    if (confirm(`Deseja restaurar as permissões recomendadas para o perfil "${selectedRole}"?`)) {
      updateRolePermissions(selectedRole, DEFAULT_ROLE_PERMISSIONS[selectedRole]);
      triggerToast();
    }
  };

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2200);
  };

  const granularPermissionsList: {
    key: keyof RoleMenuPermissions;
    label: string;
    description: string;
    category: string;
  }[] = [
    {
      key: 'canViewMedicalRecords',
      label: 'Visualizar Prontuários e Histórico Clínico',
      description: 'Permite ler evoluções, queixas e fichas de avaliação de pacientes',
      category: 'Clínico',
    },
    {
      key: 'canEditMedicalRecords',
      label: 'Registrar e Assinar Digitalmente Evoluções',
      description: 'Permite criar novas evoluções SOAP, avaliações físicas e emitir prescrições',
      category: 'Clínico',
    },
    {
      key: 'canViewFinancial',
      label: 'Visualizar Fluxo Financeiro e Saldo da Clínica',
      description: 'Acesso a relatórios de faturamento, saldo em contas e despesas da clínica',
      category: 'Financeiro',
    },
    {
      key: 'canManageFinancial',
      label: 'Gerenciar Lançamentos, Despesas e Contas',
      description: 'Permite cadastrar novas despesas, conciliar contas e fechar caixas',
      category: 'Financeiro',
    },
    {
      key: 'canEmitReceiptsAndPDFs',
      label: 'Emitir e Imprimir Recibos e Comprovantes',
      description: 'Gera recibos oficiais de quitação para reembolso de convênios/IR e PDFs',
      category: 'Documentos',
    },
    {
      key: 'canViewReports',
      label: 'Visualizar Relatórios Gerenciais e BI',
      description: 'Acesso às análises de produtividade, taxa de ocupação e faturamento por profissional',
      category: 'Gestão',
    },
    {
      key: 'canManageCadastros',
      label: 'Cadastrar Salas, Procedimentos e Profissionais',
      description: 'Parametrização de serviços, tabelas de preços e recursos da clínica',
      category: 'Gestão',
    },
    {
      key: 'canSendInternalMessages',
      label: 'Acesso ao Chat Interno da Equipe',
      description: 'Envio de avisos rápidos (chegada de paciente, sala pronta, avisos urgentes)',
      category: 'Comunicação',
    },
    {
      key: 'canManageSettings',
      label: 'Alterar Dados Cadastrais e Configurações',
      description: 'Editar CNPJ, endereço da clínica, chaves de API e licença',
      category: 'Administração',
    },
    {
      key: 'canManageTheme',
      label: 'Personalizar Identidade Visual e Tema',
      description: 'Trocar cores da clínica, logo e paletas pré-configuradas',
      category: 'Administração',
    },
    {
      key: 'canDeleteRecords',
      label: 'Excluir Registros Definitivamente',
      description: 'Excluir cadastros de pacientes ou consultas passadas',
      category: 'Segurança',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border bg-slate-900 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-slate-200 tracking-wider">
              <Shield className="w-3 h-3 text-teal-400" /> Controle de Acesso Baseado em Papéis (RBAC)
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              Gestão de Perfis & Permissões de Menus
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Defina com precisão quais menus da barra lateral e ações estão liberados para cada perfil da clínica
              (Administrador, Profissional de Saúde ou Recepção).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showSavedToast && (
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Permissões atualizadas em tempo real!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Profile Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLE_PROFILES.map((profile) => {
          const isSelected = selectedRole === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedRole(profile.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-slate-900 bg-white shadow-md ring-2 ring-slate-900/10'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {profile.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {profile.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {profile.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Role Profile Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
        {/* Header of Active Role */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900">
                Configurando Perfil: {ROLE_PROFILES.find((p) => p.id === selectedRole)?.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Alterne os menus que aparecerão na navegação e as permissões operacionais deste cargo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrão Recomendado
            </button>
          </div>
        </div>

        {/* Section 1: Menus Visíveis na Barra Lateral (Sidebar) */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-700" />
                Menus Visíveis na Barra Lateral (Navegação)
              </h4>
              <p className="text-xs text-slate-500">
                Menus desmarcados serão ocultados da sidebar e protegidos contra acesso direto para este perfil.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {rolePerms.allowedViews.length} de {MENU_DEFINITIONS.length} menus ativos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {MENU_DEFINITIONS.map((menu) => {
              const isAllowed = rolePerms.allowedViews.includes(menu.id);
              return (
                <div
                  key={menu.id}
                  onClick={() => handleToggleView(menu.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isAllowed
                      ? 'border-teal-300 bg-teal-50/50 hover:bg-teal-50'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isAllowed ? 'text-teal-950' : 'text-slate-700'}`}>
                        {menu.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">{menu.category}</span>
                    <p className="text-[11px] text-slate-500 truncate">{menu.description}</p>
                  </div>

                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                        isAllowed ? 'bg-teal-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isAllowed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Permissões Granulares de Ação */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-700" />
              Permissões Granulares de Operação & Dados
            </h4>
            <p className="text-xs text-slate-500">
              Controle o que os usuários com este perfil podem visualizar, editar ou emitir dentro dos módulos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {granularPermissionsList.map((perm) => {
              const isEnabled = !!rolePerms[perm.key];
              return (
                <div
                  key={perm.key}
                  onClick={() => handleTogglePermission(perm.key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isEnabled
                      ? 'border-slate-300 bg-white hover:border-slate-400 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-600'}`}>
                        {perm.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{perm.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                      isEnabled ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                        isEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Quick Role Testing Switcher */}
        <div className="p-6 bg-slate-50/70 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Testar Visualização Imediata como este Perfil:</p>
              <p className="text-[11px] text-slate-500">
                Você está logado atualmente como:{' '}
                <strong>
                  {currentUser.name} ({currentUser.role})
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {users
              .filter((u) => u.tenantId === activeTenant.id)
              .slice(0, 3)
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    triggerToast();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    currentUser.id === u.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {u.name.split(' ')[0]} ({u.role})
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
