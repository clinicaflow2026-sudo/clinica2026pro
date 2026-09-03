import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_CHAT_SETTINGS } from '../../lib/constants';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Shield,
  Clock,
  Sparkles,
  Paperclip,
  CheckCheck,
  Check,
  Building,
  Bell,
  Lock,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Plus,
  AlertTriangle,
  Calendar,
  X,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  UserCheck,
  Megaphone,
  Filter,
} from 'lucide-react';
import { InternalMessage, UserRole } from '../../types';
import { ChatSettingsModal } from './ChatSettingsModal';
import { PatientArrivalModal } from './PatientArrivalModal';
import { playNotificationSound } from '../../services/notificationService';

export const InternalChatModule: React.FC = () => {
  const {
    activeTenant = { name: 'Clínica', tradeName: 'Clínica' } as any,
    currentUser = { id: 'admin-1', name: 'Administrador', role: 'admin' as UserRole, email: 'admin@clinica.com' } as any,
    setCurrentUser,
    users = [],
    messages = [],
    sendMessage,
    markAllMessagesAsRead,
    clearConversation,
    chatSettings,
    updateChatSettings,
  } = useApp();
  const { primaryColor } = useTheme();

  const safeSettings = {
    ...DEFAULT_CHAT_SETTINGS,
    ...(chatSettings || {}),
  };

  const isAutoMarkAsRead = Boolean(safeSettings?.autoMarkAsRead ?? true);
  const isSoundEnabled = Boolean(safeSettings?.soundEnabled ?? true);
  const isAllowAllPostOnMural = Boolean(safeSettings?.allowAllPostOnMural ?? true);
  const isAllowReceptionDirectProf = Boolean(safeSettings?.allowReceptionDirectProf ?? true);
  const customTemplates = safeSettings?.customTemplates || DEFAULT_CHAT_SETTINGS.customTemplates;

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('all');
  const [messageInput, setMessageInput] = useState('');
  const [mobileChatView, setMobileChatView] = useState<'contacts' | 'conversation'>('conversation');
  const [contactSearch, setContactSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'mural' | 'professionals' | 'reception' | 'admin'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'patient_arrival' | 'urgent' | 'room_ready' | 'notice'>('general');
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: 'image' | 'file'; size?: string } | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPatientArrivalModal, setShowPatientArrivalModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mark messages as read when opening conversation if autoMarkAsRead is enabled
  useEffect(() => {
    if (isAutoMarkAsRead && typeof markAllMessagesAsRead === 'function') {
      try {
        markAllMessagesAsRead(selectedRecipientId);
      } catch (err) {
        console.warn('Error marking messages as read:', err);
      }
    }
  }, [selectedRecipientId, messages?.length, isAutoMarkAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length, selectedRecipientId]);

  // Safe users list
  const safeUsers = Array.isArray(users) ? users : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Visibility Rules (Section 3.8 & Configurable)
  // - Admin / SuperAdmin sees everyone
  // - Professional sees Admin, other professionals, and reception/secretaries
  // - Secretary sees Admin, SuperAdmin, and all professionals (to announce patient arrivals)
  const getVisibleUsers = () => {
    return safeUsers.filter((u) => {
      if (!u || !currentUser) return false;
      if (u.id === currentUser.id) return false;
      if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;
      if (currentUser.role === 'professional') {
        const allowReception = isAllowReceptionDirectProf;
        return (
          u.role === 'admin' ||
          u.role === 'professional' ||
          u.role === 'superadmin' ||
          (allowReception && u.role === 'secretary')
        );
      }
      if (currentUser.role === 'secretary') {
        const allowDirect = isAllowReceptionDirectProf;
        if (allowDirect) {
          return u.role === 'admin' || u.role === 'superadmin' || u.role === 'professional';
        }
        return u.role === 'admin' || u.role === 'superadmin';
      }
      return true;
    });
  };

  const visibleUsers = getVisibleUsers();

  // Filter contacts by tab and search
  const filteredUsers = visibleUsers.filter((u) => {
    if (!u) return false;
    const nameStr = u.name || '';
    const roleStr = u.role || '';
    const emailStr = u.email || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(contactSearch.toLowerCase()) ||
      roleStr.toLowerCase().includes(contactSearch.toLowerCase()) ||
      emailStr.toLowerCase().includes(contactSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (contactFilter === 'professionals') return u.role === 'professional';
    if (contactFilter === 'reception') return u.role === 'secretary';
    if (contactFilter === 'admin') return u.role === 'admin' || u.role === 'superadmin';
    return true;
  });

  // Filter messages for active conversation
  const activeConversationMessages = safeMessages.filter((m) => {
    if (!m) return false;
    if (selectedRecipientId === 'all') {
      return m.recipientId === 'all';
    }
    const isDirectToSelected = m.senderId === currentUser?.id && m.recipientId === selectedRecipientId;
    const isDirectFromSelected = m.senderId === selectedRecipientId && m.recipientId === currentUser?.id;
    return isDirectToSelected || isDirectFromSelected;
  });

  // Search inside active conversation
  const displayedMessages = messageSearch.trim()
    ? activeConversationMessages.filter(
        (m) =>
          (m.content || '').toLowerCase().includes(messageSearch.toLowerCase()) ||
          (m.senderName || '').toLowerCase().includes(messageSearch.toLowerCase()) ||
          (m.patientName || '').toLowerCase().includes(messageSearch.toLowerCase())
      )
    : activeConversationMessages;

  // Unread counts per contact
  const getUnreadCountForUser = (userId: string) => {
    if (userId === 'all') {
      return safeMessages.filter((m) => m.recipientId === 'all' && !m.read && m.senderId !== currentUser?.id).length;
    }
    return safeMessages.filter((m) => m.senderId === userId && m.recipientId === currentUser?.id && !m.read).length;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachedFile) return;

    const recipientUser = safeUsers.find((u) => u.id === selectedRecipientId);

    if (typeof sendMessage === 'function') {
      sendMessage(messageInput.trim() || 'Arquivo Anexo', selectedRecipientId, {
        recipientRole: recipientUser?.role,
        category: selectedCategory,
        attachment: attachedFile || undefined,
      });
    }

    setMessageInput('');
    setAttachedFile(null);
    setSelectedCategory('general');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const isImg = file.type.startsWith('image/');
      setAttachedFile({
        name: file.name,
        url: event.target?.result as string,
        type: isImg ? 'image' : 'file',
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleQuickTemplateClick = (templateText: string, category: any) => {
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formatted = templateText
      .replace('{horario}', currentTime)
      .replace('{hora}', currentTime)
      .replace('{horário}', currentTime);
    setMessageInput(formatted);
    setSelectedCategory(category || 'general');
  };

  const selectedUser = safeUsers.find((u) => u.id === selectedRecipientId);
  const muralUnread = getUnreadCountForUser('all');

  const handleExportCurrentConversation = () => {
    const channelName =
      selectedRecipientId === 'all'
        ? 'mural_geral'
        : `chat_${selectedUser?.name ? selectedUser.name.toLowerCase().replace(/\s+/g, '_') : selectedRecipientId}`;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeConversationMessages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${channelName}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const canPostOnCurrentChannel =
    selectedRecipientId !== 'all' ||
    isAllowAllPostOnMural ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'superadmin';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              <span>Mensagens Internas da Clínica</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comunicação instantânea segura entre Recepção, Fisioterapeutas e Gestão com avisos de chegada e alertas de prontuário.
          </p>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Persona / User Switcher for seamless simulation */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase hidden lg:inline">Conectado como:</span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const target = safeUsers.find((u) => u.id === e.target.value);
                if (target && typeof setCurrentUser === 'function') {
                  setCurrentUser(target);
                }
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
              title="Alternar usuário para testar comunicação entre Recepção e Especialistas"
            >
              {safeUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {u.name} ({u.role === 'secretary' ? 'Recepção' : u.role === 'professional' ? 'Especialista' : u.role === 'admin' ? 'Gestão' : 'Admin'})
                </option>
              ))}
            </select>
          </div>

          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isSoundEnabled;
              if (typeof updateChatSettings === 'function') {
                updateChatSettings({ soundEnabled: next });
              }
              if (next) playNotificationSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              isSoundEnabled
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isSoundEnabled ? 'Alertas sonoros ativados' : 'Alertas sonoros desativados'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSoundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {/* Quick Patient Arrival Modal Button (Recepção) */}
          <button
            type="button"
            id="btn-quick-patient-arrival"
            title="Atalho: Ctrl+B ou Alt+C"
            onClick={() => setShowPatientArrivalModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <Bell className="w-3.5 h-3.5 animate-pulse" />
            <span>Avisar Chegada</span>
            <kbd className="hidden sm:inline-block ml-0.5 px-1.5 py-0.2 bg-amber-700/60 border border-amber-300/40 rounded text-[9px] font-mono text-amber-100">
              Ctrl+B
            </kbd>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            id="btn-chat-settings"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-2xs transition"
            title="Configurar regras, templates e alertas"
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Configurar</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-4 h-[650px] sm:h-[700px] transition-colors">
        {/* Left Column: Contacts & Channels */}
        <div
          className={`border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/40 ${
            mobileChatView === 'conversation' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Contact Search & Filter */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar colega por nome ou cargo..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-teal-600"
              />
              {contactSearch && (
                <button
                  onClick={() => setContactSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setContactFilter('all')}
                className={`px-2.5 py-0.5 rounded-lg transition shrink-0 ${
                  contactFilter === 'all'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos ({visibleUsers.length + 1})
              </button>
              <button
                type="button"
                onClick={() => setContactFilter('professionals')}
                className={`px-2.5 py-0.5 rounded-lg transition shrink-0 ${
                  contactFilter === 'professionals'
                    ? 'bg-teal-700 text-white'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
                }`}
              >
                Profissionais
              </button>
              <button
                type="button"
                onClick={() => setContactFilter('reception')}
                className={`px-2.5 py-0.5 rounded-lg transition shrink-0 ${
                  contactFilter === 'reception'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                Recepção
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
            {/* Mural Geral da Clínica (Broadcast Channel) */}
            {(contactFilter === 'all' || contactFilter === 'mural') && (
              <button
                onClick={() => {
                  setSelectedRecipientId('all');
                  setMobileChatView('conversation');
                }}
                className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 relative ${
                  selectedRecipientId === 'all'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-base shrink-0">
                  📢
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold truncate">Mural Geral da Clínica</p>
                    {muralUnread > 0 && selectedRecipientId !== 'all' && (
                      <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold shrink-0">
                        {muralUnread}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      selectedRecipientId === 'all' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Comunicados e avisos para toda a equipe
                  </p>
                </div>
              </button>
            )}

            {/* Individual Team Members */}
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Nenhum contato encontrado com o filtro aplicado.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedRecipientId === u.id;
                const unread = getUnreadCountForUser(u.id);
                const roleColor =
                  u.role === 'admin' || u.role === 'superadmin'
                    ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : u.role === 'secretary'
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';

                const roleLabel =
                  u.role === 'admin'
                    ? 'Gestão'
                    : u.role === 'superadmin'
                    ? 'SuperAdmin'
                    : u.role === 'secretary'
                    ? 'Recepção'
                    : 'Profissional';

                // Find last message with this user
                const userMessages = safeMessages.filter(
                  (m) =>
                    (m.senderId === u.id && m.recipientId === currentUser?.id) ||
                    (m.senderId === currentUser?.id && m.recipientId === u.id)
                );
                const lastMessage = userMessages[userMessages.length - 1];

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedRecipientId(u.id);
                      setMobileChatView('conversation');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-teal-600 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {(u.name || 'US').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate">{u.name}</p>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full border uppercase font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white border-transparent' : roleColor
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p
                          className={`text-[10px] truncate max-w-[140px] ${
                            isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {lastMessage ? lastMessage.content : u.email}
                        </p>
                        {unread > 0 && !isSelected && (
                          <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* User Status Bar */}
          <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate font-semibold">{currentUser?.name || 'Usuário'}</span>
            </div>
            <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
              {currentUser?.role || 'admin'}
            </span>
          </div>
        </div>

        {/* Right Column: Active Conversation Stream & Composer */}
        <div
          className={`md:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 ${
            mobileChatView === 'contacts' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Bar of Active Conversation */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on mobile */}
              <button
                onClick={() => setMobileChatView('contacts')}
                className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1"
                aria-label="Voltar aos Contatos"
              >
                ←
              </button>

              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                {selectedRecipientId === 'all' ? '📢' : (selectedUser?.name || 'US').substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedRecipientId === 'all' ? 'Mural Geral da Clínica' : (selectedUser?.name || 'Conversa')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>
                    {selectedRecipientId === 'all'
                      ? `${activeTenant.tradeName || activeTenant.name || 'Clínica'} • Canal para toda a equipe`
                      : `${selectedUser?.role ? selectedUser.role.toUpperCase() : 'CONTATO'} • ${selectedUser?.email || ''}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Conversation Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search Inside Conversation */}
              <div className="relative hidden sm:block">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg w-28 lg:w-36 focus:outline-teal-600"
                />
                {messageSearch && (
                  <button
                    onClick={() => setMessageSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Export Conversation */}
              <button
                type="button"
                onClick={handleExportCurrentConversation}
                className="p-1.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition"
                title="Exportar histórico desta conversa em JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Clear History */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza de que deseja limpar as mensagens desta conversa?')) {
                    if (typeof clearConversation === 'function') {
                      clearConversation(selectedRecipientId);
                    }
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                title="Limpar mensagens desta conversa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
            {displayedMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                <div className="max-w-xs space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-2xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhuma mensagem registrada nesta conversa.</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use os atalhos clínicos rápidos abaixo ou envie uma mensagem direta para a equipe.
                  </p>
                </div>
              </div>
            ) : (
              displayedMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;

                // Category styling badges
                const categoryBadge =
                  msg.category === 'patient_arrival' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-1">
                      <Bell className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Chegada de Paciente
                    </span>
                  ) : msg.category === 'room_ready' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Sala Liberada
                    </span>
                  ) : msg.category === 'urgent' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      Urgente / Encaixe
                    </span>
                  ) : msg.category === 'notice' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-1">
                      <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      Prontuário / Exame
                    </span>
                  ) : null;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{msg.senderName}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-2xs space-y-1.5 ${
                        isMe
                          ? 'bg-teal-600 text-white rounded-tr-xs font-medium'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                      }`}
                    >
                      {categoryBadge}

                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Patient Quick Tag if attached */}
                      {msg.patientName && (
                        <div
                          className={`mt-1.5 p-2 rounded-xl flex items-center justify-between text-[11px] font-semibold ${
                            isMe
                              ? 'bg-white/15 text-white border border-white/20'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <UserCheck className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            <span className="truncate">Paciente: {msg.patientName}</span>
                          </div>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-500/20 rounded font-bold shrink-0">
                            Recepção
                          </span>
                        </div>
                      )}

                      {/* Attachment preview */}
                      {msg.attachment && (
                        <div className="pt-1.5">
                          {msg.attachment.type === 'image' ? (
                            <button
                              type="button"
                              onClick={() => setLightboxImageUrl(msg.attachment?.url || null)}
                              className="block rounded-lg overflow-hidden border border-white/20 max-w-[240px] hover:opacity-90 transition"
                            >
                              <img
                                src={msg.attachment.url}
                                alt={msg.attachment.name}
                                className="w-full h-32 object-cover"
                              />
                            </button>
                          ) : (
                            <div className="p-2 rounded-lg bg-black/10 dark:bg-black/30 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="truncate text-[11px] font-medium">{msg.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Read status check */}
                      {isMe && (
                        <div className="flex items-center justify-end gap-1 text-[9px] text-teal-100 pt-0.5">
                          <span>{msg.read ? 'Lido' : 'Enviado'}</span>
                          {msg.read ? <CheckCheck className="w-3 h-3 text-cyan-200" /> : <Check className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Clinical Templates Bar */}
          {canPostOnCurrentChannel && (
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0 mr-1">
                Atalhos Rápidos:
              </span>

              {/* Quick Button: Paciente Chegou (Opens Arrival Modal) */}
              <button
                type="button"
                onClick={() => setShowPatientArrivalModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1 shrink-0 transition"
              >
                <Bell className="w-3 h-3" />
                <span>Paciente Chegou</span>
              </button>

              {/* Default Quick Actions */}
              {customTemplates?.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleQuickTemplateClick(tmpl.text, tmpl.category)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium shrink-0 transition"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Preview Chip */}
          {attachedFile && (
            <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 border-t border-teal-100 dark:border-teal-800 flex items-center justify-between text-xs text-teal-800 dark:text-teal-200">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">({attachedFile.size})</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-teal-600 dark:text-teal-400 hover:text-teal-900 font-bold text-xs"
              >
                Remover
              </button>
            </div>
          )}

          {/* Message Input Form or Restricted Posting Notice */}
          {!canPostOnCurrentChannel ? (
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-amber-50/80 dark:bg-amber-950/40 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                O Mural Geral está configurado para avisos exclusivos da Administração. Você pode enviar mensagens diretas para qualquer colega da equipe na lista de contatos.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl transition ${
                  attachedFile ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Anexar imagem ou documento clínico"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Category Selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="hidden sm:block text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 focus:outline-teal-600"
              >
                <option value="general">💬 Geral</option>
                <option value="patient_arrival">🚨 Chegada</option>
                <option value="room_ready">✅ Sala</option>
                <option value="urgent">⚠️ Urgente</option>
                <option value="notice">📋 Prontuário</option>
              </select>

              <input
                type="text"
                placeholder={`Escreva para ${selectedRecipientId === 'all' ? 'toda a equipe' : selectedUser?.name || 'contato'}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-teal-600 transition"
              />

              <button
                type="submit"
                disabled={!messageInput.trim() && !attachedFile}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Image Attachments */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImageUrl}
              alt="Anexo ampliado"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Patient Arrival Quick Modal */}
      <PatientArrivalModal
        isOpen={showPatientArrivalModal}
        onClose={() => setShowPatientArrivalModal(false)}
        targetProfessionalId={selectedRecipientId !== 'all' ? selectedRecipientId : undefined}
        onSendNotice={(recipientId, text, patId, patName) => {
          if (typeof sendMessage === 'function') {
            sendMessage(text, recipientId, {
              category: 'patient_arrival',
              patientId: patId,
              patientName: patName,
            });
          }
        }}
      />
    </div>
  );
};
