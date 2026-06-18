"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Download, Maximize2, Minimize2,
} from "lucide-react";

interface PdfViewerProps {
  url: string;
  fileName?: string;
}

export function PdfViewer({ url, fileName }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPage(1);
      } catch (e) {
        if (!cancelled) setError("PDF 로드 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const pg = await pdfDoc.getPage(page);
    const viewport = pg.getViewport({ scale });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await pg.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, page, scale]);

  useEffect(() => { renderPage(); }, [renderPage]);

  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document.pdf";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
          className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-40">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[80px] text-center text-sm">
          {page} / {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
          className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-40">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="mx-2 h-5 w-px bg-gray-200" />

        <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          className="rounded p-1.5 hover:bg-gray-100">
          <ZoomOut className="h-5 w-5" />
        </button>
        <span className="min-w-[48px] text-center text-sm">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="rounded p-1.5 hover:bg-gray-100">
          <ZoomIn className="h-5 w-5" />
        </button>

        <div className="mx-2 h-5 w-px bg-gray-200" />

        <button onClick={download} className="rounded p-1.5 hover:bg-gray-100" title="다운로드">
          <Download className="h-5 w-5" />
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="mx-auto w-fit shadow-lg">
          <canvas ref={canvasRef} className="bg-white" />
        </div>
      </div>
    </div>
  );
}
