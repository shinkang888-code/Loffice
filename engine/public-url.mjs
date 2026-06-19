import { fixFilename } from "./filename.mjs";

export { fixFilename };

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
