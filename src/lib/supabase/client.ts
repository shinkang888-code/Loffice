import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export interface DbDocument {
  id: string;
  engine_id: string | null;
  name: string;
  ext: string;
  size: number;
  mime: string | null;
  preview_type: string;
  editable: boolean;
  storage_path: string | null;
  created_at: string;
}

export async function syncDocumentToDb(meta: {
  id: string;
  name: string;
  ext: string;
  size: number;
  mime?: string;
  previewType?: string;
  editable?: boolean;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("loffice_documents").upsert({
    engine_id: meta.id,
    name: meta.name,
    ext: meta.ext,
    size: meta.size,
    mime: meta.mime,
    preview_type: meta.previewType || "pdf",
    editable: meta.editable ?? false,
    updated_at: new Date().toISOString(),
  }, { onConflict: "engine_id" });
}

export async function listDbDocuments(): Promise<DbDocument[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("loffice_documents").select("*").order("created_at", { ascending: false }).limit(50);
  return (data as DbDocument[]) || [];
}
