import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  CampusView,
  type CampusNews,
  type CampusOpp,
  type CampusProf,
  type CampusDrive,
} from "@/components/campus/CampusView";
import { AMB_COLS, buildAmbassador, type AmbassadorRaw } from "@/lib/ambassador";

export const metadata: Metadata = { title: "Vista previa · Campus", robots: { index: false } };

// Depende de la sesión del embajador → siempre dinámica.
export const dynamic = "force-dynamic";

const VISIBLE = ["draft", "published"];

export default async function PreviewPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ambassador" || !user.university_id) redirect("/login");

  const supabase = await createClient();
  const { data: uni } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("id", user.university_id)
    .maybeSingle();

  if (!uni) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center text-ink">
        <h1 className="font-display text-2xl font-bold">Tu universidad no está activa</h1>
        <p className="mt-2 text-ink-soft">
          Cuando el equipo la active vas a poder ver tu campus acá.
        </p>
        <Link href="/panel" className="btn btn-blue mt-6 inline-flex">
          Volver al panel
        </Link>
      </main>
    );
  }

  const uid = uni.id;
  const [newsRes, oppRes, profRes, driveRes, ambProfileRes] = await Promise.all([
    supabase.from("news").select("id, title, summary, body, status, starts_at, ends_at").eq("university_id", uid).in("status", VISIBLE).order("created_at", { ascending: false }).limit(50),
    supabase.from("opportunities").select("id, kind, title, org, description, deadline, requirements, href, status, starts_at, ends_at").eq("university_id", uid).in("status", VISIBLE).order("created_at", { ascending: false }),
    supabase.from("professors").select("id, name, title, modality, subjects, whatsapp, status").eq("university_id", uid).in("status", VISIBLE).order("created_at", { ascending: false }),
    supabase.from("drives").select("id, owner, career, href, status").eq("university_id", uid).in("status", VISIBLE).order("created_at", { ascending: false }),
    supabase.from("ambassador_profiles").select(AMB_COLS).eq("university_id", uid).maybeSingle(),
  ]);

  const news = (newsRes.data ?? []) as CampusNews[];
  const opportunities = (oppRes.data ?? []) as CampusOpp[];
  const professors = (profRes.data ?? []) as CampusProf[];
  const drives = (driveRes.data ?? []) as CampusDrive[];
  const ambassador = buildAmbassador(ambProfileRes.data as AmbassadorRaw, uni.name);

  return (
    <>
      <CampusView
        uni={uni}
        news={news}
        opportunities={opportunities}
        professors={professors}
        drives={drives}
        ambassador={ambassador}
        preview
      />

      {/* Barra flotante de vista previa */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div
          className="flex items-center gap-3 rounded-full border border-blue-500/40 px-4 py-2 text-sm shadow-lg backdrop-blur"
          style={{ background: "rgba(10,14,26,0.9)" }}
        >
          <span className="flex items-center gap-2 font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Vista previa — solo vos ves esto
          </span>
          <Link href="/panel" className="font-mono text-xs text-blue-300 hover:text-blue-200">
            Volver al panel
          </Link>
        </div>
      </div>
    </>
  );
}
