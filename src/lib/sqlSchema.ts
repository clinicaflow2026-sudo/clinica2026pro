export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- ClinicFlow Pro - PostgreSQL Database Schema with Row Level Security (RLS)
-- Multi-Tenant SaaS for Physiotherapy, Pilates & Aesthetics Clinics
-- Compatible with Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tenants (Clínicas)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#0d9488',
    custom_domain VARCHAR(255),
    plan_id VARCHAR(50) DEFAULT 'profissional', -- profissional, equipe, clinica
    financial_manager_active BOOLEAN DEFAULT false,
    additional_professionals_count INT DEFAULT 0,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, expired, canceled
    welcome_message TEXT DEFAULT 'Bem-vindo(a) à nossa clínica!',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Profiles with Tenant Isolation
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- superadmin, admin, professional, secretary, patient
    phone VARCHAR(30),
    cpf VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Specialties
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    color VARCHAR(10) DEFAULT '#0ea5e9',
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Professionals
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    council_registration VARCHAR(50), -- CREFITO / CRM / etc
    commission_percent NUMERIC(5,2) DEFAULT 50.00,
    pix_key VARCHAR(100),
    bank_name VARCHAR(100),
    bank_agency VARCHAR(20),
    bank_account VARCHAR(30),
    color VARCHAR(10) DEFAULT '#0d9488',
    google_calendar_connected BOOLEAN DEFAULT false,
    google_calendar_email VARCHAR(255),
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rooms (Salas de Atendimento)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 1,
    in_maintenance BOOLEAN DEFAULT false,
    maintenance_note TEXT,
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Procedures (Procedimentos)
CREATE TABLE IF NOT EXISTS public.procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES public.specialties(id),
    name VARCHAR(200) NOT NULL,
    duration_minutes INT DEFAULT 60,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Patients (Pacientes)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    email VARCHAR(255),
    phone VARCHAR(30),
    whatsapp VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(30),
    health_insurance VARCHAR(100),
    health_insurance_number VARCHAR(50),
    medical_history TEXT,
    current_medications TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Appointments (Agendamentos)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    procedure_id UUID NOT NULL REFERENCES public.procedures(id),
    room_id UUID REFERENCES public.rooms(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed', -- confirmed, pending, canceled, completed
    notes TEXT,
    price NUMERIC(10,2) DEFAULT 0.00,
    synced_with_google BOOLEAN DEFAULT false,
    whatsapp_reminder_sent BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Medical Records / Physical Evaluations (Prontuários & Avaliações)
CREATE TABLE IF NOT EXISTS public.physical_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- Fisioterapia, Pilates, Estética
    model_title VARCHAR(150),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    postural_assessment TEXT,
    pain_scale INT DEFAULT 0,
    plan_of_care TEXT,
    signature_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Evolutions (Evoluções de Tratamento com Assinatura Digital)
CREATE TABLE IF NOT EXISTS public.evolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    appointment_id UUID REFERENCES public.appointments(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL DEFAULT CURRENT_TIME,
    procedure_performed VARCHAR(255) NOT NULL,
    subjective_feedback TEXT,
    objective_findings TEXT,
    complications_or_notes TEXT,
    signature_data JSONB NOT NULL, -- { dataUrl, signedByName, timestamp, registrationNumber }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Prescriptions (Receituário Clínico)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    items JSONB NOT NULL DEFAULT '[]', -- [{ medicationOrExercise, dosageOrFrequency, instructions }]
    general_observations TEXT,
    signature_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Financial Accounts & Entries
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(100),
    account_type VARCHAR(50) DEFAULT 'checking',
    current_balance NUMERIC(12,2) DEFAULT 0.00,
    active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- income, expense
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(30) DEFAULT 'pending', -- paid, pending, overdue
    account_id UUID REFERENCES public.accounts(id),
    category_name VARCHAR(100),
    cost_center_name VARCHAR(100),
    payment_method_name VARCHAR(100),
    patient_id UUID REFERENCES public.patients(id),
    professional_id UUID REFERENCES public.professionals(id),
    appointment_id UUID REFERENCES public.appointments(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Licenses & Activation Keys
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiration_date TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    device TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tenant-specific tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's tenant_id from profiles
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Tenants: users can only view their own tenant (or superadmins can view all)
CREATE POLICY tenant_isolation_policy ON public.tenants
    FOR ALL
    USING (
        id = auth.current_tenant_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- Patients: isolated by tenant_id
CREATE POLICY patient_tenant_policy ON public.patients
    FOR ALL
    USING (
        tenant_id = auth.current_tenant_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- Appointments: isolated by tenant_id
CREATE POLICY appointment_tenant_policy ON public.appointments
    FOR ALL
    USING (
        tenant_id = auth.current_tenant_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- Evolutions: isolated by tenant_id
CREATE POLICY evolution_tenant_policy ON public.evolutions
    FOR ALL
    USING (
        tenant_id = auth.current_tenant_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- Financial: isolated by tenant_id
CREATE POLICY financial_tenant_policy ON public.financial_entries
    FOR ALL
    USING (
        tenant_id = auth.current_tenant_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- Storage Buckets Configuration (Run in Supabase Storage SQL):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('prontuarios', 'prontuarios', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assinaturas', 'assinaturas', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
`;
