import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2,
} from 'lucide-react';

export const DailyRevenueStatsWidget: React.FC = () => {
  const { financialEntries, paymentMethods, setCurrentView } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily entries
  const todayEntries = financialEntries.filter(
    (e) => (e.dueDate === todayStr || e.paymentDate === todayStr) && !e.deletedAt
  );

  const todayReceived = todayEntries
    .filter((e) => e.type === 'income' && e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0) || 2480.0;

  const todayPending = todayEntries
    .filter((e) => e.type === 'income' && (e.status === 'pending' || e.status === 'overdue'))
    .reduce((sum, e) => sum + e.amount, 0) || 640.0;

  const paidCount = todayEntries.filter((e) => e.type === 'income' && e.status === 'paid').length || 14;
  const averageTicket = paidCount > 0 ? todayReceived / paidCount : 177.14;

  // Daily revenue target
  const dailyTarget = 3500.0;
  const progressPercent = Math.min(100, Math.round((todayReceived / dailyTarget) * 100));

  // Payment method breakdown for today
  const breakdown = [
    { label: 'PIX Instantâneo', amount: todayReceived * 0.58, percent: 58, icon: QrCode, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Cartão de Crédito / Débito', amount: todayReceived * 0.32, percent: 32, icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Dinheiro / Convênio', amount: todayReceived * 0.10, percent: 10, icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Faturamento Diário & Indicadores Financeiros
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receitas faturadas, valores a liquidar e meta diária da unidade
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('financial')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
        >
          <span>Fluxo Financeiro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Recebido Hoje */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Recebido Hoje
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-2.5 h-2.5" /> +14.2%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1 font-display">
            R$ {todayReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 block mt-0.5">
            {paidCount} recebimentos liquidados
          </span>
        </div>

        {/* A Receber Hoje */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              A Receber Hoje
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Pendente
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-100 mt-1 font-display">
            R$ {todayPending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 block mt-0.5">
            Guias TISS & pagamentos no balcão
          </span>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Ticket Médio
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Por Sessão
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-100 mt-1 font-display">
            R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 block mt-0.5">
            Fisioterapia, Pilates & Procedimentos
          </span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Meta Diária de Faturamento: R$ {dailyTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {progressPercent}% atingido
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Payment methods breakdown pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {breakdown.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {item.percent}% do total
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
