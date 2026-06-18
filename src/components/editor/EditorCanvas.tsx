"use client";

import { useEffect, useState } from "react";
import { getEditorUrl } from "@/lib/engine";
import type { LofficeDocument } from "@/lib/storage";
import { Loader2 } from "lucide-react";

interface EditorCanvasProps {
  doc: LofficeDocument;
}

export function EditorCanvas({ doc }: EditorCanvasProps) {
  const [editorUrl, setEditorUrl] = useState<string | null>(doc.editorUrl ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doc.editorUrl) {
      setEditorUrl(doc.editorUrl);
      setLoading(false);
      return;
    }
    if (!doc.editable) {
      setLoading(false);
      return;
    }
    getEditorUrl(doc.id).then((url) => {
      setEditorUrl(url);
      setLoading(false);
    });
  }, [doc]);

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
        src={editorUrl}
        className="h-full min-h-[360px] w-full flex-1 border-0"
        title={`편집 — ${doc.name}`}
        allow="clipboard-read; clipboard-write"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 text-center">
      <p className="text-lg font-semibold text-gray-700">{doc.name}</p>
      <p className="mt-2 text-sm text-gray-500">
        {doc.editable
          ? "LibreOffice 편집 엔진을 시작하려면 Docker Desktop 실행 후 docker compose up -d"
          : "이 파일 형식은 아래 미리보기 패널에서 확인하세요."}
      </p>
      <p className="mt-4 text-xs text-gray-400">
        LibreOffice 엔진 · {doc.ext.toUpperCase().replace(".", "")}
      </p>
    </div>
  );
}
