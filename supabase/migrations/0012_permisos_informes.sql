-- ============================================================================
-- Cursemos Ingeniería · Migración 0012 — Permisos de las funciones de informes
-- ----------------------------------------------------------------------------
-- En la 0010 revoqué el permiso de ejecución de report_stats y
-- report_by_university para que el público no pudiera consultarlas. Pero al
-- revocar de PUBLIC también quedó sin acceso `service_role`, que es
-- precisamente el rol con el que el servidor arma los informes: las páginas
-- habrían fallado con "permission denied for function".
--
-- Acá se da el permiso explícito SOLO a service_role (clave de servidor, nunca
-- expuesta al navegador). anon y authenticated siguen sin acceso.
--
-- Idempotente. Requiere 0010.
-- ============================================================================

revoke all on function public.report_stats(uuid) from public, anon, authenticated;
revoke all on function public.report_by_university() from public, anon, authenticated;

grant execute on function public.report_stats(uuid) to service_role;
grant execute on function public.report_by_university() to service_role;

-- ============================================================================
-- Fin de la migración 0012.
-- ============================================================================
