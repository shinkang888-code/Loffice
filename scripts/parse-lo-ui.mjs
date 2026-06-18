/**
 * LibreOffice UI XML → JSON 파서
 * Usage: node scripts/parse-lo-ui.mjs
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LO_SHARE = process.env.LO_SHARE || "C:\\Program Files\\LibreOffice\\share";
const OUT = path.join(__dirname, "..", "src", "data");

const MODULES = ["swriter", "scalc", "simpress"];

async function parseToolbarXml(xml) {
  const items = [];
  const re = /xlink:href="([^"]+)"/g;
  let m;
  while ((m = re.exec(xml))) {
    if (!m[1].startsWith(".uno:")) continue;
    items.push({ command: m[1], type: "item" });
  }
  const sepCount = (xml.match(/toolbar:toolbarseparator/g) || []).length;
  return { items, separators: sepCount };
}

async function parseMenubarXml(xml) {
  const menus = [];
  const menuRe = /<menu:menu menu:id="([^"]+)"[^>]*>/g;
  let m;
  while ((m = menuRe.exec(xml))) {
    const menuId = m[1];
    const items = [];
    const itemRe = /menu:menuitem menu:id="([^"]+)"/g;
    const section = xml.slice(m.index, xml.indexOf("</menu:menu>", m.index));
    let im;
    while ((im = itemRe.exec(section))) {
      items.push({ command: im[1], type: "menuitem" });
    }
    menus.push({ id: menuId, items });
  }
  return menus;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const result = {};

  for (const mod of MODULES) {
    const base = path.join(LO_SHARE, "config", "soffice.cfg", "modules", mod);
    const entry = { module: mod };

    try {
      const toolbar = await fs.readFile(path.join(base, "toolbar", "toolbar.xml"), "utf-8");
      entry.toolbar = await parseToolbarXml(toolbar);
    } catch { entry.toolbar = { items: [] }; }

    try {
      const menubar = await fs.readFile(path.join(base, "menubar", "menubar.xml"), "utf-8");
      entry.menubar = await parseMenubarXml(menubar);
    } catch { entry.menubar = []; }

    result[mod] = entry;
    console.log(`${mod}: toolbar=${entry.toolbar.items.length} cmds, menubar=${entry.menubar.length} menus`);
  }

  await fs.writeFile(path.join(OUT, "libreoffice-ui.json"), JSON.stringify(result, null, 2));
  console.log(`\nSaved → src/data/libreoffice-ui.json`);
}

main().catch(console.error);
