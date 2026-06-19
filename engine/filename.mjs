/** multer latin1 → UTF-8 파일명 복원 (Node) */
export function fixFilename(name) {
  if (!name) return "document";
  if (/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/.test(name)) return name;

  try {
    const fromLatin1 = Buffer.from(name, "latin1").toString("utf8");
    if (/[\uAC00-\uD7A3]/.test(fromLatin1) && !fromLatin1.includes("\uFFFD")) return fromLatin1;
  } catch { /* ignore */ }

  try {
    const fromMojibake = Buffer.from(name, "utf8").toString("utf8");
    if (/[\uAC00-\uD7A3]/.test(fromMojibake) && fromMojibake !== name) return fromMojibake;
  } catch { /* ignore */ }

  return name;
}
