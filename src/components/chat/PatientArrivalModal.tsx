import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  Clock,
  UserCheck,
  Search,
  CheckCircle2,
  Calendar,
  Send,
} from 'lucide-react';

interface PatientArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfessionalId?: string;
  onSendNotice: (recipientId: string, message: string, patientId: string, patientName: string) => void;
}

export const PatientArrivalModal: React.FC<PatientArrivalModalProps> = ({
  isOpen,
  onClose,
  targetProfessionalId,
  onSendNotice,
}) => {
  const { patients, appointments, professionals, users, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedProfId, setSelectedProfId] = useState<string>(targetProfessionalId || '');
  const [customNote, setCustomNote] = useState('');
  const [arrivalTime, setArrivalTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const safeAppointments = appointments || [];
  const safePatients = patients || [];
  const safeProfessionals = professionals || [];
  const safeUsers = users || [];

  // Filter today's appointments or search patients
  const todayAppointments = safeAppointments.filter(
    (apt) => apt?.date === todayStr && apt?.status !== 'canceled'
  );

  const filteredPatients = safePatients.filter((p) =>
    (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p?.cpf || '').includes(searchTerm)
  );

  const activeProfessionals = safeUsers.filter((u) => u?.role === 'professional' || u?.role === 'admin');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedProfId) return;

    const patient = safePatients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const formattedMsg = `🚨 [Recepção] O paciente ${patient.name} acabou de chegar e está aguardando na recepção às ${arrivalTime}.${
      customNote.trim() ? ` Obs: ${customNote.trim()}` : ''
    }`;

    onSendNotice(selectedProfId, formattedMsg, patient.id, patient.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Aviso Rápido: Chegada de Paciente na Recepção
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notifique o profissional instantaneamente que o paciente já está na sala de espera.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Quick Select from Today's Agenda */}
          {todayAppointments.length > 0 && (
            <div>
              <label className="block font-bold text-slate-800 dark:text-white text-xs mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Pacientes Agendados para Hoje:</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 bg-slate-50 dark:bg-slate-950/40">
                {todayAppointments.map((apt) => {
                  const isSelected = selectedPatientId === apt.patientId;
                  return (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(apt.patientId);
                        // find matching user for this professional
                        const prof = safeProfessionals.find((p) => p.id === apt.professionalId);
                        const profUser = safeUsers.find((u) => u.email === prof?.email || u.name === prof?.name);
                        if (profUser) {
                          setSelectedProfId(profUser.id);
                        }
                      }}
                      className={`text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-amber-500 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-semibold">{apt.patientName}</span>
                        <span className={`block text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {apt.time} • {apt.procedureName} • {apt.professionalName}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {apt.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Patient manually if not in today list */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-white text-xs mb-1">
              Ou Selecione/Busque o Paciente:
            </label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar paciente por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              required
            >
              <option value="">-- Selecione o Paciente --</option>
              {filteredPatients.slice(0, 30).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone || 'Sem telefone'})
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Professional */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-white text-xs mb-1">
              Profissional que irá Atender:
            </label>
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              required
            >
              <option value="">-- Selecione o Profissional / Destinatário --</option>
              <option value="all">📢 Toda a Equipe (Mural Geral)</option>
              {activeProfessionals.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role?.toUpperCase() || 'USUÁRIO'})
                </option>
              ))}
            </select>
          </div>

          {/* Time and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Horário de Chegada:</span>
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-1">
                Observação Opcional:
              </label>
              <input
                type="text"
                placeholder="Ex: Já aferiu pressão / Trouxe raio-X"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedPatientId || !selectedProfId}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Aviso de Chegada</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
