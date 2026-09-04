export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- CLÍNICA FLOW PRO 2026 — SCHEMA DEFINITIVO (v2)
-- Gerado a partir de src/types.ts do projeto real (não do documento original)
-- Substitui TANTO o schema já rodado no Supabase QUANTO o sqlSchema.ts embutido
-- no código — a partir de agora, ESTE arquivo é a fonte da verdade.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. RESET (cuidado: apaga o schema anterior, que usava nomes de tabela
--    incompatíveis com o app real, ex: "users" em vez de "profiles").
--    Se você já tiver dados reais gravados no schema antigo, NÃO rode este
--    bloco — me avise antes para eu gerar uma migração em vez de um reset.
-- ----------------------------------------------------------------------------
drop schema if exists public cascade;
create schema public;
grant all on schema public to postgres, anon, authenticated, service_role;

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
create type user_role as enum ('superadmin','admin','professional','secretary','patient');
create type room_status as enum ('available','in_use','cleaning','maintenance','reserved');
create type appointment_status as enum ('confirmed','pending','canceled','completed');

-- ----------------------------------------------------------------------------
-- 2. TENANTS & USUÁRIOS
-- ----------------------------------------------------------------------------
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  cnpj text unique,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  slug text unique not null,
  logo_url text,
  logo_icon text,
  primary_color text default '#0d9488',
  secondary_color text,
  accent_color text,
  theme_preset text,
  dark_mode boolean default false,
  postal_code text,
  custom_domain text,
  plan_id text not null default 'profissional', -- profissional | equipe | clinica
  financial_manager_active boolean default false,
  additional_professionals_count int default 0,
  trial_ends_at timestamptz default (now() + interval '7 days'),
  subscription_status text default 'trial', -- trial|active|expired|canceled|blocked
  license_key text,
  welcome_message text default 'Bem-vindo(a) à nossa clínica!',
  role_permissions jsonb default '{}'::jsonb,
  patient_portal_settings jsonb default '{}'::jsonb, -- inclui announcements[]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null default 'secretary',
  avatar_url text,
  phone text,
  cpf text,
  status text not null default 'active', -- active|inactive
  professional_id uuid, -- FK adicionada depois de criar professionals
  patient_id uuid,      -- FK adicionada depois de criar patients
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_tenant on profiles(tenant_id);

-- ----------------------------------------------------------------------------
-- 3. CADASTROS
-- ----------------------------------------------------------------------------
create table specialties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  color text default '#0ea5e9',
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_specialties_tenant on specialties(tenant_id);

create table professionals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profile_id uuid references profiles(id),
  name text not null,
  email text,
  phone text,
  council_registration text,
  specialty_ids uuid[] default '{}',
  commission_percent numeric(5,2) default 50.00,
  pix_key text,
  bank_name text,
  bank_agency text,
  bank_account text,
  color text default '#0d9488',
  google_calendar_connected boolean default false,
  google_calendar_email text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_professionals_tenant on professionals(tenant_id);

alter table profiles add constraint fk_profiles_professional foreign key (professional_id) references professionals(id);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  brand text,
  model text,
  serial_number text,
  acquisition_date date,
  last_maintenance_date date,
  next_maintenance_date date,
  room_id uuid, -- FK adicionada depois de criar rooms
  status text default 'operational', -- operational|maintenance|retired
  notes text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_equipment_tenant on equipment(tenant_id);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  capacity int default 1,
  equipment_ids uuid[] default '{}',
  in_maintenance boolean default false,
  maintenance_note text,
  sector text,
  modalities text[] default '{}',
  status room_status default 'available',
  current_occupant jsonb, -- { patientName, patientId, professionalName, professionalId, procedureName, modality, startedAt, durationMinutes, estimatedEndTime }
  color text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_rooms_tenant on rooms(tenant_id);

alter table equipment add constraint fk_equipment_room foreign key (room_id) references rooms(id);

create table technical_assistance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  equipment_id uuid not null references equipment(id),
  equipment_name text,
  order_number text,
  sent_date date,
  expected_return_date date,
  actual_return_date date,
  defect_description text,
  repair_location text,
  cost numeric(10,2) default 0,
  status text default 'in_repair', -- in_repair|completed|canceled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_technical_assistance_tenant on technical_assistance(tenant_id);

create table procedures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  specialty_id uuid references specialties(id),
  duration_minutes int default 60,
  price numeric(10,2) not null default 0,
  description text,
  required_materials text[] default '{}',
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_procedures_tenant on procedures(tenant_id);

create table health_insurances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  plan_type text not null default 'particular',
  type_name text,
  ans_code text,
  phone text,
  email text,
  coverage_details text,
  discount_percent numeric(5,2),
  requires_authorization_guide boolean default false,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_health_insurances_tenant on health_insurances(tenant_id);

-- ----------------------------------------------------------------------------
-- 4. PACIENTES, AGENDA E PRONTUÁRIO
-- ----------------------------------------------------------------------------
create table patients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  cpf text,
  rg text,
  birth_date date,
  gender text, -- 'M'|'F'|'Outro'
  email text,
  phone text,
  whatsapp text,
  address text,
  city text,
  state text,
  zip_code text,
  emergency_contact_name text,
  emergency_contact_phone text,
  health_insurance text,
  health_insurance_number text,
  allergies text[] default '{}',
  medical_history text,
  current_medications text,
  notes text,
  package_id uuid,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_patients_tenant on patients(tenant_id);
create index idx_patients_name_trgm on patients using gin (name gin_trgm_ops);

alter table profiles add constraint fk_profiles_patient foreign key (patient_id) references patients(id);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id),
  patient_name text,
  patient_phone text,
  professional_id uuid not null references professionals(id),
  professional_name text,
  procedure_id uuid not null references procedures(id),
  procedure_name text,
  specialty_id uuid references specialties(id),
  room_id uuid references rooms(id),
  room_name text,
  date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status not null default 'pending',
  notes text,
  synced_with_google boolean default false,
  whatsapp_reminder_sent boolean default false,
  price numeric(10,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint chk_appointment_time check (end_time > start_time)
);
create index idx_appointments_tenant on appointments(tenant_id);
create index idx_appointments_professional_date on appointments(professional_id, date);
create index idx_appointments_room_date on appointments(room_id, date);

create table physical_evaluations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  professional_id uuid not null references professionals(id),
  professional_name text,
  date date not null default current_date,
  category text not null, -- Fisioterapia|Pilates|Estética
  model_title text,
  chief_complaint text,
  history_of_present_illness text,
  postural_assessment text,
  pain_scale int default 0,
  rom_and_strength text,
  aesthetic_goals text,
  plan_of_care text,
  attachments jsonb default '[]', -- [{name,url,type}]
  signature jsonb, -- DigitalSignature
  created_at timestamptz not null default now()
);
create index idx_evaluations_tenant on physical_evaluations(tenant_id);
create index idx_evaluations_patient on physical_evaluations(patient_id);

create table evolutions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  professional_id uuid not null references professionals(id),
  professional_name text,
  professional_registration text,
  appointment_id uuid references appointments(id),
  date date not null default current_date,
  time time not null default current_time,
  procedure_performed text not null,
  subjective_feedback text,
  objective_findings text,
  complications_or_notes text,
  signature jsonb not null, -- DigitalSignature
  created_at timestamptz not null default now()
);
create index idx_evolutions_tenant on evolutions(tenant_id);
create index idx_evolutions_patient on evolutions(patient_id);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  patient_name text,
  professional_id uuid not null references professionals(id),
  professional_name text,
  professional_registration text,
  date date not null default current_date,
  items jsonb not null default '[]', -- [{medicationOrExercise,dosageOrFrequency,instructions}]
  general_observations text,
  signature jsonb,
  created_at timestamptz not null default now()
);
create index idx_prescriptions_tenant on prescriptions(tenant_id);

create table consent_terms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  patient_name text,
  patient_cpf text,
  patient_phone text,
  professional_id uuid references professionals(id),
  professional_name text,
  professional_registration text,
  term_type text not null, -- ConsentTermType
  title text not null,
  content text not null,
  clauses jsonb default '[]', -- ConsentTermClause[]
  patient_signature jsonb not null, -- PatientSignatureData
  professional_signature jsonb,
  status text not null default 'pending', -- signed|pending|revoked
  signed_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_consent_terms_tenant on consent_terms(tenant_id);
create index idx_consent_terms_patient on consent_terms(patient_id);

-- ----------------------------------------------------------------------------
-- 5. PACOTES DE SESSÕES
-- ----------------------------------------------------------------------------
create table packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  specialty_id uuid references specialties(id),
  total_sessions int not null,
  price numeric(10,2) not null default 0,
  validity_days int not null default 90,
  auto_renew boolean default false,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_packages_tenant on packages(tenant_id);

alter table patients add constraint fk_patients_package foreign key (package_id) references packages(id);

create table patient_packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  package_id uuid not null references packages(id),
  package_name text,
  total_sessions int not null,
  used_sessions int not null default 0,
  purchase_date date not null default current_date,
  expiration_date date,
  status text not null default 'active', -- active|exhausted|expired
  price_paid numeric(10,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_patient_packages_tenant on patient_packages(tenant_id);
create index idx_patient_packages_patient on patient_packages(patient_id);

-- ----------------------------------------------------------------------------
-- 6. FINANCEIRO
-- ----------------------------------------------------------------------------
create table accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  bank_name text,
  account_type text default 'checking', -- checking|cash|savings
  initial_balance numeric(12,2) default 0,
  current_balance numeric(12,2) default 0,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_accounts_tenant on accounts(tenant_id);

create table cost_centers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  code text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_cost_centers_tenant on cost_centers(tenant_id);

create table financial_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  type text not null, -- income|expense
  color text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_financial_categories_tenant on financial_categories(tenant_id);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  default_discount_percent numeric(5,2),
  default_discount_amount numeric(10,2),
  tax_rate_percent numeric(5,2),
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_payment_methods_tenant on payment_methods(tenant_id);

create table financial_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null, -- income|expense
  description text not null,
  amount numeric(12,2) not null,
  due_date date not null,
  payment_date date,
  status text not null default 'pending', -- paid|pending|overdue
  account_id uuid references accounts(id),
  account_name text,
  category_id uuid references financial_categories(id),
  category_name text,
  cost_center_id uuid references cost_centers(id),
  cost_center_name text,
  payment_method_id uuid references payment_methods(id),
  payment_method_name text,
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  patient_id uuid references patients(id),
  patient_name text,
  professional_id uuid references professionals(id),
  professional_name text,
  appointment_id uuid references appointments(id),
  installments_count int,
  installment_current int,
  invoice_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_financial_entries_tenant on financial_entries(tenant_id);
create index idx_financial_entries_due_date on financial_entries(due_date);

create table payment_splits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  professional_id uuid not null references professionals(id),
  professional_name text,
  period_start date not null,
  period_end date not null,
  total_gross_earned numeric(12,2) default 0,
  commission_percent numeric(5,2) default 0,
  split_amount numeric(12,2) default 0,
  status text default 'pending', -- pending|paid
  paid_at timestamptz,
  appointment_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);
create index idx_payment_splits_tenant on payment_splits(tenant_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  type text not null, -- nfe|boleto
  external_id text,
  number text,
  patient_id uuid references patients(id),
  patient_name text,
  patient_cpf text,
  amount numeric(12,2) not null,
  issue_date date not null default current_date,
  due_date date,
  status text default 'processing', -- issued|paid|canceled|processing
  pdf_url text,
  xml_url text,
  boleto_barcode text,
  nfe_access_key text,
  created_at timestamptz not null default now()
);
create index idx_invoices_tenant on invoices(tenant_id);

alter table financial_entries add constraint fk_financial_entries_invoice foreign key (invoice_id) references invoices(id);

-- ----------------------------------------------------------------------------
-- 7. ESTOQUE
-- ----------------------------------------------------------------------------
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_product_categories_tenant on product_categories(tenant_id);

create table units_of_measure (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  symbol text not null,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_units_tenant on units_of_measure(tenant_id);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  corporate_name text not null,
  trade_name text,
  cnpj text,
  contact_name text,
  email text,
  phone text,
  address text,
  supplied_products_description text,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_suppliers_tenant on suppliers(tenant_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  code text,
  category_id uuid references product_categories(id),
  unit_of_measure_id uuid references units_of_measure(id),
  cost_price numeric(10,2) default 0,
  sale_price numeric(10,2) default 0,
  current_stock numeric(10,2) default 0,
  min_stock numeric(10,2) default 0,
  supplier_id uuid references suppliers(id),
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_products_tenant on products(tenant_id);

-- ----------------------------------------------------------------------------
-- 8. CHAT INTERNO, TAREFAS, DASHBOARD, LICENÇAS, AUDITORIA
-- ----------------------------------------------------------------------------
create table internal_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade, -- null = broadcast global do superadmin
  sender_id uuid not null references profiles(id),
  sender_name text,
  sender_role user_role,
  recipient_id text, -- uuid do usuário OU a string 'all'
  recipient_role user_role,
  content text,
  "timestamp" text, -- "HH:mm" formatado pelo front (ver nota na Fase 4 - Chat)
  category text default 'general', -- general|patient_arrival|urgent|room_ready|notice
  patient_id uuid references patients(id),
  patient_name text,
  attachment jsonb, -- {name,url,type,size}
  read boolean default false,
  created_at timestamptz not null default now()
);
create index idx_internal_messages_tenant on internal_messages(tenant_id);
create index idx_internal_messages_recipient on internal_messages(recipient_id);

create table chat_settings (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  sound_enabled boolean default true,
  push_enabled boolean default true,
  allow_all_post_on_mural boolean default true,
  allow_reception_direct_prof boolean default true,
  auto_mark_as_read boolean default false,
  custom_templates jsonb default '[]',
  updated_at timestamptz not null default now()
);

create table clinic_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  category text default 'general', -- reception|clinical|financial|sanitation|general
  priority text default 'medium', -- low|medium|high|urgent
  completed boolean default false,
  due_date date,
  assigned_role text, -- UserRole | 'all'
  assigned_user_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clinic_tasks_tenant on clinic_tasks(tenant_id);

create table dashboard_widget_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references profiles(id), -- null = padrão do tenant
  widget_key text not null, -- DashboardWidgetKey
  title text,
  description text,
  visible boolean default true,
  sort_order int default 0,
  unique (tenant_id, user_id, widget_key)
);
create index idx_dashboard_widgets_tenant on dashboard_widget_configs(tenant_id);

create table license_keys (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_name text,
  plan_id text not null,
  start_date timestamptz not null default now(),
  expiration_date timestamptz not null,
  active boolean default true,
  generated_by text,
  hash text not null,
  created_at timestamptz not null default now()
);
create index idx_license_keys_tenant on license_keys(tenant_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  user_name text,
  user_role text,
  action text not null,
  module text not null,
  ip_address text,
  device text,
  details text,
  timestamp timestamptz not null default now()
);
create index idx_audit_logs_tenant on audit_logs(tenant_id);

-- ============================================================================
-- 9. FUNÇÕES AUXILIARES DE RLS
-- ============================================================================
create or replace function current_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- ============================================================================
-- 10. TRIGGERS: updated_at
-- ============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'tenants','profiles','specialties','professionals','equipment','rooms',
    'technical_assistance','procedures','health_insurances','patients',
    'appointments','packages','patient_packages','accounts','cost_centers',
    'financial_categories','payment_methods','financial_entries',
    'product_categories','units_of_measure','suppliers','products',
    'clinic_tasks','license_keys'
  ])
  loop
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- 11. TRIGGER: audit_logs (LGPD) nas tabelas sensíveis
-- ============================================================================
create or replace function log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tenant_id uuid;
begin
  if TG_OP = 'DELETE' then v_tenant_id := OLD.tenant_id; else v_tenant_id := NEW.tenant_id; end if;
  insert into audit_logs (tenant_id, user_id, action, module, details)
  values (v_tenant_id, auth.uid(), lower(TG_OP), TG_TABLE_NAME, coalesce(NEW.id, OLD.id)::text);
  return coalesce(NEW, OLD);
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'patients','physical_evaluations','evolutions','prescriptions',
    'consent_terms','financial_entries','profiles'
  ])
  loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on %1$I for each row execute function log_audit()', t);
  end loop;
end $$;

-- ============================================================================
-- 12. TRIGGER: decremento de sessões em patient_packages ao concluir agendamento
-- ============================================================================
create or replace function decrement_package_session()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update patient_packages
    set used_sessions = used_sessions + 1,
        status = case when used_sessions + 1 >= total_sessions then 'exhausted' else status end
    where id = (
      select id from patient_packages
      where patient_id = new.patient_id
        and status = 'active'
        and used_sessions < total_sessions
      order by purchase_date asc
      limit 1
    );
  end if;
  return new;
end;
$$;

create trigger trg_decrement_package
after update on appointments
for each row execute function decrement_package_session();

-- ============================================================================
-- 13. ROW LEVEL SECURITY
-- ============================================================================
alter table tenants enable row level security;
create policy tenant_self on tenants
  using (id = current_tenant_id() or current_user_role() = 'superadmin')
  with check (id = current_tenant_id() or current_user_role() = 'superadmin');

do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','specialties','professionals','equipment','rooms',
    'technical_assistance','procedures','health_insurances','patients',
    'appointments','physical_evaluations','evolutions','prescriptions',
    'consent_terms','packages','patient_packages','accounts','cost_centers',
    'financial_categories','payment_methods','financial_entries',
    'payment_splits','invoices','product_categories','units_of_measure',
    'suppliers','products','internal_messages','chat_settings',
    'clinic_tasks','dashboard_widget_configs','license_keys'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy tenant_isolation on %1$I using (tenant_id = current_tenant_id() or current_user_role() = ''superadmin'') with check (tenant_id = current_tenant_id() or current_user_role() = ''superadmin'')', t
    );
  end loop;
end $$;

alter table audit_logs enable row level security;
create policy audit_read on audit_logs
  for select using (
    (tenant_id = current_tenant_id() and current_user_role() in ('admin','superadmin'))
    or current_user_role() = 'superadmin'
  );

-- ============================================================================
-- 14. STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public) values ('prontuarios', 'prontuarios', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('assinaturas', 'assinaturas', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;

-- ============================================================================
-- FIM. Próximos passos (fora deste script):
-- 1) Portal do Paciente: adicionar policy restritiva extra para role='patient'
--    em patients/appointments/evolutions/financial_entries limitando a
--    patients.id = profiles.patient_id do usuário logado.
-- 2) pgcrypto campo a campo em physical_evaluations/evolutions, se desejar
--    criptografia em repouso além do que o Supabase já oferece por padrão.
-- ============================================================================
`;
