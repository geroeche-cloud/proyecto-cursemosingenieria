-- ============================================================================
-- Cursemos Ingeniería · Migración 0002 — Módulos: Oportunidades, Profesores, Drives
-- ----------------------------------------------------------------------------
-- Mismo patrón que Noticias: cada fila lleva su universidad (forzada por trigger),
-- autor, estado (borrador/publicado), RLS por universidad. Idempotente.
-- Requiere la migración 0001 (tipos, helpers app_role/app_university_id).
-- ============================================================================

-- Trigger genérico: fuerza autor = usuario actual y universidad = la del embajador.
create or replace function public.set_content_owner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  new.author_id := auth.uid();
  if public.app_role() = 'ambassador' then
    new.university_id := public.app_university_id();
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- OPORTUNIDADES (becas, pasantías, programas, eventos, competencias, noticias)
-- ---------------------------------------------------------------------------
create table if not exists public.opportunities (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  kind          text not null default 'beca'
                  check (kind in ('beca','pasantia','programa','evento','competencia','noticia')),
  title         text not null,
  org           text,
  description   text,
  deadline      text,                             -- fecha límite (texto libre)
  requirements  jsonb not null default '[]'::jsonb, -- requisitos excluyentes (lista)
  href          text,                             -- link de postulación
  status        content_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists opportunities_public_idx
  on public.opportunities (university_id, status, published_at desc);

drop trigger if exists opportunities_before_insert on public.opportunities;
create trigger opportunities_before_insert
  before insert on public.opportunities
  for each row execute function public.set_content_owner();

-- ---------------------------------------------------------------------------
-- PROFESORES (clases particulares / tutorías)
-- ---------------------------------------------------------------------------
create table if not exists public.professors (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  name          text not null,
  title         text,                              -- ej: "Ingeniero Químico · Matemática"
  modality      text not null default 'ambas'
                  check (modality in ('presencial','virtual','ambas')),
  whatsapp      text,
  photo_url     text,
  subjects      jsonb not null default '[]'::jsonb, -- materias (lista de textos)
  status        content_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists professors_public_idx
  on public.professors (university_id, status);

drop trigger if exists professors_before_insert on public.professors;
create trigger professors_before_insert
  before insert on public.professors
  for each row execute function public.set_content_owner();

-- ---------------------------------------------------------------------------
-- DRIVES (material de estudio compartido por estudiantes)
-- ---------------------------------------------------------------------------
create table if not exists public.drives (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  owner         text not null,                     -- nombre de quien comparte
  career        text,                              -- carrera
  href          text,                              -- link al drive
  status        content_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists drives_public_idx
  on public.drives (university_id, status);

drop trigger if exists drives_before_insert on public.drives;
create trigger drives_before_insert
  before insert on public.drives
  for each row execute function public.set_content_owner();

-- ============================================================================
-- RLS — mismo criterio que Noticias, para las tres tablas.
-- ============================================================================
alter table public.opportunities enable row level security;
alter table public.professors    enable row level security;
alter table public.drives        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['opportunities','professors','drives']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format($f$
      create policy %1$s_read on public.%1$s for select using (
        status = 'published'
        or public.app_role() = 'admin'
        or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
      )$f$, t);

    execute format('drop policy if exists %1$s_insert on public.%1$s', t);
    execute format($f$
      create policy %1$s_insert on public.%1$s for insert with check (
        public.app_role() = 'admin'
        or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
      )$f$, t);

    execute format('drop policy if exists %1$s_update on public.%1$s', t);
    execute format($f$
      create policy %1$s_update on public.%1$s for update using (
        public.app_role() = 'admin'
        or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
      ) with check (
        public.app_role() = 'admin'
        or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
      )$f$, t);

    execute format('drop policy if exists %1$s_delete on public.%1$s', t);
    execute format($f$
      create policy %1$s_delete on public.%1$s for delete using (
        public.app_role() = 'admin'
        or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
      )$f$, t);
  end loop;
end $$;

-- Privilegios: lectura pública (anon), escritura solo autenticados (RLS decide filas).
grant select on public.opportunities, public.professors, public.drives to anon, authenticated;
grant insert, update, delete on public.opportunities, public.professors, public.drives to authenticated;

-- ============================================================================
-- Fin de la migración 0002.
-- ============================================================================
