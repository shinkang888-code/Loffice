import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { clientEngineUrl } from "./engine-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** API 호출용 엔진 URL (브라우저: /engine 프록시) */
export const ENGINE_URL = clientEngineUrl();

export const SUPPORTED_FORMATS = [
  "ODT", "ODS", "ODP", "DOC", "DOCX", "XLS", "XLSX",
  "PPT", "PPTX", "RTF", "TXT", "CSV", "PDF", "EPUB", "HTML",
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
