-- ============================================================================
-- PROMOVER UM USUÁRIO JÁ CADASTRADO A SUPERADMIN
-- Rode isso DEPOIS de criar a segunda conta pelo app (ver instruções no chat).
-- Troque o e-mail abaixo pelo e-mail que você usou nesse segundo cadastro.
-- ============================================================================
update profiles
set role = 'superadmin'
where email = 'TROQUE_PELO_EMAIL_DO_SUPERADMIN@exemplo.com';

-- Confirmação: deve mostrar 1 linha, com role = superadmin
select id, name, email, role, tenant_id from profiles where role = 'superadmin';
