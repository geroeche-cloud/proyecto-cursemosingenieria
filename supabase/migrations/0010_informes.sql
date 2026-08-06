-- ============================================================================
-- Cursemos Ingeniería · Migración 0010 — Informes de impacto
-- ----------------------------------------------------------------------------
-- Tres piezas:
--   1) vid: identidad anónima PERSISTENTE del visitante (un id aleatorio que
--      vive en su navegador, hasheado acá). Permite contar "estudiantes que
--      usan la plataforma" de verdad; el hash de IP+día solo servía para
--      deduplicar dentro de una jornada.
--   2) track_event: una única función para TODOS los eventos — clics de
--      contenido (suman contador), visitas a un campus y clics a redes —
--      siempre con el mismo freno anti-abuso (una vez por visitante/día).
--   3) report_stats / report_by_university: TODOS los números de un informe
--      en UNA consulta. Los paneles no agregan nada en tiempo de página.
--
-- Idempotente. Requiere 0009.
-- ============================================================================

alter table public.click_events add column if not exists vid text;

-- ---------------------------------------------------------------------------
-- track_event — registra cualquier evento medible.
--   · news / opportunities / professors / drives → clic de contenido (suma clicks)
--   · visit                                       → visita al campus (row_id = universidad)
--   · social:instagram|tiktok|youtube|linkedin|mail → clic a una red (row_id = universidad)
-- ---------------------------------------------------------------------------
create or replace function public.track_event(kind text, row_id uuid, vid text default null)
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
  v_vid     text;
  v_content boolean := false;
begin
  if kind in ('news', 'opportunities', 'professors', 'drives') then
    v_content := true;
  elsif kind not in ('visit', 'social:instagram', 'social:tiktok', 'social:youtube', 'social:linkedin', 'social:mail') then
    return;
  end if;

  if v_content then
    -- El contenido tiene que existir, estar publicado y no estar en la papelera.
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
  else
    -- Visitas y redes: el id ES la universidad, que debe estar activa.
    select id into v_uni from public.universities
      where id = row_id and status = 'active' and deleted_at is null;
  end if;

  if v_uni is null then
    return;
  end if;

  v_day := (now() at time zone 'America/Argentina/Buenos_Aires')::date;

  v_ip := coalesce(
    nullif(split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
      ',', 1
    ), ''),
    'sin-ip'
  );

  -- Dedup del día (anti-abuso): hash de IP+día, imposible de seguir en el tiempo.
  v_visitor := encode(
    sha256(convert_to(v_ip || '|' || v_day::text || '|cursemos-ing', 'utf8')),
    'hex'
  );

  -- Identidad persistente anónima: hash del id aleatorio del navegador.
  v_vid := case
    when vid is null or vid = '' then null
    else encode(sha256(convert_to(left(vid, 64) || '|cursemos-vid', 'utf8')), 'hex')
  end;

  insert into public.click_events (kind, row_id, university_id, visitor, day, vid)
  values (kind, row_id, v_uni, v_visitor, v_day, v_vid)
  on conflict (kind, row_id, visitor, day) do nothing;

  if not found then
    return; -- ya contó hoy
  end if;

  if v_content then
    if kind = 'news' then
      update public.news set clicks = clicks + 1 where id = row_id;
    elsif kind = 'opportunities' then
      update public.opportunities set clicks = clicks + 1 where id = row_id;
    elsif kind = 'professors' then
      update public.professors set clicks = clicks + 1 where id = row_id;
    else
      update public.drives set clicks = clicks + 1 where id = row_id;
    end if;
  end if;
end;
$$;

grant execute on function public.track_event(text, uuid, text) to anon, authenticated;

-- Compatibilidad: páginas cacheadas viejas siguen llamando a bump_click.
create or replace function public.bump_click(kind text, row_id uuid)
  returns void
  language sql
  security definer
  set search_path = public
as $$
  select public.track_event(kind, row_id, null);
$$;
grant execute on function public.bump_click(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- report_stats — todos los números de un informe en una sola llamada.
-- p_uni null = todo el país; con id = solo esa universidad.
-- Solo la ejecuta el servidor (service_role): nadie más tiene permiso.
-- ---------------------------------------------------------------------------
create or replace function public.report_stats(p_uni uuid default null)
  returns jsonb
  language sql
  security definer
  set search_path = public
as $$
with hoy as (
  select (now() at time zone 'America/Argentina/Buenos_Aires')::date as d
),
ev as (
  select kind, coalesce(vid, visitor) as quien, day
  from public.click_events
  where p_uni is null or university_id = p_uni
),
base as (
  select
    count(*) filter (where kind = 'visit')                   as visitas,
    count(distinct quien)                                    as estudiantes,
    count(*) filter (where kind <> 'visit')                  as interacciones,
    count(*) filter (where kind = 'news')                    as noticias,
    count(*) filter (where kind = 'opportunities')           as oportunidades,
    count(*) filter (where kind = 'professors')              as mensajes_profes,
    count(distinct quien) filter (where kind = 'professors') as estudiantes_profes,
    count(*) filter (where kind = 'drives')                  as recursos,
    count(*) filter (where kind like 'social:%')             as redes,
    count(*) filter (where kind <> 'visit'
      and day >= date_trunc('month', (select d from hoy))::date)  as mes_actual,
    count(*) filter (where kind <> 'visit'
      and day >= (date_trunc('month', (select d from hoy)) - interval '1 month')::date
      and day <  date_trunc('month', (select d from hoy))::date)  as mes_anterior
  from ev
),
por_red as (
  select coalesce(jsonb_object_agg(replace(kind, 'social:', ''), n), '{}'::jsonb) as redes_det
  from (select kind, count(*) as n from ev where kind like 'social:%' group by kind) s
),
semanas as (
  select coalesce(
    jsonb_agg(jsonb_build_object('semana', w, 'visitas', v, 'interacciones', i) order by w),
    '[]'::jsonb
  ) as series
  from (
    select date_trunc('week', day)::date as w,
           count(*) filter (where kind = 'visit')  as v,
           count(*) filter (where kind <> 'visit') as i
    from ev
    where day >= ((select d from hoy) - interval '8 weeks')::date
    group by 1
  ) t
)
select to_jsonb(base.*)
  || jsonb_build_object('por_red', por_red.redes_det, 'semanas', semanas.series)
from base, por_red, semanas;
$$;

revoke all on function public.report_stats(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- report_by_university — ranking nacional para el panel ejecutivo.
-- ---------------------------------------------------------------------------
create or replace function public.report_by_university()
  returns jsonb
  language sql
  security definer
  set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'university_id', u,
        'estudiantes', e,
        'visitas', v,
        'interacciones', i
      ) order by i desc, v desc
    ),
    '[]'::jsonb
  )
  from (
    select university_id as u,
           count(distinct coalesce(vid, visitor))  as e,
           count(*) filter (where kind = 'visit')  as v,
           count(*) filter (where kind <> 'visit') as i
    from public.click_events
    group by 1
  ) t;
$$;

revoke all on function public.report_by_university() from public, anon, authenticated;

-- ============================================================================
-- Fin de la migración 0010.
-- ============================================================================
