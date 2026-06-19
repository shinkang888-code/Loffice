"use client";

import { ReactNode } from "react";
import {
  LoTitleBar, LoMenuBar, LoToolbars, LoLeftSidebar,
  LoRightSidebar, LoRuler, LoStatusBar,
} from "./LoChrome";
import { MODULE_TITLES, detectModule, type OfficeModule } from "@/lib/lo-menus";

interface LofficeDesktopShellProps {
  fileName: string;
  ext: string;
  children?: ReactNode;
  previewPanel: ReactNode;
  editorPanel?: ReactNode;
}

export function LofficeDesktopShell({
  fileName, ext, children, previewPanel, editorPanel,
}: LofficeDesktopShellProps) {
  const mod: OfficeModule = detectModule(ext);
  const title = `${fileName} — ${MODULE_TITLES[mod]}`;

  return (
    <div className="lo-shell flex flex-col" style={{ height: "100vh" }}>
      <LoTitleBar title={title} />
      <LoMenuBar ext={ext} />
      <LoToolbars />
      <div className="lo-workspace flex-1">
        <LoLeftSidebar />
        <div className="lo-canvas-area flex flex-1 flex-col">
          <LoRuler />
          <div className="lo-canvas-inner flex-1">
            <div className="lo-doc-page flex flex-1 flex-col" style={{ width: "100%", maxWidth: "100%", minHeight: 400 }}>
              {editorPanel || children}
            </div>
          </div>
          {previewPanel}
        </div>
        <LoRightSidebar />
      </div>
      <LoStatusBar fileName={fileName} />
    </div>
  );
}
