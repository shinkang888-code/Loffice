/** 브라우저에서는 Vercel /engine 프록시(동일 출처) 사용 → PDF.js CORS 회피 */
export function clientEngineUrl(): string {
  if (typeof window !== "undefined") return "/engine";
  return process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:9982";
}

/** 엔진이 반환한 절대 URL → /engine 상대 경로로 정규화 */
export function normalizeEngineUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return `/engine${u.pathname}${u.search}`;
  } catch {
    if (url.startsWith("/engine/")) return url;
    if (url.startsWith("/api/")) return `/engine${url}`;
    return url;
  }
}

export function engineApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${clientEngineUrl()}${p}`;
}
