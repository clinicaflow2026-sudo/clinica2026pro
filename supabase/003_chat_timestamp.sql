-- ============================================================================
-- FASE 4 (Salas + Chat) — migração ADITIVA, não apaga nada.
-- O front guarda a hora da mensagem como texto "HH:mm" (campo `timestamp`
-- no types.ts), formato diferente do `created_at` (timestamptz) que já
-- existe na tabela. Em vez de forçar uma conversão, adicionamos a coluna
-- que o front já espera, mantendo 100% de compatibilidade com o que o
-- ConsentTermSignModal/InternalChatModule já fazem hoje.
-- ============================================================================
alter table internal_messages add column if not exists "timestamp" text;
