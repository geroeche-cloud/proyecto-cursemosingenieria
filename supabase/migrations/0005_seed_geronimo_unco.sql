-- ============================================================================
-- Cursemos Ingeniería · Migración 0005 — Perfil de Gerónimo (embajador UNCo)
-- ----------------------------------------------------------------------------
-- Carga el perfil PÚBLICO del embajador de la Universidad Nacional del Comahue
-- (como si se hubiera cargado a mano en el panel de admin) y lo enlaza a la
-- cuenta de login geroeche@icloud.com si ya existe (si no, se enlaza al re-correr
-- esta migración una vez creada la cuenta desde el admin).
-- Idempotente. Requiere 0004. Se ancla por slug 'unco'.
-- ============================================================================

insert into public.ambassador_profiles
  (university_id, profile_id, display_name, presentation, photo_url,
   bio, bio_full, trajectory, email, instagram, tiktok, youtube, linkedin, updated_at)
select
  u.id,
  (select p.id from public.profiles p where lower(p.email) = 'geroeche@icloud.com' limit 1),
  'Gerónimo Echevarría',
  'Fundador de Cursemos Ingeniería · Embajador de la Universidad Nacional del Comahue',
  '/images/hero-portada.jpg',
  'Estudiante de Ingeniería en Petróleo, técnico químico y apasionado por la tecnología, la innovación y la construcción de comunidades capaces de generar impacto real.',
  'Fundé Cursemos Ingeniería con una convicción: el futuro no se construye únicamente dentro de las aulas, sino en la conexión entre personas, ideas, universidades, empresas y oportunidades.

Creo que la universidad puede convertirse en mucho más que un espacio de formación académica. Puede ser el lugar donde nacen líderes, proyectos, amistades, tecnologías y soluciones capaces de transformar industrias enteras.

Por eso, Cursemos Ingeniería busca construir una red nacional que impulse a una nueva generación de estudiantes a desarrollar no solo conocimientos técnicos, sino también liderazgo, pensamiento crítico, creatividad, comunicación y la capacidad de convertir ideas en realidades.

Mi objetivo es demostrar que el impacto no comienza el día en que recibimos un título. Comienza mucho antes: en el momento en que decidimos construir, crear y asumir el desafío de mejorar el mundo que nos rodea.

Porque las grandes transformaciones no empiezan con recursos extraordinarios. Empiezan cuando personas comunes deciden construir algo extraordinario juntas.

Imagino una generación de estudiantes que no solo aspire a aprobar exámenes, sino también a liderar proyectos, crear tecnología, impulsar comunidades y dejar una huella real en el mundo.

Quiero construir una red donde universidades, empresas y estudiantes trabajen juntos para potenciar el talento, acelerar la innovación y formar a las personas que liderarán los próximos desafíos de nuestra sociedad.

Cursemos Ingeniería no busca acompañar el futuro. Busca ayudar a construirlo. Porque el futuro no pertenece a quienes esperan: pertenece a quienes se animan a imaginarlo, diseñarlo y hacerlo realidad.',
  '[
    {"year":"2024","title":"Técnico Químico — EPET N.º 14 (Neuquén)","detail":"Egreso como técnico químico: mis primeros pasos en el mundo de la energía, la industria y la ingeniería."},
    {"year":"2024","title":"Introducción a la Industria Hidrocarburífera","detail":"Primer acercamiento formal al sector energético y a la industria del petróleo y el gas. · 3 meses"},
    {"year":"2024","title":"Operador de Pozo No Convencional — Curso básico","detail":"Procesos operativos, seguridad y fundamentos del trabajo en yacimientos no convencionales. · 3 meses"},
    {"year":"2024","title":"Química aplicada a la perforación no convencional","detail":"Principios químicos en la perforación y su impacto en la eficiencia y la seguridad. · 1 mes"},
    {"year":"2025","title":"Ingeniería en Petróleo — Universidad Nacional del Comahue","detail":"Inicio de la carrera de Ingeniería en Petróleo en la Universidad Nacional del Comahue."},
    {"year":"2025","title":"Programa de Becarios Roberto Rocca","detail":"Ingreso al programa, enfocado en el desarrollo académico, profesional y personal."},
    {"year":"2026","title":"Fundación de Cursemos Ingeniería","detail":"Una red que conecta estudiantes, universidades, empresas y oportunidades para potenciar a la próxima generación de ingenieros."},
    {"year":"2026","title":"Voluntarios en Acción — Tecpetrol","detail":"Proyectos educativos y comunitarios en la Cuenca Neuquina."},
    {"year":"2026","title":"Tecpetrol Inspiring Program","detail":"Habilidades profesionales, liderazgo e innovación vinculadas al sector energético."},
    {"year":"2026","title":"SPE Comahue Student Chapter","detail":"Incorporación oficial al capítulo estudiantil: actividades técnicas, vínculo con la industria y proyectos de la comunidad."}
  ]'::jsonb,
  'geroeche@icloud.com',
  'https://www.instagram.com/cursemosingenieria',
  'https://www.tiktok.com/@cursemos.ingenieria',
  'https://www.youtube.com/@CursemosIngenier%C3%ADa',
  'https://www.linkedin.com/in/echevarriageronimo/',
  now()
from public.universities u
where u.slug = 'unco'
on conflict (university_id) do update set
  profile_id   = coalesce(excluded.profile_id, public.ambassador_profiles.profile_id),
  display_name = excluded.display_name,
  presentation = excluded.presentation,
  photo_url    = excluded.photo_url,
  bio          = excluded.bio,
  bio_full     = excluded.bio_full,
  trajectory   = excluded.trajectory,
  email        = excluded.email,
  instagram    = excluded.instagram,
  tiktok       = excluded.tiktok,
  youtube      = excluded.youtube,
  linkedin     = excluded.linkedin,
  updated_at   = now();

-- ============================================================================
-- Fin de la migración 0005.
-- ============================================================================
