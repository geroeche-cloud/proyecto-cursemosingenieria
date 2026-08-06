-- ============================================================================
-- Cursemos Ingeniería · Migración 0009 — Registro de clics con freno anti-abuso
-- ----------------------------------------------------------------------------
-- Problema: bump_click era un endpoint público de escritura sin ningún freno
-- del lado del servidor. La única protección era el navegador (sessionStorage),
-- que cualquiera puede saltear: un script podía inflar los contadores.
--
-- Solución: cada clic se registra como un evento con la identidad anónima del
-- visitante, y una restricción única impide contar más de una vez por
-- visitante, por publicación y por día. El contador solo sube si el evento era
-- nuevo. El abuso deja de ser posible sin necesidad de rate limiting complejo.
--
-- Beneficio extra (clave para los informes): esta tabla es la base para medir
-- visitantes únicos y crecimiento semanal/mensual. Un contador entero no puede
-- dar esos datos; una tabla de eventos sí.
--
-- Privacidad: NO se guarda la IP. Se guarda un hash de (IP + día + sal), que
-- además cambia todos los días, así que no permite seguir a una persona en el
-- tiempo. Solo sirve para deduplicar dentro de la misma jornada.
--
-- Idempotente. Requiere 0007 y 0008.
-- ============================================================================

create table if not exists public.click_events (
  id            bigserial primary key,
  kind          text        not null,
  row_id        uuid        not null,
  university_id uuid        references public.universities(id) on delete cascade,
  visitor       text        not null,
  day           date        not null,
  created_at    timestamptz not null default now(),
  unique (kind, row_id, visitor, day)
);

-- Consultas de informes: por universidad y por fecha.
create index if not exists click_events_uni_day_idx on public.click_events (university_id, day);
create index if not exists click_events_day_idx     on public.click_events (day);

-- RLS activo y SIN políticas: nadie puede leer ni escribir esta tabla
-- directamente. Solo la escribe la función de abajo (SECURITY DEFINER) y solo
-- la lee el servidor con la clave de administración.
alter table public.click_events enable row level security;

-- ---------------------------------------------------------------------------
-- bump_click: registra el clic y, si es nuevo, incrementa el contador.
-- ---------------------------------------------------------------------------
create or replace function public.bump_click(kind text, row_id uuid)
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_uni     uuid;
  v_ip      text;
  v_day     date;
  v_visitor text;
begin
  if kind not in ('news', 'opportunities', 'professors', 'drives') then
    return;
  end if;

  -- La fila tiene que existir, estar publicada y no estar en la papelera.
  if kind = 'news' then
    select university_id into v_uni from public.news
      where id = row_id and status = 'published' and deleted_at is null;
  elsif kind = 'opportunities' then
    select university_id into v_uni from public.opportunities
      where id = row_id and status = 'published' and deleted_at is null;
  elsif kind = 'professors' then
    select university_id into v_uni from public.professors
      where id = row_id and status = 'published' and deleted_at is null;
  else
    select university_id into v_uni from public.drives
      where id = row_id and status = 'published' and deleted_at is null;
  end if;

  if v_uni is null then
    return;
  end if;

  v_day := (now() at time zone 'America/Argentina/Buenos_Aires')::date;

  -- Primera IP de la cadena x-forwarded-for (la del visitante real).
  v_ip := coalesce(
    nullif(split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
      ',', 1
    ), ''),
    'sin-ip'
  );

  -- Identidad anónima del día. sha256 es nativo de Postgres (sin extensiones).
  v_visitor := encode(
    sha256(convert_to(v_ip || '|' || v_day::text || '|cursemos-ing', 'utf8')),
    'hex'
  );

  -- El freno: una sola vez por visitante, publicación y día.
  insert into public.click_events (kind, row_id, university_id, visitor, day)
  values (kind, row_id, v_uni, v_visitor, v_day)
  on conflict (kind, row_id, visitor, day) do nothing;

  if not found then
    return; -- ya había contado hoy: no se vuelve a sumar
  end if;

  if kind = 'news' then
    update public.news set clicks = clicks + 1 where id = row_id;
  elsif kind = 'opportunities' then
    update public.opportunities set clicks = clicks + 1 where id = row_id;
  elsif kind = 'professors' then
    update public.professors set clicks = clicks + 1 where id = row_id;
  else
    update public.drives set clicks = clicks + 1 where id = row_id;
  end if;
end;
$$;

grant execute on function public.bump_click(text, uuid) to anon, authenticated;

-- ============================================================================
-- Fin de la migración 0009.
-- ============================================================================
