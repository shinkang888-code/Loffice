/**
 * Supabase Storage — Render 휘발성 디스크 보완
 * bucket: loffice-files
 */
import { promises as fs } from "fs";

const BUCKET = "loffice-files";

function cfg() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

async function storageFetch(path, opts = {}) {
  const c = cfg();
  if (!c) return null;
  const res = await fetch(`${c.url}/storage/v1/object/${BUCKET}/${path}`, {
    ...opts,
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      ...(opts.headers || {}),
    },
  });
  return res;
}

export async function uploadToStorage(storagePath, filePath, contentType) {
  const c = cfg();
  if (!c) return false;
  try {
    const body = await fs.readFile(filePath);
    const res = await storageFetch(storagePath, {
      method: "POST",
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "x-upsert": "true",
      },
      body,
    });
    return res.ok;
  } catch (e) {
    console.warn("Storage upload failed:", e.message);
    return false;
  }
}

export async function downloadFromStorage(storagePath, destPath) {
  const c = cfg();
  if (!c) return false;
  try {
    const res = await storageFetch(storagePath);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(destPath, buf);
    return true;
  } catch (e) {
    console.warn("Storage download failed:", e.message);
    return false;
  }
}

export function storageKey(docId, file) {
  return `${docId}/${file}`;
}
