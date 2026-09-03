import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Settings,
  XCircle,
  Wand2,
} from 'lucide-react';
import { Patient } from '../../types';
import {
  validateCPF,
  formatCPF,
  generateValidSampleCPF,
  cleanDocument,
} from '../../lib/documentValidation';

export const PatientsModule: React.FC = () => {
  const {
    patients,
    healthInsurances,
    addPatient,
    updatePatient,
    deletePatient,
    appointments,
    evolutions,
    financialEntries,
    patientPackages,
    setCurrentView,
    checkPlanLimit,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '1990-05-15',
    gender: 'Feminino',
    phone: '',
    email: '',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    healthInsurance: 'Particular',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
  });

  const filteredPatients = patients.filter((p) => {
    if (p.deletedAt) return false;
    const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cpfMatch = p.cpf?.includes(searchTerm);
    const phoneMatch = p.phone?.includes(searchTerm);
    return nameMatch || cpfMatch || phoneMatch;
  });

  const handleOpenAdd = () => {
    const limit = checkPlanLimit('patients');
    if (!limit.allowed) {
      setErrorMessage(limit.message || 'Limite de pacientes atingido para seu plano.');
    } else {
      setErrorMessage(null);
    }
    setEditingPatient(null);
    setFormData({
      name: '',
      cpf: '',
      birthDate: '1992-06-20',
      gender: 'Feminino',
      phone: '(11) 98888-7766',
      email: '',
      address: 'Rua das Palmeiras, 100',
      city: 'São Paulo',
      state: 'SP',
      healthInsurance: 'Particular',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalHistory: '',
      allergies: '',
    });
    setShowModal(true);
  };

  // Auto-trigger Add Patient modal if opened via PWA Shortcut (action=new_patient) or Global Keyboard Shortcut (Ctrl+N)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new_patient' || params.get('action') === 'add_patient') {
        handleOpenAdd();
      }
    }

    const handleShortcutOpen = () => {
      handleOpenAdd();
    };

    window.addEventListener('cfp:open-new-patient', handleShortcutOpen);
    return () => window.removeEventListener('cfp:open-new-patient', handleShortcutOpen);
  }, []);

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setErrorMessage(null);
    setFormData({
      name: p.name,
      cpf: p.cpf,
      birthDate: p.birthDate,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address,
      city: p.city,
      state: p.state,
      healthInsurance: p.healthInsurance || 'Particular',
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactPhone: p.emergencyContactPhone || '',
      medicalHistory: p.medicalHistory || '',
      allergies: p.allergies?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validação estrita de CPF
    const cleanCpf = cleanDocument(formData.cpf);
    const cpfValidation = validateCPF(formData.cpf);
    if (!cpfValidation.isValid) {
      setErrorMessage(`Não foi possível salvar: ${cpfValidation.message || 'CPF inválido.'}`);
      return;
    }

    // Verificação de duplicidade de CPF no banco de pacientes da clínica
    const duplicate = patients.find(
      (p) => !p.deletedAt && p.id !== editingPatient?.id && cleanDocument(p.cpf) === cleanCpf
    );
    if (duplicate) {
      setErrorMessage(`Já existe um paciente cadastrado com este mesmo CPF (${duplicate.name}). Verifique os dados ou utilize o prontuário existente.`);
      return;
    }

    const allergiesArray = formData.allergies
      ? formData.allergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    if (editingPatient) {
      updatePatient(editingPatient.id, {
        name: formData.name,
        cpf: formatCPF(formData.cpf),
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        healthInsurance: formData.healthInsurance,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        medicalHistory: formData.medicalHistory,
        allergies: allergiesArray,
      });
      setShowModal(false);
    } else {
      const result = addPatient({
        name: formData.name,
        cpf: formatCPF(formData.cpf),
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        healthInsurance: formData.healthInsurance,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        medicalHistory: formData.medicalHistory,
        allergies: allergiesArray,
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao cadastrar paciente.');
        return;
      }
      setShowModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente arquivar este paciente? Os dados históricos do prontuário serão preservados.')) {
      deletePatient(id, false);
      if (selectedPatientDetail?.id === id) setSelectedPatientDetail(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Gestão de Pacientes & Fichas Clínicas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastro completo, histórico de agendamentos, saldos de pacotes e acesso direto ao prontuário.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          title="Atalho: Ctrl+N"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-teal-800/60 border border-teal-400/40 rounded text-[10px] font-mono text-teal-100">
            Ctrl+N
          </kbd>
        </button>
      </div>

      {/* Main Grid: Patients Table + Detail Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredPatients.length} pacientes
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Paciente</th>
                    <th className="p-3.5">Contato</th>
                    <th className="p-3.5">Convênio</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => {
                    const isSelected = selectedPatientDetail?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPatientDetail(p)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-teal-50/80' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400">CPF: {p.cpf} • {p.gender}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div className="flex items-center gap-1 font-medium">{p.phone}</div>
                          <div className="text-[10px] text-slate-400">{p.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {p.healthInsurance || 'Particular'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                              title="Editar Paciente"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200"
                              title="Arquivar Paciente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Patient Clinical Quick Overview */}
        <div>
          {selectedPatientDetail ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center font-display">
                    {selectedPatientDetail.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedPatientDetail.name}</h3>
                    <p className="text-[11px] text-slate-400">CPF: {selectedPatientDetail.cpf}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Endereço</span>
                  <p className="text-slate-800">{selectedPatientDetail.address}, {selectedPatientDetail.city} - {selectedPatientDetail.state}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Histórico Médico</span>
                  <p className="text-slate-800">{selectedPatientDetail.medicalHistory || 'Nenhum'}</p>
                </div>

                {selectedPatientDetail.allergies && selectedPatientDetail.allergies.length > 0 && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="font-bold text-rose-800 block text-[10px] uppercase">Alergias</span>
                    <p className="text-rose-700 font-semibold">{selectedPatientDetail.allergies.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setCurrentView('medical_records')}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Abrir Prontuário & Evoluções
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Ver Histórico na Agenda
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Clique em um paciente na tabela para visualizar o resumo clínico e ficha cadastral.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPatient ? 'Editar Paciente' : 'Novo Cadastro de Paciente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePatient} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">CPF *</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cpf: generateValidSampleCPF() })}
                      className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                      title="Gerar CPF válido matematicamente para testes"
                    >
                      <Wand2 className="w-2.5 h-2.5" />
                      <span>Gerar Válido</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                      className={`w-full p-2.5 pr-8 border rounded-xl bg-slate-50 focus:bg-white font-mono transition ${
                        !formData.cpf
                          ? 'border-slate-200'
                          : cleanDocument(formData.cpf).length === 11 && validateCPF(formData.cpf).isValid
                          ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                          : cleanDocument(formData.cpf).length === 11
                          ? 'border-rose-500 ring-1 ring-rose-500/20'
                          : 'border-slate-200'
                      }`}
                      required
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {formData.cpf && cleanDocument(formData.cpf).length === 11 && (
                        validateCPF(formData.cpf).isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" title="CPF Válido" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" title="CPF Inválido" />
                        )
                      )}
                    </div>
                  </div>

                  {/* CPF Live Feedback status */}
                  {formData.cpf && (
                    <div className="mt-1 flex items-center gap-1 text-[11px]">
                      {cleanDocument(formData.cpf).length < 11 ? (
                        <span className="text-slate-400">
                          Digitando... ({cleanDocument(formData.cpf).length}/11 dígitos)
                        </span>
                      ) : validateCPF(formData.cpf).isValid ? (
                        patients.some(
                          (p) => !p.deletedAt && p.id !== editingPatient?.id && cleanDocument(p.cpf) === cleanDocument(formData.cpf)
                        ) ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Atenção: CPF já cadastrado em outro paciente!
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            CPF Válido (Receita Federal)
                          </span>
                        )
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {validateCPF(formData.cpf).message || 'CPF inválido'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gênero</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Convênio / Tipo *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setCurrentView('cadastros');
                      }}
                      className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 underline"
                      title="Gerenciar tabelas de convênios"
                    >
                      + Cadastros
                    </button>
                  </div>
                  <select
                    value={formData.healthInsurance}
                    onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800"
                  >
                    <option value="Particular">Particular / Tabela Direta</option>
                    {healthInsurances
                      .filter((h) => !h.deletedAt && h.active !== false && h.name !== 'Particular / Tabela Direta')
                      .map((h) => {
                        const planLabel = h.typeName ? `${h.name} - ${h.typeName}` : `${h.name} (${h.planType})`;
                        return (
                          <option key={h.id} value={`${h.name} (${h.typeName || h.planType})`}>
                            {planLabel}
                          </option>
                        );
                      })}
                    <option value="Outro">Outro Convênio / Não listado</option>
                  </select>
                </div>
              </div>

              {formData.healthInsurance && formData.healthInsurance !== 'Particular' && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nº da Carteirinha / Matrícula</label>
                    <input
                      type="text"
                      placeholder="Ex: 0057.1192.8392.01"
                      value={(formData as any).healthInsuranceCardNumber || ''}
                      onChange={(e) => setFormData({ ...formData, healthInsuranceCardNumber: e.target.value } as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Validade da Carteirinha / Guia</label>
                    <input
                      type="text"
                      placeholder="Ex: 12/2027 ou Guia Nº 84920"
                      value={(formData as any).healthInsuranceValidity || ''}
                      onChange={(e) => setFormData({ ...formData, healthInsuranceValidity: e.target.value } as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="paciente@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Histórico Clínico e Patologias Prévias</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Cirurgias, diagnósticos médicos anteriores, fraturas..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alergias e Restrições (separar por vírgula)</label>
                <input
                  type="text"
                  placeholder="Dipirona, Látex, Iodo..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  title="Atalho: Ctrl+S"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>{editingPatient ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-teal-800/60 border border-teal-400/40 rounded text-[9px] font-mono text-teal-100">
                    Ctrl+S
                  </kbd>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
