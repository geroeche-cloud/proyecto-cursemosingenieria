-- ============================================================================
-- 0014 — Que suspender a alguien le quite el acceso DE VERDAD
--
-- EL PROBLEMA
-- `app_role()` devolvía el rol leyendo la tabla de perfiles sin mirar el estado
-- de la cuenta. Y TODAS las políticas de seguridad de todas las tablas llaman a
-- esa función.
--
-- Consecuencia: suspender a un embajador desde el panel no le quitaba nada. El
-- panel lo redirigía al login —eso es frontend— pero su token de sesión seguía
-- siendo válido contra la base. Con ese token podía seguir creando, editando y
-- borrando contenido de su universidad desde fuera de la aplicación. Lo mismo
-- para una cuenta enviada a la papelera.
--
-- Es la diferencia entre "no ve el botón" y "no puede hacerlo". Solo lo segundo
-- es seguridad.
--
-- LA SOLUCIÓN
-- Las dos funciones que usan las políticas devuelven NULL si la cuenta no está
-- activa o fue borrada. Como toda política compara contra ellas, un NULL hace
-- que ninguna condición se cumpla y el acceso desaparece en todas las tablas a
-- la vez. Un solo cambio, sin tocar ni una política.
--
-- Se arregla en la raíz a propósito: si mañana se agrega una tabla nueva con el
-- mismo patrón de políticas, queda protegida sin que nadie tenga que acordarse.
-- ============================================================================

create or replace function public.app_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role
    from public.profiles
   where id = auth.uid()
     and status = 'active'
     and deleted_at is null
$$;

create or replace function public.app_university_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select university_id
    from public.profiles
   where id = auth.uid()
     and status = 'active'
     and deleted_at is null
$$;

-- El administrador también: una cuenta de admin suspendida deja de ser admin.
-- No hay excepciones, porque una excepción es justo lo que alguien buscaría.

notify pgrst, 'reload schema';
