-- ============================================================================
-- 0015 — Cerrar los resúmenes al público
--
-- EL PROBLEMA
-- Las funciones panel_overview() y admin_overview() (migración 0013) quedaron
-- ejecutables por cualquiera, incluido un visitante sin sesión. Comprobado
-- llamándolas con la clave pública: respondían.
--
-- Lo que devuelven no es contenido: es el ranking nacional de publicaciones,
-- los clics acumulados y la actividad de cada universidad. Es justamente el
-- material que se armó como herramienta interna para mostrarle a empresas y
-- organismos. No tiene por qué ser consultable desde afuera.
--
-- Es el mismo olvido de la 0012, repetido: al crear funciones nuevas no se
-- revisó a quién quedaban concedidas. Postgres concede EXECUTE a PUBLIC por
-- defecto, así que el descuido es silencioso — hay que quitarlo a propósito.
--
-- LA SOLUCIÓN
-- Se quita a todos y se concede solo a quien tiene sesión iniciada. Las
-- políticas RLS siguen filtrando lo que cada uno ve: un embajador con sesión
-- solo obtiene los números de SU universidad, porque las tablas que la función
-- lee están limitadas por sus políticas. La función no reparte permisos, solo
-- deja de estar abierta a cualquiera.
-- ============================================================================

revoke all on function public.panel_overview()   from public, anon;
revoke all on function public.admin_overview()   from public, anon;

grant execute on function public.panel_overview()  to authenticated;
grant execute on function public.admin_overview()  to authenticated;

-- Recordatorio para el futuro: toda función nueva que devuelva datos agregados
-- tiene que terminar con estas dos líneas. Si no se escriben, queda abierta.

notify pgrst, 'reload schema';
