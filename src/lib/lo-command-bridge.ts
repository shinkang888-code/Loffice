import iconManifest from "@/data/icon-manifest.json";

const ICON_MAP: Record<string, string> = iconManifest as Record<string, string>;
const FALLBACK_ICON = "lc_standardfilter";

/**
 * LibreOffice .uno 명령 → Colibre 아이콘 (manifest 우선)
 */
export function unoToIcon(uno: string): string {
  const key = uno.toLowerCase();
  if (ICON_MAP[key]) return ICON_MAP[key];
  const name = uno.replace(".uno:", "").toLowerCase();
  return `lc_${name}`;
}

export function iconUrl(icon: string): string {
  const name = icon.endsWith(".svg") ? icon.replace(".svg", "") : icon;
  return `/icons/lo/${name}.svg`;
}

export function iconUrlWithFallback(uno: string): string {
  const icon = unoToIcon(uno);
  if (ICON_MAP[uno.toLowerCase()]) return iconUrl(icon);
  return iconUrl(FALLBACK_ICON);
}

/** Collabora Online iframe에 UNO 명령 전송 */
export function sendCollaboraUno(iframe: HTMLIFrameElement | null, command: string): boolean {
  if (!iframe?.contentWindow) return false;
  try {
    iframe.contentWindow.postMessage(
      JSON.stringify({ MessageId: "CallUNOCommand", Values: { Command: command } }),
      "*"
    );
    return true;
  } catch {
    return false;
  }
}

/** Collabora 저장 트리거 */
export function sendCollaboraSave(iframe: HTMLIFrameElement | null): boolean {
  return sendCollaboraUno(iframe, ".uno:Save");
}

export type LoAction =
  | { type: "uno"; command: string }
  | { type: "zoom"; delta: number }
  | { type: "print" }
  | { type: "download" }
  | { type: "save" }
  | { type: "exportPdf" }
  | { type: "open" }
  | { type: "new" }
  | { type: "find" };

export function parseToolbarAction(cmd: string): LoAction {
  if (cmd.startsWith(".uno:")) return { type: "uno", command: cmd };
  return { type: "uno", command: cmd };
}

export const MENU_UNO_MAP: Record<string, string> = {
  "파일": ".uno:PickList",
  "편집": ".uno:EditMenu",
  "보기": ".uno:ViewMenu",
  "삽입": ".uno:InsertMenu",
  "서식": ".uno:FormatMenu",
  "페이지": ".uno:PageMenu",
  "도형": ".uno:ShapeMenu",
  "도구": ".uno:ToolsMenu",
  "창": ".uno:WindowMenu",
  "도움말": ".uno:HelpMenu",
};
