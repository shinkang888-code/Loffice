import { ENGINE_URL } from "./utils";
import { normalizeEngineUrl } from "./engine-url";
import { fixFilename } from "./filename";
import type { LofficeDocument } from "./storage";

export type PreviewType = "pdf" | "image" | "text" | "html" | "info";

export interface PreviewInfo {
  type: PreviewType;
  url?: string;
  content?: string;
  fileName: string;
  fileSize: number;
  ext: string;
  message?: string;
}

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg"]);
const TEXT_EXT = new Set([
  ".txt", ".csv", ".md", ".json", ".xml", ".log", ".js", ".ts", ".tsx", ".jsx",
  ".py", ".java", ".c", ".cpp", ".h", ".css", ".scss", ".yaml", ".yml", ".ini", ".bat", ".sh",
]);
const HTML_EXT = new Set([".html", ".htm"]);

export function detectClientPreviewType(ext: string): PreviewType {
  const e = ext.toLowerCase();
  if (e === ".pdf") return "pdf";
  if (IMAGE_EXT.has(e)) return "image";
  if (TEXT_EXT.has(e)) return "text";
  if (HTML_EXT.has(e)) return "html";
  return "pdf"; // LibreOffice 변환 시도
}

export async function fetchPreviewInfo(doc: LofficeDocument): Promise<PreviewInfo> {
  const base: PreviewInfo = {
    type: (doc.previewType as PreviewType) || detectClientPreviewType(doc.ext),
    fileName: fixFilename(doc.name),
    fileSize: doc.size,
    ext: doc.ext,
  };

  try {
    const res = await fetch(`${ENGINE_URL}/api/documents/${doc.id}/preview`);
    if (res.ok) {
      const data = await res.json();
      return {
        ...base,
        ...data,
        fileName: fixFilename(data.fileName || doc.name),
        url: normalizeEngineUrl(data.url),
      };
    }
  } catch { /* fallback below */ }

  const type = base.type;
  const rawUrl = `${ENGINE_URL}/api/documents/${doc.id}/raw`;

  if (type === "pdf") {
    const pdfUrl = `${ENGINE_URL}/api/documents/${doc.id}/pdf`;
    const check = await fetch(pdfUrl, { method: "HEAD" }).catch(() => null);
    if (check?.ok) return { ...base, type: "pdf", url: pdfUrl };
    return {
      ...base,
      type: "info",
      message: "PDF 미리보기 생성 중이거나 지원되지 않는 형식입니다. 원본 파일을 다운로드할 수 있습니다.",
      url: rawUrl,
    };
  }

  if (type === "image") {
    return { ...base, type: "image", url: rawUrl };
  }

  if (type === "text" || type === "html") {
    try {
      const res = await fetch(rawUrl);
      const content = await res.text();
      return { ...base, type, content, url: rawUrl };
    } catch {
      return { ...base, type: "info", message: "텍스트를 불러올 수 없습니다.", url: rawUrl };
    }
  }

  return { ...base, type: "info", message: "미리보기를 준비 중입니다.", url: rawUrl };
}
