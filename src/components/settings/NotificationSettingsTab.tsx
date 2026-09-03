import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  FileText,
  Smartphone,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestPushPermission,
  showPushNotification,
  triggerAppointmentReminder,
  triggerClinicalUpdateNotification,
} from '../../services/notificationService';

export const NotificationSettingsTab: React.FC = () => {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    appointmentReminders: true,
    reminderAdvanceTime: '60', // minutes
    clinicalUpdates: true,
    patientPortalAlerts: true,
    financialDueAlerts: true,
    chatMessages: true,
  });

  useEffect(() => {
    setSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPushPermission();
    setPermission(result);
    if (result === 'granted') {
      setTestStatus('Permissão concedida! Notificações push ativadas com sucesso.');
      // Send a welcome notification
      await showPushNotification({
        title: '🎉 Notificações Push Ativadas!',
        body: 'Você agora receberá lembretes de consultas e atualizações clínicas no ClinicFlow Pro.',
        tag: 'welcome-notification',
      });
    } else if (result === 'denied') {
      setTestStatus('Permissão negada pelo navegador. Você pode reativá-la nas configurações do navegador.');
    }
  };

  const handleTestAppointmentReminder = async () => {
    setTestStatus('Enviando lembrete de consulta de teste...');
    const ok = await triggerAppointmentReminder({
      patientName: 'Mariana Silva',
      professionalName: 'Dr. Lucas Santos (Fisioterapeuta)',
      time: '14:30',
      date: new Date().toISOString().split('T')[0],
      procedureName: 'Fisioterapia Traumato-Ortopédica',
      roomName: 'Consultório 01',
    });

    if (ok) {
      setTestStatus('Lembrete de consulta enviado com sucesso via Service Worker!');
    } else {
      setTestStatus('Falha ao enviar notificação. Verifique se as permissões estão ativas.');
    }
  };

  const handleTestClinicalUpdate = async () => {
    setTestStatus('Enviando notificação de atualização clínica de teste...');
    const ok = await triggerClinicalUpdateNotification({
      patientName: 'Carlos Eduardo Oliveira',
      professionalName: 'Dra. Camila Ribeiro',
      type: 'Evolução SOAP',
      summary: 'Paciente relata alívio significativo da dor lombar após cinesioterapia.',
    });

    if (ok) {
      setTestStatus('Notificação clínica enviada com sucesso via Service Worker!');
    } else {
      setTestStatus('Falha ao enviar notificação. Verifique se as permissões estão ativas.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            <span>Notificações Push & Lembretes em Segundo Plano</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Receba lembretes de consultas, confirmações de presença e atualizações de prontuário mesmo com o app fechado.
          </p>
        </div>

        {/* Permission Status Pill */}
        <div className="flex items-center gap-2">
          {permission === 'granted' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Push Ativo
            </span>
          ) : permission === 'denied' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Bloqueado no Navegador
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Zap className="w-4 h-4" />
              Ativar Notificações
            </button>
          )}
        </div>
      </div>

      {testStatus && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-medium text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Service Worker Info Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800">Tecnologia Service Worker PWA (W3C Push API)</div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Compatível com Android Chrome, Windows/Mac Edge & Chrome, e iOS 16.4+ (Safari adicionado à tela inicial).
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Background Sync Pronto
          </span>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Configuração de Alertas Automáticos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Appointment Reminders */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800">Lembretes de Consultas</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.appointmentReminders}
                onChange={(e) => setPreferences({ ...preferences, appointmentReminders: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dispara lembretes automáticos para terapeutas e pacientes antes do início de cada sessão.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-600 font-semibold">Antecedência:</span>
              <select
                value={preferences.reminderAdvanceTime}
                onChange={(e) => setPreferences({ ...preferences, reminderAdvanceTime: e.target.value })}
                className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
              >
                <option value="15">15 minutos antes</option>
                <option value="30">30 minutos antes</option>
                <option value="60">1 hora antes</option>
                <option value="120">2 horas antes</option>
                <option value="1440">24 horas antes</option>
              </select>
            </div>
          </div>

          {/* Clinical Evolution Updates */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800">Atualizações Clínicas & SOAP</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.clinicalUpdates}
                onChange={(e) => setPreferences({ ...preferences, clinicalUpdates: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Notifica profissionais quando novos exames, evoluções ou laudos são anexados ao prontuário do paciente.
            </p>
          </div>

          {/* Patient Portal Alert */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Portal do Paciente</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.patientPortalAlerts}
                onChange={(e) => setPreferences({ ...preferences, patientPortalAlerts: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Avisa a recepção e o profissional quando o paciente confirma presença ou solicita reagendamento pelo app.
            </p>
          </div>

          {/* Chat and Urgent alerts */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800">Chat Interno & Mensagens Diretas</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.chatMessages}
                onChange={(e) => setPreferences({ ...preferences, chatMessages: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Notifica o profissional quando recebe uma mensagem direta de colegas de equipe ou da administração.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Testing Section */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>Simulador de Notificações Push em Segundo Plano</span>
          </h4>
        </div>
        <p className="text-xs text-slate-500">
          Experimente o recebimento de notificações nativas emitidas pelo Service Worker da aplicação:
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleTestAppointmentReminder}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Testar Lembrete de Consulta</span>
          </button>

          <button
            onClick={handleTestClinicalUpdate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Testar Atualização Clínica (SOAP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
