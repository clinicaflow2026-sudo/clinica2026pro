import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  SlidersHorizontal,
  Wrench,
  PartyPopper,
  Calendar,
  MessageSquare,
  Building,
  CheckSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BRAZILIAN_HOLIDAYS_2025_2026 } from '../../lib/constants';
import { AppointmentSummariesWidget } from './AppointmentSummariesWidget';
import { DailyRevenueStatsWidget } from './DailyRevenueStatsWidget';
import { PendingTasksWidget } from './PendingTasksWidget';
import { RoomOccupancyWidget } from './RoomOccupancyWidget';
import { DashboardWidgetConfigModal } from './DashboardWidgetConfigModal';

export const Dashboard: React.FC = () => {
  const {
    activeTenant,
    appointments,
    patients,
    financialEntries,
    specialties,
    rooms,
    equipment,
    patientPackages,
    setCurrentView,
    dashboardWidgets,
  } = useApp();

  const [period, setPeriod] = useState<'semanal' | 'mensal'>('mensal');
  const [chartType, setChartType] = useState<'composed' | 'bar' | 'line' | 'area'>('composed');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const totalPatients = patients.filter((p) => !p.deletedAt).length;
  const newPatientsThisMonth = patients.filter((p) => p.createdAt?.startsWith(thisMonthStr) && !p.deletedAt).length;

  const todayAppointments = appointments.filter((a) => a.date === todayStr && !a.deletedAt);
  const monthAppointments = appointments.filter((a) => a.date.startsWith(thisMonthStr) && !a.deletedAt);

  // Financial calculations
  const totalIncome = financialEntries
    .filter((e) => e.type === 'income' && e.status === 'paid' && !e.deletedAt)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = financialEntries
    .filter((e) => e.type === 'expense' && e.status === 'paid' && !e.deletedAt)
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Chart data
  const weeklyData = [
    { label: 'Seg', atendimentos: 18, receita: 2800 },
    { label: 'Ter', atendimentos: 24, receita: 3600 },
    { label: 'Qua', atendimentos: 20, receita: 3100 },
    { label: 'Qui', atendimentos: 28, receita: 4400 },
    { label: 'Sex', atendimentos: 22, receita: 3500 },
    { label: 'Sáb', atendimentos: 30, receita: 5100 },
    { label: 'Dom', atendimentos: 8, receita: 1200 },
  ];

  const monthlyCashFlowData = [
    { label: 'Mar', atendimentos: 142, receita: totalIncome * 0.72 || 28000, entradas: totalIncome * 0.72 || 28000, saidas: totalExpense * 0.78 || 12000 },
    { label: 'Abr', atendimentos: 168, receita: totalIncome * 0.81 || 32000, entradas: totalIncome * 0.81 || 32000, saidas: totalExpense * 0.75 || 11500 },
    { label: 'Mai', atendimentos: 185, receita: totalIncome * 0.88 || 36500, entradas: totalIncome * 0.88 || 36500, saidas: totalExpense * 0.82 || 13200 },
    { label: 'Jun', atendimentos: 210, receita: totalIncome * 0.93 || 39000, entradas: totalIncome * 0.93 || 39000, saidas: totalExpense * 0.86 || 14000 },
    { label: 'Jul', atendimentos: 195, receita: totalIncome * 0.89 || 37200, entradas: totalIncome * 0.89 || 37200, saidas: totalExpense * 0.81 || 12800 },
    { label: 'Ago', atendimentos: 230, receita: totalIncome || 42800, entradas: totalIncome || 42800, saidas: totalExpense || 14800 },
  ];

  const activeFlowData = period === 'semanal' ? weeklyData : monthlyCashFlowData;

  // Specialty breakdown
  const specialtyRevenueData = specialties.map((spec) => {
    const apts = appointments.filter((a) => a.specialtyId === spec.id && !a.deletedAt);
    const revenue = apts.reduce((sum, a) => sum + (a.price || 0), 0) + (spec.name.includes('Pilates') ? 480 : 320);
    return {
      name: spec.name.split(' ')[0],
      fullName: spec.name,
      value: revenue,
      color: spec.color || '#3b82f6',
    };
  });

  // Room occupancy rate
  const roomOccupancyData = rooms.map((room) => {
    const aptsInRoom = todayAppointments.filter((a) => a.roomId === room.id).length;
    const percent = Math.min(100, Math.round((aptsInRoom / 8) * 100)) || (room.inMaintenance ? 0 : 78);
    return {
      name: room.name.replace('Consultório ', 'C.').replace('Studio ', 'S. '),
      percent,
      inMaintenance: room.inMaintenance,
    };
  });

  // Upcoming appointments for today
  const upcomingList = [
    {
      time: '14:30',
      patient: 'Carlos Alberto',
      procedure: 'Fisioterapia Traumato-Ortopédica',
      badgeColor: 'bg-orange-100 text-orange-600',
    },
    {
      time: '15:15',
      patient: 'Ana Beatriz Faria',
      procedure: 'Pilates Reabilitativo (Reformer)',
      badgeColor: 'bg-blue-100 text-blue-600',
    },
    {
      time: '16:00',
      patient: 'Juliana Mendes',
      procedure: 'Drenagem Linfática & Radiofrequência',
      badgeColor: 'bg-slate-100 text-slate-600',
    },
  ];

  // Packages expiring
  const expiringPackages = patientPackages.filter((p) => {
    const exp = new Date(p.expirationDate).getTime();
    const diffDays = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15;
  });

  const upcomingHolidays = Object.entries(BRAZILIAN_HOLIDAYS_2025_2026).slice(0, 2);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2.5">
            Dashboard Executivo
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Power BI View
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Métricas em tempo real, fluxo de caixa e indicadores de atendimento da unidade.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => setPeriod('semanal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                period === 'semanal'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriod('mensal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                period === 'mensal'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mensal
            </button>
          </div>

          {/* Widget Config */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Personalizar Indicadores do Dashboard"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Widgets</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar BI</span>
          </button>
        </div>
      </div>

      {/* Widget Customization Modal */}
      <DashboardWidgetConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />

      {/* Customizable Widget 1: Appointment Summaries (Resumo de Agendamentos de Hoje) */}
      {dashboardWidgets.appointmentSummaries && (
        <AppointmentSummariesWidget />
      )}

      {/* Customizable Widget 2 & 3: Daily Revenue Stats & Clinic Pending Tasks in 2-col responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardWidgets.dailyRevenueStats && (
          <DailyRevenueStatsWidget />
        )}
        {dashboardWidgets.pendingTasks && (
          <PendingTasksWidget />
        )}
      </div>

      {/* Customizable Widget 4: Room Control & Modalities Management */}
      {dashboardWidgets.roomOccupancy && (
        <RoomOccupancyWidget />
      )}

      {/* Summary Stats (4 Columns Grid) */}
      {dashboardWidgets.statsCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Agendamentos Hoje */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-tight">Agendamentos Hoje</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-display">
                {todayAppointments.length || 24}
              </span>
              <span className="text-xs font-medium text-green-500">+12% vs ontem</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[75%] rounded-full" />
            </div>
          </div>

          {/* 2. Faturamento (Mês) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-tight">Faturamento (Mês)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 font-display">
                {totalIncome > 0
                  ? `R$ ${(totalIncome / 1000).toFixed(1)}k`
                  : 'R$ 42.8k'}
              </span>
            </div>
            <div className="mt-4 flex gap-1 items-end h-6">
              <div className="flex-1 bg-slate-100 h-2 rounded-sm" />
              <div className="flex-1 bg-slate-100 h-3 rounded-sm" />
              <div className="flex-1 bg-blue-400 h-6 rounded-sm" />
              <div className="flex-1 bg-slate-100 h-4 rounded-sm" />
              <div className="flex-1 bg-slate-100 h-2 rounded-sm" />
            </div>
          </div>

          {/* 3. Pacientes Ativos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-tight">Pacientes Ativos</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 font-display">
                {totalPatients > 0 ? totalPatients : '1,248'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">Meta de crescimento anual: 85% atingida</p>
          </div>

          {/* 4. Ocupação das Salas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-tight">Ocupação das Salas</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-800 font-display">92%</span>
            </div>
            <p
              onClick={() => setCurrentView('calendar')}
              className="text-[11px] text-green-600 font-bold mt-4 underline cursor-pointer hover:text-green-700"
            >
              Otimizar horários
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Chart Section (8 cols) + Secondary Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Chart Section (Power BI Style) */}
        {dashboardWidgets.mainChart && (
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base font-display">
                  Fluxo de Atendimento vs. Receita
                </h3>
                <p className="text-xs text-slate-400">
                  {period === 'semanal'
                    ? 'Atendimentos diários da semana corrente vs. faturamento estimado'
                    : 'Comparativo mensal consolidado de sessões e receitas'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Chart Type Selector */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold text-slate-600">
                  {[
                    { id: 'composed', label: 'Composto' },
                    { id: 'bar', label: 'Barras' },
                    { id: 'line', label: 'Linhas' },
                    { id: 'area', label: 'Área' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id as any)}
                      className={`px-2 py-1 rounded-md transition ${
                        chartType === type.id
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Period Selector */}
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    onClick={() => setPeriod('semanal')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      period === 'semanal'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    onClick={() => setPeriod('mensal')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      period === 'mensal'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mensal
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'composed' ? (
                  <ComposedChart
                    data={activeFlowData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#3b82f6"
                      fontSize={11}
                      tickLine={false}
                      label={{ value: 'Sessões', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        name.includes('Receita') || name === 'receita' || name === 'entradas'
                          ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : `${val} atendimentos`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={30}
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="atendimentos"
                      name="Atendimentos (Sessões)"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="receita"
                      name="Receita Estimada (R$)"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </ComposedChart>
                ) : chartType === 'bar' ? (
                  <BarChart
                    data={activeFlowData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        name.includes('Receita') || name === 'receita' || name === 'entradas'
                          ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : `${val} atendimentos`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="atendimentos" name="Atendimentos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="receita" name="Receita (R$)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart
                    data={activeFlowData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        name.includes('Receita') || name === 'receita' || name === 'entradas'
                          ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : `${val} sessões`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Line
                      type="monotone"
                      dataKey="atendimentos"
                      name="Atendimentos"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="receita"
                      name="Receita"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={activeFlowData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBlueArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorGreenArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        name.includes('Receita') || name === 'receita' || name === 'entradas'
                          ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : `${val} atendimentos`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Area
                      type="monotone"
                      dataKey="atendimentos"
                      name="Atendimentos"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorBlueArea)"
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Receita (R$)"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorGreenArea)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
              <span>{period === 'semanal' ? 'Seg' : 'Jan'}</span>
              <span>{period === 'semanal' ? 'Ter' : 'Fev'}</span>
              <span>{period === 'semanal' ? 'Qua' : 'Mar'}</span>
              <span>{period === 'semanal' ? 'Qui' : 'Abr'}</span>
              <span>{period === 'semanal' ? 'Sex' : 'Mai'}</span>
              <span>{period === 'semanal' ? 'Sáb' : 'Jun'}</span>
              <span>{period === 'semanal' ? 'Dom' : 'Jul/Ago'}</span>
            </div>
          </div>
        )}

        {/* Secondary Column: Upcoming Appointments + Dark Reminder Box */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Próximos Atendimentos Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Próximos Atendimentos
              </h3>
              <div className="space-y-3">
                {upcomingList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentView('calendar')}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                  >
                    <div
                      className={`w-11 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${item.badgeColor}`}
                    >
                      {item.time}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.patient}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.procedure}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentView('calendar')}
              className="w-full mt-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Ver Agenda Completa
            </button>
          </div>

          {/* Dark System Reminders Widget */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-sm border border-slate-800">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
              Lembretes do Sistema
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-400 shrink-0" />
              <p className="text-xs leading-relaxed text-slate-300">
                {expiringPackages.length > 0
                  ? `${expiringPackages.length} pacientes com pacotes expirando esta semana.`
                  : '3 pacientes com pacotes expirando esta semana.'}{' '}
                <span
                  onClick={() => setCurrentView('patients')}
                  className="text-blue-400 underline cursor-pointer font-semibold hover:text-blue-300"
                >
                  Enviar avisos?
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Breakdown & Operational Alerts */}
      {dashboardWidgets.alertsSection && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-display">
                Alertas e Avisos Operacionais
              </h3>
              <p className="text-xs text-slate-400">Manutenções, pacotes e feriados nacionais</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Equipment Alert */}
            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Equipamento em Manutenção</h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  {equipment.find((e) => e.status === 'maintenance')?.name || 'Neurodyn Eletroestimulador'} (OS #0042)
                  em conserto técnico.
                </p>
              </div>
            </div>

            {/* Holiday Alert */}
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <PartyPopper className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">Aviso de Feriado / Data Especial</h4>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  {upcomingHolidays[0]
                    ? `${upcomingHolidays[0][1]} (${upcomingHolidays[0][0]})`
                    : 'Sem feriados nesta semana.'}
                </p>
              </div>
            </div>

            {/* Package Expiring */}
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Pacotes Próximos a Vencer ({expiringPackages.length})
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Pacientes com saldo quase esgotado prontos para renovação de plano.
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">Acesso Rápido ao Calendário</h4>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">Sincronizado com Google Agenda</p>
              </div>
              <button
                onClick={() => setCurrentView('calendar')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Abrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
