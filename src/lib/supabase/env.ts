/**
 * Variables de entorno de Supabase.
 * Las NEXT_PUBLIC_* pueden usarse en navegador y servidor (Next las inyecta al bundle).
 * La service_role NUNCA se expone al navegador — vive solo en admin.ts (servidor).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Definilas en .env.local (el archivo correcto, no un .txt).",
  );
}

export const supabaseUrl: string = url;
export const supabaseAnonKey: string = anonKey;
