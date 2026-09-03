export type UserRole = 'superadmin' | 'admin' | 'professional' | 'secretary' | 'patient';

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

export type PlanType = 'profissional' | 'equipe' | 'clinica';

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  description?: string;
  priceMonthly: number;
  priceAnnualMonthly?: number;
  maxPatients: number;
  maxMonthlyAppointments: number;
  maxProfessionals: number;
  maxUnits: number;
  maxAdminUsers: number;
  patientAppIncluded: boolean;
  financialManagerIncluded: boolean;
  financialManagerAddonPrice: number;
  additionalProfessionalPrice: number;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  slug: string;
  logoUrl?: string;
  logoIcon?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  themePreset?: string;
  darkMode?: boolean;
  postalCode?: string;
  customDomain?: string;
  planId: PlanType;
  financialManagerActive: boolean;
  additionalProfessionalsCount: number;
  trialEndsAt: string; // ISO string
  isTrialActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'canceled' | 'blocked';
  licenseKey?: string;
  welcomeMessage?: string;
  rolePermissions?: Record<string, any>;
  patientPortalSettings?: PatientPortalSettings;
  createdAt: string;
}

export interface PatientPortalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'update' | 'feature' | 'alert';
  date: string;
  active: boolean;
  targetPatientId?: string; // empty means all patients
  authorName?: string;
}

export interface PatientPortalSettings {
  appVersion: string;
  releaseNotes: string;
  lastUpdatedDate: string;
  allowWhatsAppBooking: boolean;
  showPrescriptions: boolean;
  showFinancialHistory: boolean;
  showPackages: boolean;
  showPixPayment: boolean;
  customWelcomeMessage?: string;
  announcements: PatientPortalAnnouncement[];
}

export interface UserProfile {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  cpf?: string;
  status: 'active' | 'inactive';
  professionalId?: string;
  patientId?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleName: string;
  canViewDashboard: boolean;
  canManageAppointments: boolean;
  canManagePatients: boolean;
  canManageMedicalRecords: boolean;
  canManageFinancial: boolean;
  canEmitNFeBoleto: boolean;
  canViewReports: boolean;
  canManageCadastros: boolean;
  canSendInternalMessages: boolean;
  canManageSettings: boolean;
}

export interface Professional {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  councilRegistration: string; // CREFITO / CRM / etc.
  specialtyIds: string[];
  commissionPercent: number; // e.g. 50%
  pixKey: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  color: string;
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface Specialty {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  deletedAt?: string | null;
}

export type RoomStatus = 'available' | 'in_use' | 'cleaning' | 'maintenance' | 'reserved';

export interface RoomOccupantInfo {
  patientName?: string;
  patientId?: string;
  professionalName?: string;
  professionalId?: string;
  procedureName?: string;
  modality?: string;
  startedAt?: string; // HH:mm or ISO string
  durationMinutes?: number;
  estimatedEndTime?: string; // HH:mm
}

export interface Room {
  id: string;
  tenantId: string;
  name: string;
  capacity: number;
  equipmentIds: string[];
  inMaintenance: boolean;
  maintenanceNote?: string;
  active: boolean;
  deletedAt?: string | null;
  sector?: string; // Ex: "Ala A - Ortopedia", "Studio Pilates", "Piso 1"
  modalities?: string[]; // Ex: ["Fisioterapia Ortopédica", "Pilates Clínico", "Osteopatia", "Acupuntura"]
  status?: RoomStatus; // 'available' | 'in_use' | 'cleaning' | 'maintenance' | 'reserved'
  currentOccupant?: RoomOccupantInfo;
  color?: string;
}

export interface Procedure {
  id: string;
  tenantId: string;
  name: string;
  specialtyId: string;
  durationMinutes: number;
  price: number;
  description: string;
  requiredMaterials?: string[];
  active: boolean;
  deletedAt?: string | null;
}

export type HealthInsurancePlanType =
  | 'ambulatorial'
  | 'hospitalar'
  | 'coparticipacao'
  | 'particular'
  | 'odontologico'
  | 'estetica'
  | 'outro';

export interface HealthInsurance {
  id: string;
  tenantId: string;
  name: string; // Ex: "Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "NotreDame Intermédica", "Porto Seguro", "Particular"
  planType: HealthInsurancePlanType;
  typeName?: string; // Ex: "Nacional Top", "Especial", "Plano Básico", "Master", "Empresarial"
  ansCode?: string; // Código de registro ANS (ex: 417530, 005711)
  phone?: string; // Central de autorizações / SAC
  email?: string; // Faturamento TISS / Autorização
  coverageDetails?: string; // Cobertura (ex: "Cobre Fisioterapia e RPG mediante guia")
  discountPercent?: number; // Desconto padrão se houver tabela própria
  requiresAuthorizationGuide?: boolean; // Se exige guia TISS/autorização prévia
  active: boolean;
  deletedAt?: string | null;
}

export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Outro';
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthInsurance?: string;
  healthInsuranceNumber?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string;
  notes?: string;
  packageId?: string;
  active: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'canceled' | 'completed';

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  professionalName: string;
  procedureId: string;
  procedureName: string;
  specialtyId: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  syncedWithGoogle: boolean;
  whatsappReminderSent: boolean;
  price: number;
  deletedAt?: string | null;
}

export interface PhysicalEvaluation {
  id: string;
  tenantId: string;
  patientId: string;
  professionalId: string;
  professionalName: string;
  date: string;
  category: 'Fisioterapia' | 'Pilates' | 'Estética';
  modelTitle: string;
  chiefComplaint: string; // Queixa principal
  historyOfPresentIllness: string; // HDA
  posturalAssessment?: string;
  painScale: number; // 0 to 10
  romAndStrength?: string; // Amplitude e força
  aestheticGoals?: string; // Para estética
  planOfCare: string;
  attachments?: { name: string; url: string; type: 'image' | 'doc' }[];
  signature?: DigitalSignature;
  createdAt: string;
}

export interface Evolution {
  id: string;
  tenantId: string;
  patientId: string;
  professionalId: string;
  professionalName: string;
  professionalRegistration: string;
  appointmentId?: string;
  date: string;
  time: string;
  procedurePerformed: string;
  subjectiveFeedback: string; // Relato do paciente
  objectiveFindings: string; // Condutas e parâmetros aplicados
  complicationsOrNotes?: string;
  signature: DigitalSignature;
  createdAt: string;
}

export interface DigitalSignature {
  type: 'drawn' | 'uploaded';
  dataUrl: string;
  signedByName: string;
  signedByRole: string;
  registrationNumber: string;
  timestamp: string;
}

export type ConsentTermType =
  | 'physiotherapy'
  | 'pilates'
  | 'dry_needling'
  | 'electrotherapy'
  | 'rpg_osteopathy'
  | 'aesthetic'
  | 'lgpd_privacy'
  | 'custom';

export interface ConsentTermClause {
  id: string;
  title: string;
  description: string;
  required: boolean;
  agreed: boolean;
}

export interface PatientSignatureData {
  type: 'drawn' | 'touch' | 'uploaded';
  dataUrl: string;
  signedByName: string;
  signedByCpf: string;
  timestamp: string;
  deviceInfo: string;
  verificationHash: string;
  ipOrLocation?: string;
}

export interface PatientConsentTerm {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientPhone?: string;
  professionalId?: string;
  professionalName?: string;
  professionalRegistration?: string;
  termType: ConsentTermType;
  title: string;
  content: string;
  clauses: ConsentTermClause[];
  patientSignature: PatientSignatureData;
  professionalSignature?: DigitalSignature;
  status: 'signed' | 'pending' | 'revoked';
  signedAt: string;
  revokedAt?: string;
  revokeReason?: string;
  createdAt: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  professionalRegistration: string;
  date: string;
  items: {
    medicationOrExercise: string;
    dosageOrFrequency: string;
    instructions: string;
  }[];
  generalObservations?: string;
  signature?: DigitalSignature;
  createdAt: string;
}

export interface Package {
  id: string;
  tenantId: string;
  name: string;
  specialtyId: string;
  totalSessions: number;
  price: number;
  validityDays: number;
  autoRenew: boolean;
  active: boolean;
  deletedAt?: string | null;
}

export interface PatientPackagePurchase {
  id: string;
  tenantId: string;
  patientId: string;
  packageId: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  purchaseDate: string;
  expirationDate: string;
  status: 'active' | 'exhausted' | 'expired';
  pricePaid: number;
}

export type FinancialType = 'income' | 'expense';

export interface FinancialEntry {
  id: string;
  tenantId: string;
  type: FinancialType;
  description: string;
  amount: number;
  dueDate: string; // Data de vencimento
  paymentDate?: string; // Data de pagamento/recebimento
  status: 'paid' | 'pending' | 'overdue';
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  costCenterId: string;
  costCenterName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  discountPercent?: number;
  discountAmount?: number;
  patientId?: string;
  patientName?: string;
  professionalId?: string;
  professionalName?: string;
  appointmentId?: string;
  installmentsCount?: number;
  installmentCurrent?: number;
  invoiceId?: string;
  deletedAt?: string | null;
}

export interface Account {
  id: string;
  tenantId: string;
  name: string; // ex: Itaú Principal, Caixa Físico
  bankName: string;
  accountType: 'checking' | 'cash' | 'savings';
  initialBalance: number;
  currentBalance: number;
  active: boolean;
  deletedAt?: string | null;
}

export interface CostCenter {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface FinancialCategory {
  id: string;
  tenantId: string;
  name: string;
  type: FinancialType;
  color?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  name: string;
  defaultDiscountPercent?: number;
  defaultDiscountAmount?: number;
  taxRatePercent?: number;
  active: boolean;
  deletedAt?: string | null;
}

export interface PaymentSplit {
  id: string;
  tenantId: string;
  professionalId: string;
  professionalName: string;
  periodStart: string;
  periodEnd: string;
  totalGrossEarned: number;
  commissionPercent: number;
  splitAmount: number;
  status: 'pending' | 'paid';
  paidAt?: string;
  appointmentIds: string[];
}

export interface Invoice {
  id: string;
  tenantId: string;
  type: 'nfe' | 'boleto';
  externalId?: string;
  number: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'paid' | 'canceled' | 'processing';
  pdfUrl?: string;
  xmlUrl?: string;
  boletoBarcode?: string;
  nfeAccessKey?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  categoryId: string;
  unitOfMeasureId: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  supplierId?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface UnitOfMeasure {
  id: string;
  tenantId: string;
  name: string;
  symbol: string; // kg, ml, un, cx, etc.
  active: boolean;
  deletedAt?: string | null;
}

export interface Supplier {
  id: string;
  tenantId: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  suppliedProductsDescription?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface Equipment {
  id: string;
  tenantId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  roomId?: string;
  status: 'operational' | 'maintenance' | 'retired';
  notes?: string;
  active: boolean;
  deletedAt?: string | null;
}

export interface TechnicalAssistance {
  id: string;
  tenantId: string;
  equipmentId: string;
  equipmentName: string;
  orderNumber: string; // Nº OS
  sentDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  defectDescription: string;
  repairLocation: string; // Nome da assistência
  cost: number;
  status: 'in_repair' | 'completed' | 'canceled';
}

export interface InternalMessage {
  id: string;
  tenantId?: string; // Optional for SuperAdmin global broadcast
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // Specific user ID or 'all'
  recipientRole?: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
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

export interface ChatSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  allowAllPostOnMural: boolean;
  allowReceptionDirectProf: boolean;
  autoMarkAsRead: boolean;
  customTemplates: Array<{
    id: string;
    title: string;
    text: string;
    category: 'general' | 'patient_arrival' | 'urgent' | 'room_ready' | 'notice';
    icon?: string;
  }>;
}

export interface LicenseKey {
  id: string;
  key: string;
  tenantId: string;
  tenantName: string;
  planId: PlanType;
  startDate: string;
  expirationDate: string;
  active: boolean;
  generatedBy: string;
  hash: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  ipAddress: string;
  device: string;
  details?: string;
  timestamp: string;
}

export interface ClinicTask {
  id: string;
  tenantId: string;
  title: string;
  category: 'reception' | 'clinical' | 'financial' | 'sanitation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate?: string;
  assignedRole?: UserRole | 'all';
  assignedUserName?: string;
  createdAt: string;
}

export type DashboardWidgetKey =
  | 'statsCards'
  | 'appointmentSummaries'
  | 'dailyRevenueStats'
  | 'pendingTasks'
  | 'mainChart'
  | 'roomOccupancy'
  | 'alertsSection';

export interface DashboardWidgetConfig {
  id: DashboardWidgetKey;
  title: string;
  description: string;
  visible: boolean;
  order: number;
}
