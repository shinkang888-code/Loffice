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
  previewPanel: ReactNode;
}

export function LofficeDesktopShell({
  fileName, ext, previewPanel,
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
          <div className="lo-canvas-inner lo-canvas-inner--full">
            {previewPanel}
          </div>
        </div>
        <LoRightSidebar />
      </div>
      <LoStatusBar fileName={fileName} />
    </div>
  );
}
