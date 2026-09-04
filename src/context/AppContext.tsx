import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { financialService } from '../services/financialService';
import { cadastrosService, getCadastroService } from '../services/cadastrosService';
import { getSupabaseClient } from '../lib/supabase';
import {
  Tenant,
  UserProfile,
  UserRole,
  PlanType,
  Specialty,
  Professional,
  Room,
  Procedure,
  HealthInsurance,
  Patient,
  Appointment,
  PhysicalEvaluation,
  Evolution,
  Prescription,
  PatientConsentTerm,
  Package,
  PatientPackagePurchase,
  Account,
  CostCenter,
  FinancialCategory,
  PaymentMethod,
  FinancialEntry,
  Product,
  ProductCategory,
  UnitOfMeasure,
  Supplier,
  Equipment,
  TechnicalAssistance,
  InternalMessage,
  ChatSettings,
  LicenseKey,
  AuditLog,
  PatientPortalSettings,
  PatientPortalAnnouncement,
  ClinicTask,
  RoomStatus,
  RoomOccupantInfo,
  DashboardWidgetKey,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_SPECIALTIES,
  INITIAL_PROFESSIONALS,
  INITIAL_ROOMS,
  INITIAL_PROCEDURES,
  INITIAL_HEALTH_INSURANCES,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_PHYSICAL_EVALUATIONS,
  INITIAL_EVOLUTIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_CONSENT_TERMS,
  INITIAL_PACKAGES,
  INITIAL_PATIENT_PACKAGES,
  INITIAL_ACCOUNTS,
  INITIAL_COST_CENTERS,
  INITIAL_FINANCIAL_CATEGORIES,
  INITIAL_PAYMENT_METHODS,
  INITIAL_FINANCIAL_ENTRIES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_SUPPLIERS,
  INITIAL_EQUIPMENT,
  INITIAL_TECHNICAL_ASSISTANCE,
  INITIAL_MESSAGES,
  INITIAL_LICENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLINIC_TASKS,
} from '../lib/mockData';
import { SUBSCRIPTION_PLANS, generateLicenseHash, DEFAULT_CHAT_SETTINGS } from '../lib/constants';
import { triggerInternalChatMessageNotification, playNotificationSound } from '../services/notificationService';
import { RoleMenuPermissions, DEFAULT_ROLE_PERMISSIONS } from '../lib/rolePermissions';

export const DEFAULT_DASHBOARD_WIDGETS: Record<DashboardWidgetKey, boolean> = {
  statsCards: true,
  appointmentSummaries: true,
  dailyRevenueStats: true,
  pendingTasks: true,
  mainChart: true,
  roomOccupancy: true,
  alertsSection: true,
};

export const DEFAULT_PATIENT_PORTAL_SETTINGS: PatientPortalSettings = {
  appVersion: '2.4.2',
  releaseNotes: 'Visualização de séries de exercícios com orientações detalhadas, histórico de pagamentos com chave PIX Copia e Cola e confirmação de presença.',
  lastUpdatedDate: new Date().toISOString().split('T')[0],
  allowWhatsAppBooking: true,
  showPrescriptions: true,
  showFinancialHistory: true,
  showPackages: true,
  showPixPayment: true,
  customWelcomeMessage: 'Olá! Acompanhe seus agendamentos, saldo de sessões e exercícios prescritos pelo seu terapeuta.',
  announcements: [
    {
      id: 'ann-1',
      title: 'Lembrete de Hidratação e Postura',
      message: 'Mantenha uma boa postura no trabalho e lembre-se de beber água ao longo do dia para otimizar sua recuperação muscular!',
      type: 'feature',
      date: '2025-05-10',
      active: true,
      authorName: 'Equipe Clínica',
    },
    {
      id: 'ann-2',
      title: 'Horário de Atendimento e Feriado',
      message: 'Informamos que na próxima sexta-feira nosso atendimento ocorrerá normalmente das 07:00 às 20:00.',
      type: 'announcement',
      date: '2025-05-08',
      active: true,
      authorName: 'Recepção',
    },
  ],
};

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'calendar'
  | 'patients'
  | 'medical_records'
  | 'financial'
  | 'cadastros'
  | 'reports'
  | 'chat'
  | 'patient_portal'
  | 'superadmin'
  | 'settings';

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  patientPortalPatientId: string | null;
  setPatientPortalPatientId: (id: string | null) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showLicenseModal: boolean;
  setShowLicenseModal: (show: boolean) => void;

  // Active Tenant & User
  activeTenant: Tenant;
  setActiveTenant: (tenant: Tenant) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;

  // Data Stores (filtered by active tenant)
  specialties: Specialty[];
  professionals: Professional[];
  rooms: Room[];
  procedures: Procedure[];
  healthInsurances: HealthInsurance[];
  patients: Patient[];
  appointments: Appointment[];
  evaluations: PhysicalEvaluation[];
  evolutions: Evolution[];
  prescriptions: Prescription[];
  consentTerms: PatientConsentTerm[];
  packages: Package[];
  patientPackages: PatientPackagePurchase[];
  accounts: Account[];
  costCenters: CostCenter[];
  financialCategories: FinancialCategory[];
  paymentMethods: PaymentMethod[];
  financialEntries: FinancialEntry[];
  products: Product[];
  productCategories: ProductCategory[];
  unitsOfMeasure: UnitOfMeasure[];
  suppliers: Supplier[];
  equipment: Equipment[];
  technicalAssistance: TechnicalAssistance[];
  licenses: LicenseKey[];
  auditLogs: AuditLog[];

  // Mutations
  addPatient: (patient: Omit<Patient, 'id' | 'tenantId' | 'createdAt'>) => { success: boolean; message?: string; patient?: Patient };
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string, hard?: boolean) => void;

  addAppointment: (apt: Omit<Appointment, 'id' | 'tenantId' | 'syncedWithGoogle' | 'whatsappReminderSent'>) => { success: boolean; message?: string; appointment?: Appointment };
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addEvolution: (evo: Omit<Evolution, 'id' | 'tenantId' | 'createdAt'>) => void;
  addEvaluation: (evalData: Omit<PhysicalEvaluation, 'id' | 'tenantId' | 'createdAt'>) => void;
  addPrescription: (presc: Omit<Prescription, 'id' | 'tenantId' | 'createdAt'>) => void;
  addConsentTerm: (term: Omit<PatientConsentTerm, 'id' | 'tenantId' | 'createdAt'>) => void;
  updateConsentTerm: (id: string, data: Partial<PatientConsentTerm>) => void;
  deleteConsentTerm: (id: string) => void;
  revokeConsentTerm: (id: string, reason?: string) => void;

  addFinancialEntry: (entry: Omit<FinancialEntry, 'id' | 'tenantId' | 'status'> & { status?: 'paid' | 'pending' | 'overdue' }) => void;
  updateFinancialEntry: (id: string, data: Partial<FinancialEntry>) => void;
  deleteFinancialEntry: (id: string) => void;

  // Generic Cadastros CRUD
  addGenericItem: (collection: string, item: any) => void;
  updateGenericItem: (collection: string, id: string, data: any) => void;
  deleteGenericItem: (collection: string, id: string, hard?: boolean) => void;

  // Messages
  messages: InternalMessage[];
  chatSettings: ChatSettings;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  sendMessage: (
    content: string,
    recipientId: string,
    options?: {
      recipientRole?: UserRole;
      category?: 'general' | 'patient_arrival' | 'urgent' | 'room_ready' | 'notice';
      patientId?: string;
      patientName?: string;
      attachment?: {
        name: string;
        url: string;
        type: 'image' | 'file';
        size?: string;
      };
    }
  ) => void;
  markMessageAsRead: (messageId: string) => void;
  markAllMessagesAsRead: (recipientId: string) => void;
  clearConversation: (recipientId: string) => void;

  // Trial & Licensing
  activateLicenseKey: (keyString: string) => { success: boolean; message: string; planName?: string };
  generateNewLicense: (tenantId: string, planId: PlanType, durationMonths: number) => LicenseKey;
  createTenantFromCheckout: (clinicData: {
    name: string;
    tradeName: string;
    cnpj: string;
    email: string;
    phone: string;
    planId: PlanType;
    financialManager: boolean;
    additionalProfessionals: number;
  }) => Tenant;

  // Audit
  logAction: (action: string, module: string, details?: string) => void;

  // Plan limits check
  checkPlanLimit: (type: 'patients' | 'appointments' | 'professionals') => { allowed: boolean; current: number; max: number; message?: string };

  // Tenant & Role Permissions & Export
  updateTenantInfo: (changes: Partial<Tenant>) => void;
  updateRolePermissions: (role: UserRole, permissions: Partial<RoleMenuPermissions>) => void;
  resetRolePermissionsToDefault: () => void;
  exportTenantDataJSON: () => void;

  // Patient Portal Updates & Sync
  patientPortalSettings: PatientPortalSettings;
  updatePatientPortalSettings: (settings: Partial<PatientPortalSettings>) => void;
  addPatientAnnouncement: (announcement: Omit<PatientPortalAnnouncement, 'id' | 'date'>) => void;
  deletePatientAnnouncement: (id: string) => void;

  // Clinic Tasks Checklist
  tasks: ClinicTask[];
  toggleClinicTask: (id: string) => void;
  addClinicTask: (task: Omit<ClinicTask, 'id' | 'tenantId' | 'createdAt'>) => void;
  deleteClinicTask: (id: string) => void;

  // Real-time Room & Modality Operations
  updateRoomStatus: (roomId: string, status: RoomStatus, maintenanceNote?: string) => void;
  startRoomSession: (roomId: string, occupant: RoomOccupantInfo) => void;
  freeRoom: (roomId: string, notifyReception?: boolean) => void;

  // Customizable Dashboard Widgets
  dashboardWidgets: Record<DashboardWidgetKey, boolean>;
  updateDashboardWidgets: (widgets: Partial<Record<DashboardWidgetKey, boolean>>) => void;
  resetDashboardWidgets: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (
        viewParam &&
        [
          'landing',
          'dashboard',
          'calendar',
          'medical_records',
          'financial',
          'cadastros',
          'patients',
          'reports',
          'chat',
          'settings',
          'superadmin',
          'patient_portal',
        ].includes(viewParam)
      ) {
        return viewParam as AppView;
      }
    }
    return 'dashboard';
  });
  const [patientPortalPatientId, setPatientPortalPatientId] = useState<string | null>('patient-1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const setCurrentView = (view: AppView) => {
    setCurrentViewState(view);
    setMobileMenuOpen(false); // Auto close mobile drawer on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const newUrl = `${window.location.pathname}?view=${view}`;
      window.history.pushState({ view }, '', newUrl);
    }
  };

  // Multi-Tenant Core State with LocalStorage Persistence
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('cfp_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [activeTenant, setActiveTenantState] = useState<Tenant>(() => {
    const saved = localStorage.getItem('cfp_active_tenant_id');
    const found = INITIAL_TENANTS.find((t) => t.id === saved);
    return found || INITIAL_TENANTS[0];
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cfp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cfp_current_user_id');
    const found = INITIAL_USERS.find((u) => u.id === saved);
    return found || INITIAL_USERS[1]; // default to Dra. Helena (Admin)
  });

  // Fase 2: assim que o login real acontece, o perfil/tenant vindos do
  // Supabase substituem os dados mock acima. Enquanto isso não acontece
  // (usuário deslogado, ou tela pública), o app segue com os dados locais
  // como já funcionava antes — nada foi removido, só complementado.
  const { authProfile, authTenant } = useAuth();
  useEffect(() => {
    if (authTenant) {
      setActiveTenantState(authTenant);
      setTenants((prev) => {
        const exists = prev.some((t) => t.id === authTenant.id);
        return exists ? prev.map((t) => (t.id === authTenant.id ? authTenant : t)) : [authTenant, ...prev];
      });
    }
    if (authProfile) {
      setCurrentUser(authProfile);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === authProfile.id);
        return exists ? prev.map((u) => (u.id === authProfile.id ? authProfile : u)) : [authProfile, ...prev];
      });
    }
  }, [authTenant, authProfile]);

  // Collections
  const [specialties, setSpecialties] = useState<Specialty[]>(() => {
    const saved = localStorage.getItem('cfp_specialties');
    return saved ? JSON.parse(saved) : INITIAL_SPECIALTIES;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('cfp_professionals');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('cfp_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [procedures, setProcedures] = useState<Procedure[]>(() => {
    const saved = localStorage.getItem('cfp_procedures');
    return saved ? JSON.parse(saved) : INITIAL_PROCEDURES;
  });

  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>(() => {
    const saved = localStorage.getItem('cfp_health_insurances');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_INSURANCES;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('cfp_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  // Fase 4 (Pacientes): com sessão real ativa, os pacientes passam a vir do
  // Supabase em vez do mock local. Sem sessão (app público/demo), continua
  // tudo como antes — nada quebra pra quem ainda não logou.
  useEffect(() => {
    if (!authTenant || !getSupabaseClient()) return;
    let active = true;
    patientService
      .list(authTenant.id)
      .then((remote) => {
        if (active) setPatients(remote);
      })
      .catch((err) => console.error('Erro ao carregar pacientes do Supabase:', err));
    return () => {
      active = false;
    };
  }, [authTenant?.id]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('cfp_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Fase 4 (Agenda): mesmo padrão dos Pacientes — com sessão real, os
  // agendamentos passam a vir do Supabase.
  useEffect(() => {
    if (!authTenant || !getSupabaseClient()) return;
    let active = true;
    appointmentService
      .list(authTenant.id)
      .then((remote) => {
        if (active) setAppointments(remote);
      })
      .catch((err) => console.error('Erro ao carregar agendamentos do Supabase:', err));
    return () => {
      active = false;
    };
  }, [authTenant?.id]);

  const [evaluations, setEvaluations] = useState<PhysicalEvaluation[]>(() => {
    const saved = localStorage.getItem('cfp_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_PHYSICAL_EVALUATIONS;
  });

  const [evolutions, setEvolutions] = useState<Evolution[]>(() => {
    const saved = localStorage.getItem('cfp_evolutions');
    return saved ? JSON.parse(saved) : INITIAL_EVOLUTIONS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('cfp_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [consentTerms, setConsentTerms] = useState<PatientConsentTerm[]>(() => {
    const saved = localStorage.getItem('cfp_consent_terms');
    return saved ? JSON.parse(saved) : INITIAL_CONSENT_TERMS;
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem('cfp_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [patientPackages, setPatientPackages] = useState<PatientPackagePurchase[]>(() => {
    const saved = localStorage.getItem('cfp_patient_packages');
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_PACKAGES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('cfp_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    const saved = localStorage.getItem('cfp_cost_centers');
    return saved ? JSON.parse(saved) : INITIAL_COST_CENTERS;
  });

  const [financialCategories, setFinancialCategories] = useState<FinancialCategory[]>(() => {
    const saved = localStorage.getItem('cfp_financial_categories');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_CATEGORIES;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('cfp_payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('cfp_financial_entries');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  // Fase 4 (Financeiro): mesmo padrão dos módulos anteriores — com sessão
  // real, contas, centros de custo, categorias, formas de pagamento e
  // lançamentos passam a vir do Supabase.
  useEffect(() => {
    if (!authTenant || !getSupabaseClient()) return;
    let active = true;
    Promise.all([
      financialService.accounts.list(authTenant.id),
      financialService.costCenters.list(authTenant.id),
      financialService.categories.list(authTenant.id),
      financialService.paymentMethods.list(authTenant.id),
      financialService.listEntries(authTenant.id),
    ])
      .then(([remoteAccounts, remoteCostCenters, remoteCategories, remoteMethods, remoteEntries]) => {
        if (!active) return;
        setAccounts(remoteAccounts);
        setCostCenters(remoteCostCenters);
        setFinancialCategories(remoteCategories);
        setPaymentMethods(remoteMethods);
        setFinancialEntries(remoteEntries);
      })
      .catch((err) => console.error('Erro ao carregar dados financeiros do Supabase:', err));
    return () => {
      active = false;
    };
  }, [authTenant?.id]);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cfp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [productCategories, setProductCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem('cfp_product_categories');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_CATEGORIES;
  });

  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>(() => {
    const saved = localStorage.getItem('cfp_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('cfp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('cfp_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [technicalAssistance, setTechnicalAssistance] = useState<TechnicalAssistance[]>(() => {
    const saved = localStorage.getItem('cfp_technical_assistance');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICAL_ASSISTANCE;
  });

  // Fase 4 (Cadastros gerais): mesmo padrão dos módulos anteriores. Salas
  // ficam de fora daqui (service próprio, fase separada); users/tenants
  // também (dependem de Supabase Auth, não só da tabela).
  useEffect(() => {
    if (!authTenant || !getSupabaseClient()) return;
    let active = true;
    Promise.all([
      cadastrosService.specialties.list(authTenant.id),
      cadastrosService.professionals.list(authTenant.id),
      cadastrosService.procedures.list(authTenant.id),
      cadastrosService.healthInsurances.list(authTenant.id),
      cadastrosService.packages.list(authTenant.id),
      cadastrosService.products.list(authTenant.id),
      cadastrosService.productCategories.list(authTenant.id),
      cadastrosService.unitsOfMeasure.list(authTenant.id),
      cadastrosService.suppliers.list(authTenant.id),
      cadastrosService.equipment.list(authTenant.id),
      cadastrosService.technicalAssistance.list(authTenant.id),
    ])
      .then(
        ([
          remoteSpecialties,
          remoteProfessionals,
          remoteProcedures,
          remoteHealthInsurances,
          remotePackages,
          remoteProducts,
          remoteProductCategories,
          remoteUnitsOfMeasure,
          remoteSuppliers,
          remoteEquipment,
          remoteTechnicalAssistance,
        ]) => {
          if (!active) return;
          setSpecialties(remoteSpecialties);
          setProfessionals(remoteProfessionals);
          setProcedures(remoteProcedures);
          setHealthInsurances(remoteHealthInsurances);
          setPackages(remotePackages);
          setProducts(remoteProducts);
          setProductCategories(remoteProductCategories);
          setUnitsOfMeasure(remoteUnitsOfMeasure);
          setSuppliers(remoteSuppliers);
          setEquipment(remoteEquipment);
          setTechnicalAssistance(remoteTechnicalAssistance);
        }
      )
      .catch((err) => console.error('Erro ao carregar cadastros gerais do Supabase:', err));
    return () => {
      active = false;
    };
  }, [authTenant?.id]);

  const [messages, setMessages] = useState<InternalMessage[]>(() => {
    const saved = localStorage.getItem('cfp_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    try {
      const saved = localStorage.getItem('cfp_chat_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_CHAT_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Error loading chat settings from storage:', e);
    }
    return DEFAULT_CHAT_SETTINGS;
  });

  const [licenses, setLicenses] = useState<LicenseKey[]>(() => {
    const saved = localStorage.getItem('cfp_licenses');
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('cfp_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [tasks, setTasks] = useState<ClinicTask[]>(() => {
    const saved = localStorage.getItem('cfp_tasks');
    return saved ? JSON.parse(saved) : INITIAL_CLINIC_TASKS;
  });

  const [dashboardWidgets, setDashboardWidgetsState] = useState<Record<DashboardWidgetKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cfp_dashboard_widgets');
      if (saved) {
        return { ...DEFAULT_DASHBOARD_WIDGETS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error loading dashboard widgets from storage:', e);
    }
    return DEFAULT_DASHBOARD_WIDGETS;
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('cfp_tenants', JSON.stringify(tenants));
  }, [tenants]);
  useEffect(() => {
    localStorage.setItem('cfp_active_tenant_id', activeTenant.id);
  }, [activeTenant]);
  useEffect(() => {
    localStorage.setItem('cfp_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('cfp_current_user_id', currentUser.id);
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('cfp_rooms', JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem('cfp_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('cfp_dashboard_widgets', JSON.stringify(dashboardWidgets));
  }, [dashboardWidgets]);
  useEffect(() => {
    localStorage.setItem('cfp_procedures', JSON.stringify(procedures));
  }, [procedures]);
  useEffect(() => {
    localStorage.setItem('cfp_health_insurances', JSON.stringify(healthInsurances));
  }, [healthInsurances]);
  useEffect(() => {
    localStorage.setItem('cfp_patients', JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem('cfp_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('cfp_financial_entries', JSON.stringify(financialEntries));
  }, [financialEntries]);
  useEffect(() => {
    localStorage.setItem('cfp_evolutions', JSON.stringify(evolutions));
  }, [evolutions]);
  useEffect(() => {
    localStorage.setItem('cfp_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);
  useEffect(() => {
    localStorage.setItem('cfp_consent_terms', JSON.stringify(consentTerms));
  }, [consentTerms]);
  useEffect(() => {
    localStorage.setItem('cfp_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);
  useEffect(() => {
    localStorage.setItem('cfp_messages', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem('cfp_chat_settings', JSON.stringify(chatSettings));
  }, [chatSettings]);
  useEffect(() => {
    localStorage.setItem('cfp_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('cfp_licenses', JSON.stringify(licenses));
  }, [licenses]);

  const setActiveTenant = (t: Tenant) => {
    setActiveTenantState(t);
    // Find an appropriate user for this tenant
    const matchingUser = users.find((u) => u.tenantId === t.id && (u.role === 'admin' || u.role === 'professional'));
    if (matchingUser && currentUser.role !== 'superadmin') {
      setCurrentUser(matchingUser);
    }
    logAction('TENANT_SWITCH', 'Multi-Tenant', `Alternou para clínica: ${t.name}`);
  };

  const logAction = (action: string, module: string, details?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: activeTenant?.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      ipAddress: '189.40.12.85',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Web App' : 'Desktop Browser',
      details,
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Plan Limit Checker
  const checkPlanLimit = (type: 'patients' | 'appointments' | 'professionals') => {
    const plan = SUBSCRIPTION_PLANS[activeTenant.planId] || SUBSCRIPTION_PLANS.profissional;
    const isSuperAdmin = currentUser.role === 'superadmin';
    if (isSuperAdmin) {
      return { allowed: true, current: 0, max: 999999 };
    }

    if (type === 'patients') {
      const activePatientsCount = patients.filter((p) => p.tenantId === activeTenant.id && !p.deletedAt).length;
      const max = plan.maxPatients;
      const allowed = activePatientsCount < max;
      return {
        allowed,
        current: activePatientsCount,
        max,
        message: allowed ? undefined : `Limite de ${max} pacientes atingido para o ${plan.name}. Faça upgrade para continuar cadastrando.`,
      };
    }

    if (type === 'professionals') {
      const activeProfsCount = professionals.filter((p) => p.tenantId === activeTenant.id && !p.deletedAt).length;
      const max = plan.maxProfessionals + (activeTenant.additionalProfessionalsCount || 0);
      const allowed = activeProfsCount < max;
      return {
        allowed,
        current: activeProfsCount,
        max,
        message: allowed ? undefined : `Limite de ${max} profissionais atingido para sua assinatura. Adicione slots de profissionais ou faça upgrade.`,
      };
    }

    if (type === 'appointments') {
      const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const monthApts = appointments.filter((a) => a.tenantId === activeTenant.id && a.date.startsWith(thisMonth) && !a.deletedAt).length;
      const max = plan.maxMonthlyAppointments;
      const allowed = monthApts < max;
      return {
        allowed,
        current: monthApts,
        max,
        message: allowed ? undefined : `Limite de ${max} atendimentos mensais atingido para o ${plan.name}. Faça upgrade para desbloquear mais atendimentos.`,
      };
    }

    return { allowed: true, current: 0, max: 999999 };
  };

  // Patient Actions
  const addPatient = (patientData: Omit<Patient, 'id' | 'tenantId' | 'createdAt'>) => {
    const check = checkPlanLimit('patients');
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    const tempId = `patient-${Date.now()}`;
    const newPatient: Patient = {
      ...patientData,
      id: tempId,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };

    // Otimista: aparece na tela na hora. Se houver sessão real, persiste no
    // Supabase em seguida e troca o id temporário pelo id real do banco.
    setPatients((prev) => [newPatient, ...prev]);
    logAction('PATIENT_CREATED', 'Pacientes', `Cadastrou paciente ${newPatient.name}`);

    if (authTenant && getSupabaseClient()) {
      patientService
        .create(authTenant.id, patientData)
        .then((saved) => {
          setPatients((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
        })
        .catch((err) => {
          console.error('Erro ao salvar paciente no Supabase:', err);
          setPatients((prev) => prev.filter((p) => p.id !== tempId));
          logAction('PATIENT_SYNC_ERROR', 'Pacientes', `Falha ao sincronizar paciente ${newPatient.name}: ${err.message}`);
        });
    }

    return { success: true, patient: newPatient };
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    logAction('PATIENT_UPDATED', 'Pacientes', `Atualizou dados do paciente ID ${id}`);

    // Só tenta persistir se o id já é um UUID real do banco (não um id
    // temporário aguardando a confirmação do addPatient acima).
    if (authTenant && getSupabaseClient() && !id.startsWith('patient-')) {
      patientService
        .update(id, data)
        .catch((err) => {
          console.error('Erro ao atualizar paciente no Supabase:', err);
          logAction('PATIENT_SYNC_ERROR', 'Pacientes', `Falha ao sincronizar atualização do paciente ID ${id}: ${err.message}`);
        });
    }
  };

  const deletePatient = (id: string, hard = false) => {
    if (hard) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } else {
      setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, deletedAt: new Date().toISOString() } : p)));
    }
    logAction('PATIENT_DELETED', 'Pacientes', `Excluiu paciente ID ${id} (${hard ? 'Definitivo' : 'Soft Delete'})`);

    if (authTenant && getSupabaseClient() && !id.startsWith('patient-')) {
      patientService
        .remove(id, { hard })
        .catch((err) => {
          console.error('Erro ao remover paciente no Supabase:', err);
          logAction('PATIENT_SYNC_ERROR', 'Pacientes', `Falha ao sincronizar exclusão do paciente ID ${id}: ${err.message}`);
        });
    }
  };

  // Appointment Actions
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tenantId' | 'syncedWithGoogle' | 'whatsappReminderSent'>) => {
    const check = checkPlanLimit('appointments');
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    const tempId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...aptData,
      id: tempId,
      tenantId: activeTenant.id,
      syncedWithGoogle: true,
      whatsappReminderSent: false,
    };

    setAppointments((prev) => [newApt, ...prev]);

    // If price > 0, also create a financial entry (permanece local — o
    // módulo Financeiro ainda não foi migrado nesta fase).
    let tempFinId: string | null = null;
    if (newApt.price && newApt.price > 0) {
      tempFinId = `fin-${Date.now()}`;
      const newFinEntry: FinancialEntry = {
        id: tempFinId,
        tenantId: activeTenant.id,
        type: 'income',
        description: `Sessão: ${newApt.procedureName} - ${newApt.patientName}`,
        amount: newApt.price,
        dueDate: newApt.date,
        paymentDate: newApt.status === 'completed' ? newApt.date : undefined,
        status: newApt.status === 'completed' ? 'paid' : 'pending',
        accountId: accounts[0]?.id || 'acc-1',
        accountName: accounts[0]?.name || 'Banco Itaú',
        categoryId: financialCategories[0]?.id || 'cat-1',
        categoryName: financialCategories[0]?.name || 'Receita de Atendimentos',
        costCenterId: costCenters[0]?.id || 'cc-1',
        costCenterName: costCenters[0]?.name || 'Atendimento Clínico',
        paymentMethodId: paymentMethods[0]?.id || 'pm-1',
        paymentMethodName: paymentMethods[0]?.name || 'PIX',
        patientId: newApt.patientId,
        patientName: newApt.patientName,
        professionalId: newApt.professionalId,
        professionalName: newApt.professionalName,
        appointmentId: newApt.id,
      };
      setFinancialEntries((prev) => [newFinEntry, ...prev]);
    }

    logAction('APPOINTMENT_CREATED', 'Agendamentos', `Novo agendamento: ${newApt.patientName} com ${newApt.professionalName} em ${newApt.date} ${newApt.startTime}`);

    if (authTenant && getSupabaseClient()) {
      appointmentService
        .create(authTenant.id, aptData)
        .then((saved) => {
          setAppointments((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
          if (tempFinId) {
            setFinancialEntries((prev) => prev.map((f) => (f.id === tempFinId ? { ...f, appointmentId: saved.id } : f)));
          }
        })
        .catch((err) => {
          console.error('Erro ao salvar agendamento no Supabase:', err);
          setAppointments((prev) => prev.filter((a) => a.id !== tempId));
          if (tempFinId) setFinancialEntries((prev) => prev.filter((f) => f.id !== tempFinId));
          logAction(
            'APPOINTMENT_SYNC_ERROR',
            'Agendamentos',
            `Falha ao sincronizar agendamento de ${newApt.patientName}: ${err.message} — o horário foi removido da tela, pode haver conflito real com outro agendamento.`
          );
        });
    }

    return { success: true, appointment: newApt };
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    logAction('APPOINTMENT_UPDATED', 'Agendamentos', `Atualizou agendamento ID ${id}`);

    if (authTenant && getSupabaseClient() && !id.startsWith('apt-')) {
      appointmentService.update(id, data).catch((err) => {
        console.error('Erro ao atualizar agendamento no Supabase:', err);
        logAction('APPOINTMENT_SYNC_ERROR', 'Agendamentos', `Falha ao sincronizar atualização do agendamento ID ${id}: ${err.message}`);
      });
    }
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    logAction('APPOINTMENT_DELETED', 'Agendamentos', `Cancelou/removeu agendamento ID ${id}`);

    if (authTenant && getSupabaseClient() && !id.startsWith('apt-')) {
      appointmentService.remove(id, { hard: true }).catch((err) => {
        console.error('Erro ao remover agendamento no Supabase:', err);
        logAction('APPOINTMENT_SYNC_ERROR', 'Agendamentos', `Falha ao sincronizar exclusão do agendamento ID ${id}: ${err.message}`);
      });
    }
  };

  // Clinical Actions
  const addEvolution = (evoData: Omit<Evolution, 'id' | 'tenantId' | 'createdAt'>) => {
    const newEvo: Evolution = {
      ...evoData,
      id: `evo-${Date.now()}`,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };
    setEvolutions((prev) => [newEvo, ...prev]);
    logAction('EVOLUTION_CREATED', 'Prontuário Eletrônico', `Evolução clínica assinada para paciente ID ${evoData.patientId}`);
  };

  const addEvaluation = (evalData: Omit<PhysicalEvaluation, 'id' | 'tenantId' | 'createdAt'>) => {
    const newEval: PhysicalEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };
    setEvaluations((prev) => [newEval, ...prev]);
    logAction('EVALUATION_CREATED', 'Prontuário Eletrônico', `Avaliação física salva (${evalData.category})`);
  };

  const addPrescription = (prescData: Omit<Prescription, 'id' | 'tenantId' | 'createdAt'>) => {
    const newPresc: Prescription = {
      ...prescData,
      id: `presc-${Date.now()}`,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };
    setPrescriptions((prev) => [newPresc, ...prev]);
    logAction('PRESCRIPTION_CREATED', 'Receituário', `Prescrição emitida para ${prescData.patientName}`);
  };

  const addConsentTerm = (termData: Omit<PatientConsentTerm, 'id' | 'tenantId' | 'createdAt'>) => {
    const newTerm: PatientConsentTerm = {
      ...termData,
      id: `tcle-${Date.now()}`,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };
    setConsentTerms((prev) => [newTerm, ...prev]);
    logAction('CONSENT_TERM_SIGNED', 'Prontuário / TCLE', `Termo de Consentimento assinado digitalmente por ${termData.patientName} (${termData.title})`);
  };

  const updateConsentTerm = (id: string, data: Partial<PatientConsentTerm>) => {
    setConsentTerms((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    logAction('CONSENT_TERM_UPDATED', 'Prontuário / TCLE', `Termo de Consentimento ID ${id} atualizado`);
  };

  const deleteConsentTerm = (id: string) => {
    setConsentTerms((prev) => prev.filter((t) => t.id !== id));
    logAction('CONSENT_TERM_DELETED', 'Prontuário / TCLE', `Termo de Consentimento ID ${id} excluído`);
  };

  const revokeConsentTerm = (id: string, reason = 'Revogado a pedido do paciente') => {
    setConsentTerms((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'revoked' as const,
              revokedAt: new Date().toISOString(),
              revokeReason: reason,
            }
          : t
      )
    );
    logAction('CONSENT_TERM_REVOKED', 'Prontuário / TCLE', `Termo de Consentimento ID ${id} revogado: ${reason}`);
  };

  // Financial Actions
  const addFinancialEntry = (entryData: Omit<FinancialEntry, 'id' | 'tenantId' | 'status'> & { status?: 'paid' | 'pending' | 'overdue' }) => {
    const tempId = `fin-${Date.now()}`;
    const newEntry: FinancialEntry = {
      ...entryData,
      id: tempId,
      tenantId: activeTenant.id,
      status: entryData.status || 'pending',
    };
    setFinancialEntries((prev) => [newEntry, ...prev]);
    logAction('FINANCIAL_ENTRY_CREATED', 'Gestor Financeiro', `Lançamento ${newEntry.type === 'income' ? 'Receita' : 'Despesa'}: ${newEntry.description} (R$ ${newEntry.amount.toFixed(2)})`);

    if (authTenant && getSupabaseClient()) {
      financialService
        .createEntry(authTenant.id, entryData as Partial<FinancialEntry>)
        .then((saved) => {
          setFinancialEntries((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
        })
        .catch((err) => {
          console.error('Erro ao salvar lançamento financeiro no Supabase:', err);
          setFinancialEntries((prev) => prev.filter((e) => e.id !== tempId));
          logAction('FINANCIAL_SYNC_ERROR', 'Gestor Financeiro', `Falha ao sincronizar lançamento ${newEntry.description}: ${err.message}`);
        });
    }
  };

  const updateFinancialEntry = (id: string, data: Partial<FinancialEntry>) => {
    setFinancialEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    logAction('FINANCIAL_ENTRY_UPDATED', 'Gestor Financeiro', `Atualizou lançamento financeiro ID ${id}`);

    if (authTenant && getSupabaseClient() && !id.startsWith('fin-')) {
      financialService.updateEntry(id, data).catch((err) => {
        console.error('Erro ao atualizar lançamento financeiro no Supabase:', err);
        logAction('FINANCIAL_SYNC_ERROR', 'Gestor Financeiro', `Falha ao sincronizar atualização do lançamento ID ${id}: ${err.message}`);
      });
    }
  };

  const deleteFinancialEntry = (id: string) => {
    setFinancialEntries((prev) => prev.filter((e) => e.id !== id));
    logAction('FINANCIAL_ENTRY_DELETED', 'Gestor Financeiro', `Excluiu lançamento financeiro ID ${id}`);

    if (authTenant && getSupabaseClient() && !id.startsWith('fin-')) {
      financialService.removeEntry(id, { hard: true }).catch((err) => {
        console.error('Erro ao remover lançamento financeiro no Supabase:', err);
        logAction('FINANCIAL_SYNC_ERROR', 'Gestor Financeiro', `Falha ao sincronizar exclusão do lançamento ID ${id}: ${err.message}`);
      });
    }
  };

  /**
   * Resolve o service real (Supabase) por trás de uma coleção de cadastro,
   * cobrindo tanto as 4 financeiras quanto as 11 de "Cadastros gerais".
   * Retorna null para coleções ainda não migradas (rooms tem service
   * próprio/fase separada; users/tenants dependem de Supabase Auth).
   */
  const getPersistedCadastroService = (collection: string) => getFinancialCadastroService(collection) || getCadastroService(collection);

  const getFinancialCadastroService = (collection: string) => {
    switch (collection) {
      case 'accounts':
        return financialService.accounts;
      case 'costCenters':
        return financialService.costCenters;
      case 'financialCategories':
        return financialService.categories;
      case 'paymentMethods':
        return financialService.paymentMethods;
      default:
        return null;
    }
  };

  /** Setter de estado do React para cada coleção com backend real (as mesmas 15 do resolvedor acima). */
  const CADASTRO_SETTER_MAP: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
    accounts: setAccounts,
    costCenters: setCostCenters,
    financialCategories: setFinancialCategories,
    paymentMethods: setPaymentMethods,
    specialties: setSpecialties,
    professionals: setProfessionals,
    procedures: setProcedures,
    healthInsurances: setHealthInsurances,
    packages: setPackages,
    products: setProducts,
    productCategories: setProductCategories,
    unitsOfMeasure: setUnitsOfMeasure,
    suppliers: setSuppliers,
    equipment: setEquipment,
    technicalAssistance: setTechnicalAssistance,
  };

  // Generic Cadastros
  const addGenericItem = (collection: string, item: any) => {
    const newItem = { ...item, id: `${collection.slice(0, 3)}-${Date.now()}`, tenantId: activeTenant.id };
    switch (collection) {
      case 'specialties':
        setSpecialties((prev) => [...prev, newItem]);
        break;
      case 'professionals':
        setProfessionals((prev) => [...prev, newItem]);
        break;
      case 'rooms':
        setRooms((prev) => [...prev, newItem]);
        break;
      case 'procedures':
        setProcedures((prev) => [...prev, newItem]);
        break;
      case 'healthInsurances':
        setHealthInsurances((prev) => [...prev, newItem]);
        break;
      case 'packages':
        setPackages((prev) => [...prev, newItem]);
        break;
      case 'accounts':
        setAccounts((prev) => [...prev, newItem]);
        break;
      case 'costCenters':
        setCostCenters((prev) => [...prev, newItem]);
        break;
      case 'financialCategories':
        setFinancialCategories((prev) => [...prev, newItem]);
        break;
      case 'paymentMethods':
        setPaymentMethods((prev) => [...prev, newItem]);
        break;
      case 'products':
        setProducts((prev) => [...prev, newItem]);
        break;
      case 'productCategories':
        setProductCategories((prev) => [...prev, newItem]);
        break;
      case 'unitsOfMeasure':
        setUnitsOfMeasure((prev) => [...prev, newItem]);
        break;
      case 'suppliers':
        setSuppliers((prev) => [...prev, newItem]);
        break;
      case 'equipment':
        setEquipment((prev) => [...prev, newItem]);
        break;
      case 'technicalAssistance':
        setTechnicalAssistance((prev) => [...prev, newItem]);
        break;
      case 'users':
        setUsers((prev) => [...prev, newItem]);
        break;
    }
    logAction('CADASTRO_CREATED', collection, `Novo item criado em ${collection}`);

    // Das ~19 coleções acima, 15 já têm backend real nesta fase (financeiras
    // + cadastros gerais) — rooms/users/tenants continuam à parte (ver nota
    // no resolvedor acima).
    const persistedSvc = getPersistedCadastroService(collection);
    if (persistedSvc && authTenant && getSupabaseClient()) {
      const setter = CADASTRO_SETTER_MAP[collection];
      persistedSvc
        .create(authTenant.id, item)
        .then((saved: any) => {
          setter((prev: any[]) => prev.map((i) => (i.id === newItem.id ? saved : i)));
        })
        .catch((err: Error) => {
          console.error(`Erro ao salvar ${collection} no Supabase:`, err);
          setter((prev: any[]) => prev.filter((i) => i.id !== newItem.id));
          logAction('CADASTRO_SYNC_ERROR', collection, `Falha ao sincronizar novo item em ${collection}: ${err.message}`);
        });
    }
  };

  const updateGenericItem = (collection: string, id: string, data: any) => {
    const updateFn = (arr: any[]) => arr.map((item) => (item.id === id ? { ...item, ...data } : item));
    switch (collection) {
      case 'specialties':
        setSpecialties(updateFn);
        break;
      case 'professionals':
        setProfessionals(updateFn);
        break;
      case 'rooms':
        setRooms(updateFn);
        break;
      case 'procedures':
        setProcedures(updateFn);
        break;
      case 'healthInsurances':
        setHealthInsurances(updateFn);
        break;
      case 'packages':
        setPackages(updateFn);
        break;
      case 'accounts':
        setAccounts(updateFn);
        break;
      case 'costCenters':
        setCostCenters(updateFn);
        break;
      case 'financialCategories':
        setFinancialCategories(updateFn);
        break;
      case 'paymentMethods':
        setPaymentMethods(updateFn);
        break;
      case 'products':
        setProducts(updateFn);
        break;
      case 'productCategories':
        setProductCategories(updateFn);
        break;
      case 'unitsOfMeasure':
        setUnitsOfMeasure(updateFn);
        break;
      case 'suppliers':
        setSuppliers(updateFn);
        break;
      case 'equipment':
        setEquipment(updateFn);
        break;
      case 'technicalAssistance':
        setTechnicalAssistance(updateFn);
        break;
      case 'users':
        setUsers(updateFn);
        break;
      case 'tenants':
        setTenants(updateFn);
        if (activeTenant.id === id) {
          setActiveTenantState((prev) => ({ ...prev, ...data }));
        }
        break;
    }
    logAction('CADASTRO_UPDATED', collection, `Item ${id} atualizado em ${collection}`);

    const persistedSvc = getPersistedCadastroService(collection);
    if (persistedSvc && authTenant && getSupabaseClient() && !id.startsWith(`${collection.slice(0, 3)}-`)) {
      persistedSvc.update(id, data).catch((err: Error) => {
        console.error(`Erro ao atualizar ${collection} no Supabase:`, err);
        logAction('CADASTRO_SYNC_ERROR', collection, `Falha ao sincronizar atualização em ${collection} ID ${id}: ${err.message}`);
      });
    }
  };

  const deleteGenericItem = (collection: string, id: string, hard = false) => {
    const deleteFn = (arr: any[]) =>
      hard
        ? arr.filter((item) => item.id !== id)
        : arr.map((item) => (item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item));

    switch (collection) {
      case 'specialties':
        setSpecialties(deleteFn);
        break;
      case 'professionals':
        setProfessionals(deleteFn);
        break;
      case 'rooms':
        setRooms(deleteFn);
        break;
      case 'procedures':
        setProcedures(deleteFn);
        break;
      case 'healthInsurances':
        setHealthInsurances(deleteFn);
        break;
      case 'packages':
        setPackages(deleteFn);
        break;
      case 'accounts':
        setAccounts(deleteFn);
        break;
      case 'costCenters':
        setCostCenters(deleteFn);
        break;
      case 'financialCategories':
        setFinancialCategories(deleteFn);
        break;
      case 'paymentMethods':
        setPaymentMethods(deleteFn);
        break;
      case 'products':
        setProducts(deleteFn);
        break;
      case 'productCategories':
        setProductCategories(deleteFn);
        break;
      case 'unitsOfMeasure':
        setUnitsOfMeasure(deleteFn);
        break;
      case 'suppliers':
        setSuppliers(deleteFn);
        break;
      case 'equipment':
        setEquipment(deleteFn);
        break;
      case 'technicalAssistance':
        setTechnicalAssistance(deleteFn);
        break;
      case 'users':
        setUsers(deleteFn);
        break;
    }
    logAction('CADASTRO_DELETED', collection, `Item ${id} excluído em ${collection}`);

    const persistedSvc = getPersistedCadastroService(collection);
    if (persistedSvc && authTenant && getSupabaseClient() && !id.startsWith(`${collection.slice(0, 3)}-`)) {
      persistedSvc.remove(id, { hard }).catch((err: Error) => {
        console.error(`Erro ao remover ${collection} no Supabase:`, err);
        logAction('CADASTRO_SYNC_ERROR', collection, `Falha ao sincronizar exclusão em ${collection} ID ${id}: ${err.message}`);
      });
    }
  };

  // Internal Messaging
  const updateChatSettings = (newSettings: Partial<ChatSettings>) => {
    setChatSettings((prev) => ({ ...(prev || DEFAULT_CHAT_SETTINGS), ...newSettings }));
    logAction('CHAT_SETTINGS_UPDATED', 'Mensagens Internas', 'Configurações de mensagens internas atualizadas');
  };

  const sendMessage = (
    content: string,
    recipientId: string,
    options?: {
      recipientRole?: UserRole;
      category?: 'general' | 'patient_arrival' | 'urgent' | 'room_ready' | 'notice';
      patientId?: string;
      patientName?: string;
      attachment?: {
        name: string;
        url: string;
        type: 'image' | 'file';
        size?: string;
      };
    }
  ) => {
    const newMsg: InternalMessage = {
      id: `msg-${Date.now()}`,
      tenantId: currentUser.role === 'superadmin' && recipientId === 'all' ? undefined : activeTenant.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId,
      recipientRole: options?.recipientRole,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      category: options?.category || 'general',
      patientId: options?.patientId,
      patientName: options?.patientName,
      attachment: options?.attachment,
    };

    setMessages((prev) => [...prev, newMsg]);
    logAction('MESSAGE_SENT', 'Mensagens Internas', `Mensagem enviada para ${recipientId} (${options?.category || 'geral'})`);

    // Audio Chime if enabled
    if (chatSettings?.soundEnabled) {
      playNotificationSound();
    }

    // Dispatch PWA Web Push Notification if recipient is not sender
    if (chatSettings?.pushEnabled && recipientId !== currentUser.id) {
      const recipientUser = users.find((u) => u.id === recipientId);
      triggerInternalChatMessageNotification({
        senderName: currentUser.name,
        senderRole: currentUser.role === 'admin' ? 'Administração' : currentUser.role === 'secretary' ? 'Recepção' : 'Profissional',
        recipientName: recipientUser?.name,
        preview: content.length > 90 ? `${content.substring(0, 90)}...` : content,
        isBroadcast: recipientId === 'all',
        category: options?.category,
      }).catch(console.warn);
    }
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };

  const markAllMessagesAsRead = (recipientId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (recipientId === 'all') {
          if (m.recipientId === 'all') return { ...m, read: true };
        } else {
          if (m.senderId === recipientId && (m.recipientId === currentUser.id || m.recipientId === 'all')) {
            return { ...m, read: true };
          }
        }
        return m;
      })
    );
  };

  const clearConversation = (recipientId: string) => {
    setMessages((prev) =>
      prev.filter((m) => {
        if (recipientId === 'all') {
          return m.recipientId !== 'all';
        }
        const isBetween =
          (m.senderId === currentUser.id && m.recipientId === recipientId) ||
          (m.senderId === recipientId && m.recipientId === currentUser.id);
        return !isBetween;
      })
    );
    logAction('CONVERSATION_CLEARED', 'Mensagens Internas', `Histórico de conversa com ${recipientId} limpo`);
  };

  // Licensing Engine
  const activateLicenseKey = (keyString: string) => {
    const trimmed = keyString.trim().toUpperCase();
    const foundLicense = licenses.find((l) => l.key.toUpperCase() === trimmed && l.active);

    if (!foundLicense && !trimmed.startsWith('CFP-')) {
      return { success: false, message: 'Chave de ativação inválida ou com formato incorreto. Formato esperado: CFP-XXX-XXXX-XXXX' };
    }

    // Determine target plan from license or prefix
    let targetPlan: PlanType = 'equipe';
    if (trimmed.includes('PRO') || trimmed.includes('PROF')) targetPlan = 'profissional';
    if (trimmed.includes('CLI')) targetPlan = 'clinica';
    if (foundLicense) targetPlan = foundLicense.planId;

    const planData = SUBSCRIPTION_PLANS[targetPlan];
    const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const updatedTenant: Tenant = {
      ...activeTenant,
      planId: targetPlan,
      subscriptionStatus: 'active',
      isTrialActive: false,
      trialEndsAt: newExpiry,
      licenseKey: trimmed,
      financialManagerActive: targetPlan === 'clinica' || activeTenant.financialManagerActive,
    };

    setTenants((prev) => prev.map((t) => (t.id === activeTenant.id ? updatedTenant : t)));
    setActiveTenantState(updatedTenant);

    logAction('LICENSE_ACTIVATED', 'Licenciamento', `Licença ativada: ${trimmed} -> Plano ${planData.name}`);
    return { success: true, message: `Plano ${planData.name} ativado com sucesso por 12 meses!`, planName: planData.name };
  };

  const generateNewLicense = (tenantId: string, planId: PlanType, durationMonths: number): LicenseKey => {
    const tenantObj = tenants.find((t) => t.id === tenantId) || activeTenant;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + durationMonths);

    const hash = generateLicenseHash(tenantId, planId, expiry.toISOString());
    const newKey: LicenseKey = {
      id: `lic-${Date.now()}`,
      key: hash,
      tenantId,
      tenantName: tenantObj.name,
      planId,
      startDate: now.toISOString().split('T')[0],
      expirationDate: expiry.toISOString().split('T')[0],
      active: true,
      generatedBy: currentUser.name,
      hash: `sha256_${Date.now()}_${hash}`,
    };

    setLicenses((prev) => [newKey, ...prev]);
    logAction('LICENSE_GENERATED', 'SuperAdmin', `Nova chave de licença gerada: ${hash} para ${tenantObj.name}`);
    return newKey;
  };

  const createTenantFromCheckout = (clinicData: {
    name: string;
    tradeName: string;
    cnpj: string;
    email: string;
    phone: string;
    planId: PlanType;
    financialManager: boolean;
    additionalProfessionals: number;
  }): Tenant => {
    const slug = clinicData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const newTenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: newTenantId,
      name: clinicData.name,
      tradeName: clinicData.tradeName || clinicData.name,
      cnpj: clinicData.cnpj,
      email: clinicData.email,
      phone: clinicData.phone,
      address: 'Endereço a configurar',
      city: 'São Paulo',
      state: 'SP',
      slug,
      primaryColor: '#0d9488',
      planId: clinicData.planId,
      financialManagerActive: clinicData.financialManager || clinicData.planId === 'clinica',
      additionalProfessionalsCount: clinicData.additionalProfessionals || 0,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isTrialActive: true,
      subscriptionStatus: 'trial',
      welcomeMessage: `Bem-vindo(a) à ${clinicData.name}!`,
      createdAt: new Date().toISOString(),
    };

    const newAdminUser: UserProfile = {
      id: `user-admin-${Date.now()}`,
      tenantId: newTenantId,
      name: `Gestor(a) - ${clinicData.name}`,
      email: clinicData.email,
      role: 'admin',
      phone: clinicData.phone,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setTenants((prev) => [...prev, newTenant]);
    setUsers((prev) => [...prev, newAdminUser]);
    setActiveTenantState(newTenant);
    setCurrentUser(newAdminUser);
    setCurrentView('dashboard');

    logAction('TENANT_CREATED_CHECKOUT', 'Assinatura', `Nova clínica criada via checkout: ${newTenant.name}`);
    return newTenant;
  };

  const updateTenantInfo = (changes: Partial<Tenant>) => {
    setActiveTenantState((prev) => {
      const updated = { ...prev, ...changes };
      return updated;
    });

    setTenants((prev) => {
      const updatedList = prev.map((t) => (t.id === activeTenant.id ? { ...t, ...changes } : t));
      localStorage.setItem('cfp_tenants', JSON.stringify(updatedList));
      return updatedList;
    });

    logAction('TENANT_INFO_UPDATED', 'Configurações', `Dados da clínica atualizados: ${Object.keys(changes).join(', ')}`);
  };

  const updateRolePermissions = (role: UserRole, permissions: Partial<RoleMenuPermissions>) => {
    setActiveTenantState((prev) => {
      const currentRolePerms = prev.rolePermissions || {};
      const updatedForRole = {
        ...(currentRolePerms[role] || DEFAULT_ROLE_PERMISSIONS[role]),
        ...permissions,
      };
      const updatedRolePermissions = {
        ...currentRolePerms,
        [role]: updatedForRole,
      };
      const updatedTenant = {
        ...prev,
        rolePermissions: updatedRolePermissions,
      };

      setTenants((allTenants) => {
        const list = allTenants.map((t) => (t.id === prev.id ? updatedTenant : t));
        localStorage.setItem('cfp_tenants', JSON.stringify(list));
        return list;
      });

      return updatedTenant;
    });

    logAction('ROLE_PERMISSIONS_UPDATED', 'Controle de Acesso', `Permissões do perfil ${role} atualizadas`);
  };

  const resetRolePermissionsToDefault = () => {
    setActiveTenantState((prev) => {
      const updatedTenant = {
        ...prev,
        rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      };
      setTenants((allTenants) => {
        const list = allTenants.map((t) => (t.id === prev.id ? updatedTenant : t));
        localStorage.setItem('cfp_tenants', JSON.stringify(list));
        return list;
      });
      return updatedTenant;
    });
    logAction('ROLE_PERMISSIONS_RESET', 'Controle de Acesso', 'Permissões de todos os perfis restauradas para o padrão');
  };

  const exportTenantDataJSON = () => {
    const data = {
      tenant: activeTenant,
      patients: patients.filter(tenantFilter),
      appointments: appointments.filter(tenantFilter),
      evolutions: evolutions.filter(tenantFilter),
      evaluations: evaluations.filter(tenantFilter),
      prescriptions: prescriptions.filter(tenantFilter),
      financialEntries: financialEntries.filter(tenantFilter),
      specialties: specialties.filter(tenantFilter),
      professionals: professionals.filter(tenantFilter),
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${activeTenant.slug || 'clinica'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAction('BACKUP_DOWNLOADED', 'Configurações', 'Backup JSON da clínica baixado com sucesso');
  };

  // Patient Portal Settings & Announcements Logic
  const patientPortalSettings: PatientPortalSettings = activeTenant.patientPortalSettings || DEFAULT_PATIENT_PORTAL_SETTINGS;

  const updatePatientPortalSettings = (settings: Partial<PatientPortalSettings>) => {
    const current = activeTenant.patientPortalSettings || DEFAULT_PATIENT_PORTAL_SETTINGS;
    const updated: PatientPortalSettings = {
      ...current,
      ...settings,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    };
    updateTenantInfo({ patientPortalSettings: updated });
    logAction('PATIENT_PORTAL_UPDATED', 'App do Paciente', `Configurações do PWA atualizadas (Versão ${updated.appVersion})`);
  };

  const addPatientAnnouncement = (ann: Omit<PatientPortalAnnouncement, 'id' | 'date'>) => {
    const current = activeTenant.patientPortalSettings || DEFAULT_PATIENT_PORTAL_SETTINGS;
    const newAnn: PatientPortalAnnouncement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated: PatientPortalSettings = {
      ...current,
      announcements: [newAnn, ...(current.announcements || [])],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    };
    updateTenantInfo({ patientPortalSettings: updated });
    logAction('PATIENT_ANNOUNCEMENT_PUBLISHED', 'App do Paciente', `Novo comunicado transmitido aos pacientes: "${ann.title}"`);
  };

  const deletePatientAnnouncement = (id: string) => {
    const current = activeTenant.patientPortalSettings || DEFAULT_PATIENT_PORTAL_SETTINGS;
    const updated: PatientPortalSettings = {
      ...current,
      announcements: (current.announcements || []).filter((a) => a.id !== id),
    };
    updateTenantInfo({ patientPortalSettings: updated });
    logAction('PATIENT_ANNOUNCEMENT_DELETED', 'App do Paciente', `Comunicado removido do Portal do Paciente`);
  };

  // Real-time Room & Modality Operations
  const updateRoomStatus = (roomId: string, status: RoomStatus, maintenanceNote?: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const updated: Room = {
          ...r,
          status,
          inMaintenance: status === 'maintenance',
          maintenanceNote: maintenanceNote !== undefined ? maintenanceNote : r.maintenanceNote,
          currentOccupant: status === 'available' || status === 'cleaning' || status === 'maintenance' ? undefined : r.currentOccupant,
        };
        return updated;
      })
    );
    const targetRoom = rooms.find((r) => r.id === roomId);
    const roomName = targetRoom?.name || 'Sala';
    const statusLabels: Record<RoomStatus, string> = {
      available: 'Disponível',
      in_use: 'Em Atendimento',
      cleaning: 'Em Higienização',
      maintenance: 'Em Manutenção',
      reserved: 'Reservada',
    };
    logAction('ROOM_STATUS_CHANGED', 'Gestão de Salas', `${roomName} alterada para status "${statusLabels[status]}"`);
  };

  const startRoomSession = (roomId: string, occupant: RoomOccupantInfo) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          status: 'in_use',
          inMaintenance: false,
          currentOccupant: {
            ...occupant,
            startedAt: occupant.startedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        };
      })
    );
    const targetRoom = rooms.find((r) => r.id === roomId);
    logAction('ROOM_SESSION_STARTED', 'Gestão de Salas', `Atendimento iniciado em ${targetRoom?.name || 'Sala'}: ${occupant.patientName || 'Paciente'} com ${occupant.professionalName || 'Terapeuta'}`);
  };

  const freeRoom = (roomId: string, notifyReception = true) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    const previousPatient = targetRoom?.currentOccupant?.patientName;
    const previousProf = targetRoom?.currentOccupant?.professionalName;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          status: 'available',
          currentOccupant: undefined,
        };
      })
    );

    logAction('ROOM_FREED', 'Gestão de Salas', `${targetRoom?.name || 'Sala'} liberada`);

    if (notifyReception && targetRoom) {
      sendMessage(
        `✅ Sala liberada: **${targetRoom.name}** está disponível para o próximo atendimento.${previousPatient ? ` (Atendimento anterior de ${previousPatient} finalizado por ${previousProf || 'Especialista'})` : ''}`,
        'all',
        {
          category: 'room_ready',
        }
      );
    }
  };

  // Clinic Tasks Operations
  const toggleClinicTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextState = !t.completed;
        return { ...t, completed: nextState };
      })
    );
  };

  const addClinicTask = (task: Omit<ClinicTask, 'id' | 'tenantId' | 'createdAt'>) => {
    const newTask: ClinicTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: activeTenant.id,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logAction('TASK_CREATED', 'Checklist da Clínica', `Nova tarefa adicionada: "${task.title}"`);
  };

  const deleteClinicTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Dashboard Widgets Operations
  const updateDashboardWidgets = (widgets: Partial<Record<DashboardWidgetKey, boolean>>) => {
    setDashboardWidgetsState((prev) => ({
      ...prev,
      ...widgets,
    }));
  };

  const resetDashboardWidgets = () => {
    setDashboardWidgetsState(DEFAULT_DASHBOARD_WIDGETS);
  };

  // Multi-tenant filtering (Row Level Security parity)
  const isSuper = currentUser.role === 'superadmin';
  const tenantFilter = <T extends { tenantId?: string }>(item: T) => isSuper || item.tenantId === activeTenant.id;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        patientPortalPatientId,
        setPatientPortalPatientId,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchQuery,
        setSearchQuery,
        showLicenseModal,
        setShowLicenseModal,

        activeTenant,
        setActiveTenant,
        currentUser,
        setCurrentUser,
        tenants,
        setTenants,
        users,
        setUsers,

        specialties: specialties.filter(tenantFilter),
        professionals: professionals.filter(tenantFilter),
        rooms: rooms.filter(tenantFilter),
        procedures: procedures.filter(tenantFilter),
        healthInsurances: healthInsurances.filter(tenantFilter),
        patients: patients.filter(tenantFilter),
        appointments: appointments.filter(tenantFilter),
        evaluations: evaluations.filter(tenantFilter),
        evolutions: evolutions.filter(tenantFilter),
        prescriptions: prescriptions.filter(tenantFilter),
        consentTerms: consentTerms.filter(tenantFilter),
        packages: packages.filter(tenantFilter),
        patientPackages: patientPackages.filter(tenantFilter),
        accounts: accounts.filter(tenantFilter),
        costCenters: costCenters.filter(tenantFilter),
        financialCategories: financialCategories.filter(tenantFilter),
        paymentMethods: paymentMethods.filter(tenantFilter),
        financialEntries: financialEntries.filter(tenantFilter),
        products: products.filter(tenantFilter),
        productCategories: productCategories.filter(tenantFilter),
        unitsOfMeasure: unitsOfMeasure.filter(tenantFilter),
        suppliers: suppliers.filter(tenantFilter),
        equipment: equipment.filter(tenantFilter),
        technicalAssistance: technicalAssistance.filter(tenantFilter),
        messages: isSuper ? messages : messages.filter((m) => !m.tenantId || m.tenantId === activeTenant.id),
        chatSettings: { ...DEFAULT_CHAT_SETTINGS, ...(chatSettings || {}) },
        updateChatSettings,
        licenses: isSuper ? licenses : licenses.filter((l) => l.tenantId === activeTenant.id),
        auditLogs: isSuper ? auditLogs : auditLogs.filter((l) => l.tenantId === activeTenant.id),

        tasks: tasks.filter(tenantFilter),
        toggleClinicTask,
        addClinicTask,
        deleteClinicTask,

        updateRoomStatus,
        startRoomSession,
        freeRoom,

        dashboardWidgets,
        updateDashboardWidgets,
        resetDashboardWidgets,

        addPatient,
        updatePatient,
        deletePatient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addEvolution,
        addEvaluation,
        addPrescription,
        addConsentTerm,
        updateConsentTerm,
        deleteConsentTerm,
        revokeConsentTerm,
        addFinancialEntry,
        updateFinancialEntry,
        deleteFinancialEntry,

        addGenericItem,
        updateGenericItem,
        deleteGenericItem,

        sendMessage,
        markMessageAsRead,
        markAllMessagesAsRead,
        clearConversation,
        activateLicenseKey,
        generateNewLicense,
        createTenantFromCheckout,
        logAction,
        checkPlanLimit,

        updateTenantInfo,
        updateRolePermissions,
        resetRolePermissionsToDefault,
        exportTenantDataJSON,

        patientPortalSettings,
        updatePatientPortalSettings,
        addPatientAnnouncement,
        deletePatientAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
