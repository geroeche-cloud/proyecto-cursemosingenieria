-- ============================================================================
-- 0013 — Resúmenes calculados en la base
--
-- POR QUÉ
-- El inicio del admin traía TODAS las filas de noticias, oportunidades,
-- profesores y drives de TODAS las universidades, sin límite, para después
-- contarlas y ordenarlas en JavaScript. Con una universidad y unas pocas
-- publicaciones no se nota. Con 50 universidades y 200 publicaciones cada una
-- son 10.000 filas viajando por la red en cada carga de la página, para mostrar
-- cuatro números y una lista de ocho.
--
-- El inicio del panel del embajador hacía lo mismo a menor escala: traía todas
-- las filas de sus cuatro módulos solo para contar cuántas están publicadas.
--
-- Contar y ordenar es exactamente lo que una base de datos hace bien, con los
-- índices que ya existen. Estas funciones devuelven el resultado ya masticado:
-- un viaje de red, unos pocos kilobytes, y el tiempo de respuesta deja de
-- depender de cuánto contenido tenga la plataforma.
--
-- SEGURIDAD
-- Son SECURITY INVOKER (el modo por defecto): corren con los permisos de quien
-- las llama, así que las políticas RLS se aplican igual que antes. Un embajador
-- que llame a panel_overview solo ve lo suyo porque RLS lo limita, no porque la
-- función se lo pida amablemente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Resumen del panel del embajador: conteos por módulo + lo más visto.
-- RLS ya limita las filas a su universidad.
-- ---------------------------------------------------------------------------
create or replace function public.panel_overview()
returns jsonb
language sql
stable
as $$
  with conteos as (
    select 'news' as modulo,
           count(*) filter (where status = 'published') as publicadas,
           count(*) filter (where status = 'draft')     as borradores
      from public.news where deleted_at is null
    union all
    select 'opportunities',
           count(*) filter (where status = 'published'),
           count(*) filter (where status = 'draft')
      from public.opportunities where deleted_at is null
    union all
    select 'professors',
           count(*) filter (where status = 'published'),
           count(*) filter (where status = 'draft')
      from public.professors where deleted_at is null
    union all
    select 'drives',
           count(*) filter (where status = 'published'),
           count(*) filter (where status = 'draft')
      from public.drives where deleted_at is null
  ),
  top as (
    select label, tipo, clicks from (
      select title as label, 'Noticia' as tipo, coalesce(clicks, 0) as clicks
        from public.news where deleted_at is null and coalesce(clicks, 0) > 0
      union all
      select title, 'Oportunidad', coalesce(clicks, 0)
        from public.opportunities where deleted_at is null and coalesce(clicks, 0) > 0
      union all
      select name, 'Profesor', coalesce(clicks, 0)
        from public.professors where deleted_at is null and coalesce(clicks, 0) > 0
      union all
      select 'Drive de ' || owner, 'Drive', coalesce(clicks, 0)
        from public.drives where deleted_at is null and coalesce(clicks, 0) > 0
    ) t
    order by clicks desc
    limit 6
  )
  select jsonb_build_object(
    'conteos', (select coalesce(jsonb_object_agg(modulo,
                  jsonb_build_object('publicadas', publicadas, 'borradores', borradores)
                ), '{}'::jsonb) from conteos),
    'ranking', (select coalesce(jsonb_agg(
                  jsonb_build_object('label', label, 'tipo', tipo, 'clicks', clicks)
                ), '[]'::jsonb) from top)
  );
$$;

-- ---------------------------------------------------------------------------
-- Resumen del inicio del admin: totales del país, ranking y actividad por
-- universidad. Solo un admin ve todo, porque así lo definen las políticas RLS.
-- ---------------------------------------------------------------------------
create or replace function public.admin_overview()
returns jsonb
language sql
stable
as $$
  with publicado as (
    select university_id, title as label, 'Noticia' as tipo, coalesce(clicks, 0) as clicks
      from public.news where deleted_at is null and status = 'published'
    union all
    select university_id, title, 'Oportunidad', coalesce(clicks, 0)
      from public.opportunities where deleted_at is null and status = 'published'
    union all
    select university_id, name, 'Profesor', coalesce(clicks, 0)
      from public.professors where deleted_at is null and status = 'published'
    union all
    select university_id, 'Drive de ' || owner, 'Drive', coalesce(clicks, 0)
      from public.drives where deleted_at is null and status = 'published'
  ),
  unis as (
    select id, coalesce(nullif(short_name, ''), name) as nombre, status
      from public.universities where deleted_at is null
  ),
  embajadores as (
    select count(*) filter (where status = 'active')    as activos,
           count(*) filter (where status = 'suspended') as suspendidos
      from public.profiles where role = 'ambassador' and deleted_at is null
  )
  select jsonb_build_object(
    'universidades_activas', (select count(*) from unis where status = 'active'),
    'universidades_total',   (select count(*) from unis),
    'embajadores_activos',   (select activos from embajadores),
    'embajadores_suspendidos', (select suspendidos from embajadores),
    'publicaciones',         (select count(*) from publicado),
    'clics',                 (select coalesce(sum(clicks), 0) from publicado),
    'ranking', (
      select coalesce(jsonb_agg(r), '[]'::jsonb) from (
        select p.label, p.tipo, p.clicks, u.nombre as universidad
          from publicado p left join unis u on u.id = p.university_id
         where p.clicks > 0
         order by p.clicks desc
         limit 8
      ) r
    ),
    'por_universidad', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select u.id,
               u.nombre,
               (u.status = 'active') as activa,
               count(p.university_id)             as publicaciones,
               coalesce(sum(p.clicks), 0)::bigint as clics
          from unis u left join publicado p on p.university_id = u.id
         group by u.id, u.nombre, u.status
         order by 5 desc, 4 desc
      ) x
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Índices que sirven exactamente a estas consultas.
--
-- Los índices que ya existían cubren "lo publicado de una universidad" y "lo
-- más clickeado de una universidad" por separado. Estos combinan las tres
-- condiciones que usan los resúmenes —vivo, publicado, ordenado por clics— en
-- un solo índice parcial. Al ser parciales solo incluyen las filas que
-- realmente se consultan: ocupan poco y no penalizan la escritura.
-- ---------------------------------------------------------------------------
create index if not exists news_publicado_idx
  on public.news (university_id, clicks desc)
  where deleted_at is null and status = 'published';

create index if not exists opportunities_publicado_idx
  on public.opportunities (university_id, clicks desc)
  where deleted_at is null and status = 'published';

create index if not exists professors_publicado_idx
  on public.professors (university_id, clicks desc)
  where deleted_at is null and status = 'published';

create index if not exists drives_publicado_idx
  on public.drives (university_id, clicks desc)
  where deleted_at is null and status = 'published';

-- Que PostgREST las vea sin reiniciar nada.
notify pgrst, 'reload schema';
