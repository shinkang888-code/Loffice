"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { PdfViewer, type PdfViewerHandle } from "@/components/viewer/PdfViewer";
import { useLoCommands } from "@/context/LoCommandContext";
import { fetchPreviewInfo, type PreviewInfo } from "@/lib/preview";
import type { LofficeDocument } from "@/lib/storage";
import { formatFileSize } from "@/lib/utils";

interface UniversalPreviewProps {
  doc: LofficeDocument;
}

export function UniversalPreview({ doc }: UniversalPreviewProps) {
  const { registerPreviewControls } = useLoCommands();
  const pdfRef = useRef<PdfViewerHandle>(null);
  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPreviewInfo(doc).then((p) => { setPreview(p); setLoading(false); });
  }, [doc]);

  useEffect(() => {
    registerPreviewControls({
      zoomIn: () => pdfRef.current?.zoomIn(),
      zoomOut: () => pdfRef.current?.zoomOut(),
      print: () => pdfRef.current?.print() ?? window.print(),
    });
    return () => registerPreviewControls(null);
  }, [registerPreviewControls, preview?.type]);

  return (
    <div className="lo-preview-panel">
      <div className="lo-preview-header">
        <span>미리보기 — {doc.name}</span>
        {preview?.url && (
          <a href={preview.url} download={doc.name} className="flex items-center gap-1 text-[11px] hover:underline">
            <Download className="h-3 w-3" /> 다운로드
          </a>
        )}
      </div>
      <div className="lo-preview-body">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">LibreOffice 엔진 미리보기 생성 중...</span>
          </div>
        ) : preview?.type === "pdf" && preview.url ? (
          <div className="w-full max-w-4xl bg-white shadow-lg">
            <PdfViewer ref={pdfRef} url={preview.url} fileName={doc.name} />
          </div>
        ) : preview?.type === "image" && preview.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt={doc.name} className="max-h-full max-w-full object-contain shadow-lg" />
        ) : preview?.type === "text" || preview?.type === "html" ? (
          <pre className="max-h-full w-full max-w-3xl overflow-auto bg-white p-4 text-left text-xs shadow-lg">
            {preview.content?.slice(0, 50000) || "(빈 파일)"}
          </pre>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded bg-white p-8 shadow-lg">
            <FileText className="h-16 w-16 text-gray-400" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">{doc.name}</p>
              <p className="mt-1 text-sm text-gray-500">
                {formatFileSize(doc.size)} · {doc.ext.toUpperCase().replace(".", "")}
              </p>
              <p className="mt-3 max-w-sm text-xs text-gray-500">
                {preview?.message || "미리보기 패널 — 원본 다운로드 가능"}
              </p>
            </div>
            {preview?.url && (
              <a href={preview.url} download={doc.name}
                className="rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm hover:bg-gray-100">
                원본 파일 다운로드
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
