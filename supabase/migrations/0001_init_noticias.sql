-- ============================================================================
-- Cursemos Ingeniería · Migración 0001 — Cimientos + módulo Noticias
-- ----------------------------------------------------------------------------
-- Cómo correrla:  Supabase → SQL Editor → pegar todo → Run  (una sola vez).
-- Es idempotente: se puede volver a correr sin romper (no borra datos).
--
-- Principio de seguridad: RLS activado en TODA tabla y por defecto DENIEGA.
-- La pertenencia por universidad se fuerza en la base, no en el frontend.
-- ============================================================================

-- ---------- Tipos ----------
do $$ begin
  create type user_role as enum ('admin', 'ambassador');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- ---------- Universidades ----------
create table if not exists public.universities (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  short_name  text,
  city        text,
  status      text not null default 'active' check (status in ('active','inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Perfiles de usuario (extiende auth.users de Supabase) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  role          user_role not null default 'ambassador',
  university_id uuid references public.universities(id) on delete set null,
  status        text not null default 'active' check (status in ('active','suspended')),
  created_at    timestamptz not null default now()
);

-- ---------- Perfil INSTITUCIONAL del embajador (lo edita SOLO el admin) ----------
create table if not exists public.ambassador_profiles (
  university_id uuid primary key references public.universities(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  photo_url     text,
  bio           text,
  trajectory    jsonb not null default '[]'::jsonb,
  presentation  text,
  updated_at    timestamptz not null default now()
);

-- ---------- Noticias (módulo de validación) ----------
create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  title         text not null,
  slug          text not null,
  summary       text,
  body          text,
  cover_url     text,
  status        content_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (university_id, slug)
);

-- Índices para que las consultas sean instantáneas a escala.
create index if not exists news_public_idx on public.news (university_id, status, published_at desc);
create index if not exists profiles_university_idx on public.profiles (university_id);

-- ============================================================================
-- Helpers de permisos
-- SECURITY DEFINER = corren con privilegios elevados y NO recursan sobre RLS
-- (leen el rol/universidad del usuario actual sin volver a evaluar políticas).
-- ============================================================================
create or replace function public.app_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.app_university_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select university_id from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- Auto-asociación blindada:
-- una noticia toma SIEMPRE la universidad de su autor embajador.
-- El cliente nunca decide la universidad. (Paso 7 del flujo.)
-- ============================================================================
create or replace function public.news_set_owner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  new.author_id := auth.uid();
  if public.app_role() = 'ambassador' then
    new.university_id := public.app_university_id();
  end if;
  return new;
end $$;

drop trigger if exists news_before_insert on public.news;
create trigger news_before_insert
  before insert on public.news
  for each row execute function public.news_set_owner();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.universities        enable row level security;
alter table public.profiles            enable row level security;
alter table public.ambassador_profiles enable row level security;
alter table public.news                enable row level security;

-- ---- Universidades: lectura pública de activas; solo admin las gestiona ----
drop policy if exists universities_read on public.universities;
create policy universities_read on public.universities
  for select using (status = 'active' or public.app_role() = 'admin');

drop policy if exists universities_admin_write on public.universities;
create policy universities_admin_write on public.universities
  for all using (public.app_role() = 'admin')
  with check (public.app_role() = 'admin');

-- ---- Perfiles: cada uno ve el suyo; el admin, todos ----
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (id = auth.uid() or public.app_role() = 'admin');

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.app_role() = 'admin')
  with check (public.app_role() = 'admin');

-- ---- Perfil institucional: lectura pública; edición SOLO admin ----
drop policy if exists ambassador_profiles_read on public.ambassador_profiles;
create policy ambassador_profiles_read on public.ambassador_profiles
  for select using (true);

drop policy if exists ambassador_profiles_admin_write on public.ambassador_profiles;
create policy ambassador_profiles_admin_write on public.ambassador_profiles
  for all using (public.app_role() = 'admin')
  with check (public.app_role() = 'admin');

-- ---- Noticias ----
-- Lectura: público ve solo publicadas; el embajador ve las de SU universidad
-- (incluidos borradores); el admin ve todo.
drop policy if exists news_read on public.news;
create policy news_read on public.news
  for select using (
    status = 'published'
    or public.app_role() = 'admin'
    or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
  );

-- Crear: admin en cualquier universidad; embajador solo en la suya
-- (el trigger ya lo fuerza; el WITH CHECK lo blinda).
drop policy if exists news_insert on public.news;
create policy news_insert on public.news
  for insert with check (
    public.app_role() = 'admin'
    or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
  );

-- Editar y borrar: solo dentro de su universidad (o admin).
drop policy if exists news_update on public.news;
create policy news_update on public.news
  for update using (
    public.app_role() = 'admin'
    or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
  ) with check (
    public.app_role() = 'admin'
    or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
  );

drop policy if exists news_delete on public.news;
create policy news_delete on public.news
  for delete using (
    public.app_role() = 'admin'
    or (public.app_role() = 'ambassador' and university_id = public.app_university_id())
  );

-- ============================================================================
-- Privilegios de tabla (RLS decide QUÉ filas; los grants, QUÉ operaciones)
-- Lectura pública para 'anon'; escritura solo para usuarios autenticados.
-- ============================================================================
grant usage on schema public to anon, authenticated;
grant execute on function public.app_role(), public.app_university_id() to anon, authenticated;

grant select on public.universities, public.ambassador_profiles, public.news to anon, authenticated;
grant insert, update, delete on public.universities, public.ambassador_profiles, public.news to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- ============================================================================
-- Fin de la migración 0001.
-- Siguiente: clientes de Supabase en la app, login y panel.
-- ============================================================================
