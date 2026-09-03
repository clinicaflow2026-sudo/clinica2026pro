import React from 'react';
import {
  Keyboard,
  X,
  UserPlus,
  CalendarPlus,
  Bell,
  MessageSquare,
  Save,
  Search,
  Layers,
  Sparkles,
  Command,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { AppView } from '../../context/AppContext';

interface GlobalKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerShortcut: (action: string) => void;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
  actionId: string;
  badge?: string;
}

export const GlobalKeyboardShortcutsModal: React.FC<GlobalKeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onTriggerShortcut,
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const ctrlLabel = isMac ? '⌘' : 'Ctrl';

  const receptionistShortcuts: ShortcutItem[] = [
    {
      keys: [ctrlLabel, 'N'],
      label: 'Novo Paciente',
      description: 'Abre o formulário de cadastro de paciente de qualquer tela.',
      actionId: 'new_patient',
      badge: 'Essencial',
    },
    {
      keys: [ctrlLabel, 'S'],
      label: 'Salvar Formulário',
      description: 'Submete e valida o formulário ativo/modal sem precisar rolar até o botão.',
      actionId: 'save_form',
      badge: 'Essencial',
    },
    {
      keys: ['Alt', 'A'],
      label: 'Novo Agendamento',
      description: 'Abre a tela de agenda e dispara o agendamento de consulta/sessão.',
      actionId: 'new_appointment',
    },
    {
      keys: [ctrlLabel, 'B'],
      label: 'Avisar Chegada de Paciente',
      description: 'Dispara aviso instantâneo para o consultório do especialista na hora.',
      actionId: 'patient_arrival',
      badge: 'Recepção',
    },
    {
      keys: [ctrlLabel, 'M'],
      label: 'Mensagens Internas (Chat)',
      description: 'Abre o chat da clínica para comunicação com fisioterapeutas e gestores.',
      actionId: 'open_chat',
    },
    {
      keys: [ctrlLabel, 'K'],
      label: 'Busca Global',
      description: 'Foca imediatamente no campo de busca de pacientes, CPFs e serviços.',
      actionId: 'focus_search',
    },
  ];

  const navigationShortcuts: ShortcutItem[] = [
    { keys: ['Alt', '1'], label: 'Dashboard Executivo', description: 'Visão geral e faturamento', actionId: 'nav_dashboard' },
    { keys: ['Alt', '2'], label: 'Agenda Central', description: 'Atendimentos do dia e salas', actionId: 'nav_calendar' },
    { keys: ['Alt', '3'], label: 'Gestão de Pacientes', description: 'Lista e cadastro de pacientes', actionId: 'nav_patients' },
    { keys: ['Alt', '4'], label: 'Prontuários & Evoluções', description: 'Evoluções SOAP e histórico', actionId: 'nav_records' },
    { keys: ['Alt', '5'], label: 'Módulo Financeiro', description: 'Fluxo de caixa, DRE e repasses', actionId: 'nav_financial' },
    { keys: ['Alt', '6'], label: 'Cadastros & Configurações', description: 'Planos, convênios e produtos', actionId: 'nav_cadastros' },
    { keys: ['Alt', '7'], label: 'Chat Interno', description: 'Comunicação direta da equipe', actionId: 'nav_chat' },
  ];

  const helperShortcuts: ShortcutItem[] = [
    { keys: ['F1'], label: 'Guia de Atalhos', description: 'Abre este painel de ajuda a qualquer momento.', actionId: 'help' },
    { keys: ['Esc'], label: 'Fechar Modais', description: 'Fecha janelas sobrepostas e painéis abertos.', actionId: 'escape' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Atalhos de Teclado Globais
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/30 text-teal-300 border border-teal-500/40">
                  Produtividade Recepção
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Acelere o atendimento, cadastro de pacientes e comunicação com a equipe médica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Reception and Primary Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5 text-teal-600" />
              <span>Ações Principais & Recepção</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {receptionistShortcuts.map((sc) => (
                <div
                  key={sc.label}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-start justify-between gap-3 transition group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{sc.label}</span>
                      {sc.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800">
                          {sc.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {sc.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {sc.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs group-hover:border-teal-500 transition"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Fast Navigation */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Navegação Rápida entre Módulos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navigationShortcuts.map((sc) => (
                <div
                  key={sc.label}
                  className="p-2.5 bg-slate-50/60 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 text-[11px]">{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {sc.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Helpers */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Auxiliares</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {helperShortcuts.map((sc) => (
                <div
                  key={sc.label}
                  className="p-2.5 bg-slate-50/60 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-slate-800 text-[11px]">{sc.label}</span>
                    <p className="text-[10px] text-slate-500">{sc.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {sc.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300 rounded shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dica: Pressione <strong>F1</strong> a qualquer momento para abrir este guia.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
