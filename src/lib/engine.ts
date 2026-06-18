import { ENGINE_URL } from "./utils";
import { saveDocument, type LofficeDocument } from "./storage";

export interface ConvertResult {
  id: string;
  name: string;
  ext: string;
  createdAt: string;
  engine: string;
  pdfUrl: string;
  previewUrl: string;
}

export async function checkEngineHealth(): Promise<{ ok: boolean; libreOffice: string | null }> {
  try {
    const res = await fetch(`${ENGINE_URL}/health`);
    const data = await res.json();
    return { ok: data.status === "ok", libreOffice: data.libreOffice };
  } catch {
    return { ok: false, libreOffice: null };
  }
}

export async function convertAndSave(file: File): Promise<LofficeDocument> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${ENGINE_URL}/api/convert`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "변환 실패" }));
    throw new Error(err.error || "변환 실패");
  }

  const result: ConvertResult = await res.json();
  const doc: LofficeDocument = {
    id: result.id,
    name: result.name,
    ext: result.ext,
    size: file.size,
    createdAt: result.createdAt,
    pdfUrl: result.pdfUrl,
    engine: result.engine,
  };
  await saveDocument(doc);
  return doc;
}
