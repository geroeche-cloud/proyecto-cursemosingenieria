-- ============================================================================
-- Cursemos Ingeniería · Migración 0008 — Papelera (borrado reversible)
-- ----------------------------------------------------------------------------
-- Borrar desde el panel dejaba de existir el dato para siempre. Un clic
-- equivocado (o borrar una universidad, que arrastra TODO su contenido) no
-- tenía vuelta atrás.
--
-- Ahora "Borrar" marca `deleted_at` y baja el elemento de público. El dato
-- sigue en la base y se puede restaurar. El borrado definitivo queda como una
-- acción aparte, dentro de la papelera.
--
-- Truco de diseño: al mandar a la papelera también se cambia el estado
-- (archived / inactive / suspended), así todas las consultas públicas que ya
-- filtran por "published"/"active" excluyen lo borrado sin tocar una línea.
--
-- Idempotente. Requiere 0001–0007.
-- ============================================================================

alter table public.universities  add column if not exists deleted_at timestamptz;
alter table public.news          add column if not exists deleted_at timestamptz;
alter table public.opportunities add column if not exists deleted_at timestamptz;
alter table public.professors    add column if not exists deleted_at timestamptz;
alter table public.drives        add column if not exists deleted_at timestamptz;
alter table public.profiles      add column if not exists deleted_at timestamptz;

-- Índices parciales: las listas del panel piden "lo no borrado" todo el tiempo.
create index if not exists universities_alive_idx  on public.universities  (id) where deleted_at is null;
create index if not exists news_alive_idx          on public.news          (university_id) where deleted_at is null;
create index if not exists opportunities_alive_idx on public.opportunities (university_id) where deleted_at is null;
create index if not exists professors_alive_idx    on public.professors    (university_id) where deleted_at is null;
create index if not exists drives_alive_idx        on public.drives        (university_id) where deleted_at is null;

-- ============================================================================
-- Fin de la migración 0008.
-- ============================================================================
