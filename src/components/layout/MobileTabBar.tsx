import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Menu,
  X,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const { currentView, setCurrentView, mobileMenuOpen, setMobileMenuOpen, messages, currentUser } = useApp();
  const { primaryColor } = useTheme();

  // If in landing page or patient portal, hide or adapt bottom bar
  if (currentView === 'landing' || currentView === 'patient_portal') {
    return null;
  }

  const unreadCount = messages.filter(
    (m) => !m.read && m.senderId !== currentUser.id && (m.recipientId === currentUser.id || m.recipientId === 'all')
  ).length;

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda', icon: CalendarDays },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'medical_records', label: 'Prontuário', icon: FileText },
  ];

  return (
    <nav
      aria-label="Navegação Mobile Principal"
      className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-3 py-1.5 shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-150"
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id && !mobileMenuOpen;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentView(tab.id as any);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 text-[10px] font-semibold select-none active:scale-95 touch-manipulation ${
                isActive
                  ? 'font-bold bg-slate-100/80 dark:bg-slate-800/80 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              style={isActive ? { color: primaryColor } : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                  style={isActive ? { color: primaryColor } : undefined}
                />
              </div>
              <span className="mt-0.5 truncate max-w-full leading-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Menu drawer toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 text-[10px] font-semibold select-none active:scale-95 touch-manipulation ${
            mobileMenuOpen
              ? 'font-bold bg-slate-100/80 dark:bg-slate-800/80 shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          style={mobileMenuOpen ? { color: primaryColor } : undefined}
        >
          <div className="relative">
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            ) : (
              <Menu className="w-5 h-5" style={mobileMenuOpen ? { color: primaryColor } : undefined} />
            )}
            {unreadCount > 0 && !mobileMenuOpen && (
              <span
                className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-xs animate-pulse"
                style={{ backgroundColor: primaryColor }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="mt-0.5 truncate max-w-full leading-tight">
            {mobileMenuOpen ? 'Fechar' : 'Mais'}
          </span>
        </button>
      </div>
    </nav>
  );
};
