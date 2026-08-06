-- ============================================================================
-- Cursemos Ingeniería · Migración 0004 — Redes + biografía completa del embajador
-- ----------------------------------------------------------------------------
-- Amplía ambassador_profiles con:
--   · bio_full  → biografía completa (se muestra al "conocer la trayectoria")
--   · redes     → email, instagram, tiktok, youtube, linkedin
-- (bio = biografía corta, ya existente desde 0001; ahora con límite en la app.)
-- Idempotente. Requiere 0001–0003.
-- ============================================================================

alter table public.ambassador_profiles
  add column if not exists bio_full  text,
  add column if not exists email     text,
  add column if not exists instagram text,
  add column if not exists tiktok    text,
  add column if not exists youtube   text,
  add column if not exists linkedin  text;

-- RLS/grants ya definidos en 0001 (lectura pública + escritura solo admin).

-- ============================================================================
-- Fin de la migración 0004.
-- ============================================================================
