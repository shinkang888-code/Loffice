"use client";

import { useState, useRef, useEffect } from "react";
import { DRAW_MENUS, STANDARD_TOOLBAR, FORMAT_TOOLBAR, type ToolbarItem, detectModule } from "@/lib/lo-menus";
import { useLoCommands } from "@/context/LoCommandContext";
import { iconUrl, unoToIcon } from "@/lib/lo-command-bridge";
import loUi from "@/data/libreoffice-ui.json";

function LoIcon({ name, alt }: { name: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={iconUrl(name)} alt={alt} width={16} height={16}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
  );
}

interface LoMenuBarProps {
  ext?: string;
}

export function LoMenuBar({ ext = ".odt" }: LoMenuBarProps) {
  const { executeUno } = useLoCommands();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const mod = detectModule(ext);
  const uiData = loUi[mod as keyof typeof loUi] || loUi.swriter;
  const menus = uiData?.menubar?.length ? uiData.menubar : DRAW_MENUS.map((label) => ({
    id: label, label, items: [],
  }));

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="lo-menubar relative" ref={barRef}>
      {menus.slice(0, 10).map((menu) => (
        <div key={menu.id} className="relative">
          <span
            className={`lo-menubar-item ${openMenu === menu.id ? "bg-[#d0d0d0]" : ""}`}
            onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
          >
            {menu.label}
          </span>
          {openMenu === menu.id && menu.items.length > 0 && (
            <div className="absolute left-0 top-full z-[100] min-w-[200px] border border-[#aaa] bg-[#fafafa] py-1 shadow-lg">
              {menu.items.slice(0, 40).map((item) => (
                <button
                  key={item.command}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1 text-left text-[12px] hover:bg-[#cce8ff]"
                  onClick={() => { executeUno(item.command); setOpenMenu(null); }}
                >
                  <LoIcon name={unoToIcon(item.command)} alt={item.label} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LoToolbarRow({ items }: { items: ToolbarItem[] }) {
  const { executeAction } = useLoCommands();

  const handleClick = (item: Extract<ToolbarItem, { cmd: string }>) => {
    if (item.cmd === ".uno:AddDirect") executeAction({ type: "new" });
    else if (item.cmd === ".uno:Open") executeAction({ type: "open" });
    else if (item.cmd === ".uno:Save") executeAction({ type: "save" });
    else if (item.cmd === ".uno:ExportDirectToPDF") executeAction({ type: "exportPdf" });
    else if (item.cmd === ".uno:Print" || item.cmd === ".uno:PrintPreview") executeAction({ type: "print" });
    else if (item.cmd === ".uno:ZoomIn") executeAction({ type: "zoom", delta: 1 });
    else if (item.cmd === ".uno:ZoomOut") executeAction({ type: "zoom", delta: -1 });
    else if (item.cmd === ".uno:Find") executeAction({ type: "find" });
    else executeAction({ type: "uno", command: item.cmd });
  };

  return (
    <div className="lo-toolbar">
      {items.map((item, i) =>
        "sep" in item ? (
          <div key={i} className="lo-tb-sep" />
        ) : (
          <button key={i} type="button" className="lo-tb-btn" title={item.label}
            onClick={() => handleClick(item)}>
            <LoIcon name={item.icon} alt={item.label} />
          </button>
        )
      )}
    </div>
  );
}

export function LoToolbars() {
  return (
    <>
      <LoToolbarRow items={STANDARD_TOOLBAR} />
      <LoToolbarRow items={FORMAT_TOOLBAR} />
    </>
  );
}

export function LoLeftSidebar({ pageCount = 1 }: { pageCount?: number }) {
  return (
    <div className="lo-sidebar" style={{ width: 120 }}>
      <div className="lo-sidebar-header">
        <span>페이지</span>
        <span style={{ cursor: "pointer" }}>+</span>
      </div>
      <div style={{ overflow: "auto", flex: 1, padding: "4px 0" }}>
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i} className={`lo-page-thumb ${i === 0 ? "active" : ""}`}>{i + 1}</div>
        ))}
      </div>
    </div>
  );
}

export function LoRightSidebar() {
  return (
    <div className="lo-sidebar lo-sidebar-right" style={{ width: 220 }}>
      <div className="lo-sidebar-header">속성</div>
      <div style={{ fontWeight: 600, padding: "6px 8px", fontSize: 11 }}>페이지</div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">형식</span>
        <select className="lo-prop-input" defaultValue="A4"><option>A4</option></select>
      </div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">방향</span>
        <select className="lo-prop-input" defaultValue="landscape">
          <option value="portrait">세로 방향</option>
          <option value="landscape">가로 방향</option>
        </select>
      </div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">배경</span>
        <select className="lo-prop-input" defaultValue="none">
          <option value="none">없음</option>
        </select>
      </div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">여백</span>
        <select className="lo-prop-input" defaultValue="normal">
          <option value="normal">보통</option>
        </select>
      </div>
    </div>
  );
}

export function LoRuler() {
  return <div className="lo-ruler-h" />;
}

export function LoStatusBar({ fileName }: { fileName: string }) {
  const { zoom, statusMessage, editorReady } = useLoCommands();
  return (
    <div className="lo-statusbar">
      <span>페이지 1 / 1</span>
      <span style={{ flex: 1 }}>
        {statusMessage || fileName}
        {editorReady && !statusMessage && " · LibreOffice 편집기 연결됨"}
      </span>
      <span>{zoom}%</span>
    </div>
  );
}

export function LoTitleBar({ title }: { title: string }) {
  return (
    <div className="lo-titlebar">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Loffice" />
      <span>{title}</span>
    </div>
  );
}
