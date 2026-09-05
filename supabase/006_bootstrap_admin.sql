-- ============================================================================
-- CORREÇÃO: cria o tenant + profile de admin para o único usuário de login
-- que já existe no projeto (Authentication > Users mostrou exatamente 1).
-- Seguro rodar mesmo com tenants/profiles vazias — é exatamente o caso atual.
-- ============================================================================
do $$
declare
  v_user_id uuid;
  v_user_email text;
  v_tenant_id uuid;
begin
  select id, email into v_user_id, v_user_email from auth.users limit 1;

  if v_user_id is null then
    raise exception 'Nenhum usuário encontrado em auth.users — verifique se o login foi criado.';
  end if;

  insert into tenants (name, slug, email)
  values ('Clínica Flow Pro', 'clinica-flow-pro', v_user_email)
  returning id into v_tenant_id;

  insert into profiles (id, tenant_id, name, email, role, status)
  values (v_user_id, v_tenant_id, 'Alice', v_user_email, 'admin', 'active');

  insert into chat_settings (tenant_id) values (v_tenant_id);

  raise notice 'Tenant % criado e vinculado ao usuário %', v_tenant_id, v_user_email;
end $$;
