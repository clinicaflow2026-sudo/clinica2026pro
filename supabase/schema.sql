-- ============================================================================
-- CLÍNICA FLOW PRO 2026 — SCHEMA COMPLETO PARA SUPABASE (PostgreSQL)
-- Multi-tenant | RLS | Soft-delete | Audit log (LGPD) | Triggers
-- Execute este script inteiro no SQL Editor do Supabase (Run).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSÕES
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid() + criptografia
create extension if not exists "pg_trgm";    -- busca por nome (patients)

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUM
-- ----------------------------------------------------------------------------
create type user_role as enum ('superadmin','admin','professional','secretary','patient');
create type room_status as enum ('available','in_use','cleaning','maintenance','reserved');
create type appointment_status as enum ('scheduled','confirmed','in_service','completed','cancelled','no_show');

-- ----------------------------------------------------------------------------
-- 2. TABELAS
-- ----------------------------------------------------------------------------

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id),
  full_name text not null,
  role user_role not null default 'secretary',
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_users_tenant on users(tenant_id);

create table specialties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_specialties_tenant on specialties(tenant_id);

create table professionals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  user_id uuid references users(id),
  specialty_id uuid references specialties(id),
  full_name text not null,
  council_number text,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_professionals_tenant on professionals(tenant_id);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  modality text,
  status room_status not null default 'available',
  current_patient_id uuid,
  current_professional_id uuid references professionals(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_rooms_tenant on rooms(tenant_id);

create table procedures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  default_price numeric(10,2) not null default 0,
  default_duration_minutes int not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_procedures_tenant on procedures(tenant_id);

create table health_insurances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  ans_code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_health_insurances_tenant on health_insurances(tenant_id);

create table patients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  user_id uuid references users(id),
  full_name text not null,
  cpf text,
  birth_date date,
  phone text,
  email text,
  health_insurance_id uuid references health_insurances(id),
  insurance_card_number text,
  address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_patients_tenant on patients(tenant_id);
create index idx_patients_name_trgm on patients using gin (full_name gin_trgm_ops);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  patient_id uuid not null references patients(id),
  professional_id uuid not null references professionals(id),
  room_id uuid references rooms(id),
  procedure_id uuid references procedures(id),
  status appointment_status not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint chk_appointment_time check (ends_at > starts_at)
);
create index idx_appointments_tenant on appointments(tenant_id);
create index idx_appointments_professional_time on appointments(professional_id, starts_at);
create index idx_appointments_room_time on appointments(room_id, starts_at);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  patient_id uuid not null references patients(id),
  professional_id uuid not null references professionals(id),
  appointment_id uuid references appointments(id),
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_evaluations_tenant on evaluations(tenant_id);
create index idx_evaluations_patient on evaluations(patient_id);

create table evolutions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  patient_id uuid not null references patients(id),
  professional_id uuid not null references professionals(id),
  appointment_id uuid references appointments(id),
  content text not null,
  signature_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_evolutions_tenant on evolutions(tenant_id);
create index idx_evolutions_patient on evolutions(patient_id);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  patient_id uuid not null references patients(id),
  professional_id uuid not null references professionals(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_prescriptions_tenant on prescriptions(tenant_id);

create table patient_packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  patient_id uuid not null references patients(id),
  procedure_id uuid references procedures(id),
  total_sessions int not null,
  remaining_sessions int not null,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_patient_packages_tenant on patient_packages(tenant_id);
create index idx_patient_packages_patient on patient_packages(patient_id);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  type text,
  initial_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_accounts_tenant on accounts(tenant_id);

create table cost_centers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_cost_centers_tenant on cost_centers(tenant_id);

create table financial_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  type text not null, -- 'income' | 'expense'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_financial_categories_tenant on financial_categories(tenant_id);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_payment_methods_tenant on payment_methods(tenant_id);

create table financial_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  type text not null, -- 'income' | 'expense'
  description text not null,
  amount numeric(12,2) not null,
  due_date date,
  paid_at timestamptz,
  status text not null default 'pending',
  account_id uuid references accounts(id),
  cost_center_id uuid references cost_centers(id),
  category_id uuid references financial_categories(id),
  payment_method_id uuid references payment_methods(id),
  patient_id uuid references patients(id),
  appointment_id uuid references appointments(id),
  health_insurance_id uuid references health_insurances(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_financial_entries_tenant on financial_entries(tenant_id);
create index idx_financial_entries_due_date on financial_entries(due_date);

create table clinic_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  title text not null,
  done boolean not null default false,
  due_date date,
  assigned_to uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_clinic_tasks_tenant on clinic_tasks(tenant_id);

create table internal_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  sender_id uuid not null references users(id),
  recipient_id uuid references users(id), -- null = mensagem geral (broadcast)
  content text,
  attachment_url text,
  is_arrival_alert boolean not null default false,
  patient_id uuid references patients(id),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_internal_messages_tenant on internal_messages(tenant_id);
create index idx_internal_messages_recipient on internal_messages(recipient_id);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  room_id uuid references rooms(id),
  status text not null default 'operational',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_equipment_tenant on equipment(tenant_id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  table_name text not null,
  record_id uuid,
  action text not null, -- 'insert' | 'update' | 'delete'
  ip_address text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_tenant on audit_logs(tenant_id);
create index idx_audit_logs_table on audit_logs(table_name);

-- ----------------------------------------------------------------------------
-- 3. FUNÇÕES AUXILIARES (usadas pelas policies de RLS)
-- ----------------------------------------------------------------------------

-- tenant do usuário logado
create or replace function current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select tenant_id from users where id = auth.uid();
$$;

-- role do usuário logado
create or replace function current_user_role()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from users where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- 4. TRIGGER: updated_at automático
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'tenants','users','specialties','professionals','rooms','procedures',
    'health_insurances','patients','appointments','evaluations','evolutions',
    'prescriptions','patient_packages','accounts','cost_centers',
    'financial_categories','payment_methods','financial_entries',
    'clinic_tasks','internal_messages','equipment'
  ])
  loop
    execute format(
      'create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at()', t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 5. TRIGGER: audit_logs (LGPD) — tabelas sensíveis
-- ----------------------------------------------------------------------------
create or replace function log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tenant_id uuid;
begin
  if TG_OP = 'DELETE' then
    v_tenant_id := OLD.tenant_id;
  else
    v_tenant_id := NEW.tenant_id;
  end if;

  insert into audit_logs (tenant_id, user_id, table_name, record_id, action, old_data, new_data)
  values (
    v_tenant_id,
    auth.uid(),
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    lower(TG_OP),
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );
  return coalesce(NEW, OLD);
end;
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'patients','evaluations','evolutions','prescriptions','financial_entries','users'
  ])
  loop
    execute format(
      'create trigger trg_audit_%1$s after insert or update or delete on %1$I for each row execute function log_audit()', t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 6. TRIGGER: decremento automático de sessões em patient_packages
--    quando um agendamento vinculado é concluído ('completed')
-- ----------------------------------------------------------------------------
create or replace function decrement_package_session()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update patient_packages
    set remaining_sessions = remaining_sessions - 1
    where id = (
      select id from patient_packages
      where patient_id = new.patient_id
        and remaining_sessions > 0
        and (expires_at is null or expires_at > now())
      order by purchased_at asc
      limit 1
    );
  end if;
  return new;
end;
$$;

create trigger trg_decrement_package
after update on appointments
for each row execute function decrement_package_session();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

-- tenants: cada usuário só vê o próprio tenant (id = current_tenant_id())
alter table tenants enable row level security;
create policy tenant_self on tenants
  using (id = current_tenant_id() or current_user_role() = 'superadmin')
  with check (id = current_tenant_id() or current_user_role() = 'superadmin');

-- demais tabelas: isolamento padrão por tenant_id
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users','specialties','professionals','rooms','procedures',
    'health_insurances','patients','appointments','evaluations','evolutions',
    'prescriptions','patient_packages','accounts','cost_centers',
    'financial_categories','payment_methods','financial_entries',
    'clinic_tasks','internal_messages','equipment'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy tenant_isolation on %1$I using (tenant_id = current_tenant_id() or current_user_role() = ''superadmin'') with check (tenant_id = current_tenant_id() or current_user_role() = ''superadmin'')', t
    );
  end loop;
end $$;

-- audit_logs: só admin/superadmin do tenant leem; inserts vêm só do trigger (security definer)
alter table audit_logs enable row level security;
create policy audit_read on audit_logs
  for select using (
    (tenant_id = current_tenant_id() and current_user_role() in ('admin','superadmin'))
    or current_user_role() = 'superadmin'
  );

-- ============================================================================
-- FIM DO SCRIPT.
-- ATENÇÃO — pontos que precisam de decisão sua antes de ir para produção:
--
-- 1) PORTAL DO PACIENTE: as policies acima dão acesso a TODOS os registros do
--    tenant para qualquer usuário autenticado daquele tenant, inclusive role
--    'patient'. Isso é aceitável para staff (admin/secretary/professional),
--    mas um paciente logado NÃO deve ver dados de outros pacientes. Antes de
--    liberar o Portal do Paciente, adicione policies restritivas extras em
--    'patients', 'appointments', 'evaluations', 'evolutions' e
--    'financial_entries' limitando role='patient' a registros onde
--    patients.user_id = auth.uid().
--
-- 2) Criptografia de prontuário (pgcrypto) mencionada no documento original
--    não foi aplicada campo a campo aqui — decida quais colunas de
--    evaluations/evolutions precisam de pgp_sym_encrypt antes de produção.
-- ============================================================================
