"use client";

import { useEffect, useState, useRef } from "react";
import { getEditorUrl } from "@/lib/engine";
import { useLoCommands } from "@/context/LoCommandContext";
import type { LofficeDocument } from "@/lib/storage";
import { Loader2 } from "lucide-react";

interface EditorCanvasProps {
  doc: LofficeDocument;
}

export function EditorCanvas({ doc }: EditorCanvasProps) {
  const { registerEditorIframe } = useLoCommands();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editorUrl, setEditorUrl] = useState<string | null>(doc.editorUrl ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doc.editorUrl) { setEditorUrl(doc.editorUrl); setLoading(false); return; }
    if (!doc.editable) { setLoading(false); return; }
    getEditorUrl(doc.id).then((url) => { setEditorUrl(url); setLoading(false); });
  }, [doc]);

  useEffect(() => {
    registerEditorIframe(editorUrl ? iframeRef.current : null);
    return () => registerEditorIframe(null);
  }, [editorUrl, loading, registerEditorIframe]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <Loader2 className="h-8 w-8 animate-spin text-loffice-teal" />
      </div>
    );
  }

  if (editorUrl) {
    return (
      <iframe
        ref={iframeRef}
        src={editorUrl}
        className="h-full min-h-[360px] w-full flex-1 border-0"
        title={`편집 — ${doc.name}`}
        allow="clipboard-read; clipboard-write"
        onLoad={() => registerEditorIframe(iframeRef.current)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 text-center">
      <p className="text-lg font-semibold text-gray-700">{doc.name}</p>
      <p className="mt-2 text-sm text-gray-500">
        상단 툴바로 미리보기·저장·PDF·인쇄·확대/축소를 사용할 수 있습니다.
      </p>
      <p className="mt-2 text-xs text-gray-400">
        실시간 편집: Collabora 연결 시 자동 활성화 · 로컬은 docker compose up -d
      </p>
    </div>
  );
}
