/** Server-side Supabase sync for engine */
export async function syncToSupabase(meta) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/loffice_documents`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        engine_id: meta.id,
        name: meta.name,
        ext: meta.ext,
        size: meta.size,
        mime: meta.mime,
        preview_type: meta.previewType || "pdf",
        editable: meta.editable ?? false,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn("Supabase sync failed:", e.message);
  }
}
