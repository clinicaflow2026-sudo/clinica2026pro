-- ============================================================================
-- CORREÇÃO: "permission denied for table profiles"
-- Script ADITIVO e seguro — só concede privilégios, não apaga nem altera
-- dados ou estrutura. Pode rodar quantas vezes quiser.
-- ============================================================================
 
-- Garante que as roles anon/authenticated têm acesso de leitura/escrita em
-- TODAS as tabelas do schema public (a RLS de cada tabela continua sendo
-- quem decide QUAIS LINHAS aparecem — isso aqui só garante que a tabela em
-- si não está bloqueada na raiz).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
 
-- Garante que as roles conseguem executar as funções usadas dentro das
-- políticas de RLS (current_tenant_id/current_user_role).
grant execute on function current_tenant_id() to anon, authenticated;
grant execute on function current_user_role() to anon, authenticated;
 
-- Garante que qualquer tabela criada DAQUI PRA FRENTE também já vem com
-- esses privilégios automaticamente, sem precisar rodar isso de novo.
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;