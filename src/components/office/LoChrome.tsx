"use client";

import { DRAW_MENUS, STANDARD_TOOLBAR, FORMAT_TOOLBAR, type ToolbarItem } from "@/lib/lo-menus";

function LoIcon({ name, alt }: { name: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/icons/lo/${name}.svg`} alt={alt} onError={(e) => {
      (e.target as HTMLImageElement).style.display = "none";
    }} />
  );
}

export function LoMenuBar() {
  return (
    <div className="lo-menubar">
      {DRAW_MENUS.map((m) => (
        <span key={m} className="lo-menubar-item">{m}</span>
      ))}
    </div>
  );
}

function LoToolbarRow({ items }: { items: ToolbarItem[] }) {
  return (
    <div className="lo-toolbar">
      {items.map((item, i) =>
        "sep" in item ? (
          <div key={i} className="lo-tb-sep" />
        ) : (
          <button key={i} type="button" className="lo-tb-btn" title={item.label}>
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
          <div key={i} className={`lo-page-thumb ${i === 0 ? "active" : ""}`}>
            {i + 1}
          </div>
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
        <select className="lo-prop-input" defaultValue="A4">
          <option>A4</option>
          <option>Letter</option>
        </select>
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
          <option value="color">색</option>
        </select>
      </div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">여백</span>
        <select className="lo-prop-input" defaultValue="normal">
          <option value="normal">보통</option>
          <option value="narrow">좁게</option>
          <option value="wide">넓게</option>
        </select>
      </div>
      <div className="lo-prop-row">
        <span className="lo-prop-label">마스터 페이지</span>
        <select className="lo-prop-input" defaultValue="master">
          <option value="master">Master pages</option>
        </select>
      </div>
    </div>
  );
}

export function LoRuler() {
  return <div className="lo-ruler-h" />;
}

export function LoStatusBar({ fileName, zoom = 100 }: { fileName: string; zoom?: number }) {
  return (
    <div className="lo-statusbar">
      <span>페이지 1 / 1</span>
      <span style={{ flex: 1 }}>{fileName}</span>
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
