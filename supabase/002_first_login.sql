-- ============================================================================
-- FASE 2 — AUTENTICAÇÃO REAL
-- Provisionamento do registro em `users` no primeiro login.
-- Execute no SQL Editor do Supabase (depois do schema.sql).
-- ============================================================================
--
-- Por que uma função e não um simples INSERT client-side?
-- A policy `tenant_isolation` da tabela `users` exige
-- `tenant_id = current_tenant_id()`, e `current_tenant_id()` lê o tenant_id
-- da PRÓPRIA linha em `users` (select tenant_id from users where id =
-- auth.uid()). No primeiro login essa linha ainda não existe, então
-- current_tenant_id() retorna NULL e o INSERT seria sempre bloqueado pela
-- RLS. A função abaixo roda como SECURITY DEFINER (contorna a RLS de forma
-- controlada) e só cria a linha usando dados que o ADMINISTRADOR já
-- configurou em user_metadata ao criar o acesso do usuário no Supabase Auth
-- — o usuário logado nunca envia tenant_id/role diretamente, então não há
-- como ele se auto-promover.
--
-- IMPORTANTE — passo operacional ao criar cada usuário:
-- No Supabase Dashboard (Authentication > Users > Add user) ou via
-- supabase.auth.admin.createUser (service role), defina em "User Metadata":
--   { "tenant_id": "<uuid do tenant>", "role": "admin" | "professional" |
--     "secretary" | "patient" | "superadmin", "full_name": "Nome Completo" }
-- Sem isso, o primeiro login falha com uma mensagem orientando a configurar.

create or replace function handle_first_login()
returns users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user users;
  v_tenant_id uuid;
  v_role user_role;
  v_full_name text;
  v_email text;
  v_meta jsonb;
begin
  -- Já provisionado? retorna direto (caminho comum, todo login após o primeiro).
  select * into v_user from users where id = auth.uid();
  if found then
    return v_user;
  end if;

  -- Primeiro login: lê os metadados configurados pelo admin na criação do usuário.
  select raw_user_meta_data, email into v_meta, v_email
  from auth.users
  where id = auth.uid();

  if v_meta is null or v_meta = '{}'::jsonb then
    raise exception 'Nenhum metadado de acesso encontrado para este usuário. Peça ao administrador para configurar tenant_id, role e full_name no cadastro.';
  end if;

  v_tenant_id := nullif(v_meta->>'tenant_id', '')::uuid;
  v_full_name := coalesce(nullif(v_meta->>'full_name', ''), v_email, 'Usuário');

  begin
    v_role := coalesce(nullif(v_meta->>'role', '')::user_role, 'secretary');
  exception when invalid_text_representation then
    raise exception 'role inválida nos metadados do usuário: %', (v_meta->>'role');
  end;

  if v_tenant_id is null then
    raise exception 'tenant_id ausente nos metadados do usuário — não é possível provisionar o perfil.';
  end if;

  if not exists (select 1 from tenants where id = v_tenant_id and deleted_at is null) then
    raise exception 'tenant_id inválido nos metadados do usuário: %', v_tenant_id;
  end if;

  insert into users (id, tenant_id, full_name, role, email)
  values (auth.uid(), v_tenant_id, v_full_name, v_role, coalesce(v_email, ''))
  returning * into v_user;

  return v_user;
end;
$$;

grant execute on function handle_first_login() to authenticated;
