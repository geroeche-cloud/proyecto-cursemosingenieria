import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CampusView,
  type CampusNews,
  type CampusOpp,
  type CampusProf,
  type CampusDrive,
} from "@/components/campus/CampusView";
import { createPublicClient } from "@/lib/supabase/public";
import { isActiveNow } from "@/lib/schedule";
import { AMB_COLS, buildAmbassador, type AmbassadorRaw } from "@/lib/ambassador";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("universities").select("slug").eq("status", "active");
    return (data ?? []).map((u: { slug: string }) => ({ university: u.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string }>;
}): Promise<Metadata> {
  const { university } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("universities")
    .select("name, short_name")
    .eq("slug", university)
    .maybeSingle();
  return { title: data ? `${data.short_name || data.name} · Campus` : "Campus" };
}

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ university: string }>;
}) {
  const { university } = await params;
  const supabase = createPublicClient();

  const { data: uni } = await supabase
    .from("universities")
    .select("id, name, short_name, city, slug")
    .eq("slug", university)
    .eq("status", "active")
    .maybeSingle();
  if (!uni) notFound();

  const uid = uni.id;
  const [newsRes, oppRes, profRes, driveRes, ambProfileRes] = await Promise.all([
    supabase.from("news").select("id, title, summary, body, starts_at, ends_at").eq("university_id", uid).eq("status", "published").order("published_at", { ascending: false }).limit(30),
    supabase.from("opportunities").select("id, kind, title, org, description, deadline, requirements, href, starts_at, ends_at").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(60),
    supabase.from("professors").select("id, name, title, modality, subjects, whatsapp").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(100),
    supabase.from("drives").select("id, owner, career, href").eq("university_id", uid).eq("status", "published").order("created_at", { ascending: false }).limit(100),
    supabase.from("ambassador_profiles").select(AMB_COLS).eq("university_id", uid).maybeSingle(),
  ]);

  const news = ((newsRes.data ?? []) as CampusNews[]).filter((n) =>
    isActiveNow(n.starts_at ?? null, n.ends_at ?? null),
  );
  const opportunities = ((oppRes.data ?? []) as CampusOpp[]).filter((o) =>
    isActiveNow(o.starts_at ?? null, o.ends_at ?? null),
  );
  const professors = (profRes.data ?? []) as CampusProf[];
  const drives = (driveRes.data ?? []) as CampusDrive[];
  const ambassador = buildAmbassador(ambProfileRes.data as AmbassadorRaw, uni.name);

  return (
    <CampusView
      uni={uni}
      news={news}
      opportunities={opportunities}
      professors={professors}
      drives={drives}
      ambassador={ambassador}
    />
  );
}
