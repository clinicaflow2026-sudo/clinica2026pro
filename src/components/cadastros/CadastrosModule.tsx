import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  UserCheck,
  Calendar,
  Layers,
  DollarSign,
  Package,
  Wrench,
  Truck,
  Shield,
  ShieldCheck,
  FileSpreadsheet,
  Settings2,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  Wand2,
} from 'lucide-react';
import {
  validateCNPJ,
  validateCPF,
  formatCNPJ,
  formatCPF,
  generateValidSampleCNPJ,
  generateValidSampleCPF,
  cleanDocument,
} from '../../lib/documentValidation';

type CadastroCategory =
  | 'specialties'
  | 'professionals'
  | 'rooms'
  | 'procedures'
  | 'healthInsurances'
  | 'packages'
  | 'accounts'
  | 'costCenters'
  | 'financialCategories'
  | 'paymentMethods'
  | 'products'
  | 'productCategories'
  | 'unitsOfMeasure'
  | 'suppliers'
  | 'equipment'
  | 'technicalAssistance'
  | 'users';

interface CadastroDefinition {
  id: CadastroCategory;
  label: string;
  count: number;
  icon: React.ElementType;
  description: string;
}

export const CadastrosModule: React.FC = () => {
  const {
    specialties,
    professionals,
    rooms,
    procedures,
    healthInsurances,
    packages,
    accounts,
    costCenters,
    financialCategories,
    paymentMethods,
    products,
    productCategories,
    unitsOfMeasure,
    suppliers,
    equipment,
    technicalAssistance,
    users,
    addGenericItem,
    updateGenericItem,
    deleteGenericItem,
    inviteStaffUser,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<CadastroCategory>('specialties');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});

  const catalogs: CadastroDefinition[] = [
    { id: 'specialties', label: 'Especialidades', count: specialties.length, icon: Layers, description: 'Fisioterapia, Pilates, Estética e outras especialidades' },
    { id: 'professionals', label: 'Profissionais & Terapeutas', count: professionals.length, icon: UserCheck, description: 'Fisioterapeutas, instrutores de pilates e esteticistas' },
    { id: 'rooms', label: 'Salas de Atendimento', count: rooms.length, icon: Building, description: 'Consultórios, studios de pilates e salas de estética' },
    { id: 'procedures', label: 'Procedimentos & Serviços', count: procedures.length, icon: Calendar, description: 'Catálogo de serviços clínicos com preços e duração' },
    { id: 'healthInsurances', label: 'Convênios & Planos de Saúde', count: healthInsurances.length, icon: ShieldCheck, description: 'Operadoras (Unimed, Bradesco, Amil), tipos de plano e regras TISS' },
    { id: 'packages', label: 'Pacotes & Planos de Sessões', count: packages.length, icon: Package, description: 'Planos de 10, 20 sessões com validade' },
    { id: 'accounts', label: 'Contas Bancárias & Caixas', count: accounts.length, icon: DollarSign, description: 'Contas correntes, cofres e carteiras da clínica' },
    { id: 'costCenters', label: 'Centros de Custo', count: costCenters.length, icon: FileSpreadsheet, description: 'Departamentos e centros de rateio de despesas' },
    { id: 'financialCategories', label: 'Categorias Financeiras', count: financialCategories.length, icon: DollarSign, description: 'Plano de contas de receitas e despesas' },
    { id: 'paymentMethods', label: 'Formas de Pagamento', count: paymentMethods.length, icon: DollarSign, description: 'PIX, Cartões, Boletos com taxas de intermediação' },
    { id: 'products', label: 'Produtos & Insumos', count: products.length, icon: Package, description: 'Controle de estoque, faixas, óleos, agulhas' },
    { id: 'productCategories', label: 'Categorias de Produtos', count: productCategories.length, icon: Package, description: 'Agrupamentos de insumos e produtos para revenda' },
    { id: 'unitsOfMeasure', label: 'Unidades de Medida', count: unitsOfMeasure.length, icon: Settings2, description: 'UN, CX, ML, KG, G' },
    { id: 'suppliers', label: 'Fornecedores', count: suppliers.length, icon: Truck, description: 'Fabricantes de aparelhos e distribuidores de insumos' },
    { id: 'equipment', label: 'Equipamentos & Aparelhos', count: equipment.length, icon: Wrench, description: 'Aparelhos de eletroterapia, macas, lasers' },
    { id: 'technicalAssistance', label: 'Assistência Técnica & Manutenção', count: technicalAssistance.length, icon: Wrench, description: 'Ordens de serviço e calibração de equipamentos' },
    { id: 'users', label: 'Usuários & Permissões', count: users.length, icon: Shield, description: 'Perfis de acesso: Admin, Profissional, Secretária' },
  ];

  // Get data array for active category
  const getCurrentData = () => {
    switch (activeCategory) {
      case 'specialties':
        return specialties;
      case 'professionals':
        return professionals;
      case 'rooms':
        return rooms;
      case 'procedures':
        return procedures;
      case 'healthInsurances':
        return healthInsurances;
      case 'packages':
        return packages;
      case 'accounts':
        return accounts;
      case 'costCenters':
        return costCenters;
      case 'financialCategories':
        return financialCategories;
      case 'paymentMethods':
        return paymentMethods;
      case 'products':
        return products;
      case 'productCategories':
        return productCategories;
      case 'unitsOfMeasure':
        return unitsOfMeasure;
      case 'suppliers':
        return suppliers;
      case 'equipment':
        return equipment;
      case 'technicalAssistance':
        return technicalAssistance;
      case 'users':
        return users;
      default:
        return [];
    }
  };

  const rawData = getCurrentData();
  const currentData = rawData.filter((item: any) => {
    if (item.deletedAt) return false;
    const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const tradeMatch = item.tradeName?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || descMatch || tradeMatch || !searchTerm;
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormError(null);
    setFormData({ active: true });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormError(null);
    setFormData({ ...item });
    setShowModal(true);
  };

  const [inviteLoading, setInviteLoading] = useState(false);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validação de CNPJ para fornecedores
    if (activeCategory === 'suppliers' && formData.cnpj && cleanDocument(formData.cnpj).length > 0) {
      const cnpjVal = validateCNPJ(formData.cnpj);
      if (!cnpjVal.isValid) {
        setFormError(`CNPJ Inválido: ${cnpjVal.message || 'Verifique o CNPJ do fornecedor.'}`);
        return;
      }
    }

    // Validação de CPF para profissionais
    if (activeCategory === 'professionals' && formData.cpf && cleanDocument(formData.cpf).length > 0) {
      const cpfVal = validateCPF(formData.cpf);
      if (!cpfVal.isValid) {
        setFormError(`CPF Inválido: ${cpfVal.message || 'Verifique o CPF do profissional.'}`);
        return;
      }
    }

    // Usuários (login real): passa pela Edge Function em vez do cadastro
    // genérico local. Só vale para CRIAR — editar um usuário existente
    // ainda atualiza só localmente (ver nota no formulário).
    if (activeCategory === 'users' && !editingItem) {
      if (!formData.name || !formData.email || !formData.role) {
        setFormError('Nome, e-mail e perfil são obrigatórios.');
        return;
      }
      setInviteLoading(true);
      const result = await inviteStaffUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        professionalId: formData.professionalId || undefined,
      });
      setInviteLoading(false);
      if (!result.success) {
        setFormError(result.message || 'Não foi possível convidar o usuário.');
        return;
      }
      setShowModal(false);
      return;
    }

    if (editingItem) {
      updateGenericItem(activeCategory, editingItem.id, formData);
    } else {
      addGenericItem(activeCategory, formData);
    }
    setShowModal(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja realmente remover este registro? (Será aplicado Soft Delete para integridade histórica)')) {
      deleteGenericItem(activeCategory, id, false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Módulo de Cadastros Clínicos & Gerenciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            20+ telas de parametrização completa com isolamento multi-tenant e integridade relacional.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro em {catalogs.find((c) => c.id === activeCategory)?.label}</span>
        </button>
      </div>

      {/* Main Grid: Sidebar of 20 categories + Dynamic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Catalogs List */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-1 max-h-52 lg:max-h-[750px] overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tabelas Paramétricas</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{catalogs.length} módulos</span>
          </div>

          <div className="space-y-1">
            {catalogs.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Data Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={`Buscar em ${catalogs.find((c) => c.id === activeCategory)?.label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Total: <strong>{currentData.length}</strong> itens ativos
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Nome / Identificação</th>
                    <th className="p-3.5">Detalhes / Vínculo</th>
                    <th className="p-3.5">Valores / Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                        Nenhum registro cadastrado nesta tabela.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {item.color && (
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{item.name || item.tradeName || item.description || item.key}</div>
                              {item.code && <div className="text-[10px] text-slate-400">Código: {item.code}</div>}
                              {item.serialNumber && <div className="text-[10px] text-slate-400">S/N: {item.serialNumber}</div>}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600">
                          {activeCategory === 'rooms' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 text-xs">
                                  {item.sector || 'Consultório Principal'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  • Cap: {item.capacity || 1} {item.capacity > 1 ? 'pacientes' : 'paciente'}
                                </span>
                              </div>
                              {item.modalities && item.modalities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.modalities.map((m: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : activeCategory === 'healthInsurances' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                                  {item.planType || 'Ambulatorial'}
                                </span>
                                {item.typeName && <span className="text-slate-600 font-medium">({item.typeName})</span>}
                              </div>
                              {item.ansCode && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Registro ANS: <span className="font-bold text-slate-700">{item.ansCode}</span>
                                </div>
                              )}
                              {item.phone && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{item.phone}</span>
                                </div>
                              )}
                              {item.coverageDetails && (
                                <div className="text-[10px] text-slate-400 italic line-clamp-1">{item.coverageDetails}</div>
                              )}
                            </div>
                          ) : (
                            <>
                              {item.specialtyName && <div>Especialidade: <strong>{item.specialtyName}</strong></div>}
                              {item.councilRegistration && <div>Conselho: <strong>{item.councilRegistration}</strong></div>}
                              {item.accountName && <div>Conta: {item.accountName}</div>}
                              {item.supplierName && <div>Fornecedor: {item.supplierName}</div>}
                              {item.email && <div>E-mail: {item.email}</div>}
                              {item.role && <div className="capitalize">Perfil: {item.role}</div>}
                              {item.description && !item.name && <div>{item.description}</div>}
                            </>
                          )}
                        </td>

                        <td className="p-3.5">
                          {activeCategory === 'healthInsurances' && (
                            <div className="space-y-1">
                              {item.discountPercent !== undefined && item.discountPercent > 0 && (
                                <span className="font-bold text-teal-700 block text-[11px]">
                                  Desc: {item.discountPercent}% em tabela
                                </span>
                              )}
                              {item.requiresAuthorizationGuide && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Exige Guia / TISS
                                </span>
                              )}
                            </div>
                          )}
                          {item.price !== undefined && (
                            <span className="font-bold text-emerald-600 block">R$ {Number(item.price).toFixed(2)}</span>
                          )}
                          {item.amount !== undefined && (
                            <span className="font-bold text-teal-700 block">R$ {Number(item.amount).toFixed(2)}</span>
                          )}
                          {item.stockQuantity !== undefined && (
                            <span className="text-[11px] text-slate-600 block">Estoque: {item.stockQuantity} un</span>
                          )}
                          {item.active !== undefined ? (
                            <span
                              className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.active ? 'Ativo' : 'Inativo'}
                            </span>
                          ) : item.status ? (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 capitalize">
                              {item.status}
                            </span>
                          ) : null}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                              title="Editar registro"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200"
                              title="Excluir (Soft Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Editar Registro' : 'Novo Registro'} - {catalogs.find((c) => c.id === activeCategory)?.label}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome / Identificação *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              {/* Specialized fields for Users (login real via Edge Function) */}
              {activeCategory === 'users' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  {editingItem ? (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      Edição de usuário existente ainda é só local nesta versão — nome/perfil não são sincronizados com o login real.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Um e-mail de convite será enviado. A pessoa define a própria senha ao aceitar.
                    </p>
                  )}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      required
                      disabled={!!editingItem}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso *</label>
                    <select
                      value={formData.role || 'secretary'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="professional">Profissional</option>
                      <option value="secretary">Secretária / Recepção</option>
                    </select>
                  </div>
                  {formData.role === 'professional' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vincular a um Profissional (opcional)</label>
                      <select
                        value={formData.professionalId || ''}
                        onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="">Nenhum</option>
                        {professionals.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Specialized fields for Suppliers (Fornecedores) */}
              {activeCategory === 'suppliers' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">CNPJ do Fornecedor</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cnpj: generateValidSampleCNPJ() })}
                        className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                        title="Gerar CNPJ válido para testes"
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
                        value={formData.cnpj || ''}
                        onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                        className={`w-full p-2.5 pr-8 border rounded-xl bg-white font-mono transition ${
                          !formData.cnpj
                            ? 'border-slate-200'
                            : cleanDocument(formData.cnpj).length === 14 && validateCNPJ(formData.cnpj).isValid
                            ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                            : cleanDocument(formData.cnpj).length === 14
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200'
                        }`}
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {formData.cnpj && cleanDocument(formData.cnpj).length === 14 && (
                          validateCNPJ(formData.cnpj).isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" title="CNPJ Válido" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" title="CNPJ Inválido" />
                          )
                        )}
                      </div>
                    </div>
                    {formData.cnpj && (
                      <div className="mt-1 text-[11px]">
                        {cleanDocument(formData.cnpj).length < 14 ? (
                          <span className="text-slate-400">
                            Digitando... ({cleanDocument(formData.cnpj).length}/14 dígitos)
                          </span>
                        ) : validateCNPJ(formData.cnpj).isValid ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            CNPJ Válido
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {validateCNPJ(formData.cnpj).message || 'CNPJ Inválido'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contato / Vendedor</label>
                      <input
                        type="text"
                        placeholder="Ex: Carlos Oliveira"
                        value={formData.contactName || ''}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Telefone Comercial</label>
                      <input
                        type="text"
                        placeholder="(11) 3456-7890"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Specialized fields for Professionals (Profissionais) */}
              {activeCategory === 'professionals' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">CPF do Profissional</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cpf: generateValidSampleCPF() })}
                        className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                        title="Gerar CPF válido para testes"
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
                        value={formData.cpf || ''}
                        onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                        className={`w-full p-2.5 pr-8 border rounded-xl bg-white font-mono transition ${
                          !formData.cpf
                            ? 'border-slate-200'
                            : cleanDocument(formData.cpf).length === 11 && validateCPF(formData.cpf).isValid
                            ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                            : cleanDocument(formData.cpf).length === 11
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200'
                        }`}
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
                    {formData.cpf && (
                      <div className="mt-1 text-[11px]">
                        {cleanDocument(formData.cpf).length < 11 ? (
                          <span className="text-slate-400">
                            Digitando... ({cleanDocument(formData.cpf).length}/11 dígitos)
                          </span>
                        ) : validateCPF(formData.cpf).isValid ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            CPF Válido
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {validateCPF(formData.cpf).message || 'CPF Inválido'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialized fields for Health Insurance / Convênios */}
              {activeCategory === 'healthInsurances' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tipo de Plano *</label>
                      <select
                        value={formData.planType || 'ambulatorial'}
                        onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                      >
                        <option value="ambulatorial">Ambulatorial (Consultas/Sessões)</option>
                        <option value="hospitalar">Hospitalar (Internação/Cirúrgico)</option>
                        <option value="coparticipacao">Coparticipação</option>
                        <option value="particular">Particular / Tabela Direta</option>
                        <option value="odontologico">Odontológico</option>
                        <option value="estetica">Estética & Bem-Estar</option>
                        <option value="outro">Outro / Cartão de Descontos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Segmentação / Subtipo</label>
                      <input
                        type="text"
                        placeholder="Ex: Top Nacional, Especial, Básico"
                        value={formData.typeName || ''}
                        onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      >
                      </input>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Registro ANS</label>
                      <input
                        type="text"
                        placeholder="Ex: 005711"
                        value={formData.ansCode || ''}
                        onChange={(e) => setFormData({ ...formData, ansCode: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Desconto em Tabela (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={formData.discountPercent || 0}
                        onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Telefone / SAC Autorização</label>
                      <input
                        type="text"
                        placeholder="Ex: 0800 014 5555"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">E-mail Faturamento / TISS</label>
                      <input
                        type="email"
                        placeholder="autorizacoes@operadora.com.br"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="reqGuideCheck"
                      checked={formData.requiresAuthorizationGuide ?? true}
                      onChange={(e) => setFormData({ ...formData, requiresAuthorizationGuide: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="reqGuideCheck" className="font-semibold text-slate-700 cursor-pointer">
                      Exige guia de autorização prévia / pedido médico TISS
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic specialty / color field if applicable */}
              {(activeCategory === 'specialties' || activeCategory === 'professionals') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cor na Agenda</label>
                    <input
                      type="color"
                      value={formData.color || '#0d9488'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 p-1 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
                    />
                  </div>

                  {activeCategory === 'professionals' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Conselho (CREFITO/CRM)</label>
                      <input
                        type="text"
                        placeholder="Ex: CREFITO-3/294819-F"
                        value={formData.councilRegistration || ''}
                        onChange={(e) => setFormData({ ...formData, councilRegistration: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Specialized fields for Rooms / Salas de Atendimento */}
              {activeCategory === 'rooms' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Setor / Ala / Andar</label>
                      <input
                        type="text"
                        placeholder="Ex: Ala Ortopédica, Studio A, Piso 1"
                        value={formData.sector || ''}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Capacidade Simultânea</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.capacity || 1}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) || 1 })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Modalidades de Atendimento Permitidas (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Fisioterapia Traumato-Ortopédica, Osteopatia, Acupuntura"
                      value={Array.isArray(formData.modalities) ? formData.modalities.join(', ') : formData.modalities || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          modalities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      As modalidades cadastradas aparecem no painel de controle e facilitam a alocação de profissionais.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status Operacional</label>
                      <select
                        value={formData.status || (formData.inMaintenance ? 'maintenance' : 'available')}
                        onChange={(e) => {
                          const st = e.target.value;
                          setFormData({
                            ...formData,
                            status: st,
                            inMaintenance: st === 'maintenance',
                          });
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                      >
                        <option value="available">🟢 Disponível</option>
                        <option value="in_use">🔵 Em Atendimento</option>
                        <option value="cleaning">🟡 Em Higienização</option>
                        <option value="maintenance">🔴 Em Manutenção</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cor do Card / Tag</label>
                      <input
                        type="color"
                        value={formData.color || '#0d9488'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10 p-1 border border-slate-200 rounded-xl bg-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price / Value if applicable */}
              {(activeCategory === 'procedures' || activeCategory === 'packages' || activeCategory === 'products') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preço / Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || formData.sellingPrice || 0}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value), sellingPrice: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duração / Sessões / Estoque</label>
                    <input
                      type="number"
                      value={formData.durationMinutes || formData.sessionCount || formData.stockQuantity || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: Number(e.target.value),
                          sessionCount: Number(e.target.value),
                          stockQuantity: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição / Observações</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
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
                  disabled={inviteLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-60"
                >
                  {inviteLoading ? 'Enviando convite...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
