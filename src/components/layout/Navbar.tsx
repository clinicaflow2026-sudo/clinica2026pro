import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Menu,
  X,
  Plus,
  MessageSquare,
  Smartphone,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  DollarSign,
  Database,
  BarChart3,
  ShieldAlert,
  Globe,
  Settings,
  Clock,
  Key,
  CheckCircle2,
  Keyboard,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenLicenseModal: () => void;
  onOpenShortcutsModal?: () => void;
}

const VIEW_CONFIG: Record<AppView, { title: string; subtitle: string; icon: React.ElementType }> = {
  dashboard: { title: 'Dashboard Executivo', subtitle: 'Visão geral da clínica e indicadores', icon: LayoutDashboard },
  calendar: { title: 'Agenda Central', subtitle: 'Agendamentos e salas de atendimento', icon: CalendarDays },
  patients: { title: 'Gestão de Pacientes', subtitle: 'Prontuários, convênios e histórico clínico', icon: Users },
  medical_records: { title: 'Prontuários & Evoluções', subtitle: 'Avaliações fisioterapêuticas e anexos', icon: FileText },
  financial: { title: 'Módulo Financeiro', subtitle: 'Fluxo de caixa, DRE e comissões', icon: DollarSign },
  cadastros: { title: 'Cadastros & Parametrização', subtitle: 'Convênios, planos, salas e serviços', icon: Database },
  reports: { title: 'Relatórios & BI', subtitle: 'Análises de produtividade e faturamento', icon: BarChart3 },
  chat: { title: 'Mensagens Internas', subtitle: 'Comunicação direta entre a equipe', icon: MessageSquare },
  patient_portal: { title: 'App do Paciente (PWA)', subtitle: 'Visualização da experiência mobile do cliente', icon: Smartphone },
  superadmin: { title: 'SuperAdmin Layer', subtitle: 'Gerenciamento de clínicas e banco multi-tenant', icon: ShieldAlert },
  landing: { title: 'Landing Page Comercial', subtitle: 'Página pública de planos e conversão', icon: Globe },
  settings: { title: 'Configurações da Clínica', subtitle: 'Identidade visual, regras e permissões', icon: Settings },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenLicenseModal, onOpenShortcutsModal }) => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    mobileMenuOpen,
    setMobileMenuOpen,
    messages,
    currentUser,
    activeTenant,
  } = useApp();
  const { primaryColor, isDarkMode, toggleDarkMode } = useTheme();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const currentConfig = VIEW_CONFIG[currentView] || VIEW_CONFIG.dashboard;
  const CurrentIcon = currentConfig.icon;
  const unreadMessagesCount = (messages || []).filter(
    (m) => !m.read && m.senderId !== currentUser?.id && (m.recipientId === currentUser?.id || m.recipientId === 'all')
  ).length;

  const calculateDaysLeftInTrial = () => {
    if (!activeTenant?.trialEndsAt) return 0;
    const end = new Date(activeTenant.trialEndsAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeftInTrial();
  const isTrial = activeTenant?.subscriptionStatus === 'trial';

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors duration-150">
      {/* Degustação Alert Banner */}
      {isTrial && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/50 px-4 sm:px-6 py-1 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">
              Período de Degustação: <strong>{daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}</strong> no plano {activeTenant?.planId?.toUpperCase() || 'PRO'}
            </span>
          </div>
          <button
            onClick={onOpenLicenseModal}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-0.5 rounded-full font-bold transition shadow-2xs text-[10px] shrink-0"
          >
            <Key className="w-2.5 h-2.5" />
            <span>Ativar Chave Definitiva</span>
          </button>
        </div>
      )}

      {/* Main Topbar Row */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Left: Hamburger (Mobile) + Current View Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                {currentConfig.title}
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate hidden sm:block">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center & Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Search Input */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Buscar paciente, CPF ou serviço... (Ctrl+K)"
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-12 text-xs w-48 lg:w-64 focus:outline-none focus:ring-2 ring-teal-500/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              title="Atalho: Ctrl+K"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            ) : (
              <kbd className="hidden lg:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-700/80 border border-slate-300/80 dark:border-slate-600 px-1 rounded pointer-events-none">
                Ctrl+K
              </kbd>
            )}
          </div>

          {/* Global Keyboard Shortcuts Guide Button */}
          {onOpenShortcutsModal && (
            <button
              onClick={onOpenShortcutsModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs"
              title="Guia de Atalhos Globais de Teclado (Pressione F1)"
            >
              <Keyboard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden xl:inline text-[11px] font-bold">Atalhos</span>
              <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[9px] font-mono font-bold">F1</kbd>
            </button>
          )}

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition border shadow-2xs flex items-center justify-center ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={isDarkMode ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro / Noturno'}
            aria-label="Alternar Tema Escuro"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Context Action Button */}
          {currentView === 'patients' ? (
            <button
              onClick={() => {
                const addBtn = document.querySelector('button:has-text("Cadastrar Novo Paciente")') as HTMLElement;
                addBtn?.click();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Paciente</span>
            </button>
          ) : currentView === 'calendar' ? (
            <button
              onClick={() => {
                const addApptBtn = document.querySelector('#btn-add-appointment') as HTMLElement;
                addApptBtn?.click();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Agendamento</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('patients')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Novo Paciente</span>
              <span className="lg:hidden">Paciente</span>
            </button>
          )}

          {/* Patient App Shortcut */}
          <button
            onClick={() => setCurrentView('patient_portal')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl transition border hover:opacity-95 shadow-2xs"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
              borderColor: `${primaryColor}30`,
            }}
            title="Abrir App do Paciente / PWA"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">App Paciente</span>
          </button>

          {/* Internal Chat Button with Badge */}
          <button
            onClick={() => setCurrentView('chat')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs"
            title="Mensagens da Equipe"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Buscar paciente, CPF, serviço..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:ring-2 ring-teal-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};
