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

do $$
declare t text;
begin
  foreach t in array array['news', 'opportunities', 'professors', 'drives']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format($f$
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
    $f$, t);
  end loop;
end $$;

notify pgrst, 'reload schema';
