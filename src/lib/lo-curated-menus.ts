import type { OfficeModule } from "./lo-menus";

export interface CuratedMenuItem {
  command: string;
  label: string;
  icon?: string;
}

export interface CuratedMenu {
  id: string;
  label: string;
  items: CuratedMenuItem[];
}

const FILE_ITEMS: CuratedMenuItem[] = [
  { command: ".uno:AddDirect", label: "새로 만들기", icon: "lc_newdoc" },
  { command: ".uno:Open", label: "열기", icon: "lc_open" },
  { command: ".uno:Save", label: "저장", icon: "lc_save" },
  { command: ".uno:SaveAs", label: "다른 이름으로 저장", icon: "lc_saveas" },
  { command: ".uno:ExportDirectToPDF", label: "PDF로 내보내기", icon: "lc_exportdirecttopdf" },
  { command: ".uno:Print", label: "인쇄", icon: "lc_print" },
  { command: ".uno:PrintPreview", label: "인쇄 미리보기", icon: "lc_printpreview" },
  { command: ".uno:CloseDoc", label: "닫기", icon: "lc_closedoc" },
];

const EDIT_ITEMS: CuratedMenuItem[] = [
  { command: ".uno:Undo", label: "실행 취소", icon: "lc_undo" },
  { command: ".uno:Redo", label: "다시 실행", icon: "lc_redo" },
  { command: ".uno:Cut", label: "잘라내기", icon: "lc_cut" },
  { command: ".uno:Copy", label: "복사", icon: "lc_copy" },
  { command: ".uno:Paste", label: "붙여넣기", icon: "lc_paste" },
  { command: ".uno:SelectAll", label: "모두 선택", icon: "lc_selectall" },
  { command: ".uno:Find", label: "찾기", icon: "lc_find" },
];

const VIEW_ITEMS: CuratedMenuItem[] = [
  { command: ".uno:ZoomIn", label: "확대", icon: "lc_zoomin" },
  { command: ".uno:ZoomOut", label: "축소", icon: "lc_zoomout" },
  { command: ".uno:PrintPreview", label: "미리보기", icon: "lc_printpreview" },
];

const FORMAT_ITEMS: CuratedMenuItem[] = [
  { command: ".uno:Bold", label: "굵게", icon: "lc_bold" },
  { command: ".uno:Italic", label: "기울임꼴", icon: "lc_italic" },
  { command: ".uno:Underline", label: "밑줄", icon: "lc_underline" },
  { command: ".uno:LeftPara", label: "왼쪽 정렬", icon: "lc_alignleft" },
  { command: ".uno:CenterPara", label: "가운데 정렬", icon: "lc_aligncenter" },
  { command: ".uno:RightPara", label: "오른쪽 정렬", icon: "lc_alignright" },
];

const BASE: CuratedMenu[] = [
  { id: "file", label: "파일", items: FILE_ITEMS },
  { id: "edit", label: "편집", items: EDIT_ITEMS },
  { id: "view", label: "보기", items: VIEW_ITEMS },
  { id: "format", label: "서식", items: FORMAT_ITEMS },
  { id: "tools", label: "도구", items: [{ command: ".uno:SpellingAndGrammar", label: "맞춤법 검사", icon: "lc_spelling" }] },
  { id: "help", label: "도움말", items: [{ command: ".uno:OnlineHelp", label: "LibreOffice 도움말", icon: "lc_help" }] },
];

const DRAW_EXTRA: CuratedMenu = {
  id: "shape",
  label: "도형",
  items: [
    { command: ".uno:BasicShapes.rectangle", label: "직사각형", icon: "lc_basicshapes.rectangle" },
    { command: ".uno:BasicShapes.ellipse", label: "타원", icon: "lc_basicshapes.ellipse" },
    { command: ".uno:Line", label: "선", icon: "lc_line" },
  ],
};

export function getCuratedMenus(mod: OfficeModule): CuratedMenu[] {
  if (mod === "sdraw" || mod === "simpress") {
    return [...BASE.slice(0, 4), DRAW_EXTRA, ...BASE.slice(4)];
  }
  return BASE;
}
