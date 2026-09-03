import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Filter,
  CheckCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Appointment } from '../../types';

export const AppointmentSummariesWidget: React.FC = () => {
  const { appointments, patients, professionals, rooms, procedures, setCurrentView, startRoomSession } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'in_service' | 'completed'>('all');
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's appointments
  const todayAppointments = appointments.filter((a) => a.date === todayStr && !a.deletedAt);

  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmed').length;
  const inServiceCount = todayAppointments.filter((a) => a.status === 'in_service').length;
  const pendingCount = todayAppointments.filter((a) => a.status === 'scheduled').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'completed').length;

  const filteredAppointments = todayAppointments.filter((a) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'confirmed') return a.status === 'confirmed';
    if (statusFilter === 'pending') return a.status === 'scheduled';
    if (statusFilter === 'in_service') return a.status === 'in_service';
    if (statusFilter === 'completed') return a.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'in_service':
        return {
          label: 'Em Atendimento',
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'completed':
        return {
          label: 'Concluído',
          classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
        };
      case 'scheduled':
        return {
          label: 'Aguardando',
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Resumo dos Agendamentos de Hoje
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {todayAppointments.length} atendimentos programados para hoje
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('calendar')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          <span>Abrir Agenda Completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Counter Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setStatusFilter(statusFilter === 'confirmed' ? 'all' : 'confirmed')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'confirmed'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Confirmados</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{confirmedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_service' ? 'all' : 'in_service')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'in_service'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Em Sala</span>
          <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{inServiceCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'pending'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Aguardando</span>
          <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'completed'
              ? 'bg-slate-200/70 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Concluídos</span>
          <span className="text-lg font-extrabold text-slate-700 dark:text-slate-300">{completedCount}</span>
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredAppointments.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCheck className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nenhum agendamento encontrado
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {statusFilter !== 'all' ? 'Tente limpar o filtro de status selecionado.' : 'Nenhum paciente agendado para o dia de hoje.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const patient = patients.find((p) => p.id === apt.patientId);
            const prof = professionals.find((pr) => pr.id === apt.professionalId);
            const proc = procedures.find((pc) => pc.id === apt.procedureId);
            const room = rooms.find((r) => r.id === apt.roomId);
            const badge = getStatusBadge(apt.status);

            return (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Time & Patient Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mb-0.5" />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {apt.startTime || '14:00'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {patient?.name || apt.patientName || 'Paciente'}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {proc?.name || 'Procedimento Clínico'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        {prof?.name || 'Terapeuta'}
                      </span>
                      {room && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {room.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Quick Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {apt.status === 'scheduled' && room && (
                    <button
                      onClick={() => {
                        startRoomSession(room.id, {
                          patientName: patient?.name || 'Paciente',
                          patientId: patient?.id,
                          professionalName: prof?.name || 'Especialista',
                          professionalId: prof?.id,
                          procedureName: proc?.name || 'Atendimento',
                          modality: proc?.name,
                          startedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                          durationMinutes: apt.durationMinutes || 50,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      title="Chamar para Sala"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Iniciar</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentView('calendar')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                    title="Ver Detalhes do Agendamento"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
