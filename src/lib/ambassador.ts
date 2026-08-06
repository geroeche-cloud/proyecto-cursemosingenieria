import { type AmbassadorCardData } from "@/components/campus/AmbassadorCard";

/** Columnas del perfil del embajador para el render de campus. */
export const AMB_COLS =
  "display_name, presentation, bio, bio_full, photo_url, email, instagram, tiktok, youtube, linkedin, trajectory";

export type AmbassadorRaw = {
  display_name: string | null;
  presentation: string | null;
  bio: string | null;
  bio_full: string | null;
  photo_url: string | null;
  email: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
  trajectory: unknown;
} | null;

/** Convierte la fila de ambassador_profiles en los datos de la tarjeta. */
export function buildAmbassador(
  ambRaw: AmbassadorRaw,
  universityName: string,
): AmbassadorCardData | null {
  if (!ambRaw || !(ambRaw.display_name || ambRaw.bio || ambRaw.photo_url)) return null;
  return {
    universityName,
    name: ambRaw.display_name,
    presentation: ambRaw.presentation,
    bio: ambRaw.bio,
    bioFull: ambRaw.bio_full,
    photo: ambRaw.photo_url,
    email: ambRaw.email,
    instagram: ambRaw.instagram,
    tiktok: ambRaw.tiktok,
    youtube: ambRaw.youtube,
    linkedin: ambRaw.linkedin,
    trajectory: Array.isArray(ambRaw.trajectory)
      ? (ambRaw.trajectory as { year?: unknown; title?: unknown; text?: unknown; detail?: unknown }[])
          .map((t) => ({
            year: String(t.year ?? ""),
            title: String(t.title ?? t.text ?? ""),
            detail: String(t.detail ?? ""),
          }))
          .filter((t) => t.title)
      : [],
  };
}
