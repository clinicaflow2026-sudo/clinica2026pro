import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
  Activity,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Building,
  HeartPulse,
  CreditCard,
  QrCode,
  ArrowRight,
  HelpCircle,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Layers,
  Check,
} from 'lucide-react';
import { PlanType, AppView } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../lib/constants';

export const CommercialLandingPage: React.FC = () => {
  const { createTenantFromCheckout, setCurrentView } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('equipe');
  const [includeFinancialManager, setIncludeFinancialManager] = useState(true);
  const [additionalProfs, setAdditionalProfs] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    clinicName: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
  });

  const plans = [
    SUBSCRIPTION_PLANS.profissional,
    SUBSCRIPTION_PLANS.equipe,
    SUBSCRIPTION_PLANS.clinica,
  ];

  // Calculate pricing
  const currentPlan = SUBSCRIPTION_PLANS[selectedPlan];
  const basePrice = billingCycle === 'annual' ? currentPlan.priceAnnualMonthly : currentPlan.priceMonthly;
  const addonFin = selectedPlan !== 'clinica' && includeFinancialManager ? 49 : 0;
  const addonProf = additionalProfs * 39;
  const totalPrice = basePrice + addonFin + addonProf;

  const handleStartTrial = (planId: PlanType) => {
    setSelectedPlan(planId);
    setShowCheckoutModal(true);
  };

  const handleNavigateToModule = (view: AppView) => {
    setCurrentView(view);
  };

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.clinicName || !checkoutForm.email) return;

    createTenantFromCheckout({
      name: checkoutForm.clinicName,
      tradeName: checkoutForm.tradeName || checkoutForm.clinicName,
      cnpj: checkoutForm.cnpj || '00.000.000/0001-00',
      email: checkoutForm.email,
      phone: checkoutForm.phone || '(11) 98888-7766',
      planId: selectedPlan,
      financialManager: includeFinancialManager || selectedPlan === 'clinica',
      additionalProfessionals: additionalProfs,
    });

    setShowCheckoutModal(false);
  };

  const faqs = [
    {
      q: 'Como funciona o período de degustação de 7 dias?',
      a: 'Você cria sua conta instantaneamente e tem acesso completo a todos os recursos da plataforma (agenda, prontuário, financeiro, PWA do paciente), sem necessidade de cadastrar cartão de crédito. Ao final dos 7 dias, você escolhe seu plano para continuar.',
    },
    {
      q: 'Como funciona a assinatura digital dos prontuários e evoluções?',
      a: 'O profissional assina com o dedo na tela do celular/tablet ou mouse no computador. O sistema gera um carimbo com CREFITO/CRM, data, hora e código de validação criptográfico SHA-256 inalterável, com opção de exportação em PDF e impressão.',
    },
    {
      q: 'A sincronização com o Google Agenda é bidirecional?',
      a: 'Sim! Agendamentos realizados na recepção do ClinicFlow são sincronizados automaticamente com o Google Calendar do profissional e vice-versa, mantendo os horários sempre atualizados em tempo real.',
    },
    {
      q: 'O App do Paciente (PWA) requer instalação pela App Store ou Play Store?',
      a: 'Não! Trata-se de uma Progressive Web App (PWA) ultrarrápida que o paciente acessa via link ou QR Code direto no navegador e adiciona à tela inicial em 1 clique, sem ocupar memória do aparelho.',
    },
    {
      q: 'Posso personalizar o sistema com o logotipo e cores da minha clínica?',
      a: 'Com certeza! O ClinicFlow é 100% personalizável: você pode enviar o logotipo, definir as cores primária e secundária, e escolher temas modernos adaptados à identidade visual da sua marca.',
    },
    {
      q: 'Como funciona o Gestor Financeiro e emissão de boletos/PIX?',
      a: 'O módulo financeiro calcula fluxo de caixa, contas a pagar e a receber, comissões de profissionais por especialidade e DRE gerencial, além de gerar cobranças com chave PIX Copia e Cola e links diretos para envio via WhatsApp.',
    },
  ];

  const features = [
    {
      id: 'medical_records' as AppView,
      title: 'Prontuário & Assinatura Digital',
      desc: 'Evoluções SOAP, avaliações físicas posturais e goniometria com assinatura manuscrita e carimbo CREFITO/CRM.',
      icon: Activity,
      tag: 'Mais Utilizado',
      color: 'teal',
    },
    {
      id: 'calendar' as AppView,
      title: 'Agenda & Google Calendar',
      desc: 'Visão diária, semanal e por profissional, controle de salas, confirmação via WhatsApp e sincronização em tempo real.',
      icon: Calendar,
      tag: 'Sincronizado',
      color: 'blue',
    },
    {
      id: 'financial' as AppView,
      title: 'Gestor Financeiro Completo',
      desc: 'Fluxo de caixa, emissão de boletos, PIX Copia e Cola, comissões por terapeuta e DRE gerencial.',
      icon: DollarSign,
      tag: 'Módulo Premium',
      color: 'emerald',
    },
    {
      id: 'patient_portal' as AppView,
      title: 'App do Paciente (PWA)',
      desc: 'Acesso a exercícios prescritos, histórico de consultas, extrato de pacotes e novidades enviadas pela clínica.',
      icon: Smartphone,
      tag: 'Exclusivo',
      color: 'indigo',
    },
    {
      id: 'chat' as AppView,
      title: 'Chat Interno & Avisos de Chegada',
      desc: 'Comunicação direta entre recepção e terapeutas, avisos de sala liberada e paciente na sala de espera.',
      icon: MessageSquare,
      tag: 'Produtividade',
      color: 'amber',
    },
    {
      id: 'reports' as AppView,
      title: 'Central de Relatórios & BI',
      desc: 'Atendimentos, faturamento, assiduidade de pacientes, DRE contábil, ocupação de salas e estoque de insumos.',
      icon: BarChart3,
      tag: 'Gerencial',
      color: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg text-white tracking-tight">ClinicFlow</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 bg-teal-500 text-slate-950 rounded">PRO</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#modulos" className="hover:text-white transition">Especialidades</a>
            <a href="#recursos" className="hover:text-white transition">Recursos & Módulos</a>
            <a href="#planos" className="hover:text-white transition">Planos & Preços</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
            >
              Acessar Sistema
            </button>
            <button
              onClick={() => handleStartTrial('equipe')}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md shadow-teal-500/20 transition"
            >
              Testar 7 Dias Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma SaaS Completa • Fisioterapia, Pilates & Estética</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
          A Gestão Completa da sua Clínica em um{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
            Único Software Inteligente
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Prontuários eletrônicos com assinatura digital, sincronização bidirecional com Google Agenda, emissão de boletos & NF-e, e App do Paciente (PWA).
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleStartTrial('equipe')}
            className="w-full sm:w-auto px-8 py-4 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-2xl shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Iniciar Degustação de 7 Dias Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full sm:w-auto px-6 py-4 text-sm font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 rounded-2xl transition flex items-center justify-center gap-2"
          >
            <span>Ver Demonstração Interativa</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" /> Sem necessidade de cartão de crédito para iniciar • Ativação imediata
        </p>
      </section>

      {/* Specialty Highlights Section */}
      <section id="modulos" className="py-16 border-t border-slate-900 bg-slate-950/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Desenvolvido sob medida para seu nicho
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Módulos integrados adaptados para os fluxos reais de consultórios e estúdios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-teal-500/50 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fisioterapia Clínica</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Avaliações posturais, goniometria, testes musculares, histórico de dor e evolução SOAP com assinatura manuscrita.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToModule('medical_records')}
              className="mt-4 flex items-center justify-between text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 px-3.5 py-2.5 rounded-xl transition"
            >
              <span>Explorar Prontuário</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/50 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Studio de Pilates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Controle de turmas e ocupação de aparelhos (Reformer, Cadillac), controle de reposições e pacotes de sessões.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToModule('calendar')}
              className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2.5 rounded-xl transition"
            >
              <span>Explorar Agenda de Turmas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/50 transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Clínica de Estética</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fichas de anamnese facial e corporal, galeria de fotos de antes e depois, controle de lotes e validade de cosméticos.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToModule('cadastros')}
              className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2.5 rounded-xl transition"
            >
              <span>Explorar Procedimentos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Recurso Interativo Grid (All Items Navigable) */}
      <section id="recursos" className="py-20 border-t border-slate-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Recursos Integrados de Ponta a Ponta
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Clique em qualquer recurso para testar a experiência real no sistema em modo interativo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between gap-5 transition hover:shadow-xl hover:shadow-teal-500/5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigateToModule(feat.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 px-4 py-2.5 rounded-xl transition"
                >
                  <span>Acessar Módulo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="planos" className="py-20 border-t border-slate-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Planos Transparentes e Sem Surpresas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Comece grátis por 7 dias e escale conforme sua clínica cresce.
          </p>

          {/* Billing Cycle Switch */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl transition ${
                billingCycle === 'monthly' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">20% OFF</span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isPopular = plan.id === 'equipe';
            const price = billingCycle === 'annual' ? plan.priceAnnualMonthly : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950/40 border-2 border-teal-500 shadow-2xl shadow-teal-500/10'
                    : 'bg-slate-900/60 border border-slate-800'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-extrabold text-[11px] rounded-full uppercase tracking-wider shadow-md">
                    Mais Escolhido por Clínicas
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">R$</span>
                    <span className="text-4xl font-black text-white font-display">{price}</span>
                    <span className="text-xs text-slate-400">/mês</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleStartTrial(plan.id)}
                    className={`w-full py-3.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>Testar {plan.name} por 7 Dias</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-ons Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-400" />
              Módulo Opcional: Gestor Financeiro Completo (+ R$ 49/mês)
            </h4>
            <p className="text-xs text-slate-400">
              Disponível como add-on para os planos Profissional e Equipe (já incluso gratuitamente no plano Clínica).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigateToModule('financial')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Conhecer Módulo Financeiro
            </button>
            <button
              onClick={() => handleStartTrial('equipe')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
            >
              Configurar com Add-on
            </button>
          </div>
        </div>
      </section>

      {/* FAQ with Interactive Accordion */}
      <section id="faq" className="py-16 border-t border-slate-900 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white text-center">
          Perguntas Frequentes
        </h2>

        <div className="space-y-3 text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4.5 flex items-center justify-between text-left font-bold text-white hover:text-teal-300 transition"
                >
                  <span className="text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-teal-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4.5 pb-4 text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-900 text-center text-xs text-slate-400 space-y-4">
        <div className="flex items-center justify-center gap-6 text-slate-400">
          <button onClick={() => setCurrentView('dashboard')} className="hover:text-white">Dashboard</button>
          <button onClick={() => setCurrentView('medical_records')} className="hover:text-white">Prontuário</button>
          <button onClick={() => setCurrentView('calendar')} className="hover:text-white">Agenda</button>
          <button onClick={() => setCurrentView('financial')} className="hover:text-white">Financeiro</button>
          <button onClick={() => setCurrentView('patient_portal')} className="hover:text-white">App Paciente</button>
          <button onClick={() => setCurrentView('settings')} className="hover:text-white">Configurações</button>
        </div>
        <p>ClinicFlow Pro © 2025 • Todos os direitos reservados • Suporte: suporte@clinicflowpro.com.br</p>
      </footer>

      {/* Checkout / Onboarding Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Iniciar Teste de 7 Dias Grátis
                </h3>
                <p className="text-xs text-slate-400">
                  Plano selecionado: <span className="text-teal-400 font-bold">{currentPlan.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteCheckout} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Clínica / Consultório *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FisioVida Integrada"
                  value={checkoutForm.clinicName}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, clinicName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={checkoutForm.cnpj}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp de Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-7766"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">E-mail do Administrador *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@minhaclinica.com.br"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Add-ons Selector in Checkout */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider block">
                  Add-ons & Configurações de Assinatura
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeFinancialManager || selectedPlan === 'clinica'}
                      disabled={selectedPlan === 'clinica'}
                      onChange={(e) => setIncludeFinancialManager(e.target.checked)}
                      className="rounded text-teal-500 focus:ring-0"
                    />
                    <span className="text-slate-300">Gestor Financeiro Completo</span>
                  </div>
                  <span className="text-teal-400 font-bold">
                    {selectedPlan === 'clinica' ? 'Incluso no Plano' : '+ R$ 49/mês'}
                  </span>
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-slate-300">Profissionais Adicionais (+ R$ 39/cada):</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdditionalProfs(Math.max(0, additionalProfs - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="font-bold text-white w-4 text-center">{additionalProfs}</span>
                    <button
                      type="button"
                      onClick={() => setAdditionalProfs(additionalProfs + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300 font-bold">
                <span>Total Estimado após os 7 dias grátis:</span>
                <span className="text-base font-black text-white font-display">
                  R$ {totalPrice.toFixed(2)}/mês
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-lg shadow-teal-500/20 transition"
                >
                  Criar Clínica e Acessar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
