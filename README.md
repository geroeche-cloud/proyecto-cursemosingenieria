# Gerónimo Echevarría — Sitio de marca personal

Hub digital premium que reúne dos identidades: **Gerónimo Echevarría** (marca personal) y **Cursemos Ingeniería** (iniciativa educativa).

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — sistema de diseño oscuro premium, glassmorphism, luces ambientales
- **Motion** (Framer Motion) — animaciones fluidas
- **i18n** Español / Inglés con toggle (sin recargar la página)
- Totalmente estático → deploy en Vercel en segundos

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
```

Otros comandos:

```bash
npm run build    # build de producción
npm run start    # sirve el build
npm run lint
```

## Estructura

```
src/
  app/            layout, page, globals.css (design system), robots, sitemap
  components/
    layout/       Nav, Footer
    sections/     Hero, About, Trajectory, Projects, Cursemos, Content, Contact
    ui/           LogoE, AmbientLights, Reveal, SectionHeading, toggles
    providers/    LanguageProvider (i18n), AudienceProvider (Empresas/Estudiantes)
  lib/
    i18n.ts       diccionarios ES/EN (todo el texto editable acá)
    content.ts    links oficiales, redes y rutas de imágenes
public/
  icon.svg        favicon (monograma E)
  images/         fotos (perfil, intelectual, proceso, lifestyle)
```

### Editar contenido
- **Textos:** `src/lib/i18n.ts` (ES y EN).
- **Links / redes / email:** `src/lib/content.ts`.
- **Fotos:** reemplazar los archivos en `public/images/` manteniendo el nombre.

## Deploy en Vercel

1. Subí este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importá el repo.
3. **Root Directory:** seleccioná la carpeta `web`.
4. Framework: Next.js (autodetectado). Deploy.
5. Para dominio propio: Project → Settings → Domains.

> Recordá actualizar `SITE_URL` en `src/app/layout.tsx`, `robots.ts` y `sitemap.ts`
> con el dominio final para el SEO y las metaetiquetas Open Graph.
