-- ============================================================================
-- Cursemos Ingeniería · Migración 0007 — Contador de clics por publicación
-- ----------------------------------------------------------------------------
-- Cada noticia/oportunidad/profesor/drive acumula clics del público.
-- Seguridad: el público (anon) NO puede escribir en las tablas (RLS lo impide);
-- solo puede llamar a bump_click(), una función SECURITY DEFINER que UNICAMENTE
-- incrementa el contador de una fila publicada. No expone ni modifica nada más.
-- Idempotente. Requiere 0001–0002.
-- ============================================================================

alter table public.news          add column if not exists clicks integer not null default 0;
alter table public.opportunities add column if not exists clicks integer not null default 0;
alter table public.professors    add column if not exists clicks integer not null default 0;
alter table public.drives        add column if not exists clicks integer not null default 0;

-- Índices para el ranking "lo más visto" por universidad.
create index if not exists news_clicks_idx          on public.news          (university_id, clicks desc);
create index if not exists opportunities_clicks_idx  on public.opportunities (university_id, clicks desc);
create index if not exists professors_clicks_idx     on public.professors    (university_id, clicks desc);
create index if not exists drives_clicks_idx         on public.drives        (university_id, clicks desc);

-- Función acotada: solo suma 1 al contador de una fila PUBLICADA de una tabla
-- de la lista blanca. Cualquier otro uso no hace nada.
create or replace function public.bump_click(kind text, row_id uuid)
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if kind = 'news' then
    update public.news set clicks = clicks + 1 where id = row_id and status = 'published';
  elsif kind = 'opportunities' then
    update public.opportunities set clicks = clicks + 1 where id = row_id and status = 'published';
  elsif kind = 'professors' then
    update public.professors set clicks = clicks + 1 where id = row_id and status = 'published';
  elsif kind = 'drives' then
    update public.drives set clicks = clicks + 1 where id = row_id and status = 'published';
  end if;
end;
$$;

-- El público puede EJECUTAR la función (no las tablas). Nada peligroso.
grant execute on function public.bump_click(text, uuid) to anon, authenticated;

-- ============================================================================
-- Fin de la migración 0007.
-- ============================================================================
