import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ClinicLogo } from '../common/ClinicLogo';
import {
  Smartphone,
  Calendar,
  Clock,
  Package,
  FileText,
  DollarSign,
  MessageCircle,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Send,
  Bell,
  RefreshCw,
  Info,
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const {
    activeTenant,
    patients,
    appointments,
    patientPackages,
    prescriptions,
    financialEntries,
    patientPortalPatientId,
    setPatientPortalPatientId,
    setCurrentView,
  } = useApp();
  const { primaryColor, secondaryColor } = useTheme();

  const portalSettings = activeTenant.patientPortalSettings || {
    appVersion: '2.4.2',
    releaseNotes: 'Visualização de séries de exercícios com orientações detalhadas, histórico de pagamentos com chave PIX Copia e Cola e confirmação de presença.',
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    allowWhatsAppBooking: true,
    showPrescriptions: true,
    showFinancialHistory: true,
    showPackages: true,
    showPixPayment: true,
    customWelcomeMessage: 'Olá! Acompanhe seus agendamentos, saldo de sessões e exercícios prescritos pelo seu terapeuta.',
    announcements: [],
  };

  const [activeTab, setActiveTab] = useState<'appointments' | 'packages' | 'prescriptions' | 'financial' | 'updates'>('appointments');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const selectedPatient = patients.find((p) => p.id === patientPortalPatientId) || patients[0];

  const patientApts = appointments.filter((a) => a.patientId === selectedPatient?.id && !a.deletedAt);
  const patientPacks = patientPackages.filter((p) => p.patientId === selectedPatient?.id);
  const patientPrescs = prescriptions.filter((pr) => pr.patientId === selectedPatient?.id);
  const patientFin = financialEntries.filter((f) => f.patientId === selectedPatient?.id && !f.deletedAt);

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2500);
    }, 1000);
  };

  const handleWhatsAppContact = () => {
    const cleanPhone = (activeTenant.phone || '11988887766').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${activeTenant.name}! Sou o(a) paciente ${selectedPatient.name} e gostaria de tirar uma dúvida sobre meus agendamentos.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const availableTabs = [
    { id: 'appointments', label: 'Consultas', icon: Calendar, visible: true },
    { id: 'packages', label: 'Pacotes', icon: Package, visible: portalSettings.showPackages },
    { id: 'prescriptions', label: 'Exercícios', icon: FileText, visible: portalSettings.showPrescriptions },
    { id: 'financial', label: 'Pagamentos', icon: DollarSign, visible: portalSettings.showFinancialHistory },
    { id: 'updates', label: 'Novidades', icon: Bell, visible: true, badge: (portalSettings.announcements?.length || 0) > 0 },
  ].filter((t) => t.visible);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      {/* Patient Switcher & PWA Banner for Testing */}
      <div className="max-w-md mx-auto mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-brand-primary" />
          <span className="font-bold text-slate-700">Simulador PWA do Paciente:</span>
        </div>
        <select
          value={selectedPatient?.id}
          onChange={(e) => setPatientPortalPatientId(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-bold max-w-[150px] truncate"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Simulated Mobile Phone Container */}
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
        {/* PWA App Header with Clinic Brand */}
        <div
          className="p-5 text-white shadow-md relative transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ClinicLogo size="sm" customPrimaryColor="#ffffff" customSecondaryColor="#ffffff" />
              <div>
                <h1 className="font-bold text-sm tracking-tight leading-tight">{activeTenant.tradeName || activeTenant.name}</h1>
                <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span>PWA v{portalSettings.appVersion}</span>
                  <span>•</span>
                  <span>Atualizado {portalSettings.lastUpdatedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncData}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition relative"
                title="Sincronizar dados e novidades da clínica"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              {portalSettings.allowWhatsAppBooking && (
                <button
                  onClick={handleWhatsAppContact}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  title="Falar no WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {syncDone && (
            <div className="mt-2.5 py-1 px-2.5 bg-emerald-500/90 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dados e comunicados atualizados com sucesso!</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-white/80">Olá, bem-vindo(a)</p>
              <p className="font-extrabold text-sm">{selectedPatient?.name}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white text-slate-900 font-extrabold text-[10px] shadow-xs">
              Paciente Ativo
            </span>
          </div>

          {portalSettings.customWelcomeMessage && (
            <p className="mt-2 text-[11px] text-white/90 leading-tight bg-white/10 p-2 rounded-xl border border-white/10">
              {portalSettings.customWelcomeMessage}
            </p>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-${availableTabs.length} border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-center`}>
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex flex-col items-center gap-1 transition relative ${
                  isActiveTab ? 'bg-white font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
                style={
                  isActiveTab
                    ? {
                        color: primaryColor,
                        borderBottom: `2px solid ${primaryColor}`,
                      }
                    : undefined
                }
              >
                <Icon className="w-4 h-4" style={isActiveTab ? { color: primaryColor } : undefined} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Tab 5: Clinic Announcements & Updates */}
          {activeTab === 'updates' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-brand-primary" />
                  Novidades da Clínica & Atualizações
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">
                  {portalSettings.announcements?.length || 0} comunicados
                </span>
              </div>

              {/* Version & Release notes */}
              <div className="p-3.5 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-primary text-xs">
                    Versão Atual do App: v{portalSettings.appVersion}
                  </span>
                  <span className="text-[10px] text-slate-500">{portalSettings.lastUpdatedDate}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {portalSettings.releaseNotes}
                </p>
              </div>

              {/* Announcements list */}
              {(!portalSettings.announcements || portalSettings.announcements.length === 0) ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhum comunicado recente da clínica.
                </div>
              ) : (
                portalSettings.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ann.type === 'feature'
                            ? 'bg-purple-100 text-purple-800'
                            : ann.type === 'update'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ann.type === 'feature' ? 'Novidade' : ann.type === 'update' ? 'Atualização' : 'Aviso'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{ann.title}</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{ann.message}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Publicado por: {ann.authorName}</span>
                      <span className="text-teal-600 font-bold">Oficial da Clínica</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 1: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Meus Agendamentos</h3>
                <span className="text-[10px] text-slate-500">{patientApts.length} sessões</span>
              </div>

              {patientApts.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhuma sessão agendada no momento.
                </div>
              ) : (
                patientApts.map((apt) => (
                  <div key={apt.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs" style={{ color: primaryColor }}>
                        {apt.date} • às {apt.startTime}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Realizado' : 'Pendente'}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">{apt.procedureName}</p>
                      <p className="text-[11px] text-slate-500">
                        Profissional: {apt.professionalName} ({apt.roomName})
                      </p>
                    </div>

                    {portalSettings.allowWhatsAppBooking && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          onClick={handleWhatsAppContact}
                          className="text-[11px] font-bold hover:underline flex items-center gap-1"
                          style={{ color: primaryColor }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Solicitar Reagendamento
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Packages */}
          {activeTab === 'packages' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Meus Pacotes & Planos</h3>
              {patientPacks.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhum pacote contratado no momento.
                </div>
              ) : (
                patientPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-4 rounded-2xl border space-y-3"
                    style={{
                      borderColor: `${primaryColor}40`,
                      backgroundColor: `${primaryColor}08`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{pack.packageName}</h4>
                      <span className="text-[10px] font-bold" style={{ color: primaryColor }}>Validade: {pack.expirationDate}</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">Sessões Realizadas:</span>
                        <span className="font-bold text-slate-900">
                          {pack.usedSessions} de {pack.totalSessions}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(pack.usedSessions / pack.totalSessions) * 100}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="p-2 bg-white rounded-xl text-center text-xs font-bold border"
                      style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
                    >
                      Saldo Restante: {pack.remainingSessions} sessões
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Exercícios & Orientações para Casa</h3>
              {patientPrescs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhuma prescrição de exercícios cadastrada.
                </div>
              ) : (
                patientPrescs.map((pr) => (
                  <div key={pr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-800">Prescrição do Terapeuta</span>
                      <span className="text-[10px] text-slate-400">{pr.date}</span>
                    </div>

                    {pr.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{it.medicationOrExercise}</p>
                        <p className="font-semibold text-[11px]" style={{ color: primaryColor }}>{it.dosageOrFrequency}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">{it.instructions}</p>
                      </div>
                    ))}

                    {pr.generalObservations && (
                      <p className="text-[11px] text-slate-500 italic">Obs: {pr.generalObservations}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Financial */}
          {activeTab === 'financial' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Histórico Financeiro & Boletos</h3>
              {patientFin.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhum registro financeiro pendente.
                </div>
              ) : (
                patientFin.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{f.description}</span>
                      <span className="font-black" style={{ color: primaryColor }}>R$ {f.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Vencimento: {f.dueDate}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          f.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {f.status === 'paid' ? 'Pago' : 'Aguardando Pagamento'}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Clinic PIX Box */}
              {portalSettings.showPixPayment && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-center space-y-2">
                  <p className="text-xs font-bold" style={{ color: secondaryColor }}>Chave PIX da Clínica</p>
                  <div className="p-2 bg-slate-800 rounded-lg text-[10px] font-mono select-all truncate text-slate-200">
                    pix@{activeTenant.name.toLowerCase().replace(/\s+/g, '')}.com.br
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400">
          Powered by {activeTenant.name} • PWA Mobile Ready v{portalSettings.appVersion}
        </div>
      </div>
    </div>
  );
};
