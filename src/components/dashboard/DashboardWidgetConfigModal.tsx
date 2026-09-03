import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  CalendarDays,
  DollarSign,
  CheckSquare,
  Building,
  BarChart3,
  AlertTriangle,
  Layers,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { DashboardWidgetKey } from '../../types';

interface DashboardWidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WidgetItemDef {
  key: DashboardWidgetKey;
  title: string;
  description: string;
  category: 'operacional' | 'financeiro' | 'clinico' | 'analitico';
  icon: React.ElementType;
}

export const DashboardWidgetConfigModal: React.FC<DashboardWidgetConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dashboardWidgets, updateDashboardWidgets, resetDashboardWidgets } = useApp();

  if (!isOpen) return null;

  const widgetDefinitions: WidgetItemDef[] = [
    {
      key: 'appointmentSummaries',
      title: 'Resumo de Agendamentos',
      description: 'Timeline do dia com status de confirmados, em sala, pendentes e concluídos.',
      category: 'operacional',
      icon: CalendarDays,
    },
    {
      key: 'dailyRevenueStats',
      title: 'Faturamento Diário & Indicadores',
      description: 'Receita faturada hoje, a receber, ticket médio e composição por PIX/Cartão.',
      category: 'financeiro',
      icon: DollarSign,
    },
    {
      key: 'pendingTasks',
      title: 'Tarefas & Pendências da Clínica',
      description: 'Checklist interativo de rotinas da recepção, financeiro, enfermagem e higiene.',
      category: 'operacional',
      icon: CheckSquare,
    },
    {
      key: 'roomOccupancy',
      title: 'Controle de Salas & Modalidades',
      description: 'Mapa de salas em tempo real, status livre/ocupada, modalidades e liberação com 1 clique.',
      category: 'clinico',
      icon: Building,
    },
    {
      key: 'statsCards',
      title: 'Cards de Métricas Globais (KPIs)',
      description: 'Total de pacientes ativos, novos pacientes no mês, saldo líquido e taxa de ocupação.',
      category: 'analitico',
      icon: LayoutGrid,
    },
    {
      key: 'mainChart',
      title: 'Gráfico de Fluxo de Caixa & BI',
      description: 'Curvas de entradas vs saídas e volume de atendimentos semanais e mensais.',
      category: 'analitico',
      icon: BarChart3,
    },
    {
      key: 'alertsSection',
      title: 'Alertas Operacionais & Feriados',
      description: 'Avisos de pacotes a vencer, manutenções preventivas e feriados nacionais.',
      category: 'operacional',
      icon: AlertTriangle,
    },
  ];

  const handleToggle = (key: DashboardWidgetKey) => {
    updateDashboardWidgets({
      [key]: !dashboardWidgets[key],
    });
  };

  const enabledCount = Object.values(dashboardWidgets).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Personalizar Widgets do Dashboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {enabledCount} de {widgetDefinitions.length} blocos ativos • Suas preferências são salvas automaticamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widgets List */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {widgetDefinitions.map((item) => {
            const Icon = item.icon;
            const isChecked = dashboardWidgets[item.key] ?? true;

            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isChecked
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/60 shadow-2xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className="shrink-0">
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => resetDashboardWidgets()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Salvar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
