/** LibreOffice .uno 명령 → 한국어 라벨 (LibreOffice ko 번역 기반) */
export const LO_MENU_LABELS: Record<string, string> = {
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
  ".uno:SpellingMenu": "도구",
  ".uno:GraphicMenu": "그래픽",
  ".uno:TableMenu": "표",
};

export const LO_CMD_LABELS: Record<string, string> = {
  ".uno:AddDirect": "새로 만들기",
  ".uno:Open": "열기",
  ".uno:Save": "저장",
  ".uno:SaveAs": "다른 이름으로 저장",
  ".uno:ExportDirectToPDF": "PDF로보내기",
  ".uno:Print": "인쇄",
  ".uno:PrintPreview": "인쇄 미리보기",
  ".uno:Cut": "잘라내기",
  ".uno:Copy": "복사",
  ".uno:Paste": "붙여넣기",
  ".uno:Undo": "실행 취소",
  ".uno:Redo": "다시 실행",
  ".uno:Find": "찾기",
  ".uno:Bold": "굵게",
  ".uno:Italic": "기울임꼴",
  ".uno:Underline": "밑줄",
  ".uno:LeftPara": "왼쪽 정렬",
  ".uno:CenterPara": "가운데 정렬",
  ".uno:RightPara": "오른쪽 정렬",
  ".uno:ZoomIn": "확대",
  ".uno:ZoomOut": "축소",
};

export const DRAW_MENUS = [
  "파일", "편집", "보기", "삽입", "서식", "페이지", "도형", "도구", "창", "도움말",
];

export type ToolbarItem =
  | { sep: true }
  | { icon: string; label: string; cmd: string };

export const STANDARD_TOOLBAR: ToolbarItem[] = [
  { icon: "lc_newdoc", label: "새로 만들기", cmd: ".uno:AddDirect" },
  { icon: "lc_open", label: "열기", cmd: ".uno:Open" },
  { icon: "lc_save", label: "저장", cmd: ".uno:Save" },
  { sep: true },
  { icon: "lc_exportdirecttopdf", label: "PDF", cmd: ".uno:ExportDirectToPDF" },
  { icon: "lc_print", label: "인쇄", cmd: ".uno:Print" },
  { icon: "lc_printpreview", label: "미리보기", cmd: ".uno:PrintPreview" },
  { sep: true },
  { icon: "lc_cut", label: "잘라내기", cmd: ".uno:Cut" },
  { icon: "lc_copy", label: "복사", cmd: ".uno:Copy" },
  { icon: "lc_paste", label: "붙여넣기", cmd: ".uno:Paste" },
  { sep: true },
  { icon: "lc_undo", label: "실행 취소", cmd: ".uno:Undo" },
  { icon: "lc_redo", label: "다시 실행", cmd: ".uno:Redo" },
  { sep: true },
  { icon: "lc_find", label: "찾기", cmd: ".uno:Find" },
];

export const FORMAT_TOOLBAR: ToolbarItem[] = [
  { icon: "lc_bold", label: "굵게", cmd: ".uno:Bold" },
  { icon: "lc_italic", label: "기울임꼴", cmd: ".uno:Italic" },
  { icon: "lc_underline", label: "밑줄", cmd: ".uno:Underline" },
  { sep: true },
  { icon: "lc_alignleft", label: "왼쪽", cmd: ".uno:LeftPara" },
  { icon: "lc_aligncenter", label: "가운데", cmd: ".uno:CenterPara" },
  { icon: "lc_alignright", label: "오른쪽", cmd: ".uno:RightPara" },
  { sep: true },
  { icon: "lc_zoomout", label: "축소", cmd: ".uno:ZoomOut" },
  { icon: "lc_zoomin", label: "확대", cmd: ".uno:ZoomIn" },
];

export type OfficeModule = "swriter" | "scalc" | "simpress" | "sdraw" | "unknown";

export function detectModule(ext: string): OfficeModule {
  const e = ext.toLowerCase();
  if ([".odt", ".doc", ".docx", ".rtf", ".txt"].includes(e)) return "swriter";
  if ([".ods", ".xls", ".xlsx", ".csv"].includes(e)) return "scalc";
  if ([".odp", ".ppt", ".pptx"].includes(e)) return "simpress";
  if ([".odg", ".svg"].includes(e)) return "sdraw";
  return "unknown";
}

export const MODULE_TITLES: Record<OfficeModule, string> = {
  swriter: "Loffice Writer",
  scalc: "Loffice Calc",
  simpress: "Loffice Impress",
  sdraw: "Loffice Draw",
  unknown: "Loffice",
};
