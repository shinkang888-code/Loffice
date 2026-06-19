/**
 * Colibre SVG 아이콘 전체 동기화 + manifest 생성
 * Usage: node scripts/sync-lo-icons.mjs
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "assets", "libreoffice-ui", "cmd");
const DST = path.join(__dirname, "..", "public", "icons", "lo");

async function main() {
  await fs.mkdir(DST, { recursive: true });
  const entries = await fs.readdir(SRC, { withFileTypes: true });
  const manifest = {};
  let copied = 0;

  for (const e of entries) {
    if (!e.isFile() || !e.name.startsWith("lc_") || !e.name.endsWith(".svg")) continue;
    const src = path.join(SRC, e.name);
    const dest = path.join(DST, e.name);
    try {
      await fs.access(dest);
    } catch {
      await fs.copyFile(src, dest);
      copied++;
    }
    const cmd = `.uno:${e.name.replace("lc_", "").replace(".svg", "")}`;
    manifest[cmd] = e.name.replace(".svg", "");
  }

  await fs.writeFile(path.join(DST, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Icons: ${Object.keys(manifest).length} mapped, ${copied} newly copied`);
}

main().catch(console.error);
