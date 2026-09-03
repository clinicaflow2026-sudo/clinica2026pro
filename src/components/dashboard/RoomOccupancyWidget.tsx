import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
  User,
  Layers,
  Wrench,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { Room, RoomStatus, RoomOccupantInfo } from '../../types';

export const RoomOccupancyWidget: React.FC = () => {
  const {
    rooms,
    professionals,
    patients,
    procedures,
    updateRoomStatus,
    startRoomSession,
    freeRoom,
    setCurrentView,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');

  // Start Session Modal State
  const [sessionModalRoom, setSessionModalRoom] = useState<Room | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [customPatientName, setCustomPatientName] = useState<string>('');
  const [selectedProfId, setSelectedProfId] = useState<string>('');
  const [selectedProcId, setSelectedProcId] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(50);

  // Edit Room Modal State
  const [editRoomModal, setEditRoomModal] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomSector, setEditRoomSector] = useState('');
  const [editModalitiesStr, setEditModalitiesStr] = useState('');

  // Collect all modalities available across rooms
  const allModalities = Array.from(
    new Set(rooms.flatMap((r) => r.modalities || []))
  );

  const availableCount = rooms.filter((r) => r.status === 'available' || (!r.status && !r.inMaintenance)).length;
  const inUseCount = rooms.filter((r) => r.status === 'in_use').length;
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance' || r.inMaintenance).length;

  const occupancyRate = rooms.length > 0 ? Math.round((inUseCount / rooms.length) * 100) : 0;

  const filteredRooms = rooms.filter((room) => {
    const effectiveStatus: RoomStatus = room.inMaintenance ? 'maintenance' : room.status || 'available';

    if (statusFilter !== 'all' && effectiveStatus !== statusFilter) {
      return false;
    }

    if (selectedModality !== 'all') {
      if (!room.modalities?.includes(selectedModality)) {
        return false;
      }
    }

    return true;
  });

  const handleStartSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionModalRoom) return;

    const patient = patients.find((p) => p.id === selectedPatientId);
    const prof = professionals.find((pr) => pr.id === selectedProfId);
    const proc = procedures.find((pc) => pc.id === selectedProcId);

    const occupant: RoomOccupantInfo = {
      patientName: patient?.name || customPatientName || 'Paciente Atendido',
      patientId: patient?.id,
      professionalName: prof?.name || 'Terapeuta Responsável',
      professionalId: prof?.id,
      procedureName: proc?.name || 'Sessão Clínica',
      modality: proc?.name || sessionModalRoom.modalities?.[0] || 'Atendimento Geral',
      startedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: sessionDuration,
    };

    startRoomSession(sessionModalRoom.id, occupant);
    setSessionModalRoom(null);
    setSelectedPatientId('');
    setCustomPatientName('');
    setSelectedProfId('');
    setSelectedProcId('');
  };

  const getStatusDisplay = (room: Room) => {
    const status: RoomStatus = room.inMaintenance ? 'maintenance' : room.status || 'available';

    switch (status) {
      case 'in_use':
        return {
          label: 'Em Atendimento',
          badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          dotClass: 'bg-blue-500 animate-pulse',
          cardBorder: 'border-blue-300 dark:border-blue-700/60 bg-blue-50/20 dark:bg-blue-950/20',
        };
      case 'available':
        return {
          label: 'Disponível',
          badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dotClass: 'bg-emerald-500',
          cardBorder: 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900',
        };
      case 'cleaning':
        return {
          label: 'Em Higienização',
          badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dotClass: 'bg-amber-500',
          cardBorder: 'border-amber-300/80 dark:border-amber-700/50 bg-amber-50/20 dark:bg-amber-950/20',
        };
      case 'maintenance':
        return {
          label: 'Em Manutenção',
          badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          dotClass: 'bg-rose-500',
          cardBorder: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/20 opacity-85',
        };
      default:
        return {
          label: 'Disponível',
          badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dotClass: 'bg-emerald-500',
          cardBorder: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Painel de Controle de Salas & Modalidades
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {occupancyRate}% Ocupação
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie a ocupação em tempo real, liberação de salas e modalidades de cada espaço
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('cadastros')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
        >
          <span>Cadastros de Salas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Real-time Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'available'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Salas Livres</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{availableCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_use' ? 'all' : 'in_use')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'in_use'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Em Atendimento</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400">{inUseCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'cleaning' ? 'all' : 'cleaning')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'cleaning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Higienização</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400">{cleaningCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'maintenance' ? 'all' : 'maintenance')}
          className={`p-2.5 rounded-xl border text-left transition ${
            statusFilter === 'maintenance'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Manutenção</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400">{maintenanceCount}</span>
        </button>
      </div>

      {/* Modalities Filter Scroll */}
      {allModalities.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Modalidade:
          </span>
          <button
            onClick={() => setSelectedModality('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedModality === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({rooms.length})
          </button>
          {allModalities.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedModality === mod
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      )}

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {filteredRooms.map((room) => {
          const statusMeta = getStatusDisplay(room);
          const occupant = room.currentOccupant;
          const isOccupied = (room.status === 'in_use') && occupant;

          return (
            <div
              key={room.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative group shadow-2xs ${statusMeta.cardBorder}`}
            >
              {/* Top Room Name & Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {room.name}
                    </h4>
                    {room.sector && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                        {room.sector} • Capacidade: {room.capacity} {room.capacity > 1 ? 'pessoas' : 'paciente'}
                      </span>
                    )}
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${statusMeta.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                    {statusMeta.label}
                  </span>
                </div>

                {/* Modalities Chips */}
                {room.modalities && room.modalities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {room.modalities.map((mod, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Middle Section: Active Occupant / Maintenance Note / Ready State */}
              <div className="min-h-[64px] flex flex-col justify-center">
                {isOccupied ? (
                  <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/70 dark:border-blue-800/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950 dark:text-blue-200">
                      <span className="truncate">{occupant.patientName}</span>
                      <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 shrink-0">
                        Início: {occupant.startedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-800 dark:text-blue-300">
                      <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{occupant.professionalName}</span>
                    </div>
                    {occupant.procedureName && (
                      <p className="text-[10px] text-blue-700 dark:text-blue-300/80 truncate">
                        {occupant.procedureName}
                      </p>
                    )}
                  </div>
                ) : room.status === 'cleaning' ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200/70 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
                    <span>Em higienização e troca de lençóis/insumos</span>
                  </div>
                ) : room.inMaintenance ? (
                  <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-900/30 border border-rose-200/70 dark:border-rose-800/50 text-[11px] text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{room.maintenanceNote || 'Equipamentos em calibração ou manutenção preventiva'}</p>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-dashed border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Pronta para atendimento
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Livre</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-1.5">
                {isOccupied ? (
                  <>
                    <button
                      onClick={() => freeRoom(room.id, true)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Liberar Sala</span>
                    </button>

                    <button
                      onClick={() => updateRoomStatus(room.id, 'cleaning')}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition"
                      title="Enviar para Higienização"
                    >
                      Higienizar
                    </button>
                  </>
                ) : room.status === 'cleaning' ? (
                  <>
                    <button
                      onClick={() => updateRoomStatus(room.id, 'available')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir Limpeza</span>
                    </button>

                    <button
                      onClick={() => setSessionModalRoom(room)}
                      className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                    >
                      Iniciar
                    </button>
                  </>
                ) : room.inMaintenance ? (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'available')}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finalizar Manutenção</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setSessionModalRoom(room)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Iniciar Atendimento</span>
                    </button>

                    <button
                      onClick={() => updateRoomStatus(room.id, 'cleaning')}
                      className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition"
                      title="Limpar Sala"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => updateRoomStatus(room.id, 'maintenance', 'Em calibração preventiva')}
                      className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs transition"
                      title="Bloquear p/ Manutenção"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Session Modal Popup */}
      {sessionModalRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Iniciar Atendimento na Sala
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {sessionModalRoom.name}
                </p>
              </div>
              <button
                onClick={() => setSessionModalRoom(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartSessionSubmit} className="space-y-3.5">
              {/* Patient Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Paciente
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    if (e.target.value) setCustomPatientName('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione um paciente cadastrado...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone || p.cpf})
                    </option>
                  ))}
                </select>
                {!selectedPatientId && (
                  <input
                    type="text"
                    placeholder="Ou digite o nome do paciente avulso..."
                    value={customPatientName}
                    onChange={(e) => setCustomPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mt-1.5"
                  />
                )}
              </div>

              {/* Professional Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profissional / Especialista
                </label>
                <select
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Selecione o profissional responsável...</option>
                  {professionals.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} ({pr.councilRegistration || 'Terapeuta'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Procedure / Modality Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Procedimento & Modalidade
                </label>
                <select
                  value={selectedProcId}
                  onChange={(e) => setSelectedProcId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Selecione o serviço ou modalidade...</option>
                  {procedures.map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      {pc.name} ({pc.durationMinutes} min) - R$ {pc.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Duração Estimada (minutos)
                </label>
                <div className="flex items-center gap-2">
                  {[30, 45, 50, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSessionDuration(mins)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                        sessionDuration === mins
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSessionModalRoom(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={(!selectedPatientId && !customPatientName) || !selectedProfId}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                >
                  Confirmar Início
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
