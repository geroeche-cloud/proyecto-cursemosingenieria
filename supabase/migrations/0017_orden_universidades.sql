-- ============================================================================
-- 0017 — Orden propio para las universidades
--
-- POR QUÉ
-- Hasta acá el campus se ordenaba alfabéticamente. Con dos o tres universidades
-- da igual; con cincuenta, el orden deja de ser un detalle y pasa a ser una
-- decisión: cuál se ve primero, cuál queda al final de la grilla.
--
-- El criterio que se quiere es simple:
--   1. La universidad fundadora, siempre primera.
--   2. Las demás, en el orden en que se sumaron a la plataforma.
--
-- CÓMO SE RESUELVE CADA PARTE
--
-- (1) Una columna `orden`. Menor va primero. La forma rápida habría sido
--     escribir el slug de la fundadora en el código y ordenar por eso. No se
--     hizo, a propósito: cada vez que hubiera que cambiar el orden —destacar
--     otra universidad, mover una— habría que tocar el código y volver a
--     desplegar. Eso no escala y ata el producto al programador. Con una
--     columna, se edita desde el panel de administración y listo.
--
-- (2) El desempate es `created_at`, no el nombre. Es la fecha en que la
--     universidad se dio de alta, y NO CAMBIA NUNCA: ni al editar la
--     universidad, ni al editar el perfil del embajador, ni al publicar
--     contenido. Por eso el orden queda quieto para siempre. Alfabético habría
--     movido de lugar a una universidad con solo corregirle una letra al nombre.
--
-- 100 es el valor por defecto de `orden`: toda universidad nueva entra al
-- montón, detrás de las destacadas, y se ubica según cuándo se sumó.
-- ============================================================================

do $guarda$
begin
  if to_regclass('public.universities') is null then
    raise exception
      'Esta base no tiene las tablas de Cursemos Ingenieria. Estas en el proyecto equivocado: fijate el selector de arriba en el panel de Supabase.';
  end if;
end
$guarda$;

alter table public.universities
  add column if not exists orden int not null default 100;

comment on column public.universities.orden is
  'Orden de aparicion en el campus. Menor primero. 100 es el valor por defecto; se baja para destacar. A igualdad de orden manda la antiguedad (created_at).';

-- El listado publico ordena por (orden, created_at) filtrando las activas:
-- este indice hace que siga siendo instantaneo con cientos de universidades.
create index if not exists universities_orden_idx
  on public.universities (orden, created_at)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Semilla: la universidad fundadora queda primera.
--
-- Esto es un DATO INICIAL, no una regla del sistema. A partir de aca el orden
-- se maneja desde el panel; esta linea solo evita tener que configurarlo a mano
-- la primera vez. Si el slug no existe, no hace nada y no falla.
-- ---------------------------------------------------------------------------
update public.universities set orden = 0 where slug = 'unco';

notify pgrst, 'reload schema';
