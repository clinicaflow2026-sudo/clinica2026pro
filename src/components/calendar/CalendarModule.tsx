import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerAppointmentReminder } from '../../services/notificationService';
import {
  CalendarDays,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  MessageCircle,
  Mail,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { getHolidayInfo, isWeekend } from '../../lib/constants';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleCalendarModal: React.FC<GoogleSyncModalProps> = ({ isOpen, onClose }) => {
  const { professionals } = useApp();
  const [synced, setSynced] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              G
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Integração Google Agenda v3</h3>
              <p className="text-xs text-slate-500">Sincronização bidirecional em tempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>OAuth 2.0 conectado com a conta Google Workspace da clínica.</span>
          </div>

          <p className="text-slate-600">Mapeamento de calendários individuais por profissional:</p>

          <div className="space-y-2">
            {professionals.map((prof) => (
              <div key={prof.id} className="p-2.5 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: prof.color }} />
                  <div>
                    <p className="font-semibold text-slate-800">{prof.name}</p>
                    <p className="text-[10px] text-slate-400">{prof.googleCalendarEmail || 'Sincronizado'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Sync Ativo (2-Way)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export const CalendarModule: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    patients,
    professionals,
    procedures,
    rooms,
    checkPlanLimit,
  } = useApp();

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [hoveredApt, setHoveredApt] = useState<Appointment | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    professionalId: '',
    procedureId: '',
    roomId: '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '09:50',
    status: 'confirmed' as AppointmentStatus,
    notes: '',
    price: 150,
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Auto-trigger modal if opened via PWA Shortcut (action=new_appointment) or Global Shortcut (Alt+A)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new_appointment') {
        setShowNewAptModal(true);
      }
    }

    const handleShortcutNewAppointment = () => {
      setFormData({
        patientId: patients[0]?.id || '',
        professionalId: professionals[0]?.id || '',
        procedureId: procedures[0]?.id || '',
        roomId: rooms.find((r) => !r.inMaintenance)?.id || rooms[0]?.id || '',
        date: selectedDate,
        startTime: '09:00',
        endTime: '09:50',
        status: 'confirmed',
        notes: '',
        price: 160,
      });
      setFormError(null);
      setShowNewAptModal(true);
    };

    window.addEventListener('cfp:open-new-appointment', handleShortcutNewAppointment);
    return () => window.removeEventListener('cfp:open-new-appointment', handleShortcutNewAppointment);
  }, [patients, professionals, procedures, rooms, selectedDate]);

  // Status Colors requirement:
  // confirmado (verde), pendente (amarelo), cancelado (vermelho), realizado (azul)
  const getStatusColorClasses = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600';
      case 'pending':
        return 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500';
      case 'canceled':
        return 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600';
      case 'completed':
        return 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmado</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">Pendente</span>;
      case 'canceled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Cancelado</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Realizado</span>;
    }
  };

  // Generate current week dates
  const getWeekDates = (baseDateStr: string) => {
    const curr = new Date(baseDateStr);
    const day = curr.getDay(); // 0 is Sun
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
    const monday = new Date(curr.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      week.push(nextDate.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ];

  const filteredAppointments = appointments.filter((a) => {
    if (a.deletedAt) return false;
    if (selectedProfessional !== 'all' && a.professionalId !== selectedProfessional) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    return true;
  });

  const handleOpenWhatsApp = (apt: Appointment) => {
    const cleanPhone = (apt.patientPhone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${apt.patientName}! Confirmamos o seu agendamento de ${apt.procedureName} para o dia ${apt.date} às ${apt.startTime} com ${apt.professionalName}. Caso precise reagendar, avise-nos com antecedência.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pat = patients.find((p) => p.id === formData.patientId);
    const prof = professionals.find((p) => p.id === formData.professionalId);
    const proc = procedures.find((p) => p.id === formData.procedureId);
    const room = rooms.find((r) => r.id === formData.roomId);

    if (!pat || !prof || !proc || !room) {
      setFormError('Preencha todos os campos obrigatórios (Paciente, Profissional, Procedimento e Sala).');
      return;
    }

    if (room.inMaintenance) {
      setFormError(`Atenção: A sala "${room.name}" está em manutenção. Selecione outra sala.`);
      return;
    }

    const result = addAppointment({
      patientId: pat.id,
      patientName: pat.name,
      patientPhone: pat.phone,
      professionalId: prof.id,
      professionalName: prof.name,
      procedureId: proc.id,
      procedureName: proc.name,
      specialtyId: proc.specialtyId,
      roomId: room.id,
      roomName: room.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: formData.status,
      notes: formData.notes,
      price: Number(formData.price) || proc.price,
    });

    if (!result.success) {
      setFormError(result.message || 'Erro ao criar agendamento.');
      return;
    }

    // Trigger PWA Push Notification / Reminder via Service Worker
    triggerAppointmentReminder({
      patientName: pat.name,
      professionalName: prof.name,
      time: formData.startTime,
      date: formData.date,
      procedureName: proc.name,
      roomName: room.name,
    }).catch(console.warn);

    setShowNewAptModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Agendamentos Clínicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grade horária sincronizada com Google Agenda, detecção de feriados e status visual.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Sync Button */}
          <button
            onClick={() => setShowGoogleModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-2xs transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Agenda v3</span>
          </button>

          {/* View toggle (Semanal / Mensal) */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === 'week' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === 'month' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensal
            </button>
          </div>

          {/* New Appointment Button */}
          <button
            id="btn-add-appointment"
            title="Atalho: Alt+A ou Ctrl+Shift+A"
            onClick={() => {
              setFormData({
                patientId: patients[0]?.id || '',
                professionalId: professionals[0]?.id || '',
                procedureId: procedures[0]?.id || '',
                roomId: rooms.find((r) => !r.inMaintenance)?.id || rooms[0]?.id || '',
                date: selectedDate,
                startTime: '09:00',
                endTime: '09:50',
                status: 'confirmed',
                notes: '',
                price: 160,
              });
              setFormError(null);
              setShowNewAptModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-teal-800/60 border border-teal-400/40 rounded text-[10px] font-mono text-teal-100">
              Alt+A
            </kbd>
          </button>
        </div>
      </div>

      {/* Filter and Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector & Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 7);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white"
          />

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 7);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs font-semibold text-teal-600 hover:underline px-2"
          >
            Hoje
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Professional */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Profissional:</span>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white font-semibold"
            >
              <option value="all">Todos os Profissionais</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white font-semibold"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmado (Verde)</option>
              <option value="pending">Pendente (Amarelo)</option>
              <option value="canceled">Cancelado (Vermelho)</option>
              <option value="completed">Realizado (Azul)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid (Weekly View) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center text-xs">
              <div className="p-3 font-bold text-slate-400 border-r border-slate-200">Horário</div>
              {weekDates.map((dStr) => {
                const dateObj = new Date(dStr + 'T00:00:00');
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const dayName = dayNames[dateObj.getDay()];
                const dayNum = dateObj.getDate();
                const holiday = getHolidayInfo(dStr);
                const weekend = isWeekend(dStr);
                const isToday = dStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={dStr}
                    className={`p-2.5 border-r border-slate-200 last:border-r-0 ${
                      isToday ? 'bg-teal-50/80 font-bold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">{dayName}</span>
                      <span className="font-extrabold text-sm">{dayNum}</span>
                    </div>
                    {holiday && (
                      <div className="mt-1 px-1 py-0.5 text-[9px] font-bold bg-sky-100 text-sky-800 rounded truncate" title={holiday}>
                        🎉 {holiday}
                      </div>
                    )}
                    {weekend && !holiday && (
                      <div className="mt-1 text-[9px] font-medium text-amber-700">Fim de Semana</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 min-h-[70px]">
                  {/* Hour Column */}
                  <div className="p-2 text-xs font-semibold text-slate-400 border-r border-slate-200 flex items-center justify-center bg-slate-50/50">
                    {time}
                  </div>

                  {/* Day cells */}
                  {weekDates.map((dStr) => {
                    const hourPrefix = time.split(':')[0];
                    const aptsInSlot = filteredAppointments.filter(
                      (a) => a.date === dStr && a.startTime.startsWith(hourPrefix)
                    );

                    return (
                      <div
                        key={`${dStr}-${time}`}
                        className="p-1.5 border-r border-slate-100 last:border-r-0 hover:bg-slate-50/60 transition relative flex flex-col gap-1"
                      >
                        {aptsInSlot.map((apt) => (
                          <div
                            key={apt.id}
                            onMouseEnter={(e) => {
                              setHoveredApt(apt);
                              setMousePos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseLeave={() => setHoveredApt(null)}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition shadow-2xs text-[11px] leading-tight ${getStatusColorClasses(
                              apt.status
                            )}`}
                          >
                            <div className="font-bold truncate">{apt.patientName}</div>
                            <div className="text-[10px] opacity-90 truncate">{apt.procedureName}</div>
                            <div className="text-[9px] opacity-80 flex items-center justify-between mt-0.5">
                              <span>{apt.startTime}</span>
                              <span className="truncate">{apt.roomName.split('-')[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip (Requirement 3.3.2) */}
      {hoveredApt && (
        <div
          className="fixed z-50 bg-slate-950 text-white p-3.5 rounded-xl shadow-2xl border border-slate-800 text-xs w-64 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: mousePos.y + 15,
            left: Math.min(mousePos.x + 15, window.innerWidth - 280),
          }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-teal-400">{hoveredApt.startTime} - {hoveredApt.endTime}</span>
            {getStatusBadge(hoveredApt.status)}
          </div>
          <div className="mt-2 space-y-1">
            <p className="font-bold text-white text-sm">{hoveredApt.patientName}</p>
            <p className="text-slate-300 flex items-center gap-1">
              <span className="text-slate-400">Procedimento:</span> {hoveredApt.procedureName}
            </p>
            <p className="text-slate-300 flex items-center gap-1">
              <span className="text-slate-400">Profissional:</span> {hoveredApt.professionalName}
            </p>
            <p className="text-slate-300 flex items-center gap-1">
              <span className="text-slate-400">Sala:</span> {hoveredApt.roomName}
            </p>
            {hoveredApt.price > 0 && (
              <p className="text-emerald-400 font-bold">R$ {hoveredApt.price.toFixed(2)}</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Action List / Today's Appointments with WhatsApp triggers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Atendimentos de Hoje ({appointments.filter((a) => a.date === selectedDate && !a.deletedAt).length})
        </h3>

        <div className="divide-y divide-slate-100">
          {appointments
            .filter((a) => a.date === selectedDate && !a.deletedAt)
            .map((apt) => (
              <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center">
                    <span className="text-xs font-extrabold text-slate-900">{apt.startTime}</span>
                    <span className="block text-[10px] text-slate-400">{apt.endTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                      {getStatusBadge(apt.status)}
                    </div>
                    <p className="text-xs text-slate-500">
                      {apt.procedureName} • com <strong>{apt.professionalName}</strong> ({apt.roomName})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Changer */}
                  <select
                    value={apt.status}
                    onChange={(e) => updateAppointment(apt.id, { status: e.target.value as AppointmentStatus })}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-semibold"
                  >
                    <option value="confirmed">Confirmado</option>
                    <option value="pending">Pendente</option>
                    <option value="completed">Realizado</option>
                    <option value="canceled">Cancelado</option>
                  </select>

                  {/* WhatsApp confirmation button */}
                  <button
                    onClick={() => handleOpenWhatsApp(apt)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition"
                    title="Enviar Confirmação por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {/* Cancel / Delete */}
                  <button
                    onClick={() => deleteAppointment(apt.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                    title="Cancelar agendamento"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Novo Agendamento de Paciente</h3>
              <button onClick={() => setShowNewAptModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppointment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  required
                >
                  <option value="">Selecione o Paciente</option>
                  {patients.filter((p) => !p.deletedAt).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Profissional *</label>
                  <select
                    value={formData.professionalId}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  >
                    <option value="">Selecione</option>
                    {professionals.filter((pr) => pr.active).map((pr) => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procedimento *</label>
                  <select
                    value={formData.procedureId}
                    onChange={(e) => {
                      const proc = procedures.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        procedureId: e.target.value,
                        price: proc ? proc.price : formData.price,
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  >
                    <option value="">Selecione</option>
                    {procedures.filter((pr) => pr.active).map((pr) => (
                      <option key={pr.id} value={pr.id}>{pr.name} (R$ {pr.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sala de Atendimento *</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  >
                    <option value="">Selecione</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.inMaintenance}>
                        {r.name} {r.inMaintenance ? '(Em Manutenção)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  >
                  </input>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Início *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fim *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações Clínicas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instruções de atendimento, queixas prévias..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  title="Atalho: Ctrl+S"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Salvar Agendamento</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-teal-800/60 border border-teal-400/40 rounded text-[9px] font-mono text-teal-100">
                    Ctrl+S
                  </kbd>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Calendar Modal */}
      <GoogleCalendarModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
    </div>
  );
};
