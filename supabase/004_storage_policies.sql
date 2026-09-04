-- ============================================================================
-- FASE 6 (Storage) — migração ADITIVA, não apaga nada.
-- Os 4 buckets (prontuarios, assinaturas, documentos, logos) já foram
-- criados na Fase 1, mas sem policy de RLS o Storage do Supabase bloqueia
-- qualquer upload/leitura feito com a chave anon. Este script libera acesso
-- só dentro do próprio tenant, usando a convenção de path
-- "<tenant_id>/arquivo.ext" que o storageService.ts já segue.
-- ============================================================================

-- Buckets privados: prontuarios, assinaturas, documentos
do $$
declare
  b text;
begin
  for b in select unnest(array['prontuarios', 'assinaturas', 'documentos'])
  loop
    execute format(
      'create policy "tenant_select_%1$s" on storage.objects for select using (bucket_id = %1$L and (storage.foldername(name))[1] = current_tenant_id()::text)',
      b
    );
    execute format(
      'create policy "tenant_insert_%1$s" on storage.objects for insert with check (bucket_id = %1$L and (storage.foldername(name))[1] = current_tenant_id()::text)',
      b
    );
    execute format(
      'create policy "tenant_update_%1$s" on storage.objects for update using (bucket_id = %1$L and (storage.foldername(name))[1] = current_tenant_id()::text)',
      b
    );
    execute format(
      'create policy "tenant_delete_%1$s" on storage.objects for delete using (bucket_id = %1$L and (storage.foldername(name))[1] = current_tenant_id()::text)',
      b
    );
  end loop;
end $$;

-- Bucket público: logos (qualquer um lê, só o próprio tenant escreve/apaga)
create policy "public_select_logos" on storage.objects for select using (bucket_id = 'logos');
create policy "tenant_insert_logos" on storage.objects for insert with check (bucket_id = 'logos' and (storage.foldername(name))[1] = current_tenant_id()::text);
create policy "tenant_update_logos" on storage.objects for update using (bucket_id = 'logos' and (storage.foldername(name))[1] = current_tenant_id()::text);
create policy "tenant_delete_logos" on storage.objects for delete using (bucket_id = 'logos' and (storage.foldername(name))[1] = current_tenant_id()::text);
