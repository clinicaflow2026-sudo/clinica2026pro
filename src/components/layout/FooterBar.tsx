import React from 'react';

export const FooterBar: React.FC = () => {
  return (
    <footer className="no-print h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0 z-20 transition-colors duration-150">
      <div className="flex items-center gap-4">
        <span>Suporte: 0800 555 1234</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span>Documentação v1.0.25</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Servidor: Sa-East-1 (São Paulo) | Latency: 12ms</span>
      </div>
    </footer>
  );
};
