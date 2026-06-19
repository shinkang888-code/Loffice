/** Render/Vercel 프로덕션에서 공개 API 베이스 URL */
export function getPublicBase(req) {
  const fromEnv =
    process.env.PUBLIC_ENGINE_URL ||
    process.env.WOPI_HOST ||
    process.env.RENDER_EXTERNAL_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (req?.get?.("host")) {
    const proto = req.get("x-forwarded-proto") || req.protocol || "https";
    return `${proto}://${req.get("host")}`;
  }
  const port = process.env.PORT || process.env.LOFFICE_ENGINE_PORT || 9982;
  return `http://localhost:${port}`;
}

export function apiUrl(req, pathname) {
  return `${getPublicBase(req)}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** 한글 파일명 Content-Disposition */
export function contentDisposition(filename, inline = true) {
  const mode = inline ? "inline" : "attachment";
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `${mode}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/** multer latin1 → UTF-8 파일명 복원 */
export function fixFilename(name) {
  if (!name) return "document";
  if (/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/.test(name)) return name;
  try {
    const decoded = Buffer.from(name, "latin1").toString("utf8");
    if (decoded && !decoded.includes("\uFFFD")) return decoded;
  } catch { /* keep original */ }
  return name;
}
