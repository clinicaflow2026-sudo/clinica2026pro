import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Building2,
  Key,
  Database,
  Users,
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  FileCode,
  AlertCircle,
  XCircle,
  Edit2,
  Wand2,
} from 'lucide-react';
import { PlanType, Tenant } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../lib/constants';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';
import {
  validateCNPJ,
  formatCNPJ,
  generateValidSampleCNPJ,
  cleanDocument,
} from '../../lib/documentValidation';

export const SuperAdminLayer: React.FC = () => {
  const {
    tenants,
    setTenants,
    licenses,
    generateNewLicense,
    auditLogs,
    activeTenant,
    setActiveTenant,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tenants' | 'licenses' | 'sql' | 'audit'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLicenseModal, setShowNewLicenseModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantFormError, setTenantFormError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // License Form State
  const [licenseForm, setLicenseForm] = useState({
    tenantId: tenants[0]?.id || '',
    planId: 'equipe' as PlanType,
    durationMonths: 12,
  });

  // Tenant Form State
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    phone: '',
    email: '',
    city: 'São Paulo',
    state: 'SP',
    address: 'Av. Paulista, 1000',
    postalCode: '01310-100',
    planId: 'equipe' as PlanType,
    subscriptionStatus: 'active' as Tenant['subscriptionStatus'],
  });

  // Calculate Global SaaS Metrics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.subscriptionStatus === 'active').length;
  const trialTenants = tenants.filter((t) => t.subscriptionStatus === 'trial').length;
  const blockedTenants = tenants.filter((t) => t.subscriptionStatus === 'blocked' || t.subscriptionStatus === 'canceled').length;

  const totalMRR = tenants.reduce((sum, t) => {
    if (t.subscriptionStatus === 'blocked' || t.subscriptionStatus === 'canceled') return sum;
    const plan = SUBSCRIPTION_PLANS[t.planId];
    let m = plan ? plan.priceMonthly : 197;
    if (t.financialManagerActive && t.planId !== 'clinica') m += 49;
    if (t.additionalProfessionalsCount) m += t.additionalProfessionalsCount * 39;
    return sum + m;
  }, 0);

  const totalARR = totalMRR * 12;

  const handleOpenNewTenant = () => {
    setEditingTenant(null);
    setTenantFormError(null);
    setTenantFormData({
      name: '',
      tradeName: '',
      cnpj: '',
      phone: '(11) 3456-7890',
      email: '',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000',
      postalCode: '01310-100',
      planId: 'equipe',
      subscriptionStatus: 'active',
    });
    setShowTenantModal(true);
  };

  const handleOpenEditTenant = (t: Tenant) => {
    setEditingTenant(t);
    setTenantFormError(null);
    setTenantFormData({
      name: t.name,
      tradeName: t.tradeName || t.name,
      cnpj: t.cnpj || '',
      phone: t.phone || '',
      email: t.email || '',
      city: t.city || 'São Paulo',
      state: t.state || 'SP',
      address: t.address || '',
      postalCode: t.postalCode || '',
      planId: t.planId,
      subscriptionStatus: t.subscriptionStatus,
    });
    setShowTenantModal(true);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setTenantFormError(null);

    // Validação estrita de CNPJ
    const cleanCnpj = cleanDocument(tenantFormData.cnpj);
    const cnpjValidation = validateCNPJ(tenantFormData.cnpj);
    if (!cnpjValidation.isValid) {
      setTenantFormError(`Não foi possível salvar: ${cnpjValidation.message || 'CNPJ inválido.'}`);
      return;
    }

    // Validação de unicidade de CNPJ entre tenants
    const duplicate = tenants.find(
      (t) => t.id !== editingTenant?.id && cleanDocument(t.cnpj) === cleanCnpj
    );
    if (duplicate) {
      setTenantFormError(`Já existe uma clínica cadastrada com este mesmo CNPJ (${duplicate.name}).`);
      return;
    }

    if (editingTenant) {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingTenant.id
            ? {
                ...t,
                name: tenantFormData.name,
                tradeName: tenantFormData.tradeName,
                cnpj: formatCNPJ(tenantFormData.cnpj),
                phone: tenantFormData.phone,
                email: tenantFormData.email,
                city: tenantFormData.city,
                state: tenantFormData.state,
                address: tenantFormData.address,
                postalCode: tenantFormData.postalCode,
                planId: tenantFormData.planId,
                subscriptionStatus: tenantFormData.subscriptionStatus,
              }
            : t
        )
      );
    } else {
      const newTenantId = `tenant-${Date.now()}`;
      const newTenant: Tenant = {
        id: newTenantId,
        name: tenantFormData.name,
        tradeName: tenantFormData.tradeName,
        cnpj: formatCNPJ(tenantFormData.cnpj),
        slug: tenantFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        phone: tenantFormData.phone,
        email: tenantFormData.email,
        city: tenantFormData.city,
        state: tenantFormData.state,
        address: tenantFormData.address || 'Av. Principal, 100',
        postalCode: tenantFormData.postalCode || '01310-100',
        planId: tenantFormData.planId,
        subscriptionStatus: tenantFormData.subscriptionStatus,
        financialManagerActive: true,
        additionalProfessionalsCount: 0,
        isTrialActive: tenantFormData.subscriptionStatus === 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        primaryColor: '#0d9488',
        secondaryColor: '#0284c7',
        themePreset: 'ocean',
        createdAt: new Date().toISOString(),
      };
      setTenants((prev) => [...prev, newTenant]);
    }
    setShowTenantModal(false);
  };

  const handleToggleBlock = (tenant: Tenant) => {
    const newStatus = tenant.subscriptionStatus === 'blocked' ? 'active' : 'blocked';
    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id ? { ...t, subscriptionStatus: newStatus } : t))
    );
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    generateNewLicense(licenseForm.tenantId, licenseForm.planId, licenseForm.durationMonths);
    setShowNewLicenseModal(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-teal-600" />
            SuperAdmin Control Plane
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestão global multi-tenant, gerador de chaves SHA-256, provisionador SQL e métricas SaaS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewTenant}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Cadastrar Nova Clínica</span>
          </button>

          <button
            onClick={() => setShowNewLicenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Key className="w-4 h-4" />
            <span>Emitir Nova Chave</span>
          </button>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Clínicas</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display">{totalTenants}</span>
            <span className="text-xs text-slate-500">tenants</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {activeTenants} ativas • {trialTenants} em degustação
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MRR Recorrente</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 font-display">
              R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Receita Mensal Recorrente</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ARR Projetado</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-indigo-900 font-display">
              R$ {totalARR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Anualizado (12 Meses)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chaves Emitidas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display">{licenses.length}</span>
            <span className="text-xs text-slate-500">licenças</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {licenses.filter((l) => l.active).length} chaves ativas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 sm:gap-6 text-xs font-bold overflow-x-auto whitespace-nowrap pb-px">
        {[
          { id: 'tenants', label: 'Gestão de Clínicas (Multi-Tenant)' },
          { id: 'licenses', label: 'Chaves de Licença (SHA-256)' },
          { id: 'sql', label: 'Script SQL Supabase + RLS' },
          { id: 'audit', label: 'Log de Auditoria Global' },
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

      {/* Tab 1: Tenants List */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar clínica por nome, CNPJ ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-slate-500 font-medium">{tenants.length} clínicas registradas</span>
              <button
                onClick={handleOpenNewTenant}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Clínica</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5">Clínica / CNPJ</th>
                  <th className="p-3.5">Plano / Módulos</th>
                  <th className="p-3.5">Status da Assinatura</th>
                  <th className="p-3.5">Trial / Validade</th>
                  <th className="p-3.5 text-right">Ações SuperAdmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants
                  .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.cnpj?.includes(searchTerm))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-400">CNPJ: {t.cnpj} • {t.city} - {t.state}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 uppercase border border-teal-200">
                          {t.planId}
                        </span>
                        {t.financialManagerActive && (
                          <span className="ml-1 text-[10px] text-emerald-700 font-bold">+ Gestor Fin</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.subscriptionStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.subscriptionStatus === 'trial'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.subscriptionStatus === 'active'
                            ? 'Ativa'
                            : t.subscriptionStatus === 'trial'
                            ? 'Degustação'
                            : 'Bloqueada'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {t.trialEndsAt ? new Date(t.trialEndsAt).toLocaleDateString('pt-BR') : 'Indeterminado'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveTenant(t);
                              alert(`Você agora está gerenciando a clínica ${t.name} via RLS.`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                          >
                            Entrar
                          </button>

                          <button
                            onClick={() => handleOpenEditTenant(t)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="Editar Dados da Clínica"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleBlock(t)}
                            className={`p-1.5 rounded-lg border transition ${
                              t.subscriptionStatus === 'blocked'
                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                : 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            }`}
                            title={t.subscriptionStatus === 'blocked' ? 'Desbloquear Clínica' : 'Bloquear Clínica'}
                          >
                            {t.subscriptionStatus === 'blocked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Licenses List */}
      {activeTab === 'licenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chaves de Licença Emitidas (SHA-256)</h3>
              <p className="text-xs text-slate-500">Chaves criptográficas com ativação única por tenant.</p>
            </div>
            <button
              onClick={() => setShowNewLicenseModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Chave
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5">Chave de Ativação</th>
                  <th className="p-3.5">Clínica Vinculada</th>
                  <th className="p-3.5">Plano</th>
                  <th className="p-3.5">Validade</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-800">{lic.key}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{lic.tenantName}</td>
                    <td className="p-3.5 capitalize font-bold">{lic.planId}</td>
                    <td className="p-3.5 text-slate-600">{lic.expirationDate}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {lic.active ? 'Ativa' : 'Expirada'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleCopyKey(lic.key)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 ml-auto"
                      >
                        {copiedKey === lic.key ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === lic.key ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SQL Script Generator */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-600" />
                Script SQL Oficial de Deploy (Supabase DDL & RLS)
              </h3>
              <p className="text-xs text-slate-500">
                Copie e cole este script diretamente no Supabase SQL Editor para criar todas as tabelas e políticas RLS.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
            >
              {copiedSql ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'SQL Copiado com Sucesso!' : 'Copiar SQL Completo'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono max-h-[500px] overflow-y-auto leading-relaxed border border-slate-800 select-all">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Rastreamento de Atividades & Auditoria Global</h3>
            <p className="text-xs text-slate-500">Trilha de auditoria com IP, dispositivo, ação e carimbo de data/hora.</p>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Usuário / Perfil</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Ação Realizada</th>
                  <th className="p-3">IP / Dispositivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">{log.userRole}</span>
                    </td>
                    <td className="p-3 font-semibold text-teal-800">{log.module}</td>
                    <td className="p-3 text-slate-700">{log.details || log.action}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{log.ipAddress} ({log.device})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New / Edit Clinic Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                {editingTenant ? 'Editar Dados da Clínica' : 'Cadastrar Nova Clínica (Tenant)'}
              </h3>
              <button onClick={() => setShowTenantModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {tenantFormError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{tenantFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTenant} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    value={tenantFormData.name}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    placeholder="Ex: Clínica Odonto Prime Ltda"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Fantasia *</label>
                  <input
                    type="text"
                    value={tenantFormData.tradeName}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, tradeName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    placeholder="Ex: Odonto Prime"
                    required
                  />
                </div>
              </div>

              {/* CNPJ Input with automatic validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">CNPJ da Clínica *</label>
                  <button
                    type="button"
                    onClick={() => setTenantFormData({ ...tenantFormData, cnpj: generateValidSampleCNPJ() })}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                    title="Gerar CNPJ válido para testes da clínica"
                  >
                    <Wand2 className="w-2.5 h-2.5" />
                    <span>Gerar Válido</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    value={tenantFormData.cnpj}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, cnpj: formatCNPJ(e.target.value) })}
                    className={`w-full p-2.5 pr-8 border rounded-xl bg-slate-50 focus:bg-white font-mono transition ${
                      !tenantFormData.cnpj
                        ? 'border-slate-200'
                        : cleanDocument(tenantFormData.cnpj).length === 14 && validateCNPJ(tenantFormData.cnpj).isValid
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                        : cleanDocument(tenantFormData.cnpj).length === 14
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-200'
                    }`}
                    required
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {tenantFormData.cnpj && cleanDocument(tenantFormData.cnpj).length === 14 && (
                      validateCNPJ(tenantFormData.cnpj).isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" title="CNPJ Válido" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" title="CNPJ Inválido" />
                      )
                    )}
                  </div>
                </div>

                {/* Live CNPJ Feedback */}
                {tenantFormData.cnpj && (
                  <div className="mt-1 text-[11px]">
                    {cleanDocument(tenantFormData.cnpj).length < 14 ? (
                      <span className="text-slate-400">
                        Digitando... ({cleanDocument(tenantFormData.cnpj).length}/14 dígitos)
                      </span>
                    ) : validateCNPJ(tenantFormData.cnpj).isValid ? (
                      tenants.some(
                        (t) => t.id !== editingTenant?.id && cleanDocument(t.cnpj) === cleanDocument(tenantFormData.cnpj)
                      ) ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Atenção: CNPJ já cadastrado em outra clínica!
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          CNPJ Válido (Receita Federal)
                        </span>
                      )
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        {validateCNPJ(tenantFormData.cnpj).message || 'CNPJ Inválido'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={tenantFormData.phone}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Principal</label>
                  <input
                    type="email"
                    value={tenantFormData.email}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    placeholder="contato@clinica.com.br"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={tenantFormData.city}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={tenantFormData.state}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, state: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plano da Assinatura *</label>
                  <select
                    value={tenantFormData.planId}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, planId: e.target.value as PlanType })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="profissional">Profissional (1 Profissional)</option>
                    <option value="equipe">Equipe (Até 5 Profissionais)</option>
                    <option value="clinica">Clínica (Ilimitado)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status do Tenant *</label>
                  <select
                    value={tenantFormData.subscriptionStatus}
                    onChange={(e) => setTenantFormData({ ...tenantFormData, subscriptionStatus: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="active">Ativa</option>
                    <option value="trial">Degustação (Trial)</option>
                    <option value="blocked">Bloqueada</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  {editingTenant ? 'Salvar Alterações' : 'Cadastrar Clínica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* New License Modal */}
      {showNewLicenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600" />
                Emitir Nova Chave de Ativação
              </h3>
              <button onClick={() => setShowNewLicenseModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleGenerateLicense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clínica de Destino *</label>
                <select
                  value={licenseForm.tenantId}
                  onChange={(e) => setLicenseForm({ ...licenseForm, tenantId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  required
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plano da Licença *</label>
                <select
                  value={licenseForm.planId}
                  onChange={(e) => setLicenseForm({ ...licenseForm, planId: e.target.value as PlanType })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="profissional">Profissional (R$ 97/mês)</option>
                  <option value="equipe">Equipe (R$ 197/mês)</option>
                  <option value="clinica">Clínica Ilimitado (R$ 347/mês)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duração da Licença *</label>
                <select
                  value={licenseForm.durationMonths}
                  onChange={(e) => setLicenseForm({ ...licenseForm, durationMonths: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value={1}>1 Mês (Mensal)</option>
                  <option value={3}>3 Meses (Trimestral)</option>
                  <option value={6}>6 Meses (Semestral)</option>
                  <option value={12}>12 Meses (Anual)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLicenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Gerar e Registrar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
