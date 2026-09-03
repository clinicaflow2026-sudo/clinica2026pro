import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const LicenseActivationModal: React.FC = () => {
  const {
    showLicenseModal,
    setShowLicenseModal,
    activateLicenseKey,
    activeTenant,
    licenses,
  } = useApp();

  const [inputKey, setInputKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  if (!showLicenseModal) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsActivating(true);
    setStatusMessage(null);

    setTimeout(() => {
      const result = activateLicenseKey(inputKey.trim());
      setIsActivating(false);

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Parabéns! Sua chave de ativação foi validada com sucesso. O plano ${result.plan?.toUpperCase()} agora está liberado para a clínica ${activeTenant.name}.`,
        });
        setTimeout(() => {
          setShowLicenseModal(false);
          setStatusMessage(null);
          setInputKey('');
        }, 2200);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message || 'Chave de ativação inválida ou expirada.',
        });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ativação de Licença</h3>
              <p className="text-xs text-slate-500">ClinicFlow Pro • Multi-Tenant</p>
            </div>
          </div>
          <button
            onClick={() => setShowLicenseModal(false)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <p className="text-slate-500">Clínica Ativa:</p>
          <p className="font-bold text-slate-800">{activeTenant.name} ({activeTenant.tradeName})</p>
          <p className="text-[10px] text-slate-400">CNPJ: {activeTenant.cnpj}</p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chave de Licença Fornecida pelo SuperAdmin *
            </label>
            <input
              type="text"
              placeholder="CFP-XXX-XXXX-XXXX"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value.toUpperCase())}
              className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-teal-600 text-center font-mono font-bold tracking-widest text-sm"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Formato padrão com verificação de assinatura SHA-256
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowLicenseModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isActivating || !inputKey.trim()}
              className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              {isActivating ? <Sparkles className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isActivating ? 'Validando Chave...' : 'Validar & Ativar Licença'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
