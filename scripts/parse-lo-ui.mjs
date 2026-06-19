/**
 * LibreOffice UI XML → 메뉴 JSON (확장 파서)
 * Usage: node scripts/parse-lo-ui.mjs
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LO_SHARE = process.env.LO_SHARE || "C:\\Program Files\\LibreOffice\\share";
const OUT = path.join(__dirname, "..", "src", "data");

const MODULES = ["swriter", "scalc", "simpress", "sdraw"];

const KO_LABELS = {
  ".uno:PickList": "파일",
  ".uno:EditMenu": "편집",
  ".uno:ViewMenu": "보기",
  ".uno:InsertMenu": "삽입",
  ".uno:FormatMenu": "서식",
  ".uno:PageMenu": "페이지",
  ".uno:ShapeMenu": "도형",
  ".uno:ToolsMenu": "도구",
  ".uno:WindowMenu": "창",
  ".uno:HelpMenu": "도움말",
  ".uno:Save": "저장",
  ".uno:SaveAs": "다른 이름으로 저장",
  ".uno:Open": "열기",
  ".uno:AddDirect": "새로 만들기",
  ".uno:CloseDoc": "닫기",
  ".uno:Print": "인쇄",
  ".uno:ExportDirectToPDF": "PDF로 내보내기",
  ".uno:Cut": "잘라내기",
  ".uno:Copy": "복사",
  ".uno:Paste": "붙여넣기",
  ".uno:Undo": "실행 취소",
  ".uno:Redo": "다시 실행",
  ".uno:Find": "찾기",
  ".uno:Bold": "굵게",
  ".uno:Italic": "기울임꼴",
  ".uno:Underline": "밑줄",
  ".uno:ZoomIn": "확대",
  ".uno:ZoomOut": "축소",
};

function labelFor(cmd) {
  return KO_LABELS[cmd] || cmd.replace(".uno:", "").replace(/([A-Z])/g, " $1").trim();
}

async function parseMenubarXml(xml) {
  const menus = [];
  const topRe = /<menu:menu menu:id="([^"]+)"[^>]*>([\s\S]*?)<\/menu:menu>/g;
  let m;
  while ((m = topRe.exec(xml))) {
    const id = m[1];
    if (id.startsWith(".uno:TemplateMenu") || id.startsWith(".uno:ExportAsMenu")) continue;
    const section = m[2];
    const items = [];
    const itemRe = /menu:menuitem menu:id="([^"]+)"/g;
    let im;
    while ((im = itemRe.exec(section))) {
      items.push({ command: im[1], label: labelFor(im[1]) });
    }
    if (items.length > 0 || KO_LABELS[id]) {
      menus.push({ id, label: KO_LABELS[id] || labelFor(id), items });
    }
  }
  return menus;
}

async function parseToolbarXml(xml) {
  const items = [];
  const re = /xlink:href="([^"]+)"/g;
  let m;
  while ((m = re.exec(xml))) {
    if (m[1].startsWith(".uno:")) {
      items.push({ command: m[1], label: labelFor(m[1]), icon: `lc_${m[1].replace(".uno:", "").toLowerCase()}` });
    }
  }
  return items;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const result = {};

  for (const mod of MODULES) {
    const base = path.join(LO_SHARE, "config", "soffice.cfg", "modules", mod);
    const entry = { module: mod, menubar: [], toolbar: [] };

    try {
      const menubar = await fs.readFile(path.join(base, "menubar", "menubar.xml"), "utf-8");
      entry.menubar = await parseMenubarXml(menubar);
    } catch { /* skip */ }

    try {
      const toolbar = await fs.readFile(path.join(base, "toolbar", "toolbar.xml"), "utf-8");
      entry.toolbar = await parseToolbarXml(toolbar);
    } catch { /* skip */ }

    result[mod] = entry;
    console.log(`${mod}: menubar=${entry.menubar.length} menus, toolbar=${entry.toolbar.length} items`);
  }

  await fs.writeFile(path.join(OUT, "libreoffice-ui.json"), JSON.stringify(result, null, 2));
  console.log(`\nSaved → src/data/libreoffice-ui.json`);
}

main().catch(console.error);
