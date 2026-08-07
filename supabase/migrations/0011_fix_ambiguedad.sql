-- ============================================================================
-- Cursemos Ingeniería · Migración 0011 — Fix definitivo del error 42702
-- ----------------------------------------------------------------------------
-- Síntoma: track_event / bump_click devolvían 400 con
--   42702: column reference "kind" is ambiguous
-- y por eso NO se registraba ningún clic.
--
-- Causa: los parámetros de la función se llamaban igual que columnas de
-- click_events (kind, row_id, vid). No alcanza con evitarlos en los VALUES:
-- la cláusula `on conflict (kind, row_id, visitor, day)` también los resuelve
-- como posibles variables de PL/pgSQL, y ahí vuelve la ambigüedad.
--
-- Arreglo: los parámetros pasan a llamarse p_kind / p_row / p_vid, que no
-- coinciden con ninguna columna. Postgres no permite renombrar parámetros con
-- CREATE OR REPLACE, así que primero se elimina la función.
--
-- Idempotente. Requiere 0010.
-- ============================================================================

drop function if exists public.track_event(text, uuid, text);

create function public.track_event(p_kind text, p_row uuid, p_vid text default null)
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
  if p_kind in ('news', 'opportunities', 'professors', 'drives') then
    v_content := true;
  elsif p_kind not in ('visit', 'social:instagram', 'social:tiktok', 'social:youtube', 'social:linkedin', 'social:mail') then
    return;
  end if;

  if v_content then
    -- El contenido tiene que existir, estar publicado y no estar en la papelera.
    if p_kind = 'news' then
      select university_id into v_uni from public.news
        where id = p_row and status = 'published' and deleted_at is null;
    elsif p_kind = 'opportunities' then
      select university_id into v_uni from public.opportunities
        where id = p_row and status = 'published' and deleted_at is null;
    elsif p_kind = 'professors' then
      select university_id into v_uni from public.professors
        where id = p_row and status = 'published' and deleted_at is null;
    else
      select university_id into v_uni from public.drives
        where id = p_row and status = 'published' and deleted_at is null;
    end if;
  else
    -- Visitas y redes: el id ES la universidad, que debe estar activa.
    select id into v_uni from public.universities
      where id = p_row and status = 'active' and deleted_at is null;
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
    when p_vid is null or p_vid = '' then null
    else encode(sha256(convert_to(left(p_vid, 64) || '|cursemos-vid', 'utf8')), 'hex')
  end;

  insert into public.click_events (kind, row_id, university_id, visitor, day, vid)
  values (p_kind, p_row, v_uni, v_visitor, v_day, v_vid)
  on conflict (kind, row_id, visitor, day) do nothing;

  if not found then
    return; -- ya contó hoy
  end if;

  if v_content then
    if p_kind = 'news' then
      update public.news set clicks = clicks + 1 where id = p_row;
    elsif p_kind = 'opportunities' then
      update public.opportunities set clicks = clicks + 1 where id = p_row;
    elsif p_kind = 'professors' then
      update public.professors set clicks = clicks + 1 where id = p_row;
    else
      update public.drives set clicks = clicks + 1 where id = p_row;
    end if;
  end if;
end;
$$;

grant execute on function public.track_event(text, uuid, text) to anon, authenticated;

-- Compatibilidad: páginas cacheadas viejas siguen llamando a bump_click.
-- Es SQL plano (no PL/pgSQL), así que no tiene el problema de ambigüedad.
create or replace function public.bump_click(kind text, row_id uuid)
  returns void
  language sql
  security definer
  set search_path = public
as $$
  select public.track_event(kind, row_id, null);
$$;

grant execute on function public.bump_click(text, uuid) to anon, authenticated;

-- ============================================================================
-- Fin de la migración 0011.
-- ============================================================================
