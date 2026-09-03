import { useEffect, useState, useCallback } from 'react';
import { useApp, AppView } from '../context/AppContext';

export interface ShortcutToastState {
  visible: boolean;
  title: string;
  keys: string;
  iconType?: 'patient' | 'appointment' | 'chat' | 'save' | 'search' | 'nav';
}

export function useGlobalKeyboardShortcuts() {
  const { currentView, setCurrentView } = useApp();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showArrivalModalGlobal, setShowArrivalModalGlobal] = useState(false);
  const [toast, setToast] = useState<ShortcutToastState | null>(null);

  const showToast = useCallback((title: string, keys: string, iconType?: ShortcutToastState['iconType']) => {
    setToast({ visible: true, title, keys, iconType });
    const timer = setTimeout(() => {
      setToast(null);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleTriggerAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'new_patient':
          if (currentView !== 'patients') {
            setCurrentView('patients');
          }
          // Small delay to ensure PatientsModule is rendered if switched
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cfp:open-new-patient'));
          }, 60);
          showToast('Cadastrar Novo Paciente', 'Ctrl+N', 'patient');
          break;

        case 'new_appointment':
          if (currentView !== 'calendar') {
            setCurrentView('calendar');
          }
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cfp:open-new-appointment'));
          }, 60);
          showToast('Novo Agendamento', 'Alt+A', 'appointment');
          break;

        case 'patient_arrival':
          setShowArrivalModalGlobal(true);
          showToast('Aviso de Chegada de Paciente', 'Ctrl+B', 'chat');
          break;

        case 'open_chat':
          setCurrentView('chat');
          showToast('Mensagens Internas (Chat)', 'Ctrl+M', 'chat');
          break;

        case 'focus_search': {
          const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          showToast('Busca Global', 'Ctrl+K', 'search');
          break;
        }

        case 'save_form': {
          // Find any open modal's submit button or any form submit button
          const activeModal = document.querySelector('.fixed.inset-0 form') as HTMLFormElement | null;
          const submitBtn = document.querySelector('.fixed.inset-0 button[type="submit"]') as HTMLButtonElement | null;
          const anySubmitBtn = document.querySelector('form button[type="submit"]') as HTMLButtonElement | null;

          if (submitBtn) {
            submitBtn.click();
            showToast('Salvando formulário...', 'Ctrl+S', 'save');
          } else if (activeModal) {
            activeModal.requestSubmit();
            showToast('Salvando formulário...', 'Ctrl+S', 'save');
          } else if (anySubmitBtn) {
            anySubmitBtn.click();
            showToast('Salvando formulário...', 'Ctrl+S', 'save');
          } else {
            showToast('Salvar: Nenhum formulário ativo aberto', 'Ctrl+S', 'save');
          }
          break;
        }

        case 'nav_dashboard':
          setCurrentView('dashboard');
          showToast('Navegação: Dashboard Executivo', 'Alt+1', 'nav');
          break;
        case 'nav_calendar':
          setCurrentView('calendar');
          showToast('Navegação: Agenda Central', 'Alt+2', 'nav');
          break;
        case 'nav_patients':
          setCurrentView('patients');
          showToast('Navegação: Gestão de Pacientes', 'Alt+3', 'nav');
          break;
        case 'nav_records':
          setCurrentView('medical_records');
          showToast('Navegação: Prontuários & Evoluções', 'Alt+4', 'nav');
          break;
        case 'nav_financial':
          setCurrentView('financial');
          showToast('Navegação: Módulo Financeiro', 'Alt+5', 'nav');
          break;
        case 'nav_cadastros':
          setCurrentView('cadastros');
          showToast('Navegação: Cadastros', 'Alt+6', 'nav');
          break;
        case 'nav_chat':
          setCurrentView('chat');
          showToast('Navegação: Mensagens Internas', 'Alt+7', 'nav');
          break;

        case 'help':
          setShowShortcutsModal((prev) => !prev);
          break;

        case 'escape':
          setShowShortcutsModal(false);
          setShowArrivalModalGlobal(false);
          break;
      }
    },
    [currentView, setCurrentView, showToast]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in standard text fields
      const target = e.target as HTMLElement | null;
      const isInputOrTextArea =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const key = e.key.toLowerCase();

      // F1 or Shift + ? -> Help modal
      if (e.key === 'F1' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Escape -> close shortcut modal
      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          e.preventDefault();
          setShowShortcutsModal(false);
          return;
        }
        if (showArrivalModalGlobal) {
          e.preventDefault();
          setShowArrivalModalGlobal(false);
          return;
        }
      }

      // Ctrl + S / Cmd + S -> Save active form (ALWAYS prevent browser save dialog)
      if (isCtrlOrCmd && key === 's') {
        e.preventDefault();
        handleTriggerAction('save_form');
        return;
      }

      // Ctrl + N / Cmd + N -> New Patient (prevent browser new window)
      if (isCtrlOrCmd && !e.shiftKey && key === 'n') {
        e.preventDefault();
        handleTriggerAction('new_patient');
        return;
      }

      // Ctrl + B / Cmd + B or Alt + C -> Patient Arrival (Recepção)
      if ((isCtrlOrCmd && key === 'b') || (isAlt && key === 'c')) {
        e.preventDefault();
        handleTriggerAction('patient_arrival');
        return;
      }

      // Alt + A or (Ctrl + Shift + A) -> New Appointment
      if ((isAlt && key === 'a') || (isCtrlOrCmd && e.shiftKey && key === 'a')) {
        e.preventDefault();
        handleTriggerAction('new_appointment');
        return;
      }

      // Ctrl + M / Cmd + M -> Chat / Mensagens
      if (isCtrlOrCmd && !e.shiftKey && key === 'm') {
        e.preventDefault();
        handleTriggerAction('open_chat');
        return;
      }

      // Ctrl + K / Cmd + K or '/' (when outside input) -> Focus Global Search
      if ((isCtrlOrCmd && key === 'k') || (!isInputOrTextArea && e.key === '/')) {
        e.preventDefault();
        handleTriggerAction('focus_search');
        return;
      }

      // Fast Navigation (Alt + 1..7 or Ctrl + 1..7 when outside input)
      if (isAlt || (!isInputOrTextArea && isCtrlOrCmd)) {
        if (e.key === '1') {
          e.preventDefault();
          handleTriggerAction('nav_dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          handleTriggerAction('nav_calendar');
        } else if (e.key === '3') {
          e.preventDefault();
          handleTriggerAction('nav_patients');
        } else if (e.key === '4') {
          e.preventDefault();
          handleTriggerAction('nav_records');
        } else if (e.key === '5') {
          e.preventDefault();
          handleTriggerAction('nav_financial');
        } else if (e.key === '6') {
          e.preventDefault();
          handleTriggerAction('nav_cadastros');
        } else if (e.key === '7') {
          e.preventDefault();
          handleTriggerAction('nav_chat');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTriggerAction, showShortcutsModal, showArrivalModalGlobal]);

  return {
    showShortcutsModal,
    setShowShortcutsModal,
    showArrivalModalGlobal,
    setShowArrivalModalGlobal,
    toast,
    handleTriggerAction,
  };
}
