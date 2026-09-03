import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerClinicalUpdateNotification } from '../../services/notificationService';
import {
  FileText,
  Search,
  User,
  Plus,
  Printer,
  PenTool,
  Upload,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Sparkles,
  Paperclip,
  Activity,
  HeartPulse,
  Eye,
  Trash2,
  FileCheck2,
  Smartphone,
  Tablet,
  Lock,
} from 'lucide-react';
import { Patient, Evolution, PhysicalEvaluation, Prescription, DigitalSignature, PatientConsentTerm } from '../../types';
import { PrintDocumentModal, PrintDocumentData } from '../common/PrintDocumentModal';
import { ConsentTermSignModal } from './ConsentTermSignModal';
import { ViewConsentTermModal } from './ViewConsentTermModal';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';

export const MedicalRecordsModule: React.FC = () => {
  const {
    patients,
    evolutions,
    addEvolution,
    evaluations,
    addEvaluation,
    prescriptions,
    addPrescription,
    consentTerms,
    addConsentTerm,
    revokeConsentTerm,
    currentUser,
    professionals,
    activeTenant,
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'evolutions' | 'evaluation' | 'prescriptions' | 'consent' | 'documents'>('evolutions');

  // Modals
  const [showNewEvolutionModal, setShowNewEvolutionModal] = useState(false);
  const [showNewEvaluationModal, setShowNewEvaluationModal] = useState(false);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [showConsentSignModal, setShowConsentSignModal] = useState(false);
  const [selectedConsentTermForView, setSelectedConsentTermForView] = useState<PatientConsentTerm | null>(null);
  const [printDocData, setPrintDocData] = useState<PrintDocumentData | null>(null);

  // Selected patient
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Filtered lists for selected patient
  const patientEvolutions = evolutions.filter((e) => e.patientId === selectedPatient?.id);
  const patientEvaluations = evaluations.filter((ev) => ev.patientId === selectedPatient?.id);
  const patientPrescriptions = prescriptions.filter((pr) => pr.patientId === selectedPatient?.id);
  const patientConsentTerms = consentTerms.filter((ct) => ct.patientId === selectedPatient?.id);

  const handlePrintFullRecord = () => {
    setPrintDocData({
      title: 'Prontuário Clínico Completo & Histórico',
      type: 'evolucao',
      patient: selectedPatient,
      evolutions: patientEvolutions,
      evaluation: patientEvaluations[0],
      prescription: patientPrescriptions[0],
      date: new Date().toLocaleDateString('pt-BR'),
    });
  };

  const handlePrintSingleEvolution = (evo: Evolution) => {
    setPrintDocData({
      title: `Evolução Clínica - ${evo.procedurePerformed}`,
      type: 'evolucao',
      patient: selectedPatient,
      evolutions: [evo],
      professional: {
        name: evo.professionalName,
        councilRegistration: evo.professionalRegistration,
        signatureDataUrl: evo.signature?.dataUrl,
      },
      date: evo.date,
    });
  };

  const handlePrintEvaluation = (evalItem: PhysicalEvaluation) => {
    setPrintDocData({
      title: `Ficha de Avaliação Física - ${evalItem.category}`,
      type: 'avaliacao',
      patient: selectedPatient,
      evaluation: evalItem,
      date: evalItem.date,
    });
  };

  const handlePrintPrescription = (presc: Prescription) => {
    setPrintDocData({
      title: 'Receituário & Orientações de Exercícios',
      type: 'receituario',
      patient: selectedPatient,
      prescription: presc,
      professional: {
        name: presc.professionalName,
        councilRegistration: presc.professionalRegistration,
      },
      date: presc.date,
    });
  };

  const handlePrintConsentTerm = (term: PatientConsentTerm) => {
    setPrintDocData({
      title: term.title,
      type: 'termo_consentimento',
      patient: selectedPatient,
      consentTerm: term,
      professional: {
        name: term.professionalName || professionals[0]?.name || currentUser.name,
        councilRegistration: term.professionalRegistration || professionals[0]?.councilRegistration || 'CREFITO',
        signatureDataUrl: term.professionalSignature?.dataUrl,
      },
      date: term.signedAt.split('T')[0] || new Date().toISOString().split('T')[0],
    });
  };

  // Form states
  // 1. Evolution Form
  const [evoForm, setEvoForm] = useState({
    procedurePerformed: 'Fisioterapia Traumato-Ortopédica',
    subjectiveFeedback: '',
    objectiveFindings: '',
    complicationsOrNotes: '',
  });

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImage(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureImage(null);
  };

  const handleSaveEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const professional = professionals[0] || {
      id: currentUser.id,
      name: currentUser.name,
      councilRegistration: 'CREFITO-3/294819-F',
    };

    const signature: DigitalSignature = {
      type: 'drawn',
      dataUrl: signatureImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="40"><text x="10" y="25" fill="%230d9488">Assinatura Digital</text></svg>',
      signedByName: professional.name,
      signedByRole: 'Profissional Responsável',
      registrationNumber: professional.councilRegistration,
      timestamp: new Date().toLocaleString('pt-BR'),
    };

    addEvolution({
      patientId: selectedPatient.id,
      professionalId: professional.id,
      professionalName: professional.name,
      professionalRegistration: professional.councilRegistration,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      procedurePerformed: evoForm.procedurePerformed,
      subjectiveFeedback: evoForm.subjectiveFeedback || 'Paciente relata boa evolução clínica sem intercorrências.',
      objectiveFindings: evoForm.objectiveFindings,
      complicationsOrNotes: evoForm.complicationsOrNotes,
      signature,
    });

    // Send PWA Push Notification for clinical update
    triggerClinicalUpdateNotification({
      patientName: selectedPatient.name,
      professionalName: professional.name,
      type: 'Evolução Clínica',
      summary: evoForm.subjectiveFeedback || evoForm.procedurePerformed,
    }).catch(console.warn);

    setEvoForm({
      procedurePerformed: 'Fisioterapia Traumato-Ortopédica',
      subjectiveFeedback: '',
      objectiveFindings: '',
      complicationsOrNotes: '',
    });
    clearCanvas();
    setShowNewEvolutionModal(false);
  };

  // 2. Evaluation Form
  const [evalForm, setEvalForm] = useState({
    category: 'Fisioterapia' as 'Fisioterapia' | 'Pilates' | 'Estética',
    modelTitle: 'Avaliação Funcional Completa',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    posturalAssessment: '',
    painScale: 4,
    romAndStrength: '',
    planOfCare: '',
  });

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    addEvaluation({
      patientId: selectedPatient.id,
      professionalId: professionals[0]?.id || currentUser.id,
      professionalName: professionals[0]?.name || currentUser.name,
      date: new Date().toISOString().split('T')[0],
      category: evalForm.category,
      modelTitle: evalForm.modelTitle,
      chiefComplaint: evalForm.chiefComplaint,
      historyOfPresentIllness: evalForm.historyOfPresentIllness,
      posturalAssessment: evalForm.posturalAssessment,
      painScale: evalForm.painScale,
      romAndStrength: evalForm.romAndStrength,
      planOfCare: evalForm.planOfCare,
    });

    // Send PWA Push Notification for physical evaluation
    triggerClinicalUpdateNotification({
      patientName: selectedPatient.name,
      professionalName: professionals[0]?.name || currentUser.name,
      type: `Avaliação (${evalForm.category})`,
      summary: evalForm.chiefComplaint || evalForm.modelTitle,
    }).catch(console.warn);

    setShowNewEvaluationModal(false);
  };

  // 3. Prescription Form
  const [prescItems, setPrescItems] = useState([
    { medicationOrExercise: 'Exercício de Fortalecimento Excêntrico', dosageOrFrequency: '3x de 10 reps - Diário', instructions: 'Manter postura neutra.' },
  ]);
  const [prescObs, setPrescObs] = useState('Caso sinta desconforto articular, interrompa.');

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    addPrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      professionalId: professionals[0]?.id || currentUser.id,
      professionalName: professionals[0]?.name || currentUser.name,
      professionalRegistration: professionals[0]?.councilRegistration || 'CREFITO-3/294819-F',
      date: new Date().toISOString().split('T')[0],
      items: prescItems,
      generalObservations: prescObs,
    });

    setShowNewPrescriptionModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Prontuário Eletrônico & Evoluções
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Assinatura digital manuscrita, modelos de avaliação personalizados, receituário e exportação.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrintFullRecord}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-2xs transition"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Imprimir / Exportar PDF</span>
          </button>

          <button
            onClick={() => setShowConsentSignModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl shadow-2xs transition"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Coletar Assinatura (TCLE / LGPD)</span>
          </button>

          <button
            onClick={() => setShowNewPrescriptionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-2xs transition"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Emitir Receituário</span>
          </button>

          <button
            onClick={() => setShowNewEvolutionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <PenTool className="w-4 h-4" />
            <span>Nova Evolução com Assinatura</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Patient Selector + Clinical Record Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Patient search & list */}
        <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col h-64 lg:h-[700px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar paciente por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {patients
              .filter((p) => !p.deletedAt && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.cpf?.includes(searchTerm)))
              .map((p) => {
                const isSelected = p.id === selectedPatient?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                      isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        CPF: {p.cpf} • Tel: {p.phone}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right column: Electronic Medical Record Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Banner */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-bold text-base flex items-center justify-center font-display">
                      {selectedPatient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                        {selectedPatient.name}
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          Prontuário Ativo
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Nasc.: {selectedPatient.birthDate} • Gênero: {selectedPatient.gender} • Convênio:{' '}
                        {selectedPatient.healthInsurance || 'Particular'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNewEvaluationModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition"
                    >
                      + Nova Avaliação Física
                    </button>
                  </div>
                </div>

                {/* Medical History & Alerts Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Alergias & Restrições</span>
                    <p className="font-semibold text-rose-700 mt-0.5">
                      {selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'Nenhuma alergia relatada'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Histórico Clínico</span>
                    <p className="text-slate-700 mt-0.5 truncate">{selectedPatient.medicalHistory || 'Sem histórico prévio'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Contato de Emergência</span>
                    <p className="text-slate-700 mt-0.5">
                      {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="no-print border-b border-slate-200 flex items-center gap-4 sm:gap-6 text-xs font-bold overflow-x-auto whitespace-nowrap pb-px">
                {[
                  { id: 'evolutions', label: `Evoluções Clínicas (${patientEvolutions.length})` },
                  { id: 'evaluation', label: `Avaliações Físicas (${patientEvaluations.length})` },
                  { id: 'prescriptions', label: `Receituários & Exercícios (${patientPrescriptions.length})` },
                  { id: 'consent', label: `Termos de Consentimento (${patientConsentTerms.length})` },
                  { id: 'documents', label: 'Exames & Anexos' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 transition relative shrink-0 ${
                      activeTab === tab.id
                        ? 'text-teal-700 border-b-2 border-teal-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Evolutions Timeline */}
              {activeTab === 'evolutions' && (
                <div className="space-y-4">
                  {patientEvolutions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
                      Nenhuma evolução registrada ainda para este paciente.
                    </div>
                  ) : (
                    patientEvolutions.map((evo) => (
                      <div key={evo.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                              {evo.date} às {evo.time}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{evo.procedurePerformed}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Profissional: <strong>{evo.professionalName}</strong> ({evo.professionalRegistration})
                          </span>
                          <button
                            onClick={() => handlePrintSingleEvolution(evo)}
                            className="px-2 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1 transition"
                            title="Imprimir esta evolução individual em PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block">Relato Subjetivo do Paciente:</span>
                            <p className="text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {evo.subjectiveFeedback}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700 block">Condutas Objetivas & Parâmetros:</span>
                            <p className="text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {evo.objectiveFindings}
                            </p>
                          </div>

                          {evo.complicationsOrNotes && (
                            <div>
                              <span className="font-bold text-slate-700 block">Intercorrências / Observações:</span>
                              <p className="text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {evo.complicationsOrNotes}
                              </p>
                            </div>
                          )}

                          {/* Digital Signature Badge */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/40 p-3 rounded-xl border border-teal-100">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                              <div>
                                <p className="font-bold text-teal-950 text-xs">
                                  Assinado Digitalmente por: {evo.signature.signedByName}
                                </p>
                                <p className="text-[10px] text-teal-700">
                                  Registro: {evo.signature.registrationNumber} • Timestamp: {evo.signature.timestamp}
                                </p>
                              </div>
                            </div>

                            {evo.signature.dataUrl && (
                              <img
                                src={evo.signature.dataUrl}
                                alt="Assinatura Digital"
                                className="h-9 object-contain bg-white px-2 py-1 rounded border border-teal-200"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Evaluations */}
              {activeTab === 'evaluation' && (
                <div className="space-y-4">
                  {patientEvaluations.map((evalItem) => (
                    <div key={evalItem.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{evalItem.modelTitle}</h3>
                          <p className="text-xs text-slate-500">
                            Categoria: {evalItem.category} • Data: {evalItem.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                            Escala de Dor: {evalItem.painScale}/10
                          </span>
                          <button
                            onClick={() => handlePrintEvaluation(evalItem)}
                            className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1 transition"
                            title="Imprimir esta avaliação em PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir PDF</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-700">Queixa Principal:</span>
                          <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {evalItem.chiefComplaint}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Histórico da Doença Atual (HDA):</span>
                          <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {evalItem.historyOfPresentIllness}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-slate-700">Plano de Tratamento / Conduta:</span>
                        <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {evalItem.planOfCare}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Prescriptions */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {patientPrescriptions.map((presc) => (
                    <div key={presc.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <h3 className="text-sm font-bold text-slate-900">Receituário & Orientações Clínicas</h3>
                        </div>
                        <span className="text-xs text-slate-500">{presc.date}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {presc.items.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <p className="font-bold text-slate-900">{item.medicationOrExercise}</p>
                            <p className="text-teal-700 font-semibold mt-0.5">{item.dosageOrFrequency}</p>
                            <p className="text-slate-600 mt-0.5">{item.instructions}</p>
                          </div>
                        ))}
                      </div>

                      {presc.generalObservations && (
                        <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                          <strong>Observações:</strong> {presc.generalObservations}
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handlePrintPrescription(presc)}
                          className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Imprimir Este Receituário em PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Consent Terms & Digital Signatures (TCLE / LGPD) */}
              {activeTab === 'consent' && (
                <div className="space-y-4">
                  {/* Top Bar for Consent Terms */}
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Termos de Consentimento Livre e Esclarecido (TCLE) & LGPD
                          </h3>
                          <p className="text-xs text-slate-500">
                            Coleta de assinatura biométrica digital para conformidade jurídica e ética (COFFITO / LGPD).
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowConsentSignModal(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Coletar Nova Assinatura</span>
                    </button>
                  </div>

                  {/* List of Consent Terms */}
                  {patientConsentTerms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {patientConsentTerms.map((term) => (
                        <div
                          key={term.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-teal-300 transition space-y-4"
                        >
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                                  {term.termType === 'physiotherapy'
                                    ? 'Fisioterapia'
                                    : term.termType === 'pilates'
                                    ? 'Pilates Clínico'
                                    : term.termType === 'dry_needling'
                                    ? 'Dry Needling'
                                    : term.termType === 'lgpd_privacy'
                                    ? 'LGPD & Privacidade'
                                    : term.termType === 'aesthetic'
                                    ? 'Estética Funcional'
                                    : 'Personalizado'}
                                </span>
                                {term.status === 'signed' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Assinado Digitalmente
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    Revogado ({term.revokeReason || 'Solicitado'})
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-1">{term.title}</h4>
                            </div>

                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {term.patientSignature.timestamp || term.signedAt}
                            </span>
                          </div>

                          {/* Clauses summary badge */}
                          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-700">Cláusulas Aprovadas:</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {term.clauses.filter((c) => c.agreed).length} de {term.clauses.length} cláusulas
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">
                              Profissional: <strong>{term.professionalName || 'Clínica'}</strong>
                            </span>
                          </div>

                          {/* Digital Signature Details Strip */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {term.patientSignature.dataUrl ? (
                                <div className="h-12 w-28 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                  <img
                                    src={term.patientSignature.dataUrl}
                                    alt="Assinatura"
                                    className="max-h-10 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="h-12 w-28 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                                  Assinatura Eletrônica
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">
                                  Assinado por: {term.patientSignature.signedByName}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  CPF: {term.patientSignature.signedByCpf} • {term.patientSignature.deviceInfo}
                                </p>
                                <p className="text-[10px] font-mono text-teal-700 font-semibold mt-0.5">
                                  Hash: {term.patientSignature.verificationHash}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setSelectedConsentTermForView(term)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                <span>Ver Detalhes</span>
                              </button>
                              <button
                                onClick={() => handlePrintConsentTerm(term)}
                                className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition flex items-center gap-1.5"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir / PDF</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State: Call to Action with Preset Templates */
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto">
                        <FileCheck2 className="w-7 h-7" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h4 className="text-base font-bold text-slate-900">
                          Nenhum Termo de Consentimento Assinado
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Colete a assinatura digital manuscrita de <strong>{selectedPatient.name}</strong> via mouse, tablet ou touchscreen para garantir a segurança jurídica e conformidade ética dos atendimentos.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                        <button
                          onClick={() => setShowConsentSignModal(true)}
                          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                        >
                          <PenTool className="w-4 h-4" />
                          <span>Abrir Coletor de Assinatura Digital</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Documents & Uploads */}
              {activeTab === 'documents' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Arquivos e Exames Anexados (Supabase Storage)</h3>
                    <button className="flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-xl">
                      <Upload className="w-3.5 h-3.5" />
                      Upload de Arquivo / Foto
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="font-bold text-slate-800">Ressonancia_Joelho_D.pdf</p>
                          <p className="text-[10px] text-slate-400">12/01/2025 • 4.2 MB</p>
                        </div>
                      </div>
                      <button className="text-teal-600 hover:underline">Ver</button>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="font-bold text-slate-800">Foto_Postural_Antes.jpg</p>
                          <p className="text-[10px] text-slate-400">16/01/2025 • 2.1 MB</p>
                        </div>
                      </div>
                      <button className="text-teal-600 hover:underline">Ver</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500">
              Selecione um paciente na coluna esquerda para visualizar o prontuário.
            </div>
          )}
        </div>
      </div>

      {/* New Evolution Modal with Signature Canvas */}
      {showNewEvolutionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
            
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                Nova Evolução Clínica com Assinatura Digital
              </h3>
              <button
                onClick={() => setShowNewEvolutionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvolution} className="mt-4 space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Procedimento Realizado *</label>
                <input
                  type="text"
                  value={evoForm.procedurePerformed}
                  onChange={(e) => setEvoForm({ ...evoForm, procedurePerformed: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Relato Subjetivo do Paciente (Feedback)</label>
                <textarea
                  value={evoForm.subjectiveFeedback}
                  onChange={(e) => setEvoForm({ ...evoForm, subjectiveFeedback: e.target.value })}
                  placeholder="Relato de dor, facilidade ou dificuldade com os exercícios..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condutas Objetivas & Parâmetros Aplicados *</label>
                <textarea
                  value={evoForm.objectiveFindings}
                  onChange={(e) => setEvoForm({ ...evoForm, objectiveFindings: e.target.value })}
                  placeholder="Mobilizações, cargas, repetições, correntes utilizadas..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
                  required
                />
              </div>

              {/* Digital Signature Pad */}
              <div className="space-y-1">
                <DigitalSignaturePad
                  title="Assinatura Manuscrita do Profissional (Mouse / Touch / Caneta)"
                  description="Assine no campo abaixo para carimbar a evolução clínica com validade digital."
                  height={130}
                  signerName={professionals[0]?.name || currentUser.name}
                  signerRole="Profissional Responsável"
                  showTypedOption={true}
                  onSave={(dataUrl) => setSignatureImage(dataUrl)}
                  onClear={() => setSignatureImage(null)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-5 px-5 sm:mx-0 sm:px-0 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEvolutionModal(false)}
                  className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Salvar e Assinar Evolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Physical Evaluation Modal */}
      {showNewEvaluationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Nova Avaliação Física Personalizada</h3>
              <button
                onClick={() => setShowNewEvaluationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="mt-4 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Especialidade / Categoria</label>
                  <select
                    value={evalForm.category}
                    onChange={(e) => setEvalForm({ ...evalForm, category: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  >
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Estética">Estética</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo / Título da Avaliação</label>
                  <input
                    type="text"
                    value={evalForm.modelTitle}
                    onChange={(e) => setEvalForm({ ...evalForm, modelTitle: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Queixa Principal</label>
                <textarea
                  value={evalForm.chiefComplaint}
                  onChange={(e) => setEvalForm({ ...evalForm, chiefComplaint: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Histórico da Doença Atual (HDA)</label>
                <textarea
                  value={evalForm.historyOfPresentIllness}
                  onChange={(e) => setEvalForm({ ...evalForm, historyOfPresentIllness: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Escala Visual de Dor (0 a 10): {evalForm.painScale}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={evalForm.painScale}
                  onChange={(e) => setEvalForm({ ...evalForm, painScale: Number(e.target.value) })}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plano Terapêutico Proposto</label>
                <textarea
                  value={evalForm.planOfCare}
                  onChange={(e) => setEvalForm({ ...evalForm, planOfCare: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-5 px-5 sm:mx-0 sm:px-0 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEvaluationModal(false)}
                  className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print / Export Modal with live preview, orientation toggle, header/signature toggles and PDF generation */}
      {printDocData && (
        <PrintDocumentModal
          isOpen={!!printDocData}
          onClose={() => setPrintDocData(null)}
          documentData={printDocData}
        />
      )}

      {/* Patient Consent Term Digital Signature Modal (TCLE / LGPD) */}
      {showConsentSignModal && selectedPatient && (
        <ConsentTermSignModal
          isOpen={showConsentSignModal}
          onClose={() => setShowConsentSignModal(false)}
          patient={selectedPatient}
          onSaveConsentTerm={(termData) => {
            addConsentTerm(termData);
            setShowConsentSignModal(false);
          }}
        />
      )}

      {/* View Detailed Signed Consent Term Modal */}
      {selectedConsentTermForView && (
        <ViewConsentTermModal
          isOpen={!!selectedConsentTermForView}
          onClose={() => setSelectedConsentTermForView(null)}
          term={selectedConsentTermForView}
          patient={selectedPatient}
          onPrint={(term) => handlePrintConsentTerm(term)}
          onRevoke={(termId) => revokeConsentTerm(termId)}
        />
      )}
    </div>
  );
};
