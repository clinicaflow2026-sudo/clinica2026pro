import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Building,
  Download,
  Copy,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { PatientConsentTerm, Patient } from '../../types';
import { useApp } from '../../context/AppContext';

interface ViewConsentTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: PatientConsentTerm;
  patient?: Patient;
  onPrint: (term: PatientConsentTerm) => void;
  onRevoke?: (termId: string) => void;
}

export const ViewConsentTermModal: React.FC<ViewConsentTermModalProps> = ({
  isOpen,
  onClose,
  term,
  patient,
  onPrint,
  onRevoke,
}) => {
  const { activeTenant } = useApp();

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `
TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO
Título: ${term.title}
Data: ${term.signedAt}
Paciente: ${term.patientName} (CPF: ${term.patientCpf})
Clínica: ${activeTenant.tradeName || activeTenant.name}
Código de Validação: ${term.patientSignature.verificationHash}

TEXTO:
${term.content}

CLÁUSULAS CONCORDADAS:
${term.clauses.map((c) => `- [X] ${c.title}: ${c.description}`).join('\n')}

Assinado eletronicamente por ${term.patientSignature.signedByName} em ${term.patientSignature.timestamp}.
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Texto do Termo copiado com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {term.title}
                </h3>
                {term.status === 'signed' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Assinado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    Revogado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Paciente: <strong>{term.patientName}</strong> • CPF: {term.patientCpf || '-'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Top Verification Alert */}
          <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-teal-950">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="font-bold text-xs">Validação de Integridade Criptográfica:</span>
                <p className="text-[11px] text-teal-800 font-mono mt-0.5">
                  Hash: <strong>{term.patientSignature.verificationHash}</strong>
                </p>
              </div>
            </div>
            <div className="text-[11px] text-teal-800">
              Dispositivo: {term.patientSignature.deviceInfo}
            </div>
          </div>

          {/* Full Legal Text */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Teor do Termo de Consentimento
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-serif whitespace-pre-line text-xs">
              {term.content}
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Cláusulas e Declarações Ratificadas pelo Paciente ({term.clauses.length})
            </h4>
            <div className="space-y-2">
              {term.clauses.map((clause) => (
                <div
                  key={clause.id}
                  className="p-3 rounded-2xl bg-white border border-teal-200/70 flex items-start gap-2.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-xs">{clause.title}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{clause.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures Display Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Patient Signature Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Assinatura Digital do Paciente
                </span>
                <div className="bg-white rounded-xl p-3 border border-slate-200 min-h-[90px] flex items-center justify-center">
                  {term.patientSignature.dataUrl ? (
                    <img
                      src={term.patientSignature.dataUrl}
                      alt="Assinatura do Paciente"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Sem imagem de assinatura</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <p className="font-bold text-slate-900">{term.patientSignature.signedByName}</p>
                <p className="text-slate-500">CPF: {term.patientSignature.signedByCpf}</p>
                <p className="text-[10px] text-teal-700 font-medium mt-0.5">
                  {term.patientSignature.timestamp}
                </p>
              </div>
            </div>

            {/* Professional Signature Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Ciência do Profissional Responsável
                </span>
                <div className="bg-white rounded-xl p-3 border border-slate-200 min-h-[90px] flex items-center justify-center">
                  {term.professionalSignature?.dataUrl ? (
                    <img
                      src={term.professionalSignature.dataUrl}
                      alt="Assinatura Profissional"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Assinado Eletronicamente</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <p className="font-bold text-slate-900">
                  {term.professionalSignature?.signedByName || term.professionalName || 'Profissional da Clínica'}
                </p>
                <p className="text-slate-500">
                  {term.professionalSignature?.registrationNumber || term.professionalRegistration || 'CREFITO'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {term.professionalSignature?.timestamp || term.signedAt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Texto</span>
            </button>
            {term.status === 'signed' && onRevoke && (
              <button
                onClick={() => {
                  if (confirm('Deseja realmente revogar este consentimento informado?')) {
                    onRevoke(term.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Revogar Termo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onPrint(term);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
