-- ============================================================================
-- CRIA O PROFILE DE SUPERADMIN para a conta clinicaflow2026@gmail.com, que já
-- existe em auth.users mas nunca ganhou profile (cadastro ficou pendente de
-- confirmação de e-mail, e essa etapa tinha um bug — já corrigido no código).
-- Cria também um tenant "placeholder" só para satisfazer a coluna
-- obrigatória tenant_id — não é usado pra nada, o superadmin enxerga todas
-- as clínicas de qualquer forma, graças à regra "or current_user_role() =
-- superadmin" que já existe em toda tabela desde a Fase 1.
-- ============================================================================
do $$
declare
  v_user_id uuid;
  v_placeholder_tenant_id uuid;
begin
  select id into v_user_id from auth.users where email = 'clinicaflow2026@gmail.com';

  if v_user_id is null then
    raise exception 'Não encontrei nenhum usuário com esse e-mail em auth.users.';
  end if;

  if exists (select 1 from profiles where id = v_user_id) then
    raise exception 'Esse usuário já tem profile — rode o 007_promote_superadmin.sql (update) em vez deste.';
  end if;

  insert into tenants (name, slug, email)
  values ('Superadmin (sem clínica própria)', 'superadmin-system', 'clinicaflow2026@gmail.com')
  returning id into v_placeholder_tenant_id;

  insert into profiles (id, tenant_id, name, email, role, status)
  values (v_user_id, v_placeholder_tenant_id, 'Superadmin', 'clinicaflow2026@gmail.com', 'superadmin', 'active');

  raise notice 'Profile de superadmin criado para clinicaflow2026@gmail.com';
end $$;
