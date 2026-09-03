import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ClinicLogo } from '../common/ClinicLogo';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  DollarSign,
  Database,
  BarChart3,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Globe,
  Settings,
  Building2,
  ChevronDown,
  CheckCircle2,
  Key,
  ShieldCheck,
  Palette,
  ExternalLink,
  Sparkles,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../lib/constants';
import { isViewAllowedForRole } from '../../lib/rolePermissions';

interface SidebarItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  roles?: string[]; // Allowed roles (empty = all)
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    setCurrentUser,
    users,
    messages,
    activeTenant,
    setActiveTenant,
    tenants,
    mobileMenuOpen,
    setMobileMenuOpen,
    setShowLicenseModal,
  } = useApp();
  const { primaryColor } = useTheme();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = messages.filter(
    (m) => !m.read && m.senderId !== currentUser.id && (m.recipientId === currentUser.id || m.recipientId === 'all')
  ).length;

  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda Central', icon: CalendarDays },
    { id: 'patients', label: 'Gestão de Pacientes', icon: Users },
    { id: 'medical_records', label: 'Prontuários & Evoluções', icon: FileText },
    { id: 'financial', label: 'Módulo Financeiro', icon: DollarSign },
    { id: 'cadastros', label: 'Cadastros & Parametrização', icon: Database },
    { id: 'reports', label: 'Relatórios & BI', icon: BarChart3 },
    { id: 'chat', label: 'Mensagens Internas', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'patient_portal', label: 'App do Paciente (PWA)', icon: Smartphone },
    { id: 'superadmin', label: 'SuperAdmin Layer', icon: ShieldAlert, roles: ['superadmin'] },
    { id: 'landing', label: 'Landing Page Comercial', icon: Globe },
    { id: 'settings', label: 'Configurações & Tema', icon: Settings },
  ];

  const isItemVisible = (item: SidebarItem) => {
    if (item.id === 'superadmin') {
      return currentUser.role === 'superadmin';
    }
    if (item.id === 'landing') {
      return true;
    }
    return isViewAllowedForRole(currentUser.role, item.id, activeTenant.rolePermissions);
  };

  const planInfo = SUBSCRIPTION_PLANS[activeTenant.planId];
  const formattedExpDate = activeTenant.trialEndsAt
    ? new Date(activeTenant.trialEndsAt).toLocaleDateString('pt-BR')
    : '20/12/2026';

  const renderNavContent = () => (
    <>
      {/* Brand Header with Embedded Unit / Tenant Switcher */}
      <div className="p-4 border-b border-slate-800/90 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <ClinicLogo size="sm" />
          <div className="leading-tight min-w-0 flex-1">
            <span className="text-white font-bold text-sm tracking-tight truncate block font-display">
              {activeTenant.tradeName || activeTenant.name || 'ClinicFlow Pro'}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> RLS Ativo
              </span>
              <span>•</span>
              <span className="uppercase text-slate-300 font-medium">{activeTenant.planId}</span>
            </div>
          </div>
        </div>

        {/* Embedded Unit Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTenantMenu(!showTenantMenu);
              setShowUserMenu(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition group text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 truncate">
                <p className="text-[11px] font-bold text-slate-200 truncate">{activeTenant.tradeName || activeTenant.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{activeTenant.city || 'São Paulo'} - {activeTenant.state || 'SP'}</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0 transition" />
          </button>

          {showTenantMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Trocar Unidade / Clínica
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/50">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTenant(t);
                      setShowTenantMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition ${
                      t.id === activeTenant.id ? 'bg-teal-950/50 text-teal-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-semibold">{t.tradeName || t.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{t.city} • Plano {t.planId}</p>
                    </div>
                    {t.id === activeTenant.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </button>
                ))}
              </div>
              {currentUser.role === 'superadmin' && (
                <div className="p-2 border-t border-slate-800 bg-slate-950/40">
                  <button
                    onClick={() => {
                      setCurrentView('superadmin');
                      setShowTenantMenu(false);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-1 text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Gerenciar no SuperAdmin
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Módulos Clínicos
        </div>

        {navItems.filter(isItemVisible).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${primaryColor}25`,
                      color: '#ffffff',
                      border: `1px solid ${primaryColor}60`,
                      boxShadow: `0 0 12px ${primaryColor}20`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? '' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                  style={isActive ? { color: primaryColor } : undefined}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area: License Status + User Profile Card */}
      <div className="p-3 border-t border-slate-800/90 space-y-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-950/40">
        {/* License Card with Quick Activation */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-[11px] text-slate-200 font-bold truncate">
                {planInfo?.name || 'Plano Clínica'}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate">
              {activeTenant.subscriptionStatus === 'trial' ? 'Degustação até: ' : 'Expira: '}
              {formattedExpDate}
            </p>
          </div>
          <button
            onClick={() => setShowLicenseModal(true)}
            className="p-1.5 text-teal-400 hover:text-teal-300 hover:bg-teal-950/40 rounded-lg transition border border-teal-800/40 shrink-0"
            title="Inserir ou Atualizar Chave de Licença"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Card with Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowTenantMenu(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-teal-300 uppercase tracking-tight">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
          </button>

          {showUserMenu && (
            <div className="absolute left-0 bottom-full mb-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-100">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simular Outro Perfil:
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/40">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800/80 transition ${
                      u.id === currentUser.id ? 'bg-teal-950/60 text-teal-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase">{u.role}</p>
                    </div>
                    {u.id === currentUser.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setShowUserMenu(false);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 font-medium"
                >
                  <Palette className="w-3.5 h-3.5 text-teal-400" />
                  Personalizar Cores & Tema
                </button>
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setShowUserMenu(false);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver Landing Page Comercial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="no-print hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 select-none">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl border-r border-slate-800 z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
};
