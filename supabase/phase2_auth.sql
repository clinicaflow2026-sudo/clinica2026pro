-- ============================================================================
-- FASE 2 — AUTENTICAÇÃO REAL
-- Script ADITIVO: rode isso DEPOIS do schema.sql da Fase 1. Não apaga nada.
-- Cria a função de provisionamento usada no cadastro self-service ("Criar
-- minha clínica" na tela de login) e um índice auxiliar.
-- ============================================================================

-- Provisiona um tenant novo + o profile do usuário autenticado como 'admin'
-- desse tenant. SECURITY DEFINER porque um usuário recém-cadastrado ainda
-- não tem profile (logo, current_tenant_id() é null e a RLS de "tenants"
-- bloquearia o insert). A própria função garante que isso só pode ser
-- chamado uma vez por usuário (se já existir profile, ela recusa).
create or replace function provision_tenant(
  p_tenant_name text,
  p_slug text,
  p_admin_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Este usuário já possui uma clínica associada.';
  end if;

  insert into tenants (name, slug, email)
  values (p_tenant_name, p_slug, (select email from auth.users where id = auth.uid()))
  returning id into v_tenant_id;

  insert into profiles (id, tenant_id, name, email, role, status)
  values (
    auth.uid(),
    v_tenant_id,
    p_admin_name,
    (select email from auth.users where id = auth.uid()),
    'admin',
    'active'
  );

  insert into chat_settings (tenant_id) values (v_tenant_id);

  return v_tenant_id;
end;
$$;

-- Permite que qualquer usuário autenticado chame a função (a própria função
-- controla quem pode de fato usá-la, via as checagens acima).
grant execute on function provision_tenant(text, text, text) to authenticated;
