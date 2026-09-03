import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeSettingsTab } from './ThemeSettingsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { AccessControlTab } from './AccessControlTab';
import { PatientPortalSettingsTab } from './PatientPortalSettingsTab';
import {
  Settings,
  Building,
  Key,
  Shield,
  CreditCard,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Lock,
  Globe,
  Sliders,
  Receipt,
  Palette,
  Bell,
  Smartphone,
  XCircle,
  Wand2,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../lib/constants';
import {
  validateCNPJ,
  formatCNPJ,
  generateValidSampleCNPJ,
  cleanDocument,
} from '../../lib/documentValidation';

export const SettingsModule: React.FC = () => {
  const {
    activeTenant,
    updateTenantInfo,
    setShowLicenseModal,
    exportTenantDataJSON,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'branding' | 'access_control' | 'notifications' | 'patient_portal' | 'general' | 'integrations' | 'subscription' | 'backup'>('branding');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form State for General Settings
  const [generalForm, setGeneralForm] = useState({
    name: activeTenant.name,
    tradeName: activeTenant.tradeName,
    cnpj: activeTenant.cnpj,
    phone: activeTenant.phone,
    email: activeTenant.email,
    address: activeTenant.address,
    city: activeTenant.city,
    state: activeTenant.state,
    postalCode: activeTenant.postalCode,
  });

  // Integrations State
  const [integrationsForm, setIntegrationsForm] = useState({
    supabaseUrl: 'https://xyzcompany.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    googleClientId: '123456789-abc.apps.googleusercontent.com',
    googleClientSecret: '••••••••••••••••••••••••',
    stripePublicKey: 'pk_live_51Mz...',
    stripeSecretKey: '••••••••••••••••••••••••',
    focusNfeToken: '••••••••••••••••••••••••',
    whatsappApiEndpoint: 'https://api.evolution-api.com/instance/clinic1',
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validação estrita de CNPJ caso informado
    if (generalForm.cnpj && cleanDocument(generalForm.cnpj).length > 0) {
      const cnpjValidation = validateCNPJ(generalForm.cnpj);
      if (!cnpjValidation.isValid) {
        setGeneralError(`CNPJ Inválido: ${cnpjValidation.message || 'Verifique os dígitos verificadores informados.'}`);
        return;
      }
    }

    updateTenantInfo({
      ...generalForm,
      cnpj: generalForm.cnpj ? formatCNPJ(generalForm.cnpj) : '',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentPlanInfo = SUBSCRIPTION_PLANS[activeTenant.planId];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Configurações da Clínica & Gestão
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identidade visual e tema, perfis de acesso e menus (RBAC), notificações, integrações e backup de dados.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 sm:gap-6 text-xs font-bold overflow-x-auto pb-0.5">
        {[
          { id: 'branding', label: 'Identidade Visual & Tema', icon: Palette },
          { id: 'access_control', label: 'Perfis & Acessos (RBAC)', icon: Shield },
          { id: 'notifications', label: 'Notificações & Push', icon: Bell },
          { id: 'patient_portal', label: 'App do Paciente (PWA)', icon: Smartphone },
          { id: 'general', label: 'Dados Cadastrais', icon: Building },
          { id: 'integrations', label: 'Integrações de APIs', icon: Cloud },
          { id: 'subscription', label: 'Plano & Licença de Uso', icon: Key },
          { id: 'backup', label: 'Backup & Exportação', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 transition flex items-center gap-1.5 relative whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-brand-primary border-b-2 border-brand-primary font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'patient_portal' && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-teal-600 text-white ml-0.5">
                  NOVO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Branding & Visual Theme */}
      {activeTab === 'branding' && <ThemeSettingsTab />}

      {/* Tab: Access Control & Role Permissions */}
      {activeTab === 'access_control' && <AccessControlTab />}

      {/* Tab: Push Notifications */}
      {activeTab === 'notifications' && <NotificationSettingsTab />}

      {/* Tab: Patient Portal Settings & Updates */}
      {activeTab === 'patient_portal' && <PatientPortalSettingsTab />}

      {/* Tab 1: General Info */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          {generalError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="space-y-6 text-xs max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Identificação da Clínica</h3>
              <p className="text-slate-500 text-[11px]">Estes dados aparecem nos relatórios oficiais, orçamentos e recibos.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Razão Social *</label>
                <input
                  type="text"
                  value={generalForm.name}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  value={generalForm.tradeName}
                  onChange={(e) => setGeneralForm({ ...generalForm, tradeName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">CNPJ</label>
                  <button
                    type="button"
                    onClick={() => setGeneralForm({ ...generalForm, cnpj: generateValidSampleCNPJ() })}
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
                    value={generalForm.cnpj}
                    onChange={(e) => setGeneralForm({ ...generalForm, cnpj: formatCNPJ(e.target.value) })}
                    className={`w-full p-2.5 pr-8 border rounded-xl bg-slate-50 focus:bg-white font-mono transition ${
                      !generalForm.cnpj
                        ? 'border-slate-200'
                        : cleanDocument(generalForm.cnpj).length === 14 && validateCNPJ(generalForm.cnpj).isValid
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                        : cleanDocument(generalForm.cnpj).length === 14
                        ? 'border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-200'
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {generalForm.cnpj && cleanDocument(generalForm.cnpj).length === 14 && (
                      validateCNPJ(generalForm.cnpj).isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" title="CNPJ Válido" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" title="CNPJ Inválido" />
                      )
                    )}
                  </div>
                </div>

                {/* Live CNPJ Feedback */}
                {generalForm.cnpj && (
                  <div className="mt-1 text-[11px]">
                    {cleanDocument(generalForm.cnpj).length < 14 ? (
                      <span className="text-slate-400">
                        Digitando... ({cleanDocument(generalForm.cnpj).length}/14 dígitos)
                      </span>
                    ) : validateCNPJ(generalForm.cnpj).isValid ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        CNPJ Válido (Receita Federal)
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        {validateCNPJ(generalForm.cnpj).message || 'CNPJ Inválido'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone Principal</label>
                <input
                  type="text"
                  value={generalForm.phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cidade / UF</label>
                <input
                  type="text"
                  value={`${generalForm.city} - ${generalForm.state}`}
                  onChange={(e) => {
                    const [c, s] = e.target.value.split('-');
                    setGeneralForm({ ...generalForm, city: c?.trim() || '', state: s?.trim() || '' });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-brand-primary-light bg-brand-primary-light flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Customização Visual & Logotipo</p>
                <p className="text-slate-600 text-[11px]">
                  Cores primárias, secundárias e logo da clínica agora contam com painel dedicado em tempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('branding')}
                className="px-3.5 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:opacity-90 transition shrink-0"
              >
                Abrir Gestor de Tema
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
              >
                Salvar Dados Cadastrais
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Integrations */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configuração de APIs & Serviços Externos</h3>
            <p className="text-slate-500 text-[11px]">
              Credenciais seguras para Supabase, Google Calendar, Stripe, Focus NFe e WhatsApp API.
            </p>
          </div>

          <form onSubmit={handleSaveIntegrations} className="space-y-6 text-xs max-w-3xl">
            {/* Supabase Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  Supabase PostgreSQL & Realtime
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Conectado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Project URL</label>
                  <input
                    type="text"
                    value={integrationsForm.supabaseUrl}
                    onChange={(e) => setIntegrationsForm({ ...integrationsForm, supabaseUrl: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Anon / Public API Key</label>
                  <input
                    type="text"
                    value={integrationsForm.supabaseAnonKey}
                    onChange={(e) => setIntegrationsForm({ ...integrationsForm, supabaseAnonKey: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Google Calendar Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Google Calendar OAuth 2.0 (Sincronização Bidirecional)
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client ID</label>
                  <input
                    type="text"
                    value={integrationsForm.googleClientId}
                    onChange={(e) => setIntegrationsForm({ ...integrationsForm, googleClientId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={integrationsForm.googleClientSecret}
                    onChange={(e) => setIntegrationsForm({ ...integrationsForm, googleClientSecret: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Stripe / Pagamentos Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Gateway de Pagamentos & Cobrança (Stripe / PIX)
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Pronto
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Stripe Public Key</label>
                <input
                  type="text"
                  value={integrationsForm.stripePublicKey}
                  onChange={(e) => setIntegrationsForm({ ...integrationsForm, stripePublicKey: e.target.value })}
                  placeholder="pk_test_... ou chave pública"
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"
                />
              </div>
            </div>

            {/* Focus NFe Box (Explicitly Inactive / Optional) */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  Nota Fiscal Eletrônica de Serviço (NFS-e / Focus NFe)
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  Desativado (Opcional)
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <p className="font-semibold text-amber-950 mb-0.5">Integração de NF-e não configurada no momento.</p>
                A clínica pode continuar gerando e imprimindo normalmente <strong>Recibos de Pagamento para Reembolso/IR</strong>, comprovantes, orçamentos e cobranças PIX/Boleto sem qualquer bloqueio operacional.
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Token de API Focus NFe (Opcional para o futuro)</label>
                <input
                  type="password"
                  value={integrationsForm.focusNfeToken}
                  onChange={(e) => setIntegrationsForm({ ...integrationsForm, focusNfeToken: e.target.value })}
                  placeholder="Deixe em branco se não for utilizar agora"
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px] placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Você poderá preencher este token quando desejar automatizar a emissão na prefeitura.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                Salvar Credenciais de Integração
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Subscription & Licensing */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">Plano Atual</span>
              <h3 className="text-xl font-black text-slate-900 capitalize font-display">
                Plano {currentPlanInfo?.name || activeTenant.planId}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Status:{' '}
                <strong className="text-emerald-700 uppercase">
                  {activeTenant.subscriptionStatus === 'active'
                    ? 'Assinatura Ativa'
                    : activeTenant.subscriptionStatus === 'trial'
                    ? 'Degustação (7 Dias)'
                    : 'Bloqueada'}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLicenseModal(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Key className="w-4 h-4" />
                <span>Inserir Chave de Ativação</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">Limite de Profissionais</span>
              <span className="text-lg font-black text-slate-900">
                {currentPlanInfo?.maxProfessionals === 9999 ? 'Ilimitado' : currentPlanInfo?.maxProfessionals}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">Limite de Pacientes</span>
              <span className="text-lg font-black text-slate-900">
                {currentPlanInfo?.maxPatients === 9999 ? 'Ilimitado' : currentPlanInfo?.maxPatients}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">Gestor Financeiro</span>
              <span className="text-lg font-black text-emerald-700">
                {activeTenant.financialManagerActive ? 'Ativo & Liberado' : 'Módulo Básico'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Backup & Data Export */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900">Exportação & Backup dos Dados da Clínica</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Exporte todos os registros da sua clínica (prontuários, pacientes, faturamento, configurações e logs) em formato JSON seguro e padronizado com isolamento total de dados.
          </p>

          <div className="pt-4">
            <button
              onClick={exportTenantDataJSON}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Baixar Backup Completo da Clínica (.JSON)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
