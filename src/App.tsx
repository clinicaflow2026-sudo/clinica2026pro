import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Loader2 } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { FooterBar } from './components/layout/FooterBar';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
import { GlobalKeyboardShortcutsModal } from './components/common/GlobalKeyboardShortcutsModal';
import { PatientArrivalModal } from './components/chat/PatientArrivalModal';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { Dashboard } from './components/dashboard/Dashboard';
import { CalendarModule } from './components/calendar/CalendarModule';
import { MedicalRecordsModule } from './components/medical-records/MedicalRecordsModule';
import { FinancialModule } from './components/financial/FinancialModule';
import { CadastrosModule } from './components/cadastros/CadastrosModule';
import { PatientsModule } from './components/patients/PatientsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { InternalChatModule } from './components/chat/InternalChatModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { SuperAdminLayer } from './components/superadmin/SuperAdminLayer';
import { CommercialLandingPage } from './components/landing/CommercialLandingPage';
import { PatientPortal } from './components/patient-portal/PatientPortal';
import { LicenseActivationModal } from './components/licensing/LicenseActivationModal';
import { Keyboard } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setShowLicenseModal, sendMessage } = useApp();
  const { session, loading } = useAuth();
  const {
    showShortcutsModal,
    setShowShortcutsModal,
    showArrivalModalGlobal,
    setShowArrivalModalGlobal,
    toast,
    handleTriggerAction,
  } = useGlobalKeyboardShortcuts();

  // Full page views without standard SaaS sidebar/navbar
  if (currentView === 'landing') {
    return (
      <>
        <CommercialLandingPage />
        <PwaInstallPrompt />
      </>
    );
  }

  if (currentView === 'patient_portal') {
    // NOTA (Fase 2): o Portal do Paciente ainda não tem autenticação própria
    // de paciente — isso fica para uma fase futura (auth por paciente +
    // policy de RLS restringindo cada paciente aos próprios dados).
    return (
      <div className="relative">
        <PatientPortal />
        <PwaInstallPrompt />
      </div>
    );
  }

  // A partir daqui é a área interna (staff da clínica) — exige login real.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  // Standard SaaS Application Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Navbar
        onOpenLicenseModal={() => setShowLicenseModal(true)}
        onOpenShortcutsModal={() => setShowShortcutsModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto min-w-0 pb-20 md:pb-8">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'calendar' && <CalendarModule />}
            {currentView === 'medical_records' && <MedicalRecordsModule />}
            {currentView === 'financial' && <FinancialModule />}
            {currentView === 'cadastros' && <CadastrosModule />}
            {currentView === 'patients' && <PatientsModule />}
            {currentView === 'reports' && <ReportsModule />}
            {currentView === 'chat' && <InternalChatModule />}
            {currentView === 'settings' && <SettingsModule />}
            {currentView === 'superadmin' && <SuperAdminLayer />}
          </main>
          <FooterBar />
        </div>
      </div>

      <MobileTabBar />
      <PwaInstallPrompt />
      <LicenseActivationModal />

      {/* Global Keyboard Shortcuts Modal */}
      <GlobalKeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        onTriggerShortcut={handleTriggerAction}
      />

      {/* Global Patient Arrival Notice Triggered via Ctrl+B */}
      <PatientArrivalModal
        isOpen={showArrivalModalGlobal}
        onClose={() => setShowArrivalModalGlobal(false)}
        onSendNotice={(recipientId, text, patId, patName) => {
          sendMessage(text, recipientId, {
            category: 'patient_arrival',
            patientId: patId,
            patientName: patName,
          });
        }}
      />

      {/* Floating Keyboard Shortcut Activation Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Keyboard className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <span className="text-slate-300 mr-1.5">{toast.title}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono font-bold text-teal-300">
              {toast.keys}
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
