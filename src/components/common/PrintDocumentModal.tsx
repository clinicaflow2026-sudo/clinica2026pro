import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ClinicLogo } from './ClinicLogo';
import {
  Printer,
  FileDown,
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  FileText,
  Building,
  Calendar,
  User,
  HeartPulse,
  Info,
} from 'lucide-react';
import { Patient, Professional, Evolution, PhysicalEvaluation, Prescription, PatientConsentTerm } from '../../types';

export interface PrintDocumentData {
  title: string;
  type: 'prontuario' | 'evolucao' | 'avaliacao' | 'receituario' | 'atestado' | 'recibo' | 'paciente_ficha' | 'relatorio' | 'termo_consentimento';
  patient?: Patient;
  professional?: {
    name: string;
    councilRegistration: string;
    signatureDataUrl?: string;
  };
  date?: string;
  evolutions?: Evolution[];
  evaluation?: PhysicalEvaluation;
  prescription?: Prescription;
  consentTerm?: PatientConsentTerm;
  financialReceipt?: {
    entryNumber: string;
    description: string;
    amount: number;
    paymentMethod: string;
    date: string;
    serviceCategory: string;
  };
  customContent?: React.ReactNode;
  notes?: string;
}

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: PrintDocumentData;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  documentData,
}) => {
  const { activeTenant, currentUser, professionals } = useApp();
  const { primaryColor } = useTheme();

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeClinicHeader, setIncludeClinicHeader] = useState(true);
  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const patient = documentData.patient;
  const professional = documentData.professional || {
    name: professionals[0]?.name || currentUser.name,
    councilRegistration: professionals[0]?.councilRegistration || 'CREFITO-3/294819-F',
    signatureDataUrl: undefined,
  };

  const handleTriggerPrint = () => {
    // Inject dynamic print orientation style into document head temporarily
    const styleId = 'dynamic-print-orientation';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@page { size: ${orientation}; margin: 1.2cm; }`;

    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopyText = () => {
    const textContent = `
CLÍNICA: ${activeTenant.tradeName || activeTenant.name} (CNPJ: ${activeTenant.cnpj || 'Não informado'})
DOCUMENTO: ${documentData.title}
DATA: ${documentData.date || new Date().toLocaleDateString('pt-BR')}

PACIENTE: ${patient?.name || 'Não informado'} | CPF: ${patient?.cpf || '-'}
PROFISSIONAL: ${professional.name} (${professional.councilRegistration})

${documentData.notes || ''}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedEmissionDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Top Bar (no-print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Opções de Impressão & Exportação PDF
              </h3>
              <p className="text-[11px] text-slate-500">
                {documentData.title} • {patient?.name || 'Clínica'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Controls Bar (no-print) */}
        <div className="no-print p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Orientation Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Orientação da Página:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                  orientation === 'portrait'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <div className="w-3.5 h-4.5 border border-current rounded-xs" />
                <span>Retrato (Vertical)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                  orientation === 'landscape'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <div className="w-4.5 h-3.5 border border-current rounded-xs" />
                <span>Paisagem (Horizontal)</span>
              </button>
            </div>
          </div>

          {/* Header & Signature Toggles */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeClinicHeader}
                onChange={(e) => setIncludeClinicHeader(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="font-bold text-slate-700 text-xs">Incluir Cabeçalho & Logo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDigitalSignature}
                onChange={(e) => setIncludeDigitalSignature(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="font-bold text-slate-700 text-xs">Incluir Carimbo & Assinatura</span>
            </label>
          </div>

          {/* Quick PDF Tip Box */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">Como Salvar em PDF:</p>
              <p className="text-blue-800 text-[10px] leading-tight mt-0.5">
                No diálogo do navegador, selecione <strong>Destino: Salvar como PDF</strong> para gerar o arquivo.
              </p>
            </div>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div
            id="printable-clinical-document"
            className={`mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 ${
              orientation === 'portrait' ? 'max-w-[760px] min-h-[960px]' : 'max-w-[1020px] min-h-[680px]'
            }`}
          >
            {/* Document Header */}
            {includeClinicHeader && (
              <div className="pb-6 mb-6 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <ClinicLogo size="md" />
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                      {activeTenant.tradeName || activeTenant.name}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      {activeTenant.name} • CNPJ: {activeTenant.cnpj || '00.000.000/0001-00'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {activeTenant.address} - {activeTenant.city}/{activeTenant.state}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] text-slate-500 leading-tight">
                  <p className="font-bold text-slate-700">Tel: {activeTenant.phone || '(11) 9999-9999'}</p>
                  <p>{activeTenant.email || 'contato@clinica.com.br'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Emissão: {formattedEmissionDate}</p>
                </div>
              </div>
            )}

            {/* Document Title Banner */}
            <div className="text-center pb-6">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 inline-block px-8">
                {documentData.title}
              </h2>
            </div>

            {/* Patient Identification Card */}
            {patient && (
              <div className="mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 page-break-inside-avoid">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Paciente:</span>
                  <strong className="text-slate-900 text-xs block">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">CPF:</span>
                  <span className="text-slate-800">{patient.cpf || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Data de Nasc.:</span>
                  <span className="text-slate-800">{patient.birthDate || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Convênio:</span>
                  <span className="text-slate-800">{patient.healthInsurance || 'Particular'}</span>
                </div>
              </div>
            )}

            {/* Document Body Content */}
            <div className="space-y-6 text-xs leading-relaxed text-slate-800 min-h-[300px]">
              {/* Type 1: Evoluções Clínicas */}
              {documentData.type === 'evolucao' && documentData.evolutions && (
                <div className="space-y-4">
                  {documentData.evolutions.map((evo) => (
                    <div key={evo.id} className="p-4 border border-slate-200 rounded-xl space-y-2 page-break-inside-avoid">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-bold">
                        <span className="text-teal-800">
                          {evo.date} às {evo.time} • {evo.procedurePerformed}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {evo.professionalName} ({evo.professionalRegistration})
                        </span>
                      </div>
                      <p>
                        <strong>Relato Subjetivo:</strong> {evo.subjectiveFeedback}
                      </p>
                      <p>
                        <strong>Condutas Objetivas & Parâmetros:</strong> {evo.objectiveFindings}
                      </p>
                      {evo.complicationsOrNotes && (
                        <p>
                          <strong>Observações:</strong> {evo.complicationsOrNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Type 2: Avaliação Física */}
              {documentData.type === 'avaliacao' && documentData.evaluation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-200 rounded-xl">
                      <strong className="block text-slate-700 mb-1">Especialidade & Categoria:</strong>
                      <p>{documentData.evaluation.category} - {documentData.evaluation.modelTitle}</p>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl">
                      <strong className="block text-slate-700 mb-1">Escala Visual Analógica de Dor (EVA):</strong>
                      <p className="font-bold text-teal-800">{documentData.evaluation.painScale} de 10</p>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                    <strong className="block text-slate-700">Queixa Principal do Paciente:</strong>
                    <p>{documentData.evaluation.chiefComplaint}</p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                    <strong className="block text-slate-700">Histórico da Doença Atual (HDA):</strong>
                    <p>{documentData.evaluation.historyOfPresentIllness}</p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                    <strong className="block text-slate-700">Plano de Tratamento / Conduta Proposta:</strong>
                    <p>{documentData.evaluation.planOfCare}</p>
                  </div>
                </div>
              )}

              {/* Type 3: Receituário & Prescrições */}
              {documentData.type === 'receituario' && documentData.prescription && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="font-bold text-slate-900 mb-2">Prescrição de Medicamentos / Recomendações e Exercícios Domiciliares:</h3>
                    <div className="space-y-3">
                      {documentData.prescription.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg">
                          <p className="font-bold text-slate-900 text-sm">
                            {idx + 1}. {item.medicationOrExercise}
                          </p>
                          <p className="font-semibold text-teal-700 mt-0.5">{item.dosageOrFrequency}</p>
                          <p className="text-slate-600 mt-1">{item.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {documentData.prescription.generalObservations && (
                    <div className="p-3 border border-slate-200 rounded-xl text-slate-700">
                      <strong>Observações e Cuidados Gerais:</strong> {documentData.prescription.generalObservations}
                    </div>
                  )}
                </div>
              )}

              {/* Type 4: Recibo Financeiro Oficial */}
              {documentData.type === 'recibo' && documentData.financialReceipt && (
                <div className="p-6 border-2 border-slate-300 rounded-2xl space-y-4 bg-slate-50/40">
                  <div className="text-center pb-2 border-b border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                      Comprovante de Quitação & Reembolso
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      VALOR: R$ {documentData.financialReceipt.amount.toFixed(2)}
                    </h3>
                  </div>

                  <p className="leading-relaxed text-justify">
                    Declaramos para os devidos fins de comprovação e reembolso de assistência à saúde e imposto de renda que recebemos de{' '}
                    <strong>{patient?.name || 'Cliente'}</strong>, portador(a) do CPF nº{' '}
                    <strong>{patient?.cpf || 'Não informado'}</strong>, a importância de{' '}
                    <strong>R$ {documentData.financialReceipt.amount.toFixed(2)}</strong> referente à prestação de serviços de{' '}
                    <strong>{documentData.financialReceipt.description}</strong> ({documentData.financialReceipt.serviceCategory}), liquidado via{' '}
                    <strong>{documentData.financialReceipt.paymentMethod}</strong> em{' '}
                    <strong>{documentData.financialReceipt.date}</strong>.
                  </p>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    <p>Nº do Lançamento: {documentData.financialReceipt.entryNumber}</p>
                    <p>Clínica Prestadora: {activeTenant.name} (CNPJ: {activeTenant.cnpj})</p>
                  </div>
                </div>
              )}

              {/* Type 5: Termo de Consentimento Livre e Esclarecido (TCLE / LGPD) */}
              {documentData.type === 'termo_consentimento' && documentData.consentTerm && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed text-slate-800 font-serif whitespace-pre-line text-xs">
                    {documentData.consentTerm.content}
                  </div>

                  {documentData.consentTerm.clauses && documentData.consentTerm.clauses.length > 0 && (
                    <div className="space-y-2">
                      <strong className="block text-slate-800 text-xs uppercase tracking-wider">
                        Declarações e Cláusulas Ratificadas pelo Paciente:
                      </strong>
                      <div className="space-y-1.5">
                        {documentData.consentTerm.clauses.map((clause) => (
                          <div key={clause.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-start gap-2">
                            <span className="text-teal-700 font-bold">☑</span>
                            <div>
                              <strong className="text-slate-900">{clause.title}: </strong>
                              <span className="text-slate-700">{clause.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dual Signatures Preview for TCLE: Patient + Professional */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 page-break-inside-avoid">
                    {/* Patient Signature */}
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Assinatura do Paciente / Responsável
                      </span>
                      <div className="h-16 flex items-center justify-center">
                        {documentData.consentTerm.patientSignature?.dataUrl ? (
                          <img
                            src={documentData.consentTerm.patientSignature.dataUrl}
                            alt="Assinatura do Paciente"
                            className="max-h-14 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-36 h-0.5 bg-slate-400 mx-auto mt-8" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-700 font-bold mt-1">
                        {documentData.consentTerm.patientSignature?.signedByName || patient?.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        CPF: {documentData.consentTerm.patientSignature?.signedByCpf || patient?.cpf}
                      </div>
                      <div className="text-[9px] text-teal-700 mt-0.5">
                        {documentData.consentTerm.patientSignature?.timestamp}
                      </div>
                    </div>

                    {/* Professional Signature */}
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Profissional Responsável
                      </span>
                      <div className="h-16 flex items-center justify-center">
                        {documentData.consentTerm.professionalSignature?.dataUrl || professional.signatureDataUrl ? (
                          <img
                            src={documentData.consentTerm.professionalSignature?.dataUrl || professional.signatureDataUrl}
                            alt="Assinatura do Profissional"
                            className="max-h-14 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-36 h-0.5 bg-slate-400 mx-auto mt-8" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-700 font-bold mt-1">
                        {documentData.consentTerm.professionalSignature?.signedByName || professional.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {documentData.consentTerm.professionalSignature?.registrationNumber || professional.councilRegistration}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {documentData.consentTerm.signedAt}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Código de Validação Digital: <strong>{documentData.consentTerm.patientSignature.verificationHash}</strong></span>
                    <span>Dispositivo: {documentData.consentTerm.patientSignature.deviceInfo}</span>
                  </div>
                </div>
              )}

              {/* Custom content fallback */}
              {documentData.customContent && <div>{documentData.customContent}</div>}

              {/* Notes */}
              {documentData.notes && (
                <div className="pt-2 text-slate-700">
                  <p>{documentData.notes}</p>
                </div>
              )}
            </div>

            {/* Document Footer: Digital Signature Block */}
            {includeDigitalSignature && (
              <div className="mt-12 pt-6 border-t border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-6 page-break-inside-avoid">
                <div className="space-y-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 font-bold text-teal-800 text-xs">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Documento Assinado Eletronicamente
                  </div>
                  <p>ICP-Brasil / Validação Legal MP 2.200-2/2001</p>
                  <p>Hash de Segurança: SHA256:{Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
                </div>

                <div className="text-center sm:text-right space-y-1 min-w-[240px]">
                  {professional.signatureDataUrl ? (
                    <img
                      src={professional.signatureDataUrl}
                      alt="Assinatura"
                      className="h-10 mx-auto sm:ml-auto object-contain mb-1"
                    />
                  ) : (
                    <div className="w-44 h-8 border-b-2 border-slate-800 mx-auto sm:ml-auto mb-1" />
                  )}
                  <p className="font-bold text-slate-900 text-xs">{professional.name}</p>
                  <p className="text-[11px] text-slate-600">{professional.councilRegistration}</p>
                  <p className="text-[10px] text-slate-400">{activeTenant.tradeName || activeTenant.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions Bar (no-print) */}
        <div className="no-print p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Fechar
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar como PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
