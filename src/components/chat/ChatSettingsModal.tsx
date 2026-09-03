import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CHAT_SETTINGS } from '../../lib/constants';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Bell,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Shield,
  FileText,
} from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestPushPermission,
  showPushNotification,
  playNotificationSound,
} from '../../services/notificationService';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose }) => {
  const { chatSettings, updateChatSettings, messages, currentUser, activeTenant } = useApp();

  const safeSettings = {
    ...DEFAULT_CHAT_SETTINGS,
    ...(chatSettings || {}),
  };

  const isSoundEnabled = Boolean(safeSettings?.soundEnabled);
  const isPushEnabled = Boolean(safeSettings?.pushEnabled);
  const isAutoMarkAsRead = Boolean(safeSettings?.autoMarkAsRead ?? true);
  const isAllowReceptionDirectProf = Boolean(safeSettings?.allowReceptionDirectProf ?? true);
  const isAllowAllPostOnMural = Boolean(safeSettings?.allowAllPostOnMural ?? true);
  const customTemplates = safeSettings?.customTemplates || DEFAULT_CHAT_SETTINGS.customTemplates;

  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'templates' | 'data'>('general');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<'general' | 'patient_arrival' | 'urgent' | 'room_ready' | 'notice'>('general');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    updateChatSettings({ soundEnabled: next });
    if (next) {
      playNotificationSound();
    }
  };

  const handleTogglePush = async () => {
    if (!isPushEnabled) {
      const perm = await requestPushPermission();
      if (perm === 'granted') {
        updateChatSettings({ pushEnabled: true });
        showPushNotification({
          title: '💬 Notificações de Chat Ativadas',
          body: 'Você agora receberá alertas instantâneos de mensagens da equipe clínica.',
        });
      } else {
        alert('Permissão de notificações não concedida no navegador.');
      }
    } else {
      updateChatSettings({ pushEnabled: false });
    }
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateText.trim()) return;

    const newTmpl = {
      id: `tmpl-${Date.now()}`,
      title: newTemplateTitle.trim(),
      text: newTemplateText.trim(),
      category: newTemplateCategory,
    };

    updateChatSettings({
      customTemplates: [...(customTemplates || []), newTmpl],
    });

    setNewTemplateTitle('');
    setNewTemplateText('');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleDeleteTemplate = (id: string) => {
    updateChatSettings({
      customTemplates: (customTemplates || []).filter((t) => t.id !== id),
    });
  };

  const handleExportAllChatHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `historico_chat_${activeTenant.slug || 'clinica'}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Configurações de Mensagens Internas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parametrização de avisos, alertas sonoros, permissões e templates clínicos
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

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex gap-4 text-xs font-bold overflow-x-auto bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'general'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Geral & Alertas
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Regras de Visibilidade
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'templates'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Templates Rápidos ({customTemplates?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'data'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Histórico & Dados
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSoundEnabled ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Alertas Sonoros (Chime de Áudio)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Tocar som discreto via Web Audio API ao enviar e receber mensagens internas.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playNotificationSound()}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    Testar Som
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isSoundEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Push Notification Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isPushEnabled ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notificações Push no Dispositivo (Service Worker)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Exibir avisos no celular ou desktop mesmo quando a aba do navegador estiver em segundo plano.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePush}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPushEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPushEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Mark as Read */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Marcar Mensagens como Lidas Automaticamente</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Atualiza o status de leitura assim que a conversa com o contato é aberta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateChatSettings({ autoMarkAsRead: !isAutoMarkAsRead })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAutoMarkAsRead ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAutoMarkAsRead ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <strong>Regras de Isolamento e Perfis Clínicos:</strong> O chat interno respeita as permissões do perfil do usuário logado (Administração, Recepção, Profissional de Saúde).
                </div>
              </div>

              {/* Allow reception to talk to all professionals */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Comunicação Direta Recepção ↔ Profissionais</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Permite que secretárias enviem recados e avisos de chegada de pacientes diretamente aos fisioterapeutas e terapeutas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateChatSettings({ allowReceptionDirectProf: !isAllowReceptionDirectProf })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAllowReceptionDirectProf ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAllowReceptionDirectProf ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Allow all to post on clinic wall */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Postagem Aberta no Mural Geral</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    Se desativado, apenas Administradores poderão postar no canal de Mural Geral (os demais apenas visualizam).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateChatSettings({ allowAllPostOnMural: !isAllowAllPostOnMural })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAllowAllPostOnMural ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAllowAllPostOnMural ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Templates rápidos facilitam o envio de avisos frequentes com 1 clique (ex: chegada de paciente, sala liberada, atrasos).
                </p>
                {saveToast && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Template Adicionado!
                  </span>
                )}
              </div>

              {/* Add Template Form */}
              <form onSubmit={handleAddTemplate} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Novo Template Rápido</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Título / Rótulo</label>
                    <input
                      type="text"
                      placeholder="Ex: 🚨 Paciente na Recepção"
                      value={newTemplateTitle}
                      onChange={(e) => setNewTemplateTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoria de Alerta</label>
                    <select
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="patient_arrival">🚨 Chegada de Paciente</option>
                      <option value="room_ready">✅ Sala Liberada</option>
                      <option value="urgent">⚠️ Urgente / Encaixe</option>
                      <option value="notice">📋 Prontuário / Exame</option>
                      <option value="general">💬 Geral / Recado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto da Mensagem (pode usar {'{paciente}'} e {'{horario}'})</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: 🚨 [Recepção] O paciente {paciente} acabou de chegar para o atendimento das {horario}."
                    value={newTemplateText}
                    onChange={(e) => setNewTemplateText(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                  >
                    Adicionar Template
                  </button>
                </div>
              </form>

              {/* Template List */}
              <div className="space-y-2">
                {customTemplates?.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{tmpl.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg font-mono text-[11px]">
                        {tmpl.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition"
                      title="Excluir Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Exportar Histórico de Mensagens</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Baixe um arquivo JSON com todas as mensagens registradas da clínica para conformidade, auditoria ou backup.
                </p>
                <button
                  type="button"
                  onClick={handleExportAllChatHistory}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Mensagens ({messages.length} registros)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Concluir Configuração
          </button>
        </div>
      </div>
    </div>
  );
};
