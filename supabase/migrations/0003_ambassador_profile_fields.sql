-- ============================================================================
-- Cursemos Ingeniería · Migración 0003 — Perfil público del embajador
-- ----------------------------------------------------------------------------
-- El nombre a mostrar públicamente vive en ambassador_profiles (tabla de
-- lectura pública). profiles NO es público por RLS, así que el sitio anónimo
-- no puede leer full_name; por eso lo curamos acá desde el admin.
-- Idempotente: se puede correr sin romper.
-- Requiere las migraciones 0001 y 0002.
-- ============================================================================

alter table public.ambassador_profiles
  add column if not exists display_name text;

-- (photo_url, bio, presentation y trajectory ya existen desde 0001.)

-- RLS y grants ya definidos en 0001:
--   lectura pública (using true) + escritura solo admin.
--   No hace falta tocar nada más.

-- ============================================================================
-- Fin de la migración 0003.
-- ============================================================================
