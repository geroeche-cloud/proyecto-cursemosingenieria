-- ============================================================================
-- Cursemos Ingeniería · Migración 0006 — Ventana de vigencia de publicaciones
-- ----------------------------------------------------------------------------
-- Rango de fechas en el que una noticia/oportunidad está activa en público.
--   starts_at → día en que se activa (null = desde siempre)
--   ends_at   → día en que caduca   (null = no caduca)
-- La visibilidad se calcula por fecha en la app; no hace falta cron.
-- Idempotente. Requiere 0001–0002.
-- ============================================================================

alter table public.news
  add column if not exists starts_at date,
  add column if not exists ends_at   date;

alter table public.opportunities
  add column if not exists starts_at date,
  add column if not exists ends_at   date;

-- ============================================================================
-- Fin de la migración 0006.
-- ============================================================================
