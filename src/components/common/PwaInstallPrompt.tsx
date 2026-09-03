import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, WifiOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const { primaryColor } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for iOS / Safari
      alert(
        'Para instalar o ClinicFlow Pro no iPhone/iPad:\n1. Toque no botão Compartilhar (ícone com seta para cima)\n2. Role para baixo e selecione "Adicionar à Tela de Início".'
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Erro durante instalação do PWA:', err);
    }
  };

  // Offline banner alert
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            <strong>Modo Offline Ativo:</strong> Você está desconectado. O ClinicFlow Pro PWA está operando com dados em cache local.
          </span>
        </div>
      </div>
    );
  }

  // Installation success toast
  if (installSuccess) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
        <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
        <span>ClinicFlow Pro instalado com sucesso no seu dispositivo!</span>
      </div>
    );
  }

  // If already standalone or user dismissed banner and not prompted, do not show floating banner
  if (isStandalone || isDismissed) {
    return null;
  }

  // Show floating install banner on mobile/desktop if installable prompt is available
  if (deferredPrompt) {
    return (
      <div className="no-print fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Instalar ClinicFlow Pro</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Instale o app na tela inicial para acesso rápido offline e experiência nativa.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-medium transition"
          >
            Agora não
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
