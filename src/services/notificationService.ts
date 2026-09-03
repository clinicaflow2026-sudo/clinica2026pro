// Push Notification & Service Worker Notification Helper for ClinicFlow Pro

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: 'appointment' | 'clinical' | 'chat' | 'financial' | 'general';
    id?: string;
    [key: string]: any;
  };
  actions?: Array<{ action: string; title: string }>;
}

export const isPushNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
};

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported in this browser.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Sends a notification via the active Service Worker registration
 * This works even if the app tab is inactive or backgrounded.
 */
export const showPushNotification = async (payload: NotificationPayload): Promise<boolean> => {
  if (!isPushNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestPushPermission();
    if (perm !== 'granted') return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.showNotification) {
      const options: any = {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
        badge: payload.badge || '/favicon.svg',
        tag: payload.tag || 'clinicflow-reminder',
        data: payload.data || { url: '/?view=calendar' },
        actions: payload.actions || [
          { action: 'open', title: 'Abrir' },
          { action: 'dismiss', title: 'Dispensar' },
        ],
      };
      await registration.showNotification(payload.title, options);
      return true;
    } else if ('Notification' in window) {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/pwa-192x192.png',
      });
      return true;
    }
  } catch (err) {
    console.error('Failed to show push notification:', err);
  }
  return false;
};

/**
 * Schedules or triggers an Appointment Reminder notification
 */
export const triggerAppointmentReminder = async (params: {
  patientName: string;
  professionalName: string;
  time: string;
  date: string;
  procedureName?: string;
  roomName?: string;
}) => {
  return showPushNotification({
    title: `⏰ Lembrete de Consulta: ${params.patientName}`,
    body: `Agendamento às ${params.time} (${params.procedureName || 'Atendimento'}) com ${params.professionalName} na ${params.roomName || 'Sala 01'}.`,
    tag: `apt-reminder-${params.date}-${params.time}`,
    data: {
      type: 'appointment',
      url: '/?view=calendar',
      date: params.date,
      time: params.time,
    },
    actions: [
      { action: 'open', title: 'Ver na Agenda' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  });
};

/**
 * Schedules or triggers a Clinical Evolution / Record Update notification
 */
export const triggerClinicalUpdateNotification = async (params: {
  patientName: string;
  professionalName: string;
  type: string; // 'Evolução SOAP' | 'Avaliação Fisioterapêutica' | 'Laudo'
  summary?: string;
}) => {
  return showPushNotification({
    title: `📋 Prontuário Atualizado: ${params.patientName}`,
    body: `${params.professionalName} adicionou ${params.type}: "${params.summary || 'Conduta terapêutica e plano de tratamento registrados.'}"`,
    tag: `clinical-update-${Date.now()}`,
    data: {
      type: 'clinical',
      url: '/?view=medical_records',
      patientName: params.patientName,
    },
    actions: [
      { action: 'open', title: 'Abrir Prontuário' },
      { action: 'dismiss', title: 'Fechar' },
    ],
  });
};

/**
 * Schedules or triggers an Internal Chat / Team Communication notification
 */
export const triggerInternalChatMessageNotification = async (params: {
  senderName: string;
  senderRole: string;
  recipientName?: string;
  preview: string;
  isBroadcast?: boolean;
  category?: string;
}) => {
  const categoryPrefix =
    params.category === 'patient_arrival'
      ? '🚨 [Recepção] '
      : params.category === 'urgent'
      ? '⚠️ [Urgente] '
      : params.category === 'room_ready'
      ? '✅ [Consultório] '
      : '';

  return showPushNotification({
    title: params.isBroadcast
      ? `📢 Mural da Clínica: Comunicado de ${params.senderName}`
      : `💬 Mensagem de ${params.senderName} (${params.senderRole})`,
    body: `${categoryPrefix}${params.preview}`,
    tag: `chat-msg-${Date.now()}`,
    data: {
      type: 'chat',
      url: '/?view=chat',
    },
    actions: [
      { action: 'open', title: 'Abrir Chat' },
      { action: 'dismiss', title: 'Fechar' },
    ],
  });
};

/**
 * Plays a discrete, pleasant notification chime using Web Audio API
 */
export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone cheerful chime
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // AudioContext autoplay might be blocked if user has not interacted yet
  }
};
