-- ============================================================================
-- 0016 — Que una sesión de embajador SOLO lea su universidad
--
-- EL INCIDENTE
-- Una embajadora nueva veía en su panel las publicaciones de otra universidad.
--
-- Causa: la política de lectura decía
--     status = 'published'  OR  admin  OR  (embajador AND es su universidad)
-- y el panel consultaba la tabla entera confiando en ese filtro.
--
-- El primer término es imprescindible: sin él, un visitante anónimo no vería
-- nada del sitio público. Pero también aplica a una sesión iniciada, así que el
-- panel terminaba mostrando lo publicado por todas las universidades.
--
-- El arreglo principal ya está en la aplicación: cada consulta del panel pide
-- explícitamente su universidad. Esta migración es la SEGUNDA CAPA: aunque
-- alguien olvide el filtro al agregar un módulo nuevo, la base no entrega
-- contenido ajeno a una sesión de embajador.
--
-- CÓMO
-- El "publicado es público" se limita a quien NO tiene rol, que es exactamente
-- el visitante anónimo. Las páginas públicas usan un cliente sin cookies
-- (lib/supabase/public.ts), así que para ellas app_role() es NULL y siguen
-- viendo todo lo publicado, incluso si quien mira tiene sesión abierta en otra
-- pestaña.
--
-- Escribir nunca estuvo en riesgo: para modificar o borrar, las políticas ya
-- exigían que fuera la universidad de quien lo pide. Esto es sobre LEER.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Antes de nada: comprobar que estamos en la base correcta.
--
-- Sin esto, correrlo en otro proyecto devuelve
--     ERROR: relation "public.news" does not exist
-- que no explica nada. Y es fácil equivocarse: el panel de Supabase recuerda el
-- último proyecto abierto, así que si tenés más de uno el editor SQL puede
-- quedar apuntando al que no es.
-- ---------------------------------------------------------------------------
do $guarda$
begin
  if to_regclass('public.news') is null then
    raise exception
      'Esta base no tiene las tablas de Cursemos Ingenieria. Estas en el proyecto equivocado: fijate el selector de arriba en el panel de Supabase y elegi el proyecto del sitio.';
  end if;
end
$guarda$;

do $migracion$
declare t text;
begin
  foreach t in array array['news', 'opportunities', 'professors', 'drives']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format($politica$
      create policy %1$s_read on public.%1$s
        for select using (
          -- Visitante sin sesión: ve lo publicado. Es el sitio público.
          (public.app_role() is null and status = 'published')
          -- Administración: ve todo.
          or public.app_role() = 'admin'
          -- Embajador: SOLO su universidad, en cualquier estado.
          or (public.app_role() = 'ambassador'
              and university_id = public.app_university_id())
        )
    $politica$, t);
  end loop;
end
$migracion$;

notify pgrst, 'reload schema';
