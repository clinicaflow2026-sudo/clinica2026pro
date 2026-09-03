import React, { useState, useId } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileCheck2,
  PenTool,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Maximize2,
  Calendar,
  User,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Patient, PatientConsentTerm, ConsentTermType, ConsentTermClause } from '../../types';
import { CONSENT_TERM_TEMPLATES, ConsentTermTemplate } from './consentTemplates';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';

interface ConsentTermSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSaveConsentTerm: (term: Omit<PatientConsentTerm, 'id' | 'tenantId' | 'createdAt'>) => void;
}

export const ConsentTermSignModal: React.FC<ConsentTermSignModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveConsentTerm,
}) => {
  const { activeTenant, currentUser, professionals } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<ConsentTermType>('physiotherapy');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [clauses, setClauses] = useState<ConsentTermClause[]>(() => {
    const tpl = CONSENT_TERM_TEMPLATES[0];
    return tpl.defaultClauses.map((c) => ({ ...c }));
  });

  const [activeStep, setActiveStep] = useState<'review' | 'signing' | 'completed'>('review');
  const [capturedSignature, setCapturedSignature] = useState<{
    dataUrl: string;
    isEmpty: boolean;
    strokeCount: number;
  } | null>(null);

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    professionals[0]?.id || currentUser.id
  );

  if (!isOpen) return null;

  const currentTemplate =
    CONSENT_TERM_TEMPLATES.find((t) => t.id === selectedTemplateId) || CONSENT_TERM_TEMPLATES[0];
  const selectedProfessional =
    professionals.find((p) => p.id === selectedProfessionalId) || professionals[0];

  // Handle template switch
  const handleTemplateChange = (templateId: ConsentTermType) => {
    setSelectedTemplateId(templateId);
    const tpl = CONSENT_TERM_TEMPLATES.find((t) => t.id === templateId) || CONSENT_TERM_TEMPLATES[0];
    setClauses(tpl.defaultClauses.map((c) => ({ ...c, agreed: true })));
    setCustomTitle(tpl.title);
    setCustomContent('');
    setCapturedSignature(null);
  };

  // Interpolate tags
  const processTextWithVariables = (text: string) => {
    return text
      .replace(/{NOME_PACIENTE}/g, patient.name)
      .replace(/{CPF}/g, patient.cpf || 'Não informado')
      .replace(/{CLINICA}/g, activeTenant.tradeName || activeTenant.name)
      .replace(/{DATA}/g, new Date().toLocaleDateString('pt-BR'))
      .replace(
        /{PROFISSIONAL}/g,
        selectedProfessional ? `${selectedProfessional.name} (${selectedProfessional.councilRegistration})` : 'Profissional Responsável'
      );
  };

  const fullTextToRender = customContent
    ? customContent
    : processTextWithVariables(currentTemplate.defaultContent);

  const titleToRender = customTitle ? customTitle : currentTemplate.title;

  const allRequiredClausesAgreed = clauses.every((c) => !c.required || c.agreed);

  const handleToggleClause = (clauseId: string) => {
    setClauses((prev) =>
      prev.map((c) => (c.id === clauseId ? { ...c, agreed: !c.agreed } : c))
    );
  };

  // Generate SHA-like verification hash
  const generateVerificationHash = () => {
    const raw = `${patient.id}-${patient.cpf}-${Date.now()}-${activeTenant.id}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `CFP-TCLE-${new Date().getFullYear()}-${hex}`;
  };

  const handleFinishAndSave = (sigDataUrl?: string) => {
    const finalDataUrl = sigDataUrl || capturedSignature?.dataUrl;
    if (!finalDataUrl) return;

    const verificationHash = generateVerificationHash();
    const nowIso = new Date().toISOString();
    const timestampStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;

    onSaveConsentTerm({
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      patientPhone: patient.phone,
      professionalId: selectedProfessional?.id,
      professionalName: selectedProfessional?.name,
      professionalRegistration: selectedProfessional?.councilRegistration,
      termType: selectedTemplateId,
      title: titleToRender,
      content: fullTextToRender,
      clauses,
      patientSignature: {
        type: 'drawn',
        dataUrl: finalDataUrl,
        signedByName: patient.name,
        signedByCpf: patient.cpf,
        timestamp: timestampStr,
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Touchscreen / Tablet' : 'Navegador Web / Mesa Digitalizadora',
        verificationHash,
        ipOrLocation: 'Ambiente Clínico Seguro',
      },
      professionalSignature: {
        type: 'drawn',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><text x="5" y="24" fill="%230d9488" font-family="sans-serif" font-weight="bold" font-size="12">Assinado Digitalmente</text></svg>',
        signedByName: selectedProfessional?.name || currentUser.name,
        signedByRole: 'Profissional de Saúde Responsável',
        registrationNumber: selectedProfessional?.councilRegistration || 'CREFITO-3/294819-F',
        timestamp: timestampStr,
      },
      status: 'signed',
      signedAt: nowIso,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Termo de Consentimento & Assinatura Digital
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/30 text-teal-300 border border-teal-500/40">
                  Validade Jurídica
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Paciente: <strong>{patient.name}</strong> • CPF: {patient.cpf || 'Não cadastrado'}
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

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep('review')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
                activeStep === 'review'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <span>1. Modelo & Cláusulas</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => {
                if (allRequiredClausesAgreed) setActiveStep('signing');
              }}
              disabled={!allRequiredClausesAgreed}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
                activeStep === 'signing'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'disabled:opacity-40 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>2. Assinatura do Paciente</span>
            </button>
          </div>

          <span className="hidden sm:inline text-[11px] text-slate-500">
            {activeStep === 'review' ? 'Passo 1 de 2' : 'Passo 2 de 2'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeStep === 'review' && (
            <div className="space-y-5">
              {/* Template Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Selecione o Modelo de Termo Clínico:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CONSENT_TERM_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        selectedTemplateId === tpl.id
                          ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            {tpl.category}
                          </span>
                          {selectedTemplateId === tpl.id && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Professional in Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Profissional Responsável
                  </label>
                  <select
                    value={selectedProfessionalId}
                    onChange={(e) => setSelectedProfessionalId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                  >
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.councilRegistration})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data do Consentimento
                  </label>
                  <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Full Text Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Texto Completo do Termo de Consentimento:
                  </label>
                  <span className="text-[11px] text-teal-700 font-medium">
                    (Variáveis preenchidas automaticamente)
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line max-h-48 overflow-y-auto">
                  {fullTextToRender}
                </div>
              </div>

              {/* Mandatory & Informative Clauses Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Cláusulas & Declarações de Ciência do Paciente:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Todas as obrigatórias devem estar marcadas
                  </span>
                </div>

                <div className="space-y-2">
                  {clauses.map((clause) => (
                    <label
                      key={clause.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                        clause.agreed
                          ? 'bg-teal-50/50 border-teal-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={clause.agreed}
                        onChange={() => handleToggleClause(clause.id)}
                        className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{clause.title}</span>
                          {clause.required && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800">
                              Obrigatória
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                          {clause.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 'signing' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200 flex items-start gap-3 text-xs text-teal-900">
                <Smartphone className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-teal-950">
                    Instrução para Coleta da Assinatura:
                  </h4>
                  <p className="text-teal-800 text-[11px] mt-0.5">
                    Entregue o tablet ou posicione o cursor do mouse para que o paciente{' '}
                    <strong>{patient.name}</strong> assine diretamente no quadro abaixo.
                  </p>
                </div>
              </div>

              {/* Digital Signature Pad Component */}
              <DigitalSignaturePad
                signerName={patient.name}
                signerCpf={patient.cpf}
                signerRoleLabel="Assinatura Manuscrita do Paciente"
                defaultInkColor="#1e3a8a"
                height={220}
                showLegalStamp={true}
                onSaveSignature={(res) => {
                  if (!res.isEmpty && res.dataUrl) {
                    setCapturedSignature(res);
                    handleFinishAndSave(res.dataUrl);
                  }
                }}
                onCancel={() => setActiveStep('review')}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {activeStep === 'review' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('signing')}
                disabled={!allRequiredClausesAgreed}
                className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                <span>Prosseguir para Assinatura do Paciente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveStep('review')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
              >
                ← Voltar para Revisão
              </button>
              <span className="text-[11px] text-slate-500 italic">
                O paciente deve assinar e clicar em &ldquo;Confirmar Assinatura&rdquo; acima.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
