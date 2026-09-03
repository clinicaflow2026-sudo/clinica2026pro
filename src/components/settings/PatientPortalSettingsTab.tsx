import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Smartphone,
  Sparkles,
  Send,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { PatientPortalAnnouncement } from '../../types';

export const PatientPortalSettingsTab: React.FC = () => {
  const { activeTenant, updatePatientPortalSettings, addPatientAnnouncement, deletePatientAnnouncement } = useApp();
  const { primaryColor } = useTheme();

  const settings = activeTenant.patientPortalSettings || {
    appVersion: '2.4.2',
    releaseNotes: 'Sincronização de dados da clínica, exercícios e confirmação de presença.',
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    allowWhatsAppBooking: true,
    showPrescriptions: true,
    showFinancialHistory: true,
    showPackages: true,
    showPixPayment: true,
    customWelcomeMessage: 'Olá! Acompanhe seus agendamentos, saldo de sessões e exercícios prescritos.',
    announcements: [],
  };

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New announcement form
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    message: string;
    type: 'announcement' | 'update' | 'feature';
    authorName: string;
  }>({
    title: '',
    message: '',
    type: 'feature',
    authorName: 'Equipe da Clínica',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientPortalSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleBroadcastUpdate = () => {
    const updated = {
      ...formSettings,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    };
    updatePatientPortalSettings(updated);
    setFormSettings(updated);
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    addPatientAnnouncement({
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      type: newAnnouncement.type,
      authorName: newAnnouncement.authorName || 'Equipe da Clínica',
      active: true,
    });

    setNewAnnouncement({
      title: '',
      message: '',
      type: 'feature',
      authorName: 'Equipe da Clínica',
    });
    setShowAddAnnouncement(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Gestão Remota do PWA do Paciente</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Configurações & Atualizações do App do Paciente
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Controle os módulos visíveis, personalize mensagens de boas-vindas e envie comunicados e atualizações de dados diretamente para o aplicativo dos seus pacientes em tempo real.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleBroadcastUpdate}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl text-xs font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${broadcastSuccess ? 'animate-spin' : ''}`} />
            <span>{broadcastSuccess ? 'Disparado com Sucesso!' : 'Forçar Atualização de Dados'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Configurações do Portal do Paciente salvas com sucesso! As alterações já estão sincronizadas.</span>
        </div>
      )}

      {broadcastSuccess && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <span>Sinal de atualização de dados e cache PWA disparado para todos os pacientes com sucesso!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Versioning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: App Version & Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Versão & Mensagem de Boas-Vindas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Versão do App do Paciente</label>
                <input
                  type="text"
                  value={formSettings.appVersion}
                  onChange={(e) => setFormSettings({ ...formSettings, appVersion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white"
                  placeholder="Ex: 2.5.0"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data da Última Atualização</label>
                <input
                  type="date"
                  value={formSettings.lastUpdatedDate}
                  onChange={(e) => setFormSettings({ ...formSettings, lastUpdatedDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Mensagem de Boas-Vindas aos Pacientes</label>
              <textarea
                rows={2}
                value={formSettings.customWelcomeMessage}
                onChange={(e) => setFormSettings({ ...formSettings, customWelcomeMessage: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                placeholder="Mensagem exibida no topo do app do paciente..."
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Notas de Atualização do App (Release Notes)</label>
              <textarea
                rows={2}
                value={formSettings.releaseNotes}
                onChange={(e) => setFormSettings({ ...formSettings, releaseNotes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
                placeholder="Descreva o que mudou ou as novidades recentes..."
              />
            </div>
          </div>

          {/* Card 2: Modules Visibility */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              Módulos e Recursos Ativos no App do Paciente
            </h3>
            <p className="text-xs text-slate-500">
              Escolha quais seções e funcionalidades o paciente terá acesso no aplicativo PWA.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition">
                <span className="font-semibold text-slate-800">Exercícios & Prescrições</span>
                <input
                  type="checkbox"
                  checked={formSettings.showPrescriptions}
                  onChange={(e) => setFormSettings({ ...formSettings, showPrescriptions: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition">
                <span className="font-semibold text-slate-800">Saldos de Pacotes & Turmas</span>
                <input
                  type="checkbox"
                  checked={formSettings.showPackages}
                  onChange={(e) => setFormSettings({ ...formSettings, showPackages: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition">
                <span className="font-semibold text-slate-800">Histórico de Pagamentos</span>
                <input
                  type="checkbox"
                  checked={formSettings.showFinancialHistory}
                  onChange={(e) => setFormSettings({ ...formSettings, showFinancialHistory: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition">
                <span className="font-semibold text-slate-800">Chave PIX da Clínica</span>
                <input
                  type="checkbox"
                  checked={formSettings.showPixPayment}
                  onChange={(e) => setFormSettings({ ...formSettings, showPixPayment: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition sm:col-span-2">
                <span className="font-semibold text-slate-800">Botão de Solicitação de Reagendamento via WhatsApp</span>
                <input
                  type="checkbox"
                  checked={formSettings.allowWhatsAppBooking}
                  onChange={(e) => setFormSettings({ ...formSettings, allowWhatsAppBooking: e.target.checked })}
                  className="rounded text-brand-primary focus:ring-0 w-4 h-4"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Salvar Configurações do App
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Announcements & Updates Broadcast */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-primary" />
                Comunicados & Avisos
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAnnouncement(!showAddAnnouncement)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>
            </div>

            {/* Form to Add Announcement */}
            {showAddAnnouncement && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                <h4 className="text-xs font-bold text-slate-800">Publicar Novo Comunicado</h4>
                <div>
                  <input
                    type="text"
                    placeholder="Título do comunicado..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="feature">Novidade do App</option>
                    <option value="announcement">Aviso Geral</option>
                    <option value="update">Atualização de Saúde</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Autor (ex: Recepção)"
                    value={newAnnouncement.authorName}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, authorName: e.target.value })}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Mensagem do comunicado aos pacientes..."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAnnouncement(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAnnouncement}
                    className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {(!settings.announcements || settings.announcements.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Nenhum comunicado ativo. Clique em "+ Novo" para adicionar.
                </div>
              ) : (
                settings.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative group"
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
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{ann.date}</span>
                        <button
                          type="button"
                          onClick={() => deletePatientAnnouncement(ann.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Excluir comunicado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{ann.title}</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{ann.message}</p>
                    <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                      Por: {ann.authorName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
