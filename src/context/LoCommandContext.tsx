"use client";

import {
  createContext, useCallback, useContext, useRef, useState, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ENGINE_URL } from "@/lib/utils";
import {
  sendCollaboraUno, sendCollaboraSave, type LoAction,
} from "@/lib/lo-command-bridge";
import type { LofficeDocument } from "@/lib/storage";

export interface PreviewControls {
  zoomIn: () => void;
  zoomOut: () => void;
  print: () => void;
}

interface LoCommandContextValue {
  doc: LofficeDocument | null;
  zoom: number;
  statusMessage: string;
  editorReady: boolean;
  registerEditorIframe: (el: HTMLIFrameElement | null) => void;
  registerPreviewControls: (ctrl: PreviewControls | null) => void;
  executeUno: (command: string) => void;
  executeAction: (action: LoAction) => void;
}

const LoCommandContext = createContext<LoCommandContextValue | null>(null);

export function useLoCommands() {
  const ctx = useContext(LoCommandContext);
  if (!ctx) throw new Error("useLoCommands must be used within LoCommandProvider");
  return ctx;
}

export function LoCommandProvider({
  doc, children,
}: { doc: LofficeDocument | null; children: ReactNode }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewRef = useRef<PreviewControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [zoom, setZoom] = useState(100);
  const [statusMessage, setStatusMessage] = useState("");
  const [editorReady, setEditorReady] = useState(false);

  const flash = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 2500);
  }, []);

  const registerEditorIframe = useCallback((el: HTMLIFrameElement | null) => {
    iframeRef.current = el;
    setEditorReady(!!el);
  }, []);

  const registerPreviewControls = useCallback((ctrl: PreviewControls | null) => {
    previewRef.current = ctrl;
  }, []);

  const executeUno = useCallback((command: string) => {
    if (sendCollaboraUno(iframeRef.current, command)) {
      flash(`${command} 실행`);
      return;
    }
    // 엔진 폴백
    if (command === ".uno:ZoomIn") {
      previewRef.current?.zoomIn();
      setZoom((z) => Math.min(300, z + 20));
      return;
    }
    if (command === ".uno:ZoomOut") {
      previewRef.current?.zoomOut();
      setZoom((z) => Math.max(50, z - 20));
      return;
    }
    if (command === ".uno:Print" || command === ".uno:PrintPreview") {
      previewRef.current?.print();
      return;
    }
    flash(`편집 엔진 연결 시 ${command} 사용 가능 (미리보기 모드)`);
  }, [flash]);

  const executeAction = useCallback((action: LoAction) => {
    if (!doc) return;

    switch (action.type) {
      case "uno":
        executeUno(action.command);
        break;
      case "zoom":
        if (action.delta > 0) {
          previewRef.current?.zoomIn();
          setZoom((z) => Math.min(300, z + 20));
        } else {
          previewRef.current?.zoomOut();
          setZoom((z) => Math.max(50, z - 20));
        }
        break;
      case "print":
        if (sendCollaboraUno(iframeRef.current, ".uno:Print")) break;
        previewRef.current?.print();
        break;
      case "download": {
        const url = `${ENGINE_URL}/api/documents/${doc.id}/raw`;
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.name;
        a.click();
        flash("다운로드 시작");
        break;
      }
      case "save":
        if (sendCollaboraSave(iframeRef.current)) {
          flash("저장됨");
        } else {
          executeAction({ type: "download" });
        }
        break;
      case "exportPdf": {
        if (sendCollaboraUno(iframeRef.current, ".uno:ExportDirectToPDF")) {
          flash("PDF 내보내기");
          break;
        }
        const pdfUrl = `${ENGINE_URL}/api/documents/${doc.id}/pdf`;
        fetch(pdfUrl, { method: "HEAD" }).then((r) => {
          if (r.ok) {
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = doc.name.replace(/\.[^.]+$/, ".pdf");
            a.click();
            flash("PDF 다운로드");
          } else {
            flash("PDF 변환 실패 — LibreOffice 엔진 확인");
          }
        });
        break;
      }
      case "open":
        fileInputRef.current?.click();
        break;
      case "new":
        router.push("/");
        break;
      case "find":
        executeUno(".uno:SearchDialog");
        break;
    }
  }, [doc, executeUno, flash, router]);

  return (
    <LoCommandContext.Provider value={{
      doc, zoom, statusMessage, editorReady,
      registerEditorIframe, registerPreviewControls,
      executeUno, executeAction,
    }}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            import("@/lib/engine").then(({ convertAndSave, getDocumentRoute }) => {
              convertAndSave(f).then((d) => router.push(getDocumentRoute(d)));
            });
          }
        }}
      />
      {children}
    </LoCommandContext.Provider>
  );
}
