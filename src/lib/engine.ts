import { ENGINE_URL } from "./utils";
import { normalizeEngineUrl } from "./engine-url";
import { saveDocument, type LofficeDocument } from "./storage";

export interface ConvertResult {
  id: string;
  name: string;
  ext: string;
  createdAt: string;
  engine: string;
  pdfUrl: string;
  previewUrl: string;
  editorUrl?: string | null;
  editable?: boolean;
  collabora?: boolean;
  previewType?: string;
  hasPdf?: boolean;
  rawUrl?: string;
}

export async function checkEngineHealth(): Promise<{
  ok: boolean;
  libreOffice: string | null;
  collabora: boolean;
}> {
  try {
    const res = await fetch(`${ENGINE_URL}/health`);
    const data = await res.json();
    return {
      ok: data.status === "ok",
      libreOffice: data.libreOffice,
      collabora: !!data.collabora,
    };
  } catch {
    return { ok: false, libreOffice: null, collabora: false };
  }
}

export async function getEditorUrl(docId: string): Promise<string | null> {
  const res = await fetch(`${ENGINE_URL}/api/documents/${docId}/editor-url`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.editorUrl ?? null;
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
    pdfUrl: normalizeEngineUrl(result.pdfUrl) || "",
    editorUrl: result.editorUrl,
    editable: result.editable,
    collabora: result.collabora,
    previewType: result.previewType,
    hasPdf: result.hasPdf,
    rawUrl: normalizeEngineUrl(result.rawUrl),
    engine: result.engine,
  };
  await saveDocument(doc);
  return doc;
}

export function getDocumentRoute(doc: LofficeDocument): string {
  return `/workspace?id=${doc.id}`;
}
