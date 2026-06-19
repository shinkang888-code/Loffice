/** 한글/UTF-8 파일명 복원 (multer latin1, mojibake) */
export function fixFilename(name: string | undefined | null): string {
  if (!name) return "document";

  if (/[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/.test(name)) return name;

  const fromLatin1 = decodeLatin1AsUtf8(name);
  if (/[\uAC00-\uD7A3]/.test(fromLatin1)) return fromLatin1;

  const fromMojibake = fixMojibakeUtf8(name);
  if (/[\uAC00-\uD7A3]/.test(fromMojibake)) return fromMojibake;

  return name;
}

function decodeLatin1AsUtf8(name: string): string {
  try {
    const bytes = new Uint8Array(name.length);
    for (let i = 0; i < name.length; i++) bytes[i] = name.charCodeAt(i) & 0xff;
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return decoded.includes("\uFFFD") ? name : decoded;
  } catch {
    return name;
  }
}

/** UTF-8 바이트가 latin1 문자열로 저장된 경우 (ìíìëë…) */
function fixMojibakeUtf8(name: string): string {
  try {
    const encoded = new TextEncoder().encode(name);
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(encoded);
    return decoded.includes("\uFFFD") ? name : decoded;
  } catch {
    return name;
  }
}
